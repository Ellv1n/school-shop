const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/error.middleware');

// Helper: normalize DB row to camelCase
const normalize = (r) => ({
  id: r.id,
  name: r.name,
  nameAz: r.name_az,
  slug: r.slug,
  description: r.description,
  icon: r.icon,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  _count: { products: parseInt(r.product_count || 0) },
});

const getAllCategories = async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT c.*, COUNT(p.id) FILTER (WHERE p.is_active=true) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id ORDER BY c.name_az
    `);
    res.json({ success: true, data: rows.map(normalize) });
  } catch (err) { next(err); }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.*, 0 AS product_count FROM categories c WHERE slug=$1`,
      [req.params.slug]
    );
    if (!rows[0]) throw new AppError('Kateqoriya tapılmadı.', 404);
    res.json({ success: true, data: normalize(rows[0]) });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, nameAz, description, icon } = req.body;
    if (!name || !nameAz) throw new AppError('Ad tələb olunur.', 400);
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = uuidv4();
    const { rows } = await query(
      `INSERT INTO categories (id, name, name_az, slug, description, icon)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *, 0 AS product_count`,
      [id, name, nameAz, slug, description || null, icon || null]
    );
    res.status(201).json({ success: true, message: 'Kateqoriya yaradıldı.', data: normalize(rows[0]) });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nameAz, description, icon } = req.body;
    const slug = name ? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null;
    const { rows } = await query(
      `UPDATE categories SET
        name=COALESCE($1,name), name_az=COALESCE($2,name_az),
        slug=COALESCE($3,slug), description=COALESCE($4,description),
        icon=COALESCE($5,icon), updated_at=NOW()
       WHERE id=$6 RETURNING *, 0 AS product_count`,
      [name || null, nameAz || null, slug, description || null, icon || null, id]
    );
    if (!rows[0]) throw new AppError('Kateqoriya tapılmadı.', 404);
    res.json({ success: true, message: 'Yeniləndi.', data: normalize(rows[0]) });
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await query('SELECT COUNT(*) FROM products WHERE category_id=$1', [id]);
    if (parseInt(rows[0].count) > 0)
      throw new AppError(`Bu kateqoriyada ${rows[0].count} məhsul var.`, 400);
    await query('DELETE FROM categories WHERE id=$1', [id]);
    res.json({ success: true, message: 'Silindi.' });
  } catch (err) { next(err); }
};

module.exports = { getAllCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };
