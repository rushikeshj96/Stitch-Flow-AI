import React, { useEffect, useCallback } from 'react';
import { HiOutlineBell, HiOutlineCheck, HiOutlineTrash, HiOutlineCheckCircle } from 'react-icons/hi';
import { useNotifications } from '../context/NotificationContext.jsx';
import { notificationService } from '../services/notificationService.js';
import { formatDate } from '../utils/helpers.js';
import EmptyState from '../components/common/EmptyState.jsx';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
    order: '🧵',
    customer: '👤',
    payment: '💰',
    ai: '✨',
    system: '🔔',
};

export default function NotificationsPage() {
    const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const handleDelete = useCallback(async (id) => {
        try {
            await notificationService.delete(id);
            await fetchNotifications();
        } catch { toast.error('Delete failed'); }
    }, [fetchNotifications]);

    return (
        <div className="space-y-6 max-w-2xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                        <HiOutlineBell className="w-7 h-7 text-primary-400" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="badge badge-primary text-sm">{unreadCount} new</span>
                        )}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Stay updated with your boutique activity</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="btn-secondary text-sm gap-1.5">
                        <HiOutlineCheckCircle className="w-4 h-4" /> Mark all read
                    </button>
                )}
            </div>

            {/* List */}
            {(notifications ?? []).length === 0 ? (
                <EmptyState icon="🔔" title="All caught up!" description="No notifications at the moment." />
            ) : (
                <div className="space-y-2">
                    {(notifications ?? []).map(notif => (
                        <div key={notif._id}
                            className={`card p-4 flex items-start gap-4 transition-all duration-200
                              ${!notif.isRead ? 'border-primary-500/30 bg-primary-500/5' : ''}`}>
                            {/* Icon */}
                            <div className="text-2xl shrink-0 mt-0.5">
                                {TYPE_ICONS[notif.type] || '🔔'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <p className={`text-sm font-medium ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                                        {notif.title}
                                    </p>
                                    <p className="text-xs text-slate-500 shrink-0">{formatDate(notif.createdAt, 'relative')}</p>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                {!notif.isRead && (
                                    <button onClick={() => markAsRead(notif._id)}
                                        className="btn-ghost p-1.5 text-primary-400 hover:text-primary-300"
                                        title="Mark as read">
                                        <HiOutlineCheck className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => handleDelete(notif._id)}
                                    className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
                                    title="Delete">
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
