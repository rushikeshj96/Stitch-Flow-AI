const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// ─── Helper ────────────────────────────────────────────
const tokenResponse = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({ success: true, token, data: { user } });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res) => {
    const { name, email, password, boutiqueName, phone } = req.body;
    const user = await User.create({ name, email, password, boutiqueName, phone });
    tokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    tokenResponse(user, 200, res);
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
    res.json({ success: true, data: { user: req.user } });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = ['name', 'boutiqueName', 'phone', 'avatar'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true, runValidators: true,
    });
    res.json({ success: true, data: { user } });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    tokenResponse(user, 200, res);
});
