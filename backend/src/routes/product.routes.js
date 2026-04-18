const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const ctrl = require('../controllers/product.controller');

router.get('/', ctrl.getProducts);
router.get('/featured', ctrl.getFeaturedProducts);
router.get('/:id', ctrl.getProductById);

router.post('/', authenticate, requireAdmin, upload.single('image'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('nameAz').trim().notEmpty().withMessage('Azerbaijani name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock count required'),
  body('categoryId').notEmpty().withMessage('Category is required')
], validate, ctrl.createProduct);

router.put('/:id', authenticate, requireAdmin, upload.single('image'), ctrl.updateProduct);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteProduct);

module.exports = router;
