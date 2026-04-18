const prisma = require('../config/database');
const { AppError } = require('../middleware/error.middleware');
const path = require('path');
const fs = require('fs');

const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      categoryId,
      categorySlug,
      search,
      featured,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { isActive: true };

    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) {
      const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (category) where.categoryId = category.id;
    }
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAz: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const validSortFields = ['createdAt', 'price', 'name', 'stock'];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!product || !product.isActive) throw new AppError('Product not found.', 404);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, nameAz, description, descriptionAz, price, stock, categoryId, featured } = req.body;
    const image = req.file ? `/uploads/products/${req.file.filename}` : null;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError('Category not found.', 404);

    const product = await prisma.product.create({
      data: {
        name, nameAz,
        description, descriptionAz,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        image,
        featured: featured === 'true' || featured === true
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, message: 'Product created.', data: product });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nameAz, description, descriptionAz, price, stock, categoryId, featured, isActive } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError('Product not found.', 404);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (nameAz !== undefined) updateData.nameAz = nameAz;
    if (description !== undefined) updateData.description = description;
    if (descriptionAz !== undefined) updateData.descriptionAz = descriptionAz;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (featured !== undefined) updateData.featured = featured === 'true' || featured === true;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
      if (existing.image) {
        const oldPath = path.join(__dirname, '../../', existing.image);
        fs.unlink(oldPath, () => {});
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });

    res.json({ success: true, message: 'Product updated.', data: product });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Product not found.', 404);

    // Soft delete
    await prisma.product.update({ where: { id }, data: { isActive: false } });

    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true, isActive: true },
      include: { category: true },
      take: 8,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getFeaturedProducts
};
