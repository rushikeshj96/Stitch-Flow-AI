/**
 * aiController.js — HTTP layer for all AI endpoints.
 *
 * Rules:
 *  • Controllers do NOT contain business logic.
 *  • All AI logic lives in services/aiService.js.
 *  • Input validation is minimal here; deeper validation is in aiService.
 */

const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');

/* ═══════════════════════════════════════════════════
   POST /api/ai/design
   Generate a garment design brief + optional image
   ═══════════════════════════════════════════════════ */
exports.generateDesign = asyncHandler(async (req, res) => {
    const { prompt, generateImage = true } = req.body;

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ success: false, message: 'prompt is required' });
    }

    const design = await aiService.generateDesign(req.user._id, prompt.trim(), generateImage);

    res.status(201).json({
        success: true,
        data: {
            designIdea: design.designIdea,
            styleDescription: design.styleDescription,
            fabricSuggestion: design.fabricSuggestion,
            colorPalette: design.colorPalette,
            occasion: design.occasion,
            stitchingTime: design.stitchingTime,
            estimatedCost: design.estimatedCost,
            imageUrl: design.imageUrl,
            id: design._id,
        },
    });
});

/* ═══════════════════════════════════════════════════
   POST /api/ai/parse-order
   Convert free-form order notes → structured JSON
   ═══════════════════════════════════════════════════ */
exports.parseOrder = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ success: false, message: 'text is required' });
    }

    const parsed = await aiService.parseOrderDescription(text.trim());

    res.json({ success: true, data: parsed });
});

/* ═══════════════════════════════════════════════════
   POST /api/ai/measurements
   Predict missing body measurements from partial data
   ═══════════════════════════════════════════════════ */
exports.predictMeasurements = asyncHandler(async (req, res) => {
    const { measurements } = req.body;

    if (!measurements || typeof measurements !== 'object') {
        return res.status(400).json({ success: false, message: 'measurements object is required' });
    }

    const predicted = await aiService.predictMeasurements(measurements);

    res.json({ success: true, data: { predicted } });
});

/* ═══════════════════════════════════════════════════
   POST /api/ai/suggestions
   Get personalised fashion suggestions for a customer
   ═══════════════════════════════════════════════════ */
exports.getSuggestions = asyncHandler(async (req, res) => {
    const { customerProfile, occasion, budget } = req.body;

    const suggestions = await aiService.generateSuggestions({ customerProfile, occasion, budget });

    res.json({ success: true, data: { suggestions } });
});

/* ═══════════════════════════════════════════════════
   GET /api/ai/designs
   List saved AI designs for the current user
   ═══════════════════════════════════════════════════ */
exports.getDesigns = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await aiService.getUserDesigns(req.user._id, { page, limit });
    res.json({ success: true, data: result });
});

/* ═══════════════════════════════════════════════════
   DELETE /api/ai/designs/:id
   Delete a saved design
   ═══════════════════════════════════════════════════ */
exports.deleteDesign = asyncHandler(async (req, res) => {
    await aiService.deleteDesign(req.user._id, req.params.id);
    res.json({ success: true, message: 'Design deleted' });
});

/* ═══════════════════════════════════════════════════
   PATCH /api/ai/designs/:id/favourite
   Toggle isFavourite flag
   ═══════════════════════════════════════════════════ */
exports.toggleFavourite = asyncHandler(async (req, res) => {
    const design = await aiService.toggleFavourite(req.user._id, req.params.id);
    res.json({ success: true, data: { isFavourite: design.isFavourite } });
});
