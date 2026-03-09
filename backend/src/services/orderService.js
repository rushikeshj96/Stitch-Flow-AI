const Order = require('../models/Order');
const Customer = require('../models/Customer');
const AppError = require('../utils/AppError');

// Valid next status transitions
const STATUS_MACHINE = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in-progress', 'cancelled'],
    'in-progress': ['ready', 'cancelled'],
    ready: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

/**
 * Paginated order list with optional status filter.
 */
const getAll = async (userId, { page = DEFAULT_PAGE, limit = DEFAULT_PAGE_SIZE, status } = {}) => {
    const query = { user: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('customer', 'name phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments(query),
    ]);

    return { orders, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

/**
 * Get single order.
 */
const getById = async (userId, orderId) => {
    const order = await Order.findOne({ _id: orderId, user: userId })
        .populate('customer', 'name phone email');
    if (!order) throw new AppError('Order not found', 404);
    return order;
};

/**
 * Create order and update customer stats.
 */
const create = async (userId, data) => {
    const order = await Order.create({ ...data, user: userId });

    // Update customer stats
    await Customer.findByIdAndUpdate(data.customer, {
        $inc: { totalOrders: 1, totalSpent: order.totalAmount },
    });

    return order.populate('customer', 'name phone');
};

/**
 * Update order fields (not status — use updateStatus for that).
 */
const update = async (userId, orderId, data) => {
    const BLOCKED = ['user', 'customer', 'orderNumber', 'statusHistory', 'status'];
    BLOCKED.forEach(k => delete data[k]);

    // Recompute balanceDue if financials change
    if (data.totalAmount !== undefined || data.advancePaid !== undefined) {
        const existing = await Order.findOne({ _id: orderId, user: userId });
        if (!existing) throw new AppError('Order not found', 404);
        const total = data.totalAmount ?? existing.totalAmount;
        const advance = data.advancePaid ?? existing.advancePaid;
        data.balanceDue = Math.max(0, total - advance);
    }

    const order = await Order.findOneAndUpdate({ _id: orderId, user: userId }, data, {
        new: true, runValidators: true,
    }).populate('customer', 'name phone');

    if (!order) throw new AppError('Order not found', 404);
    return order;
};

/**
 * Advance order through the status machine.
 */
const updateStatus = async (userId, orderId, newStatus) => {
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new AppError('Order not found', 404);

    const allowed = STATUS_MACHINE[order.status] || [];
    if (!allowed.includes(newStatus)) {
        throw new AppError(`Cannot move from '${order.status}' to '${newStatus}'`, 400);
    }

    order.status = newStatus;
    order.statusHistory.push({ status: newStatus, changedBy: userId });
    if (newStatus === 'delivered') order.deliveredDate = new Date();

    await order.save();
    return order;
};

/**
 * Delete an order and roll back customer totalOrders.
 */
const remove = async (userId, orderId) => {
    const order = await Order.findOneAndDelete({ _id: orderId, user: userId });
    if (!order) throw new AppError('Order not found', 404);

    await Customer.findByIdAndUpdate(order.customer, {
        $inc: { totalOrders: -1, totalSpent: -order.totalAmount },
    });
};

/**
 * Aggregate stats per status for the dashboard.
 */
const getStats = async (userId) => {
    return Order.aggregate([
        { $match: { user: require('mongoose').Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]);
};

/**
 * Orders overdue (past dueDate, not delivered/cancelled).
 */
const getOverdue = async (userId) => {
    return Order.find({
        user: userId,
        dueDate: { $lt: new Date() },
        status: { $nin: ['delivered', 'cancelled'] },
    }).populate('customer', 'name phone');
};

module.exports = { getAll, getById, create, update, updateStatus, remove, getStats, getOverdue };
