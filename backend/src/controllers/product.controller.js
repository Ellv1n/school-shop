const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../middleware/error.middleware');
const path = require('path');
const fs = require('fs');

// Normalize DB row → camelCase for frontend
const normalizeProduct = (r) => ({
  id: r.id,
  name: r.name,
  nameAz: r.name_az,
  description: r.description,
  descriptionAz: r.description_az,
  price: r.price,
  stock: r.stock,
  image: r.image,
  featured: r.featured,
  isActive: r.is_active,
  categoryId: r.category_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  category: r.cat_id ? {
    id: r.cat_id,
    name: r.cat_name,
    nameAz: r.cat_name_az,
    slug: r.cat_slug,
  } : null,
});

const PRODUCT_SELECT = `
  SELECT p.id, p.name, p.name_az, p.description, p.description_az,
         p.price, p.stock, p.image, p.featured, p.is_active,
         p.category_id, p.created_at, p.updated_at,
         c.id as cat_id, c.name as cat_name, c.name_az as cat_name_az, c.slug as cat_slug
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12,
      categoryId, categorySlug, search, featured,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ['p.is_active = true'];
    const params = [];
    let pi = 1;

    if (categorySlug) {
      params.push(categorySlug);
      conditions.push(`c.slug = $${pi++}`);
    }
    if (categoryId) {
      params.push(categoryId);
      conditions.push(`p.category_id = $${pi++}`);
    }
    if (featured === 'true') {
      conditions.push('p.featured = true');
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name_az ILIKE $${pi} OR p.name ILIKE $${pi++})`);
    }

    const where = 'WHERE ' + conditions.join(' AND ');
    const sortMap = {
      createdAt: 'p.created_at', price: 'p.price',
      name: 'p.name_az', stock: 'p.stock',
    };
    const orderCol = sortMap[sortBy] || 'p.created_at';
    const orderDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const [countRes, dataRes] = await Promise.all([
      query(
        `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON c.id=p.category_id ${where}`,
        [...params]
      ),
      query(
        `${PRODUCT_SELECT} ${where} ORDER BY ${orderCol} ${orderDir} LIMIT $${pi} OFFSET $${pi + 1}`,
        [...params, parseInt(limit), offset]
      ),
    ]);

    const total = parseInt(countRes.rows[0].count);
    res.json({
      success: true,
      data: dataRes.rows.map(normalizeProduct),
      pagination: {
        page: parseInt(page), limit: parseInt(limit),
        total, totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

const getProductById = async (req, res, next) => {
  try {
    const { rows } = await query(
      `${PRODUCT_SELECT} WHERE p.id = $1 AND p.is_active = true`,
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Məhsul tapılmadı.', 404);
    res.json({ success: true, data: normalizeProduct(rows[0]) });
  } catch (err) { next(err); }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const { rows } = await query(
      `${PRODUCT_SELECT} WHERE p.featured = true AND p.is_active = true ORDER BY p.created_at DESC LIMIT 8`
    );
    res.json({ success: true, data: rows.map(normalizeProduct) });
  } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, nameAz, description, descriptionAz, price, stock, categoryId, featured } = req.body;
    if (!name || !nameAz || !price || !categoryId)
      throw new AppError('Ad, qiymət və kateqoriya tələb olunur.', 400);

    const catCheck = await query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (!catCheck.rows[0]) throw new AppError('Kateqoriya tapılmadı.', 404);

    const image = req.file ? `/uploads/products/${req.file.filename}` : null;
    const id = uuidv4();

    await query(
      `INSERT INTO products
         (id, name, name_az, description, description_az, price, stock, category_id, image, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id, name, nameAz,
        description || null, descriptionAz || null,
        parseFloat(price), parseInt(stock) || 0,
        categoryId, image,
        featured === 'true' || featured === true,
      ]
    );

    const { rows } = await query(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]);
    res.status(201).json({ success: true, message: 'Məhsul yaradıldı.', data: normalizeProduct(rows[0]) });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nameAz, description, descriptionAz, price, stock, categoryId, featured, isActive } = req.body;

    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (!existing.rows[0]) throw new AppError('Məhsul tapılmadı.', 404);

    let image = existing.rows[0].image;
    if (req.file) {
      image = `/uploads/products/${req.file.filename}`;
      if (existing.rows[0].image) {
        fs.unlink(path.join(__dirname, '../../', existing.rows[0].image), () => {});
      }
    }

    await query(
      `UPDATE products SET
        name          = COALESCE($1, name),
        name_az       = COALESCE($2, name_az),
        description   = COALESCE($3, description),
        description_az= COALESCE($4, description_az),
        price         = COALESCE($5, price),
        stock         = COALESCE($6, stock),
        category_id   = COALESCE($7, category_id),
        image         = $8,
        featured      = COALESCE($9, featured),
        is_active     = COALESCE($10, is_active),
        updated_at    = NOW()
       WHERE id = $11`,
      [
        name || null, nameAz || null,
        description !== undefined ? description : null,
        descriptionAz !== undefined ? descriptionAz : null,
        price ? parseFloat(price) : null,
        stock !== undefined ? parseInt(stock) : null,
        categoryId || null,
        image,
        featured !== undefined ? (featured === 'true' || featured === true) : null,
        isActive !== undefined ? (isActive === 'true' || isActive === true) : null,
        id,
      ]
    );

    const { rows } = await query(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]);
    res.json({ success: true, message: 'Məhsul yeniləndi.', data: normalizeProduct(rows[0]) });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { rows } = await query(
      'UPDATE products SET is_active=false, updated_at=NOW() WHERE id=$1 RETURNING id',
      [req.params.id]
    );
    if (!rows[0]) throw new AppError('Məhsul tapılmadı.', 404);
    res.json({ success: true, message: 'Məhsul silindi.' });
  } catch (err) { next(err); }
};

module.exports = {
  getProducts, getProductById, getFeaturedProducts,
  createProduct, updateProduct, deleteProduct,
};
