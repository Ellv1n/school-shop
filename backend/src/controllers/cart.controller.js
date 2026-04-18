const { query, getClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/error.middleware');

const ensureCart = async (userId) => {
  let { rows } = await query('SELECT id FROM carts WHERE user_id=$1', [userId]);
  if (!rows[0]) {
    const res = await query('INSERT INTO carts (id,user_id) VALUES ($1,$2) RETURNING id', [uuidv4(), userId]);
    return res.rows[0].id;
  }
  return rows[0].id;
};

const getCart = async (req, res, next) => {
  try {
    const cartId = await ensureCart(req.user.id);
    const { rows } = await query(
      `SELECT ci.id, ci.quantity, ci.product_id,
        p.name, p.name_az, p.price, p.image, p.stock,
        c.name_az as cat_name_az
       FROM cart_items ci
       JOIN products p ON p.id=ci.product_id
       LEFT JOIN categories c ON c.id=p.category_id
       WHERE ci.cart_id=$1`,
      [cartId]
    );
    const items = rows.map(r => ({
      id: r.id,
      quantity: r.quantity,
      productId: r.product_id,
      product: { id: r.product_id, name: r.name, nameAz: r.name_az, price: r.price, image: r.image, stock: r.stock, category: { nameAz: r.cat_name_az } },
    }));
    const total = items.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0).toFixed(2);
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    res.json({ success: true, data: { id: cartId, items, total, itemCount } });
  } catch (err) { next(err); }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const { rows: prod } = await query('SELECT * FROM products WHERE id=$1 AND is_active=true', [productId]);
    if (!prod[0]) throw new AppError('Məhsul tapılmadı.', 404);
    if (prod[0].stock < quantity) throw new AppError(`Yalnız ${prod[0].stock} ədəd var.`, 400);

    const cartId = await ensureCart(req.user.id);
    const existing = await query('SELECT id,quantity FROM cart_items WHERE cart_id=$1 AND product_id=$2', [cartId, productId]);

    if (existing.rows[0]) {
      const newQty = existing.rows[0].quantity + parseInt(quantity);
      if (prod[0].stock < newQty) throw new AppError(`Yalnız ${prod[0].stock} ədəd var.`, 400);
      await query('UPDATE cart_items SET quantity=$1, updated_at=NOW() WHERE id=$2', [newQty, existing.rows[0].id]);
    } else {
      await query('INSERT INTO cart_items (id,cart_id,product_id,quantity) VALUES ($1,$2,$3,$4)',
        [uuidv4(), cartId, productId, parseInt(quantity)]);
    }
    res.json({ success: true, message: 'Səbətə əlavə edildi.' });
  } catch (err) { next(err); }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cartId = await ensureCart(req.user.id);
    const { rows } = await query('SELECT ci.*,p.stock FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.id=$1 AND ci.cart_id=$2', [itemId, cartId]);
    if (!rows[0]) throw new AppError('Səbət məhsulu tapılmadı.', 404);
    if (parseInt(quantity) <= 0) {
      await query('DELETE FROM cart_items WHERE id=$1', [itemId]);
      return res.json({ success: true, message: 'Məhsul çıxarıldı.' });
    }
    if (rows[0].stock < parseInt(quantity)) throw new AppError(`Yalnız ${rows[0].stock} ədəd var.`, 400);
    await query('UPDATE cart_items SET quantity=$1, updated_at=NOW() WHERE id=$2', [parseInt(quantity), itemId]);
    res.json({ success: true, message: 'Yeniləndi.' });
  } catch (err) { next(err); }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cartId = await ensureCart(req.user.id);
    await query('DELETE FROM cart_items WHERE id=$1 AND cart_id=$2', [req.params.itemId, cartId]);
    res.json({ success: true, message: 'Məhsul çıxarıldı.' });
  } catch (err) { next(err); }
};

const clearCart = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id FROM carts WHERE user_id=$1', [req.user.id]);
    if (rows[0]) await query('DELETE FROM cart_items WHERE cart_id=$1', [rows[0].id]);
    res.json({ success: true, message: 'Səbət təmizləndi.' });
  } catch (err) { next(err); }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
