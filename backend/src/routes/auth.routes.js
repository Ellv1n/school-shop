const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/auth.controller');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required')
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerRules, validate, ctrl.register);
router.post('/login', loginRules, validate, ctrl.login);
router.get('/profile', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().isMobilePhone()
], validate, ctrl.updateProfile);
router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], validate, ctrl.changePassword);

module.exports = router;
