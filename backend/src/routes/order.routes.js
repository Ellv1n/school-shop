const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/order.controller');

router.post('/', authenticate, ctrl.createOrder);
router.get('/my-orders', authenticate, ctrl.getMyOrders);
router.get('/my-orders/:id', authenticate, ctrl.getOrderById);

// Admin
router.get('/admin/all', authenticate, requireAdmin, ctrl.getAllOrders);
router.patch('/admin/:id/status', authenticate, requireAdmin, ctrl.updateOrderStatus);

module.exports = router;
