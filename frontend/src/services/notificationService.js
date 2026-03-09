import apiClient from './apiClient.js';

export const notificationService = {
    getAll: () => apiClient.get('/notifications'),
    markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
    markAllRead: () => apiClient.patch('/notifications/read-all'),
    delete: (id) => apiClient.delete(`/notifications/${id}`),
};
