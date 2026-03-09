const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Customer name is required'], trim: true },
    phone: {
        type: String, required: [true, 'Phone number is required'],
        match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
    },
    email: { type: String, lowercase: true, trim: true },
    address: {
        street: String, city: String, state: String, pincode: String,
    },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: Date,
    avatar: String,
    notes: String,
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
}, { timestamps: true });

customerSchema.index({ user: 1, phone: 1 }, { unique: true });
customerSchema.index({ user: 1, name: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
