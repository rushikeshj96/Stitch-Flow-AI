const User = require('../models/User');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Measurement = require('../models/Measurement');
const Notification = require('../models/Notification');
const AIDesign = require('../models/AIDesign');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Delete user account and all associated data
// @route   DELETE /api/users/delete-account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Delete associated data
    await Customer.deleteMany({ user: userId });
    await Order.deleteMany({ user: userId });
    await Measurement.deleteMany({ user: userId });
    await Notification.deleteMany({ user: userId });
    await AIDesign.deleteMany({ user: userId });

    // Attempt to delete any payments logged by this user (normally tied to order, but wait - Payments are subdocuments in Orders, so they are already deleted when orders are deleted).
    // The prompt mentions: collections to clean: customers, orders, measurements, payments, ai_logs, notifications
    // Payments are inside orders, ai_logs might be AIDesign. I deleted AIDesign.

    // Delete the user record
    await User.findByIdAndDelete(userId);

    res.json({
        success: true,
        message: 'Account and all associated data deleted successfully'
    });
});
