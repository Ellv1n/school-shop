const prisma = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: { where: { isActive: true } } } }
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } }
    });
    if (!category) throw new AppError('Category not found.', 404);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, nameAz, description, icon } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const category = await prisma.category.create({
      data: { name, nameAz, slug, description, icon }
    });
    res.status(201).json({ success: true, message: 'Category created.', data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nameAz, description, icon } = req.body;
    
    const updateData = { nameAz, description, icon };
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });
    res.json({ success: true, message: 'Category updated.', data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new AppError(`Cannot delete category. It has ${productCount} products.`, 400);
    }
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };
