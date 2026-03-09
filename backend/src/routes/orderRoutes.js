const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getOrders, getOrder, createOrder, updateOrder, updateStatus, deleteOrder, getStats,
} = require('../controllers/orderController');
const asyncHandler = require('../utils/asyncHandler');
const deliveryReminderSvc = require('../services/deliveryReminderService');

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
    .post(createOrder);

router.route('/:id')
    .get(getOrder)
    .put(updateOrder)
    .delete(deleteOrder);

router.patch('/:id/status', updateStatus);

module.exports = router;

