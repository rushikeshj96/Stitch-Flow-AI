import apiClient from './apiClient.js';

export const storeService = {
    initializePayment: (data) => apiClient.post('/store/payments/initialize', data),
    placeOrder: (data) => apiClient.post('/store/orders', data),
    getMyOrders: (params) => apiClient.get('/store/orders', { params }),
    getOrderById: (id) => apiClient.get(`/store/orders/${id}`),

    getAdminOrders: (params) => apiClient.get('/store/admin/orders', { params }),
    updateAdminOrder: (id, data) => apiClient.patch(`/store/admin/orders/${id}`, data),
};
