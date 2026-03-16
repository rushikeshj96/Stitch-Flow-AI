const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
    
    // The specific tailoring service they are booking
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    
    // Booking time slots
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true }, // e.g. "14:00" or "2:00 PM"
    
    notes: { type: String, maxLength: 1000 },
    
    // If you integrate Razorpay later, this handles booking fee states
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending'
    },
    
    // Operational lifecycle of the appointment
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

// Useful indexes for querying admin calendar
appointmentSchema.index({ appointmentDate: 1, status: 1 });
appointmentSchema.index({ phoneNumber: 1 });
appointmentSchema.index({ service: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
