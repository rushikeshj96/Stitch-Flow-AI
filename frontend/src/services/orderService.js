import apiClient from './apiClient.js';

export const orderService = {
    getAll: (params) => apiClient.get('/orders', { params }),
    getById: (id) => apiClient.get(`/orders/${id}`),
    create: (data) => apiClient.post('/orders', data),
    update: (id, data) => apiClient.put(`/orders/${id}`, data),
    delete: (id) => apiClient.delete(`/orders/${id}`),
    updateStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, { status }),
    getStats: () => apiClient.get('/orders/stats'),
    // ── Receipt & WhatsApp ──
    getReceipt: (id) => apiClient.get(`/orders/${id}/receipt`),
    generateReceipt: (id) => apiClient.post(`/orders/${id}/generate-receipt`),
    sendWhatsApp: (id) => apiClient.post(`/orders/${id}/send-receipt`),
    markPaid: (id) => apiClient.patch(`/orders/${id}/mark-paid`),
    // ── Payment tracking ──
    getPayments: (id) => apiClient.get(`/orders/${id}/payments`),
    addPayment: (id, data) => apiClient.post(`/orders/${id}/payments`, data),
    deletePayment: (id, paymentId) => apiClient.delete(`/orders/${id}/payments/${paymentId}`),
    paymentReminder: (id) => apiClient.post(`/orders/${id}/payment-reminder`),
};
