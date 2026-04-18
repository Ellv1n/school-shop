const prisma = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      recentOrders,
      ordersByStatus,
      lowStockProducts,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.category.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          orderItems: true
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        include: { category: true },
        take: 10,
        orderBy: { stock: 'asc' }
      }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { not: 'CANCELLED' } }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalCategories,
          totalRevenue: totalRevenue._sum.totalPrice || 0
        },
        recentOrders,
        ordersByStatus,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true, name: true, email: true, role: true,
          phone: true, createdAt: true,
          _count: { select: { orders: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count()
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getAllUsers };
