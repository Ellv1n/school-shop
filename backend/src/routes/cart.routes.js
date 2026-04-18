const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/cart.controller');

router.get('/', authenticate, ctrl.getCart);
router.post('/add', authenticate, ctrl.addToCart);
router.put('/items/:itemId', authenticate, ctrl.updateCartItem);
router.delete('/items/:itemId', authenticate, ctrl.removeFromCart);
router.delete('/clear', authenticate, ctrl.clearCart);

module.exports = router;
