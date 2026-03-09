const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
    name: {
        type: String, required: [true, 'Name is required'], trim: true, maxlength: 50,
    },
    email: {
        type: String, required: [true, 'Email is required'], unique: true,
        lowercase: true, trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
        type: String, required: [true, 'Password is required'], minlength: 8, select: false,
    },
    role: {
        type: String, enum: ['admin', 'manager', 'staff'], default: 'admin',
    },
    boutiqueName: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT
userSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, config.jwt.secret, {
        expiresIn: config.jwt.expire,
    });
};

// Strip sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpire;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
