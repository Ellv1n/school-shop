const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/error.middleware');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      throw new AppError('Ad, e-poçt və şifrə tələb olunur.', 400);

    const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows[0]) throw new AppError('Bu e-poçt artıq qeydiyyatdadır.', 409);

    const hashed = await bcrypt.hash(password, 12);
    const id = uuidv4();
    await query(
      `INSERT INTO users (id, name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5,'CUSTOMER')`,
      [id, name, email, hashed, phone || null]
    );
    // Create cart
    await query('INSERT INTO carts (id, user_id) VALUES ($1,$2)', [uuidv4(), id]);

    const user = { id, name, email, role: 'CUSTOMER' };
    const token = generateToken(id);
    res.status(201).json({ success: true, message: 'Qeydiyyat uğurlu oldu.', data: { user, token } });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('E-poçt və şifrə tələb olunur.', 400);

    const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) throw new AppError('E-poçt və ya şifrə yanlışdır.', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('E-poçt və ya şifrə yanlışdır.', 401);

    const token = generateToken(user.id);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: 'Giriş uğurlu oldu.', data: { user: safeUser, token } });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, role, phone, address, created_at,
       (SELECT COUNT(*) FROM orders WHERE user_id=$1) AS order_count
       FROM users WHERE id=$1`,
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const { rows } = await query(
      `UPDATE users SET name=COALESCE($1,name), phone=COALESCE($2,phone),
       address=COALESCE($3,address), updated_at=NOW()
       WHERE id=$4 RETURNING id,name,email,role,phone,address`,
      [name, phone, address, req.user.id]
    );
    res.json({ success: true, message: 'Profil yeniləndi.', data: rows[0] });
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await query('SELECT password FROM users WHERE id=$1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) throw new AppError('Cari şifrə yanlışdır.', 400);
    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2', [hashed, req.user.id]);
    res.json({ success: true, message: 'Şifrə dəyişdirildi.' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
