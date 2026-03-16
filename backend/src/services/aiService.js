/**
 * aiService.js — All AI business logic for StitchFlow AI.
 *
 * Rules:
 *  • This file contains ONLY AI logic — no HTTP request/response handling.
 *  • Every public function is async and throws AppError on failure.
 *  • OpenAI calls go through the shared openaiClient singleton.
 *  • All prompts are imported from utils/aiPrompts.js — NOT hardcoded here.
 */

const openai = require('./openaiClient');
const AIDesign = require('../models/AIDesign');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const openaiCfg = require('../config/openai');
const {
    designGeneratorPrompts,
    orderParserPrompts,
    measurementPredictorPrompts,
    imageGenerationPrompt,
    fashionSuggestionPrompts,
} = require('../utils/aiPrompts');

/* ─────────────────────────────────────────────────
   Internal helper: safe JSON parse from GPT response
   ───────────────────────────────────────────────── */
function parseJsonResponse(content, label) {
    try {
        // Strip markdown code fences if model wraps output anyway
        const cleaned = content.replace(/```json|```/gi, '').trim();
        return JSON.parse(cleaned);
    } catch {
        logger.error(`[aiService] Failed to parse JSON for ${label}:\n${content}`);
        throw new AppError(`AI returned malformed data for ${label}. Please try again.`, 502);
    }
}

/* ─────────────────────────────────────────────────
   Internal helper: call chat completion
   ───────────────────────────────────────────────── */
async function chatComplete({ system, user }, { maxTokens, temperature } = {}) {
    const completion = await openai.chat.completions.create({
        model: openaiCfg.model,
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
        ],
        temperature: temperature ?? openaiCfg.temperature,
        max_tokens: maxTokens ?? openaiCfg.maxTokens,
    });
    return completion.choices[0].message.content;
}

/* ═══════════════════════════════════════════════════════
   1. DESIGN GENERATOR
   POST /api/ai/design
   ═══════════════════════════════════════════════════════ */
/**
 * Generate a structured garment design brief + optional DALL-E image.
 *
 * @param {string}  userId
 * @param {string}  prompt        - User's clothing description
 * @param {boolean} generateImage - Whether to call DALL-E 3
 * @param {string}  [size]        - DALL-E size (default: '1024x1024')
 * @returns {Promise<AIDesign document>}
 */
const generateDesign = async (userId, prompt, generateImage = true, size = '1024x1024') => {
    if (!prompt?.trim()) throw new AppError('Prompt is required', 400);
    if (!openaiCfg.apiKey || openaiCfg.apiKey === 'not-configured') {
        throw new AppError('OpenAI API key is not configured', 503);
    }

    logger.info(`[AI] generateDesign for user=${userId} prompt="${prompt.slice(0, 60)}"`);

    // Step 1: Generate structured design brief with GPT
    const prompts = designGeneratorPrompts(prompt);
    const rawText = await chatComplete(prompts, { maxTokens: 600, temperature: 0.75 });
    const designData = parseJsonResponse(rawText, 'generateDesign');

    // Step 2: Generate image with DALL-E 3 (optional — costs extra credit)
    let imageUrl = null;
    let revisedPrompt = null;

    if (generateImage) {
        try {
            const imgPrompt = imageGenerationPrompt(prompt, designData.designIdea);
            const imgResult = await openai.images.generate({
                model: openaiCfg.imageModel,
                prompt: imgPrompt,
                n: 1,
                size,
                quality: 'hd',
                response_format: 'url',
            });
            imageUrl = imgResult.data[0].url;
            revisedPrompt = imgResult.data[0].revised_prompt;
        } catch (err) {
            // Image generation failure is non-fatal — log and continue
            logger.warn(`[AI] DALL-E 3 failed (non-fatal): ${err.message}`);
        }
    }

    // Step 3: Persist to MongoDB
    const design = await AIDesign.create({
        user: userId,
        prompt,
        designIdea: designData.designIdea,
        styleDescription: designData.styleDescription,
        fabricSuggestion: designData.fabricSuggestion,
        colorPalette: designData.colorPalette,
        occasion: designData.occasion,
        estimatedCost: designData.estimatedCost,
        stitchingTime: designData.stitchingTime,
        imageUrl,
        metadata: {
            model: openaiCfg.model,
            imageModel: generateImage ? openaiCfg.imageModel : null,
            size: generateImage ? size : null,
            revisedPrompt,
        },
    });

    return design;
};

/* ═══════════════════════════════════════════════════════
   2. ORDER DESCRIPTION PARSER
   POST /api/ai/parse-order
   ═══════════════════════════════════════════════════════ */
/**
 * Convert free-form tailor order notes into a structured JSON record.
 *
 * @param {string} rawText - Messy order description from the tailor
 * @returns {Promise<Object>} - Structured order fields
 */
const parseOrderDescription = async (rawText) => {
    if (!rawText?.trim()) throw new AppError('Order description text is required', 400);
    if (rawText.trim().length < 5) throw new AppError('Order description is too short', 400);

    logger.info(`[AI] parseOrderDescription: "${rawText.slice(0, 80)}"`);

    const prompts = orderParserPrompts(rawText);
    const rawJson = await chatComplete(prompts, { maxTokens: 400, temperature: 0.2 });
    return parseJsonResponse(rawJson, 'parseOrderDescription');
};

