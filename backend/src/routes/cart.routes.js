const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/cart.controller');

router.get('/', authenticate, ctrl.getCart);
router.post('/add', authenticate, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], validate, ctrl.addToCart);
router.put('/items/:itemId', authenticate, [
  body('quantity').isInt({ min: 0 }).withMessage('Valid quantity required')
], validate, ctrl.updateCartItem);
router.delete('/items/:itemId', authenticate, ctrl.removeFromCart);
router.delete('/clear', authenticate, ctrl.clearCart);

module.exports = router;
