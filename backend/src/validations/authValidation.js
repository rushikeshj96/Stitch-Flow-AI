const { body } = require('express-validator');

exports.signupValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8 }).withMessage('Min 8 characters')
        .matches(/[A-Z]/).withMessage('Needs 1 uppercase')
        .matches(/\d/).withMessage('Needs 1 number'),
    body('boutiqueName').optional().trim(),
    body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone'),
];

exports.loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];
