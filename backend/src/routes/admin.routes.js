const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/admin.controller');

router.get('/dashboard', authenticate, requireAdmin, ctrl.getDashboardStats);
router.get('/users', authenticate, requireAdmin, ctrl.getAllUsers);

module.exports = router;
