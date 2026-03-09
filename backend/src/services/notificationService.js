const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

/**
 * Fetch all notifications for user (most recent first, limit 50).
 */
const getAll = async (userId) => {
    const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
    return { notifications, unreadCount };
};

/**
 * Mark single notification as read.
 */
const markRead = async (userId, id) => {
    const n = await Notification.findOneAndUpdate(
        { _id: id, user: userId }, { isRead: true }, { new: true }
    );
    if (!n) throw new AppError('Notification not found', 404);
    return n;
};

/**
 * Mark ALL unread notifications as read.
 */
const markAllRead = async (userId) => {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};

/**
 * Delete a notification.
 */
const remove = async (userId, id) => {
    const n = await Notification.findOneAndDelete({ _id: id, user: userId });
    if (!n) throw new AppError('Notification not found', 404);
};

/**
 * Create a system notification programmatically.
 * @param {{ userId, title, message, type, link }} opts
 */
const create = async ({ userId, title, message, type = 'system', link }) => {
    return Notification.create({ user: userId, title, message, type, link });
};

/**
 * Bulk create notifications (e.g., for overdue order alerts).
 */
const bulkCreate = async (notifications) => {
    return Notification.insertMany(notifications, { ordered: false });
};

module.exports = { getAll, markRead, markAllRead, remove, create, bulkCreate };
