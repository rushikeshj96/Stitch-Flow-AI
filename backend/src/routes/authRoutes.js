const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const {
    signup, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword,
} = require('../controllers/authController');

// Public
router.post('/signup',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .matches(/[A-Z]/).withMessage('Must contain 1 uppercase letter')
            .matches(/\d/).withMessage('Must contain 1 number'),
    ],
    validate,
    signup
);

router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
    ],
    validate,
    login
);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected
router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
