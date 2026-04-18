const prisma = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

const getCart = async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { include: { category: true } }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: { include: { product: { include: { category: true } } } } }
      });
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        ...cart,
        total: total.toFixed(2),
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new AppError('Product not found.', 404);
    if (product.stock < quantity) throw new AppError(`Only ${product.stock} items in stock.`, 400);

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });

    let cartItem;
    if (existingItem) {
      const newQty = existingItem.quantity + parseInt(quantity);
      if (product.stock < newQty) throw new AppError(`Only ${product.stock} items in stock.`, 400);
      
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
        include: { product: { include: { category: true } } }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity: parseInt(quantity) },
        include: { product: { include: { category: true } } }
      });
    }

    res.json({ success: true, message: 'Item added to cart.', data: cartItem });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) throw new AppError('Cart not found.', 404);

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true }
    });
    if (!cartItem) throw new AppError('Cart item not found.', 404);

    if (cartItem.product.stock < parseInt(quantity)) {
      throw new AppError(`Only ${cartItem.product.stock} items in stock.`, 400);
    }

    if (parseInt(quantity) <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: parseInt(quantity) },
      include: { product: { include: { category: true } } }
    });

    res.json({ success: true, message: 'Cart updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) throw new AppError('Cart not found.', 404);

    const cartItem = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!cartItem) throw new AppError('Cart item not found.', 404);

    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
