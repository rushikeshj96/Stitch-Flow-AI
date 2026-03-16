const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    label: { type: String, default: 'Standard Measurements' },

    // Upper body
    chest: String,
    waist: String,
    hips: String,
    shoulder: String,
    sleeveLength: String,
    armhole: String,
    chest_around: String,

    // Lower body
    length: String,
    inseam: String,
    thigh: String,
    knee: String,
    ankle: String,

    // Kurta / Salwar
    kurta_length: String,
    salwar_length: String,
    neck: String,

    unit: { type: String, enum: ['inch', 'cm'], default: 'inch' },
    notes: String,
    measurementSource: { type: String, enum: ['MANUAL', 'AI_IMAGE'], default: 'MANUAL' }
}, { timestamps: true });

measurementSchema.index({ customer: 1 });

module.exports = mongoose.model('Measurement', measurementSchema);
