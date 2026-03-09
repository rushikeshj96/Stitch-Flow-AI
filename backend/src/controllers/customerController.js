const Customer = require('../models/Customer');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all customers (with pagination & search)
// @route   GET /api/customers
// @access  Private
exports.getCustomers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id, isActive: true };
    if (req.query.q) {
        filter.$text = { $search: req.query.q };
    }
    if (req.query.gender) filter.gender = req.query.gender;

    const [customers, total] = await Promise.all([
        Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Customer.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: { customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: { customer } });
});

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: { customer } });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: { customer } });
});

// @desc    Delete (soft-delete) customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isActive: false },
        { new: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted' });
});
