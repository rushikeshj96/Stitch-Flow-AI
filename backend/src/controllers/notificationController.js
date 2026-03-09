const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/notifications
 */
exports.getAll = asyncHandler(async (req, res) => {
    const { notifications, unreadCount } = await notificationService.getAll(req.user._id);
    res.json({ success: true, data: { notifications, unreadCount } });
});

/**
 * PATCH /api/notifications/:id/read
 */
exports.markRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markRead(req.user._id, req.params.id);
    res.json({ success: true, data: { notification } });
});

/**
 * PATCH /api/notifications/read-all
 */
exports.markAllRead = asyncHandler(async (req, res) => {
    await notificationService.markAllRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
});

/**
 * DELETE /api/notifications/:id
 */
exports.remove = asyncHandler(async (req, res) => {
    await notificationService.remove(req.user._id, req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
});
