const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, maxLength: 500 },
    
    // We tie a review to a specific service they received
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    
    // For admin moderation before displaying publicly
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

// Useful for pulling latest public reviews per service
reviewSchema.index({ service: 1, status: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