/* ═══════════════════════════════════════════════════════
   3. MEASUREMENT PREDICTOR
   POST /api/ai/measurements
   ═══════════════════════════════════════════════════════ */
/**
 * Given partial body measurements, predict the missing ones.
 *
 * @param {Object} knownMeasurements - e.g. { chest: 40, waist: 36 }
 * @returns {Promise<Object>} - Predicted measurements (missing fields only)
 */
const predictMeasurements = async (knownMeasurements) => {
    if (!knownMeasurements || typeof knownMeasurements !== 'object') {
        throw new AppError('Measurements object is required', 400);
    }

    const validEntries = Object.entries(knownMeasurements)
        .filter(([, v]) => v !== null && v !== undefined && v !== '');

    if (validEntries.length === 0) {
        throw new AppError('At least one known measurement is required', 400);
    }

    logger.info(`[AI] predictMeasurements: ${validEntries.length} known values`);

    const prompts = measurementPredictorPrompts(knownMeasurements);
    const rawJson = await chatComplete(prompts, { maxTokens: 300, temperature: 0.3 });
    const predicted = parseJsonResponse(rawJson, 'predictMeasurements');

    // Safety: remove any keys the user already provided
    const knownKeys = new Set(validEntries.map(([k]) => k.toLowerCase()));
    const filtered = {};
    for (const [key, val] of Object.entries(predicted)) {
        if (!knownKeys.has(key.toLowerCase())) {
            filtered[key] = typeof val === 'number' ? Math.round(val * 10) / 10 : val;
        }
    }

    return filtered;
};

/* ═══════════════════════════════════════════════════════
   3b. MEASUREMENT IMAGE ANALYZER (Computer Vision)
   POST /api/ai/analyze-measurement-image
   ═══════════════════════════════════════════════════════ */
/**
 * Uses a Vision model to detect landmarks and estimate measurements.
 * @param {Buffer} imageBuffer - the raw image buffer from multer
 * @param {string} mimeType - e.g. 'image/jpeg'
 */
const analyzeMeasurementImage = async (imageBuffer, mimeType) => {
    if (!imageBuffer) throw new AppError('Image buffer is required', 400);

    logger.info(`[AI] analyzeMeasurementImage invoked for measuring proportions`);

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const systemPrompt = `You are a highly advanced Body Landmark Detection model. 
    Your task is to analyze the uploaded full-body image of a person, identify key body proportions (shoulders, chest, waist, hips, legs), and estimate standard tailoring measurements in inches.
    Assume the person is of average height (around 65 inches or 165 cm) if there is no explicit scale. 
    Use the pixel proportions and distances between joints to estimate these 6 key measurements accurately.
    
    You MUST reply ONLY with a valid JSON object matching this schema exactly, and absolutely no other text:
    {
      "chest": number,
      "waist": number,
      "hip": number,
      "shoulder": number,
      "sleeveLength": number,
      "inseam": number
    }`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 300,
            temperature: 0.1,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Please generate the estimated body measurements from this image." },
                        { type: "image_url", image_url: { url: dataUrl, detail: "high" } }
                    ]
                }
            ]
        });

        const rawJson = response.choices[0].message.content;
        return parseJsonResponse(rawJson, 'analyzeMeasurementImage');
    } catch (err) {
        logger.error(`[AI] Vision API failed: ${err.message}`);
        throw new AppError('AI failed to process the image measurements. Please try again.', 500);
    }
};

/* ═══════════════════════════════════════════════════════
   4. FASHION SUGGESTIONS (existing feature, improved)
   POST /api/ai/suggestions
   ═══════════════════════════════════════════════════════ */
/**
 * Generate 3 personalised fashion recommendations for a customer.
 *
 * @param {{ customerProfile, occasion, budget }} opts
 * @returns {Promise<Array>} - Array of suggestion objects
 */
const generateSuggestions = async ({ customerProfile, occasion, budget }) => {
    if (!customerProfile) throw new AppError('Customer profile is required', 400);

    logger.info(`[AI] generateSuggestions: occasion=${occasion} budget=${budget}`);

    const prompts = fashionSuggestionPrompts({ customerProfile, occasion, budget });
    const rawJson = await chatComplete(prompts, { maxTokens: 800, temperature: 0.7 });
    const data = parseJsonResponse(rawJson, 'generateSuggestions');
    return Array.isArray(data) ? data : (data.suggestions ?? []);
};

/* ═══════════════════════════════════════════════════════
   5. DESIGN HISTORY (no OpenAI — DB only)
   ═══════════════════════════════════════════════════════ */
const getUserDesigns = async (userId, { page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const [designs, total] = await Promise.all([
        AIDesign.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        AIDesign.countDocuments({ user: userId }),
    ]);
    return { designs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } };
};

const deleteDesign = async (userId, designId) => {
    const design = await AIDesign.findOneAndDelete({ _id: designId, user: userId });
    if (!design) throw new AppError('Design not found', 404);
};

const toggleFavourite = async (userId, designId) => {
    const design = await AIDesign.findOne({ _id: designId, user: userId });
    if (!design) throw new AppError('Design not found', 404);
    design.isFavourite = !design.isFavourite;
    await design.save();
    return design;
};

module.exports = {
    generateDesign,
    parseOrderDescription,
    predictMeasurements,
    analyzeMeasurementImage,
    generateSuggestions,
    getUserDesigns,
    deleteDesign,
    toggleFavourite,
};
