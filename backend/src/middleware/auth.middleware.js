const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token tapılmadı.' });
    }
    const token = auth.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query(
      'SELECT id, name, email, role FROM users WHERE id=$1',
      [decoded.userId]
    );
    if (!rows[0]) return res.status(401).json({ success: false, message: 'İstifadəçi tapılmadı.' });
    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token müddəti bitib.' });
    return res.status(401).json({ success: false, message: 'Token etibarsızdır.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN')
    return res.status(403).json({ success: false, message: 'Admin icazəsi tələb olunur.' });
  next();
};

module.exports = { authenticate, requireAdmin };
