const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ── SERVICES (Admin) ──────────────────────────────────
exports.createService = asyncHandler(async (req, res) => {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
});

exports.updateService = asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) throw new AppError('Service not found', 404);
    res.json({ success: true, data: service });
});

exports.deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) throw new AppError('Service not found', 404);
    res.json({ success: true, message: 'Service deleted successfully' });
});

exports.getAllAdminServices = asyncHandler(async (req, res) => {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
});

// ── APPOINTMENTS (Admin) ─────────────────────────────
exports.getAllAppointments = asyncHandler(async (req, res) => {
    // Basic filtering hook for dashboard (e.g. ?status=Pending)
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.dateStr) {
        // Simple exact date match
        const d = new Date(req.query.dateStr);
        d.setHours(0,0,0,0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        query.appointmentDate = { $gte: d, $lt: nextD };
    }
    
    const appointments = await Appointment.find(query).populate('service', 'name category priceRange').sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
});

exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status, paymentStatus } = req.body;
    const upd = {};
    if (status) upd.status = status;
    if (paymentStatus) upd.paymentStatus = paymentStatus;
    
    const appt = await Appointment.findByIdAndUpdate(req.params.id, upd, { new: true }).populate('service', 'name');
    if (!appt) throw new AppError('Appointment not found', 404);
    
    res.json({ success: true, data: appt });
});

exports.deleteAppointment = asyncHandler(async (req, res) => {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) throw new AppError('Appointment not found', 404);
    res.json({ success: true, message: 'Appointment deleted successfully' });
});

// ── REVIEWS (Admin Moderation) ───────────────────────
exports.getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find().populate('service', 'name').sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
});

exports.updateReviewStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'Pending', 'Approved', 'Rejected'
    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) throw new AppError('Review not found', 404);
    res.json({ success: true, data: review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) throw new AppError('Review not found', 404);
    res.json({ success: true, message: 'Review deleted successfully' });
});
