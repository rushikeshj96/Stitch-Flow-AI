const Measurement = require('../models/Measurement');
const AppError = require('../utils/AppError');

/**
 * All measurement profiles for a customer.
 */
const getByCustomer = async (userId, customerId) => {
    return Measurement.find({ user: userId, customer: customerId }).sort({ createdAt: -1 });
};

/**
 * Single measurement by ID.
 */
const getById = async (userId, id) => {
    const m = await Measurement.findOne({ _id: id, user: userId }).populate('customer', 'name');
    if (!m) throw new AppError('Measurement not found', 404);
    return m;
};

/**
 * Create a new measurement.
 */
const create = async (userId, data) => {
    return Measurement.create({ ...data, user: userId });
};

/**
 * Update an existing measurement.
 */
const update = async (userId, id, data) => {
    const m = await Measurement.findOneAndUpdate({ _id: id, user: userId }, data, { new: true, runValidators: true });
    if (!m) throw new AppError('Measurement not found', 404);
    return m;
};

/**
 * Delete a measurement.
 */
const remove = async (userId, id) => {
    const m = await Measurement.findOneAndDelete({ _id: id, user: userId });
    if (!m) throw new AppError('Measurement not found', 404);
};

module.exports = { getByCustomer, getById, create, update, remove };
