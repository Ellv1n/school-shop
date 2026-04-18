const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/order.controller');

router.post('/', authenticate, [
  body('customerName').trim().notEmpty().withMessage('Name is required'),
  body('customerPhone').trim().notEmpty().withMessage('Phone is required'),
  body('address').trim().notEmpty().withMessage('Address is required')
], validate, ctrl.createOrder);

router.get('/my-orders', authenticate, ctrl.getMyOrders);
router.get('/my-orders/:id', authenticate, ctrl.getOrderById);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, ctrl.getAllOrders);
router.patch('/admin/:id/status', authenticate, requireAdmin, [
  body('status').notEmpty().withMessage('Status is required')
], validate, ctrl.updateOrderStatus);

module.exports = router;
