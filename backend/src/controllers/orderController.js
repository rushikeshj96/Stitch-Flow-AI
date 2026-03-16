const Order = require('../models/Order');
const Customer = require('../models/Customer');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.customer) filter.customer = req.query.customer;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('customer', 'name phone avatar')
            .sort({ dueDate: 1 }).skip(skip).limit(limit),
        Order.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
        .populate('customer', 'name phone email address');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: { order } });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
    const { advancePaid, items } = req.body;

    // We expect the frontend to pass the items at minimum. 
    // The pre-save hook will calculate subtotal, gstAmount, and totalAmount.

    const order = await Order.create({ ...req.body, user: req.user._id });
    // Update customer stats
    await Customer.findByIdAndUpdate(order.customer, { $inc: { totalOrders: 1, totalSpent: order.totalAmount } });
    res.status(201).json({ success: true, data: { order } });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: { order } });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        {
            status,
            $push: { statusHistory: { status, changedBy: req.user._id } },
            ...(status === 'delivered' ? { deliveredDate: new Date() } : {}),
        },
        { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: { order } });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    // BUG-07 fix: Decrement customer stats when order is deleted
    await Customer.findByIdAndUpdate(order.customer, {
        $inc: { totalOrders: -1, totalSpent: -order.totalAmount },
    });
    res.json({ success: true, message: 'Record deleted successfully' });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res) => {
    const stats = await Order.aggregate([
        { $match: { user: req.user._id } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' },
            }
        },
    ]);
    res.json({ success: true, data: { stats } });
});
