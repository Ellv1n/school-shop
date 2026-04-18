const { query } = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const [users, products, orders, categories, revenue, recentOrders, ordersByStatus, lowStock] = await Promise.all([
      query(`SELECT COUNT(*) FROM users WHERE role='CUSTOMER'`),
      query(`SELECT COUNT(*) FROM products WHERE is_active=true`),
      query(`SELECT COUNT(*) FROM orders`),
      query(`SELECT COUNT(*) FROM categories`),
      query(`SELECT COALESCE(SUM(total_price),0) as total FROM orders WHERE status!='CANCELLED'`),
      query(`SELECT o.id, o.total_price, o.status, o.created_at, u.name as user_name, u.email as user_email,
              (SELECT COUNT(*) FROM order_items WHERE order_id=o.id) as item_count
             FROM orders o LEFT JOIN users u ON u.id=o.user_id
             ORDER BY o.created_at DESC LIMIT 5`),
      query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`),
      query(`SELECT p.*, c.name_az as cat_name FROM products p LEFT JOIN categories c ON c.id=p.category_id
             WHERE p.stock<=5 AND p.is_active=true ORDER BY p.stock ASC LIMIT 10`),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: parseInt(users.rows[0].count),
          totalProducts: parseInt(products.rows[0].count),
          totalOrders: parseInt(orders.rows[0].count),
          totalCategories: parseInt(categories.rows[0].count),
          totalRevenue: revenue.rows[0].total,
        },
        recentOrders: recentOrders.rows.map(r => ({
          ...r, user: { name: r.user_name, email: r.user_email },
          orderItems: Array(parseInt(r.item_count)).fill({}),
        })),
        ordersByStatus: ordersByStatus.rows.map(r => ({ status: r.status, _count: { status: parseInt(r.count) } })),
        lowStockProducts: lowStock.rows.map(r => ({ ...r, nameAz: r.name_az, category: { nameAz: r.cat_name } })),
      },
    });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [countRes, usersRes] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query(
        `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
          COUNT(o.id) as order_count
         FROM users u LEFT JOIN orders o ON o.user_id=u.id
         GROUP BY u.id ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
        [parseInt(limit), offset]
      ),
    ]);
    const total = parseInt(countRes.rows[0].count);
    const users = usersRes.rows.map(r => ({ ...r, _count: { orders: parseInt(r.order_count) } }));
    res.json({ success: true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

module.exports = { getDashboardStats, getAllUsers };
