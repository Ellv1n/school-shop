const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/error.middleware');
const path = require('path');
const fs = require('fs');

const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, categoryId, categorySlug, search, featured, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['p.is_active=true'];
    const params = [];
    let pi = 1;

    if (categorySlug) {
      params.push(categorySlug);
      conditions.push(`c.slug=$${pi++}`);
    }
    if (categoryId) {
      params.push(categoryId);
      conditions.push(`p.category_id=$${pi++}`);
    }
    if (featured === 'true') conditions.push('p.featured=true');
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name_az ILIKE $${pi} OR p.name ILIKE $${pi++})`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const validSort = { createdAt: 'p.created_at', price: 'p.price', name: 'p.name_az', stock: 'p.stock' };
    const orderCol = validSort[sortBy] || 'p.created_at';
    const orderDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countParams = [...params];
    const dataParams = [...params, parseInt(limit), offset];

    const [countRes, dataRes] = await Promise.all([
      query(`SELECT COUNT(*) FROM products p LEFT JOIN categories c ON c.id=p.category_id ${where}`, countParams),
      query(
        `SELECT p.*, c.id as cat_id, c.name as cat_name, c.name_az as cat_name_az, c.slug as cat_slug
         FROM products p LEFT JOIN categories c ON c.id=p.category_id
         ${where} ORDER BY ${orderCol} ${orderDir}
         LIMIT $${pi++} OFFSET $${pi++}`,
        dataParams
      ),
    ]);

    const total = parseInt(countRes.rows[0].count);
    const products = dataRes.rows.map(r => ({
      ...r,
      category: { id: r.cat_id, name: r.cat_name, nameAz: r.cat_name_az, slug: r.cat_slug },
    }));

    res.json({ success: true, data: products, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getProductById = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.name_az as cat_name_az, c.slug as cat_slug
       FROM products p LEFT JOIN categories c ON c.id=p.category_id
       WHERE p.id=$1 AND p.is_active=true`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Məhsul tapılmadı.', 404);
    const r = rows[0];
    res.json({ success: true, data: { ...r, category: { id: r.cat_id, name: r.cat_name, nameAz: r.cat_name_az, slug: r.cat_slug } } });
  } catch (err) { next(err); }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, c.id as cat_id, c.name as cat_name, c.name_az as cat_name_az, c.slug as cat_slug
       FROM products p LEFT JOIN categories c ON c.id=p.category_id
       WHERE p.featured=true AND p.is_active=true
       ORDER BY p.created_at DESC LIMIT 8`
    );
    const products = rows.map(r => ({ ...r, category: { id: r.cat_id, name: r.cat_name, nameAz: r.cat_name_az, slug: r.cat_slug } }));
    res.json({ success: true, data: products });
  } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, nameAz, description, descriptionAz, price, stock, categoryId, featured } = req.body;
    if (!name || !nameAz || !price || !categoryId) throw new AppError('Ad, qiymət və kateqoriya tələb olunur.', 400);

    const catCheck = await query('SELECT id FROM categories WHERE id=$1', [categoryId]);
    if (!catCheck.rows[0]) throw new AppError('Kateqoriya tapılmadı.', 404);

    const image = req.file ? `/uploads/products/${req.file.filename}` : null;
    const id = uuidv4();
    const { rows } = await query(
      `INSERT INTO products (id,name,name_az,description,description_az,price,stock,category_id,image,featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [id, name, nameAz, description||null, descriptionAz||null, parseFloat(price), parseInt(stock)||0, categoryId, image, featured==='true'||featured===true]
    );
    res.status(201).json({ success: true, message: 'Məhsul yaradıldı.', data: rows[0] });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nameAz, description, descriptionAz, price, stock, categoryId, featured, isActive } = req.body;

    const existing = await query('SELECT * FROM products WHERE id=$1', [id]);
    if (!existing.rows[0]) throw new AppError('Məhsul tapılmadı.', 404);

    let image = existing.rows[0].image;
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
      if (existing.rows[0].image) fs.unlink(path.join(__dirname, '../../', existing.rows[0].image), () => {});
    }

    const { rows } = await query(
      `UPDATE products SET
        name=COALESCE($1,name), name_az=COALESCE($2,name_az),
        description=COALESCE($3,description), description_az=COALESCE($4,description_az),
        price=COALESCE($5,price), stock=COALESCE($6,stock),
        category_id=COALESCE($7,category_id), image=$8,
        featured=COALESCE($9,featured), is_active=COALESCE($10,is_active),
        updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, nameAz, description, descriptionAz,
       price ? parseFloat(price) : null,
       stock !== undefined ? parseInt(stock) : null,
       categoryId, image,
       featured !== undefined ? (featured==='true'||featured===true) : null,
       isActive !== undefined ? (isActive==='true'||isActive===true) : null,
       id]
    );
    res.json({ success: true, message: 'Məhsul yeniləndi.', data: rows[0] });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await query('UPDATE products SET is_active=false, updated_at=NOW() WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Məhsul silindi.' });
  } catch (err) { next(err); }
};

module.exports = { getProducts, getProductById, getFeaturedProducts, createProduct, updateProduct, deleteProduct };
