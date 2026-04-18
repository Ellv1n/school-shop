const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/category.controller');

router.get('/', ctrl.getAllCategories);
router.get('/:slug', ctrl.getCategoryBySlug);
router.post('/', authenticate, requireAdmin, ctrl.createCategory);
router.put('/:id', authenticate, requireAdmin, ctrl.updateCategory);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteCategory);

module.exports = router;
