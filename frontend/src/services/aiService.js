import apiClient from './apiClient.js';

/**
 * Frontend AI service — wraps all /api/ai endpoints.
 * All methods return the full Axios response promise.
 */
export const aiService = {
    /**
     * POST /api/ai/design
     * Generate a garment design brief + optional DALL-E image.
     */
    generateDesign: (prompt, generateImage = true) =>
        apiClient.post('/ai/design', { prompt, generateImage }),

    /**
     * POST /api/ai/parse-order
     * Convert free-form tailor notes → structured order JSON.
     */
    parseOrder: (text) =>
        apiClient.post('/ai/parse-order', { text }),

    /**
     * POST /api/ai/measurements
     * Predict missing measurements from partial body data.
     */
    predictMeasurements: (measurements) =>
        apiClient.post('/ai/measurements', { measurements }),

    /**
     * POST /api/ai/analyze-measurement-image
     * Predict body measurements from a full body image
     */
    analyzeMeasurementImage: (formData) =>
        apiClient.post('/ai/analyze-measurement-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    /**
     * POST /api/ai/suggestions
     * Get 3 personalised fashion recommendations.
     */
    getSuggestions: (data) =>
        apiClient.post('/ai/suggestions', data),

    /**
     * GET /api/ai/designs?page=&limit=
     * Fetch saved design history.
     */
    getDesigns: (params = {}) =>
        apiClient.get('/ai/designs', { params }),

    /**
     * DELETE /api/ai/designs/:id
     */
    deleteDesign: (id) =>
        apiClient.delete(`/ai/designs/${id}`),

    /**
     * PATCH /api/ai/designs/:id/favourite
     */
    toggleFavourite: (id) =>
        apiClient.patch(`/ai/designs/${id}/favourite`),
};
