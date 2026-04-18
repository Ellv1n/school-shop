const { query, getClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/error.middleware');

const createOrder = async (req, res, next) => {
  const client = await getClient();
  try {
    const { customerName, customerPhone, address, notes } = req.body;

    // Get cart
    const cartRes = await client.query('SELECT id FROM carts WHERE user_id=$1', [req.user.id]);
    if (!cartRes.rows[0]) throw new AppError('Səbətiniz boşdur.', 400);
    const cartId = cartRes.rows[0].id;

    const itemsRes = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name_az, p.is_active
       FROM cart_items ci JOIN products p ON p.id=ci.product_id
       WHERE ci.cart_id=$1`,
      [cartId]
    );

    if (!itemsRes.rows.length) throw new AppError('Səbətiniz boşdur.', 400);

    for (const item of itemsRes.rows) {
      if (!item.is_active) throw new AppError(`"${item.name_az}" artıq mövcud deyil.`, 400);
      if (item.stock < item.quantity) throw new AppError(`"${item.name_az}" üçün kifayət qədər stok yoxdur.`, 400);
    }

    const totalPrice = itemsRes.rows.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

    await client.query('BEGIN');

    const orderId = uuidv4();
    await client.query(
      `INSERT INTO orders (id,user_id,total_price,status,customer_name,customer_phone,address,notes)
       VALUES ($1,$2,$3,'PENDING',$4,$5,$6,$7)`,
      [orderId, req.user.id, totalPrice, customerName, customerPhone, address, notes || null]
    );

    for (const item of itemsRes.rows) {
      await client.query(
        `INSERT INTO order_items (id,order_id,product_id,quantity,price) VALUES ($1,$2,$3,$4,$5)`,
        [uuidv4(), orderId, item.product_id, item.quantity, item.price]
      );
      await client.query(
        'UPDATE products SET stock=stock-$1, updated_at=NOW() WHERE id=$2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart_items WHERE cart_id=$1', [cartId]);
    await client.query('COMMIT');

    const { rows } = await query(
      `SELECT o.*, json_agg(json_build_object('id',oi.id,'quantity',oi.quantity,'price',oi.price,
        'product',json_build_object('id',p.id,'name',p.name,'nameAz',p.name_az,'image',p.image))
       ) as order_items
       FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id
       WHERE o.id=$1 GROUP BY o.id`,
      [orderId]
    );

    res.status(201).json({ success: true, message: 'Sifariş qəbul edildi.', data: rows[0] });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [countRes, ordersRes] = await Promise.all([
      query('SELECT COUNT(*) FROM orders WHERE user_id=$1', [req.user.id]),
      query(
        `SELECT o.*, COALESCE(json_agg(json_build_object('id',oi.id,'quantity',oi.quantity,
          'product',json_build_object('id',p.id,'nameAz',p.name_az,'image',p.image))
         ) FILTER (WHERE oi.id IS NOT NULL), '[]') as order_items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id=o.id
         LEFT JOIN products p ON p.id=oi.product_id
         WHERE o.user_id=$1 GROUP BY o.id ORDER BY o.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.id, parseInt(limit), offset]
      ),
    ]);

    const total = parseInt(countRes.rows[0].count);
    res.json({ success: true, data: ordersRes.rows, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getOrderById = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT o.*, COALESCE(json_agg(json_build_object('id',oi.id,'quantity',oi.quantity,'price',oi.price,
        'product',json_build_object('id',p.id,'name',p.name,'nameAz',p.name_az,'image',p.image))
       ) FILTER (WHERE oi.id IS NOT NULL), '[]') as order_items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id LEFT JOIN products p ON p.id=oi.product_id
       WHERE o.id=$1 AND o.user_id=$2 GROUP BY o.id`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) throw new AppError('Sifariş tapılmadı.', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let where = '';
    if (status) { params.push(status); where = 'WHERE o.status=$1'; }

    const countParams = [...params];
    const dataParams = [...params, parseInt(limit), offset];
    const pi = params.length + 1;

    const [countRes, ordersRes] = await Promise.all([
      query(`SELECT COUNT(*) FROM orders o ${where}`, countParams),
      query(
        `SELECT o.*, u.name as user_name, u.email as user_email,
          COALESCE(json_agg(json_build_object('id',oi.id,'quantity',oi.quantity,
            'product',json_build_object('id',p.id,'nameAz',p.name_az,'image',p.image))
          ) FILTER (WHERE oi.id IS NOT NULL), '[]') as order_items
         FROM orders o
         LEFT JOIN users u ON u.id=o.user_id
         LEFT JOIN order_items oi ON oi.order_id=o.id
         LEFT JOIN products p ON p.id=oi.product_id
         ${where} GROUP BY o.id,u.name,u.email
         ORDER BY o.created_at DESC LIMIT $${pi} OFFSET $${pi+1}`,
        dataParams
      ),
    ]);

    const total = parseInt(countRes.rows[0].count);
    const orders = ordersRes.rows.map(r => ({
      ...r,
      user: { name: r.user_name, email: r.user_email },
    }));
    res.json({ success: true, data: orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const valid = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
    const { status } = req.body;
    if (!valid.includes(status)) throw new AppError('Yanlış status.', 400);
    const { rows } = await query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows[0]) throw new AppError('Sifariş tapılmadı.', 404);
    res.json({ success: true, message: 'Status yeniləndi.', data: rows[0] });
  } catch (err) { next(err); }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
