const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    priceRange: {
        min: { type: Number, required: true },
        max: { type: Number }
    },
    estimatedTime: { type: String, required: true }, // e.g. "2-3 Days", "1 Week"
    images: [{ type: String }],
    category: {
        type: String,
        enum: ['Men', 'Women', 'Alteration', 'Custom Stitching', 'Measurement', 'Bridal', 'Other'],
        required: true,
        default: 'Other'
    },
    processSteps: [{
        title: String,
        description: String
    }],
    faqs: [{
        question: String,
        answer: String
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
