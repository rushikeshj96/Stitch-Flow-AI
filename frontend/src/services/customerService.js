import apiClient from './apiClient.js';

export const customerService = {
    getAll: (params) => apiClient.get('/customers', { params }),
    getById: (id) => apiClient.get(`/customers/${id}`),
    create: (data) => apiClient.post('/customers', data),
    update: (id, data) => apiClient.put(`/customers/${id}`, data),
    delete: (id) => apiClient.delete(`/customers/${id}`),
    search: (query) => apiClient.get('/customers/search', { params: { q: query } }),
    getOrders: (id) => apiClient.get(`/customers/${id}/orders`),
};
