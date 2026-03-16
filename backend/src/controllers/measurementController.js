const measurementService = require('../services/measurementService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/measurements/customer/:customerId
 */
exports.getByCustomer = asyncHandler(async (req, res) => {
    const measurements = await measurementService.getByCustomer(req.user._id, req.params.customerId);
    res.json({ success: true, data: { measurements } });
});

/**
 * GET /api/measurements/:id
 */
exports.getById = asyncHandler(async (req, res) => {
    const measurement = await measurementService.getById(req.user._id, req.params.id);
    res.json({ success: true, data: { measurement } });
});

/**
 * POST /api/measurements
 */
exports.create = asyncHandler(async (req, res) => {
    const measurement = await measurementService.create(req.user._id, req.body);
    res.status(201).json({ success: true, data: { measurement } });
});

/**
 * PUT /api/measurements/:id
 */
exports.update = asyncHandler(async (req, res) => {
    const measurement = await measurementService.update(req.user._id, req.params.id, req.body);
    res.json({ success: true, data: { measurement } });
});

/**
 * DELETE /api/measurements/:id
 */
exports.remove = asyncHandler(async (req, res) => {
    await measurementService.remove(req.user._id, req.params.id);
    res.json({ success: true, message: 'Record deleted successfully' });
});
