const prisma = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerPhone, address, notes } = req.body;

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: { include: { product: true } }
      }
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty.', 400);
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new AppError(`Product "${item.product.name}" is no longer available.`, 400);
      }
      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`, 400);
      }
    }

    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalPrice,
          customerName,
          customerPhone,
          address,
          notes,
          orderItems: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        },
        include: {
          orderItems: { include: { product: true } }
        }
      });

      // Decrease stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          orderItems: {
            include: { product: { select: { id: true, name: true, nameAz: true, image: true } } }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where: { userId: req.user.id } })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { id, userId: req.user.id },
      include: {
        orderItems: { include: { product: true } }
      }
    });
    if (!order) throw new AppError('Order not found.', 404);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          orderItems: { include: { product: { select: { id: true, name: true, image: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid order status.', 400);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } }
      }
    });

    res.json({ success: true, message: 'Order status updated.', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
