// product.routes.js
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const ctrl = require('../controllers/product.controller');

router.get('/', ctrl.getProducts);
router.get('/featured', ctrl.getFeaturedProducts);
router.get('/:id', ctrl.getProductById);
router.post('/', authenticate, requireAdmin, upload.single('image'), ctrl.createProduct);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), ctrl.updateProduct);
router.delete('/:id', authenticate, requireAdmin, ctrl.deleteProduct);

module.exports = router;
