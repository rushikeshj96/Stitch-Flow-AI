/**
 * Centralised prompt templates for every AI feature in StitchFlow AI.
 *
 * Each export is a function that takes parameters and returns a
 * ready-to-use { system, user } message pair for the OpenAI Chat API.
 *
 * Keeping prompts here (not scattered in controllers / services) means
 * we can tune them, A/B test them, or swap models without touching
 * business logic.
 */

/* ─────────────────────────────────────────────────
   1. DESIGN GENERATOR
   ───────────────────────────────────────────────── */
const designGeneratorPrompts = (userPrompt) => ({
    system: `You are an expert Indian fashion designer with 20 years of boutique experience.
Your job is to turn a short clothing description into a detailed design brief.
Always respond with ONLY valid JSON — no markdown, no commentary.
The JSON must exactly follow this shape:
{
  "designIdea": "A 2–3 sentence creative concept description",
  "styleDescription": "Detailed description of cut, silhouette, layers, patterns and embellishments",
  "fabricSuggestion": "Primary fabric + lining + embroidery thread recommendation",
  "colorPalette": ["primary hex", "secondary hex", "accent hex"],
  "estimatedCost": { "min": 0, "max": 0, "currency": "INR" },
  "occasion": "Wedding / Casual / Party / Festival / Office",
  "stitchingTime": "X–Y days"
}`,

    user: `Create a complete design brief for: "${userPrompt}"
Focus on Indian fashion trends for 2026.
Be specific about embroidery styles (e.g., zardozi, chikankari, mirror work), fabrics (e.g., banarasi, chanderi, georgette), and regional influences.`,
});

/* ─────────────────────────────────────────────────
   2. ORDER DESCRIPTION PARSER
   ───────────────────────────────────────────────── */
const orderParserPrompts = (rawText) => ({
    system: `You are a tailor's assistant that converts messy handwritten order notes into clean structured JSON.
Extract ONLY what is explicitly mentioned. Use null for missing fields.
Respond with ONLY valid JSON — no markdown, no extra text.
The JSON must follow this shape exactly:
{
  "dressType": "string | null",
  "color": "string | null",
  "embroidery": "string | null",
  "neckStyle": "string | null",
  "sleeveStyle": "string | null",
  "length": "string | null",
  "fabric": "string | null",
  "occasion": "string | null",
  "specialInstructions": "string | null",
  "confidence": 0.0
}
The "confidence" field (0.0–1.0) reflects how clearly the order was described.`,

    user: `Parse this order note into structured JSON:
"${rawText}"`,
});

/* ─────────────────────────────────────────────────
   3. MEASUREMENT PREDICTOR
   ───────────────────────────────────────────────── */
const measurementPredictorPrompts = (known) => {
    const knownStr = Object.entries(known)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

    return {
        system: `You are an expert tailor with deep knowledge of body proportions and Indian sizing standards.
Given some known measurements (in inches), predict the missing standard tailoring measurements.
Base predictions on average Indian body proportions and standard fitting ratios.
Respond with ONLY valid JSON — no markdown.
Return a flat object containing ONLY the predicted (missing) measurements.
Each key is a measurement name; each value is a number in inches (one decimal place).
Example shape (only predicted fields):
{
  "shoulder": 15.5,
  "neckCircumference": 14.0,
  "sleeveLength": 24.0,
  "armhole": 16.5
}`,

        user: `Known measurements (inches): ${knownStr}.
Predict the most important missing tailoring measurements based on these values.
Do NOT repeat measurements that were already provided.`,
    };
};

/* ─────────────────────────────────────────────────
   4. DESIGN IMAGE PROMPT (for DALL-E 3)
   ───────────────────────────────────────────────── */
const imageGenerationPrompt = (userText, designIdea = '') => {
    const context = designIdea
        ? `${userText}. Design concept: ${designIdea}.`
        : userText;

    return `Professional high-quality fashion illustration of ${context}.
Indian fashion design, detailed fabric texture, elegant draping, intricate embroidery details.
White studio background, fashion sketch style, full garment visible, photorealistic rendering.
No text, no watermark, no human model — garment only.`;
};

/* ─────────────────────────────────────────────────
   5. FASHION SUGGESTION (for customer profile)
   ───────────────────────────────────────────────── */
const fashionSuggestionPrompts = ({ customerProfile, occasion, budget }) => ({
    system: `You are an expert Indian fashion designer and boutique consultant.
Provide exactly 3 personalised garment recommendations for the given customer.
Respond with ONLY valid JSON — an object with a "suggestions" array:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "fabric": "string",
      "estimatedCost": number,
      "colors": ["string"],
      "occasion": "string",
      "stitchingDays": number
    }
  ]
}`,

    user: `Customer profile: ${JSON.stringify(customerProfile)}
Occasion: ${occasion || 'general'}
Budget: ₹${budget || 'flexible'}`,
});

module.exports = {
    designGeneratorPrompts,
    orderParserPrompts,
    measurementPredictorPrompts,
    imageGenerationPrompt,
    fashionSuggestionPrompts,
};
