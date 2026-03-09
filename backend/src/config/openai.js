/**
 * OpenAI configuration — separate from the main app config so it can
 * be imported independently (e.g. in the openaiClient singleton).
 */
const config = require('./config');

module.exports = {
    apiKey: config.ai?.apiKey || process.env.OPENAI_API_KEY,
    model: config.ai?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
    imageModel: config.ai?.imageModel || process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
    maxTokens: Number(process.env.OPENAI_MAX_TOKENS) || 800,
    temperature: Number(process.env.OPENAI_TEMPERATURE) || 0.7,
};
