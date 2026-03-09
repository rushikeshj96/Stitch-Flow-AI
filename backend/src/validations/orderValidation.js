const { body } = require('express-validator');

exports.orderValidation = [
    body('customer').notEmpty().withMessage('Customer ID required'),
    body('items').isArray({ min: 1 }).withMessage('At least 1 item required'),
    body('items.*.garmentType').notEmpty().withMessage('Garment type required'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Valid price required'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Valid total amount required'),
    body('dueDate').isISO8601().withMessage('Valid due date required'),
    body('priority').optional().isIn(['normal', 'high', 'urgent']),
];
