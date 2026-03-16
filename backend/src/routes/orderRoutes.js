const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getOrders, getOrder, createOrder, updateOrder, updateStatus, deleteOrder, getStats,
} = require('../controllers/orderController');
const {
    generateOrderReceipt, sendReceiptViaWhatsApp, markPaymentReceived, getReceiptInfo,
} = require('../controllers/receiptController');
const {
    addPayment, getPayments, deletePayment, sendPaymentReminder,
} = require('../controllers/paymentController');
const asyncHandler = require('../utils/asyncHandler');
const deliveryReminderSvc = require('../services/deliveryReminderService');
const { generateReceipt } = require('../services/receiptService');

router.use(protect);

router.get('/stats', getStats);

// PRD Feature 7: Delivery Reminder System
router.get('/delivery-status', asyncHandler(async (req, res) => {
    const result = await deliveryReminderSvc.getDeliveryStatus(req.user._id);
    res.json({ success: true, data: result });
}));

router.post('/check-reminders', asyncHandler(async (req, res) => {
    const result = await deliveryReminderSvc.checkAndNotify(req.user._id);
    res.json({ success: true, data: result });
}));

router.route('/')
    .get(getOrders)
    .post(asyncHandler(async (req, res, next) => {
        // Create the order
        const order = await require('../models/Order').create({ ...req.body, user: req.user._id });
        const Customer = require('../models/Customer');
        await Customer.findByIdAndUpdate(order.customer, { $inc: { totalOrders: 1, totalSpent: order.totalAmount } });

        // Auto-generate receipt (non-blocking — don't fail if PDF fails)
        generateReceipt(order._id, req.user).catch(err =>
            console.warn('[Receipt] Auto-generation failed:', err.message)
        );

        res.status(201).json({ success: true, data: { order } });
    }));

router.route('/:id')
    .get(getOrder)
    .put(updateOrder)
    .delete(deleteOrder);

router.patch('/:id/status', updateStatus);

// ── Receipt & WhatsApp routes ──────────────────────────────
router.get('/:id/receipt', getReceiptInfo);
router.post('/:id/generate-receipt', generateOrderReceipt);
router.post('/:id/send-receipt', sendReceiptViaWhatsApp);
router.patch('/:id/mark-paid', markPaymentReceived);

// ── Payment routes ──────────────────────────────────────
router.get('/:id/payments', getPayments);
router.post('/:id/payments', addPayment);
router.delete('/:id/payments/:paymentId', deletePayment);
router.post('/:id/payment-reminder', sendPaymentReminder);

module.exports = router;
