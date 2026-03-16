'use strict';

const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const { generateReceipt } = require('../services/receiptService');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a payment record to an order
// @route   POST /api/orders/:id/payments
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.addPayment = asyncHandler(async (req, res) => {
    const { amount, method, notes, date } = req.body;

    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
        .populate('customer', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.paidAmount >= order.totalAmount) {
        return res.status(400).json({ success: false, message: 'Order is already fully paid' });
    }

    const payAmount = Math.min(Number(amount), order.balanceDue); // cap at balance

    // Push payment entry
    order.paymentHistory.push({
        amount: payAmount,
        method: method || 'Cash',
        date: date ? new Date(date) : new Date(),
        notes: notes || '',
        recordedBy: req.user._id,
    });

    // Update running total (pre-save hook handles balanceDue + paymentStatus)
    order.paidAmount += payAmount;
    await order.save();

    // Auto re-generate receipt with updated payment info (non-blocking)
    generateReceipt(order._id, req.user).catch(() => { });

    res.status(201).json({
        success: true,
        message: `Payment of ₹${payAmount.toLocaleString('en-IN')} recorded successfully`,
        data: { order },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get full payment history for an order
// @route   GET /api/orders/:id/payments
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getPayments = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
        .select('orderNumber totalAmount paidAmount balanceDue paymentStatus paymentHistory')
        .populate('paymentHistory.recordedBy', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: { order } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a payment entry from history (undo payment)
// @route   DELETE /api/orders/:id/payments/:paymentId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.deletePayment = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const entry = order.paymentHistory.id(req.params.paymentId);
    if (!entry) return res.status(404).json({ success: false, message: 'Payment entry not found' });

    // Restore the amount
    order.paidAmount = Math.max(0, order.paidAmount - entry.amount);
    entry.deleteOne();
    await order.save();

    res.json({ success: true, message: 'Payment entry removed', data: { order } });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Payment analytics summary for dashboard
// @route   GET /api/payments/summary
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.getPaymentSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [summary, monthly] = await Promise.all([
        // Overall aggregation by paymentStatus
        Order.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    paidAmount: { $sum: '$paidAmount' },
                    balanceDue: { $sum: '$balanceDue' },
                },
            },
        ]),
        // Last 6 months collected payments
        Order.aggregate([
            { $match: { user: userId } },
            { $unwind: '$paymentHistory' },
            {
                $group: {
                    _id: {
                        year: { $year: '$paymentHistory.date' },
                        month: { $month: '$paymentHistory.date' },
                    },
                    collected: { $sum: '$paymentHistory.amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 },
        ]),
    ]);

    // Flatten to easy totals
    const totals = summary.reduce((acc, s) => {
        acc[s._id] = s;
        return acc;
    }, {});

    const allOrders = summary.reduce(
        (a, s) => ({ ...a, totalRevenue: a.totalRevenue + s.totalAmount, totalCollected: a.totalCollected + s.paidAmount, totalPending: a.totalPending + s.balanceDue }),
        { totalRevenue: 0, totalCollected: 0, totalPending: 0 }
    );

    res.json({
        success: true,
        data: {
            ...allOrders,
            byStatus: summary,
            paidOrders: totals.paid?.count || 0,
            partialOrders: totals.partial?.count || 0,
            pendingOrders: totals.pending?.count || 0,
            overdueOrders: totals.overdue?.count || 0,
            overdueAmount: totals.overdue?.balanceDue || 0,
            monthlyTrend: monthly,
        },
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Send WhatsApp payment reminder
// @route   POST /api/orders/:id/payment-reminder
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
exports.sendPaymentReminder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
        .populate('customer', 'name phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.customer) return res.status(400).json({ success: false, message: 'No customer linked' });
    if (order.paymentStatus === 'paid') {
        return res.status(400).json({ success: false, message: 'Order is already paid' });
    }

    const { customer } = order;
    const shopName = process.env.SHOP_NAME || 'StitchFlow Boutique';
    const digits = customer.phone.replace(/\D/g, '');
    const phone = digits.length === 10 ? `91${digits}` : digits;

    const message = [
        `Hello *${customer.name}* 👋`,
        '',
        `This is a gentle reminder from *${shopName}*.`,
        '',
        `💳 *Payment Due for Order ${order.orderNumber}*`,
        `• Total Amount:    ₹${order.totalAmount.toLocaleString('en-IN')}`,
        `• Amount Paid:     ₹${order.paidAmount.toLocaleString('en-IN')}`,
        `• *Remaining:      ₹${order.balanceDue.toLocaleString('en-IN')}*`,
        '',
        `Please arrange payment at your earliest convenience.`,
        '',
        `Thank you for choosing *${shopName}*! 🙏`,
    ].join('\n');

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    res.json({
        success: true,
        message: 'Reminder link generated',
        data: { whatsappUrl: waUrl, reminderMessage: message },
    });
});
