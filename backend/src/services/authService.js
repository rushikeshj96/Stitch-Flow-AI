const User = require('../models/User');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const config = require('../config/config');

/**
 * Register a new user/boutique owner.
 */
const register = async ({ name, email, password, boutiqueName, phone }) => {
    const exists = await User.findOne({ email });
    if (exists) throw new AppError('Email already registered', 409);

    const user = await User.create({ name, email, password, boutiqueName, phone });
    const token = user.getSignedToken();
    return { user, token };
};

/**
 * Login with email + password.
 */
const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password', 401);
    }
    if (!user.isActive) throw new AppError('Account deactivated. Contact support.', 403);

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.getSignedToken();
    return { user, token };
};

/**
 * Get profile by user ID.
 */
const getProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
};

/**
 * Update profile fields (name, boutiqueName, phone).
 */
const updateProfile = async (userId, updates) => {
    const ALLOWED = ['name', 'boutiqueName', 'phone', 'avatar'];
    const safe = {};
    ALLOWED.forEach(k => { if (updates[k] !== undefined) safe[k] = updates[k]; });

    const user = await User.findByIdAndUpdate(userId, safe, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found', 404);
    return user;
};

/**
 * Change password after verifying current password.
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const match = await user.comparePassword(currentPassword);
    if (!match) throw new AppError('Current password is incorrect', 401);

    user.password = newPassword;
    await user.save();
    return user;
};

/**
 * Generate and email a password-reset token.
 */
const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new AppError('No account with that email', 404);

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
    await sendEmail({
        to: user.email,
        subject: 'StitchFlow AI – Password Reset',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 10 minutes.</p>`,
    });
};

/**
 * Reset password using token from email.
 */
const resetPassword = async (token, newPassword) => {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: hashed,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) throw new AppError('Reset token is invalid or expired', 400);

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return user.getSignedToken();
};

module.exports = { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword };
