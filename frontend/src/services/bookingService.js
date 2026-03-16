import apiClient from './apiClient';

/**
 * Public Booking APIs
 */
export const publicBookingService = {
    getServices: () => apiClient.get('/public/services'),
    getServiceById: (id) => apiClient.get(`/public/services/${id}`),
    bookAppointment: (data) => apiClient.post('/public/appointments', data),
    initializePayment: (data) => apiClient.post('/public/appointments/pay/initialize', data),
    verifyPayment: (data) => apiClient.post('/public/appointments/pay/verify', data),
    submitReview: (data) => apiClient.post('/public/reviews', data),
};

/**
 * Admin Booking APIs
 */
export const adminBookingService = {
    // Services CRUD
    getServices: () => apiClient.get('/admin/booking/services'),
    createService: (data) => apiClient.post('/admin/booking/services', data),
    updateService: (id, data) => apiClient.put(`/admin/booking/services/${id}`, data),
    deleteService: (id) => apiClient.delete(`/admin/booking/services/${id}`),
    
    // Appointments
    getAppointments: (params) => apiClient.get('/admin/booking/appointments', { params }),
    updateAppointment: (id, data) => apiClient.patch(`/admin/booking/appointments/${id}`, data),
    deleteAppointment: (id) => apiClient.delete(`/admin/booking/appointments/${id}`),
    
    // Reviews
    getReviews: () => apiClient.get('/admin/booking/reviews'),
    updateReview: (id, data) => apiClient.patch(`/admin/booking/reviews/${id}`, data),
    deleteReview: (id) => apiClient.delete(`/admin/booking/reviews/${id}`),
};
