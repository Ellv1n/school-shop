const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/category.controller');

router.get('/', ctrl.getAllCategories);
router.get('/:slug', ctrl.getCategoryBySlug);
router.post('/', authenticate, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('nameAz').trim().notEmpty().withMessage('Azerbaijani name is required')
], validate, ctrl.createCategory);
router.put('/:id', authenticate, requireAdmin, ctrl.updateCategory);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteCategory);

module.exports = router;
