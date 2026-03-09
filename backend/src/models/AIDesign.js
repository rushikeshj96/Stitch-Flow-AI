const mongoose = require('mongoose');

/**
 * Extended AIDesign schema — stores results from all 3 AI features:
 *   1. Design Generator  (designIdea, styleDescription, fabricSuggestion, imageUrl)
 *   2. Order Parser      (parsedOrder sub-doc)
 *   3. Measurement Pred  (predictedMeasurements sub-doc)
 */
const aiDesignSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true, index: true,
    },

    /* ── Feature type ── */
    featureType: {
        type: String,
        enum: ['design', 'order-parse', 'measurement-predict', 'suggestion'],
        default: 'design',
    },

    /* ── 1. Design Generator fields ── */
    prompt: { type: String, required: true, trim: true, maxlength: 1000 },
    designIdea: { type: String, trim: true },
    styleDescription: { type: String, trim: true },
    fabricSuggestion: { type: String, trim: true },
    colorPalette: [{ type: String }],
    occasion: { type: String, trim: true },
    stitchingTime: { type: String },
    estimatedCost: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'INR' },
    },
    imageUrl: { type: String },
    isFavourite: { type: Boolean, default: false },

    /* ── 2. Order Parser result ── */
    parsedOrder: {
        dressType: String,
        color: String,
        embroidery: String,
        neckStyle: String,
        sleeveStyle: String,
        length: String,
        fabric: String,
        occasion: String,
        specialInstructions: String,
        confidence: Number,
    },

    /* ── 3. Measurement predictor result ── */
    inputMeasurements: { type: Map, of: Number },
    predictedMeasurements: { type: Map, of: Number },

    /* ── 4. Optional order linkage ── */
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    /* ── OpenAI metadata ── */
    metadata: {
        model: String,
        imageModel: String,
        size: String,
        revisedPrompt: String,
    },

    tags: [{ type: String, trim: true }],

}, { timestamps: true });

aiDesignSchema.index({ user: 1, createdAt: -1 });
aiDesignSchema.index({ user: 1, featureType: 1 });
aiDesignSchema.index({ user: 1, isFavourite: 1 });

module.exports = mongoose.model('AIDesign', aiDesignSchema);
