const { body } = require('express-validator');

exports.customerValidation = [
    body('name').trim().notEmpty().withMessage('Customer name required'),
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian phone required'),
    body('email').optional().isEmail().normalizeEmail(),
    body('gender').optional().isIn(['male', 'female', 'other']),
];
