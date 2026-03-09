/**
 * deliveryReminderService.js
 *
 * PRD Feature 7: Delivery Reminder System
 * "System detects upcoming deliveries. Example alert: '5 orders due tomorrow.'"
 *
 * This service:
 *  1. Finds all orders due within the next N days
 *  2. Creates in-app notifications for the boutique owner
 *  3. Can be triggered on a schedule (cron) or on dashboard load
 */

const Order = require('../models/Order');
const notificationSvc = require('./notificationService');
const logger = require('../utils/logger');

// How many days ahead to look for upcoming deliveries
const REMINDER_WINDOW_DAYS = 3;

/**
 * Run the delivery reminder check for a single user.
 * Called from the API route so the dashboard can trigger it on load.
 *
 * @param {string} userId
 * @returns {{ upcoming: Order[], overdue: Order[], remindersSent: number }}
 */
const checkAndNotify = async (userId) => {
    const now = new Date();
    const windowEnd = new Date();
    windowEnd.setDate(now.getDate() + REMINDER_WINDOW_DAYS);

    // Orders due within the next 3 days (not yet delivered / cancelled)
    const upcoming = await Order.find({
        user: userId,
        dueDate: { $gte: now, $lte: windowEnd },
        status: { $nin: ['delivered', 'cancelled'] },
    }).populate('customer', 'name phone').sort({ dueDate: 1 });

    // Overdue orders (past due, not delivered)
    const overdue = await Order.find({
        user: userId,
        dueDate: { $lt: now },
        status: { $nin: ['delivered', 'cancelled'] },
    }).populate('customer', 'name phone').sort({ dueDate: 1 });

    let remindersSent = 0;

    // Send notification for upcoming deliveries group
    if (upcoming.length > 0) {
        const dueToday = upcoming.filter(o => isSameDay(o.dueDate, now));
        const dueTomorrow = upcoming.filter(o => isSameDay(o.dueDate, addDays(now, 1)));
        const dueLater = upcoming.filter(o => !isSameDay(o.dueDate, now) && !isSameDay(o.dueDate, addDays(now, 1)));

        if (dueToday.length > 0) {
            await notificationSvc.create({
                userId,
                title: `🚨 ${dueToday.length} order${dueToday.length > 1 ? 's' : ''} due TODAY`,
                message: dueToday.map(o => `${o.customer?.name} – ${o.orderNumber}`).join(', '),
                type: 'delivery_reminder',
                link: '/orders?status=in-progress',
            });
            remindersSent++;
        }

        if (dueTomorrow.length > 0) {
            await notificationSvc.create({
                userId,
                title: `📅 ${dueTomorrow.length} order${dueTomorrow.length > 1 ? 's' : ''} due TOMORROW`,
                message: dueTomorrow.map(o => `${o.customer?.name} – ${o.orderNumber}`).join(', '),
                type: 'delivery_reminder',
                link: '/orders',
            });
            remindersSent++;
        }

        if (dueLater.length > 0) {
            await notificationSvc.create({
                userId,
                title: `📦 ${dueLater.length} upcoming delivery${dueLater.length > 1 ? 's' : ''} in ${REMINDER_WINDOW_DAYS} days`,
                message: dueLater.map(o => `${o.customer?.name} – ${formatDueDate(o.dueDate)}`).join(', '),
                type: 'delivery_reminder',
                link: '/orders',
            });
            remindersSent++;
        }
    }

    // Send notification for overdue orders
    if (overdue.length > 0) {
        await notificationSvc.create({
            userId,
            title: `⛔ ${overdue.length} overdue order${overdue.length > 1 ? 's' : ''}`,
            message: overdue.map(o => `${o.customer?.name} – was due ${formatDueDate(o.dueDate)}`).join(', '),
            type: 'overdue_alert',
            link: '/orders',
        });
        remindersSent++;
    }

    logger.info(`[DeliveryReminder] user=${userId}: ${upcoming.length} upcoming, ${overdue.length} overdue, ${remindersSent} notifications sent`);

    return { upcoming, overdue, remindersSent };
};

/**
 * Get upcoming + overdue orders WITHOUT creating notifications.
 * Used to render the delivery reminder widget on the dashboard.
 */
const getDeliveryStatus = async (userId) => {
    const now = new Date();
    const windowEnd = new Date();
    windowEnd.setDate(now.getDate() + REMINDER_WINDOW_DAYS);

    const [upcoming, overdue] = await Promise.all([
        Order.find({
            user: userId,
            dueDate: { $gte: now, $lte: windowEnd },
            status: { $nin: ['delivered', 'cancelled'] },
        }).populate('customer', 'name phone').sort({ dueDate: 1 }).limit(10),

        Order.find({
            user: userId,
            dueDate: { $lt: now },
            status: { $nin: ['delivered', 'cancelled'] },
        }).populate('customer', 'name phone').sort({ dueDate: 1 }).limit(10),
    ]);

    return { upcoming, overdue, windowDays: REMINDER_WINDOW_DAYS };
};

/* ─── Helpers ─── */
function isSameDay(a, b) {
    const da = new Date(a), db = new Date(b);
    return da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate();
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDueDate(date) {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

module.exports = { checkAndNotify, getDeliveryStatus };
