import React, { createContext, useContext, useState, useCallback } from 'react';
import { notificationService } from '../services/notificationService.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await notificationService.getAll();
            // Backend: { success, data: { notifications, unreadCount } }
            const list = res.data?.data?.notifications ?? [];
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.isRead).length);
        } catch {
            // silent — user may not be logged in yet
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        await notificationService.markRead(id);
        setNotifications(prev =>
            prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(async () => {
        await notificationService.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
    }, []);

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
