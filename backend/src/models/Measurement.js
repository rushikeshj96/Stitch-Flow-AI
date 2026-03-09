const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    label: { type: String, default: 'Standard Measurements' },

    // Upper body
    chest: Number,
    waist: Number,
    hips: Number,
    shoulder: Number,
    sleeveLength: Number,
    armhole: Number,
    chest_around: Number,

    // Lower body
    length: Number,
    inseam: Number,
    thigh: Number,
    knee: Number,
    ankle: Number,

    // Kurta / Salwar
    kurta_length: Number,
    salwar_length: Number,
    neck: Number,

    unit: { type: String, enum: ['inch', 'cm'], default: 'inch' },
    notes: String,
}, { timestamps: true });

measurementSchema.index({ customer: 1 });

module.exports = mongoose.model('Measurement', measurementSchema);
