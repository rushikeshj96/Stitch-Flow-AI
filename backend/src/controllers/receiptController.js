'use strict';

const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const { generateReceipt } = require('../services/receiptService');
const { prepareReceiptPayload, markWhatsAppSent } = require('../services/whatsappService');

// ─────────────────────────────────────────────────────────────────
// @desc    Generate (or re-generate) PDF receipt for an order
// @route   POST /api/orders/:id/generate-receipt
// @access  Private
// ─────────────────────────────────────────────────────────────────
exports.generateOrderReceipt = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const { receiptUrl, receiptNumber } = await generateReceipt(order._id, req.user);

    res.json({
        success: true,
        message: 'Receipt generated successfully',
        data: { receiptUrl, receiptNumber },
    });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Retrieve WhatsApp click-to-chat URL for sending receipt
// @route   POST /api/orders/:id/send-receipt
// @access  Private
// ─────────────────────────────────────────────────────────────────
exports.sendReceiptViaWhatsApp = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Auto-generate receipt if not yet done
    if (!order.receiptUrl) {
        await generateReceipt(order._id, req.user);
        await order.reload?.();
    }

    const payload = await prepareReceiptPayload(order._id);

    // Mark as sent
    await markWhatsAppSent(order._id);

    res.json({
        success: true,
        message: 'WhatsApp link prepared',
        data: payload,
    });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Mark order payment as received / paid
// @route   PATCH /api/orders/:id/mark-paid
// @access  Private
// ─────────────────────────────────────────────────────────────────
exports.markPaymentReceived = asyncHandler(async (req, res) => {
    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { paymentStatus: 'paid', balanceDue: 0 },
        { new: true }
    ).populate('customer', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Re-generate receipt with updated payment status
    try { await generateReceipt(order._id, req.user); } catch (_) { /* non-blocking */ }

    res.json({ success: true, message: 'Payment marked as received', data: { order } });
});

// ─────────────────────────────────────────────────────────────────
// @desc    Get receipt info for an order
// @route   GET /api/orders/:id/receipt
// @access  Private
// ─────────────────────────────────────────────────────────────────
exports.getReceiptInfo = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
        .select('receiptUrl receiptNumber paymentStatus whatsappSent whatsappSentAt orderNumber');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: { order } });
});
