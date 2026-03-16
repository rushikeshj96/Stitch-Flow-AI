const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const notificationService = require('../services/bookingNotificationService');
const paymentService = require('../services/paymentService');

// ── SERVICES ────────────────────────────────────────────────────────
exports.getPublicServices = asyncHandler(async (req, res) => {
    // Only fetch active services for public gallery
    const services = await Service.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.json({ success: true, count: services.length, data: services });
});

exports.getPublicServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findOne({ _id: req.params.id, isActive: true });
    if (!service) throw new AppError('Service not found or is currently unavailable', 404);
    
    // Fetch approved reviews alongside service
    const reviews = await Review.find({ service: req.params.id, status: 'Approved' }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: { service, reviews } });
});

// ── APPOINTMENTS ─────────────────────────────────────────────────────
exports.bookAppointment = asyncHandler(async (req, res) => {
    const { customerName, phoneNumber, email, serviceId, appointmentDate, appointmentTime, notes } = req.body;
    
    if (!customerName || !phoneNumber || !serviceId || !appointmentDate || !appointmentTime) {
        throw new AppError('Please fill out all required booking fields', 400);
    }
    
    // Validate service exists
    const service = await Service.findOne({ _id: serviceId, isActive: true });
    if (!service) throw new AppError('Invalid service selected', 400);

    const appointment = await Appointment.create({
        customerName,
        phoneNumber,
        email,
        service: serviceId,
        appointmentDate,
        appointmentTime,
        notes,
        status: 'Pending',
        paymentStatus: 'Pending'
    });
    
    // Optional: send WhatsApp/SMS trigger here if configured
    notificationService.sendBookingConfirmation(appointment).catch(err => console.error('Notification error:', err));
    notificationService.notifyAdminNewBooking(appointment).catch(err => console.error('Admin Notification error:', err));

    res.status(201).json({
        success: true,
        message: 'Appointment reserved successfully!',
        data: appointment
    });
});

// ── PAYMENTS ─────────────────────────────────────────────────────────
exports.initializePayment = asyncHandler(async (req, res) => {
    const { amount, appointmentId } = req.body;
    
    if (!amount) throw new AppError('Payment amount is required', 400);

    const paymentIntent = await paymentService.createPaymentIntent(amount, 'INR', { appointmentId });
    
    res.json({
        success: true,
        data: paymentIntent
    });
});

exports.verifyPayment = asyncHandler(async (req, res) => {
    const { payload, signature, appointmentId } = req.body;
    
    const isValid = await paymentService.verifyPaymentSignature(payload, signature);
    
    if (isValid) {
        // Update appointment payment status
        await Appointment.findByIdAndUpdate(appointmentId, { paymentStatus: 'Paid' });
        
        res.json({
            success: true,
            message: 'Payment verified and appointment updated.'
        });
    } else {
        throw new AppError('Invalid payment signature', 400);
    }
});

// ── REVIEWS ──────────────────────────────────────────────────────────
exports.submitReview = asyncHandler(async (req, res) => {
    const { customerName, rating, message, serviceId } = req.body;
    
    if (!customerName || !rating || !message || !serviceId) {
        throw new AppError('Incomplete review fields', 400);
    }

    const review = await Review.create({
        customerName,
        rating: Number(rating),
        message,
        service: serviceId,
        status: 'Pending' // Requires admin approval to show publicly
    });

    res.status(201).json({
        success: true,
        message: 'Review submitted and is pending moderation.',
        data: review
    });
});
