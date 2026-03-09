const Customer = require('../models/Customer');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;

/**
 * List customers with search + pagination.
 */
const getAll = async (userId, { page = DEFAULT_PAGE, limit = DEFAULT_PAGE_SIZE, q } = {}) => {
    const query = { user: userId, isActive: true };
    if (q) query.$text = { $search: q };

    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
        Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Customer.countDocuments(query),
    ]);

    return { customers, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } };
};

/**
 * Get single customer by ID (must belong to the user).
 */
const getById = async (userId, customerId) => {
    const customer = await Customer.findOne({ _id: customerId, user: userId, isActive: true });
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
};

/**
 * Create a new customer.
 */
const create = async (userId, data) => {
    return Customer.create({ ...data, user: userId });
};

/**
 * Update a customer's fields.
 */
const update = async (userId, customerId, data) => {
    const BLOCKED = ['user', 'totalOrders', 'totalSpent', 'isActive'];
    BLOCKED.forEach(k => delete data[k]);

    const customer = await Customer.findOneAndUpdate(
        { _id: customerId, user: userId }, data, { new: true, runValidators: true }
    );
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
};

/**
 * Soft-delete a customer (sets isActive = false).
 */
const remove = async (userId, customerId) => {
    const customer = await Customer.findOneAndUpdate(
        { _id: customerId, user: userId },
        { isActive: false },
        { new: true }
    );
    if (!customer) throw new AppError('Customer not found', 404);
};

/**
 * Get all orders for a customer.
 */
const getOrders = async (userId, customerId) => {
    await getById(userId, customerId); // ensure ownership
    return Order.find({ customer: customerId, user: userId }).sort({ createdAt: -1 });
};

/**
 * Quick search — returns up to 10 matches.
 */
const search = async (userId, q) => {
    if (!q || q.length < 2) return [];
    return Customer.find({ user: userId, isActive: true, $text: { $search: q } })
        .select('name phone email')
        .limit(10);
};

module.exports = { getAll, getById, create, update, remove, getOrders, search };
