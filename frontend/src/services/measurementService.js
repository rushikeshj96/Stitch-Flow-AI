import apiClient from './apiClient.js';

export const measurementService = {
    getByCustomer: (customerId) => apiClient.get(`/measurements/customer/${customerId}`),
    getById: (id) => apiClient.get(`/measurements/${id}`),
    create: (data) => apiClient.post('/measurements', data),
    update: (id, data) => apiClient.put(`/measurements/${id}`, data),
    delete: (id) => apiClient.delete(`/measurements/${id}`),
};
