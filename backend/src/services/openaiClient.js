const OpenAI = require('openai');
const config = require('../config/config');

/**
 * Singleton OpenAI client — shared across all service calls.
 * Validation at startup prevents silent failures at request time.
 */
if (!config.ai?.apiKey) {
    console.warn('[openaiClient] WARNING: OPENAI_API_KEY is not set — AI endpoints will return 503');
}

const openaiClient = new OpenAI({
    apiKey: config.ai?.apiKey || 'not-configured',
    timeout: 60_000,   // 60 s timeout per request
    maxRetries: 2,     // retry transient network errors automatically
});

module.exports = openaiClient;
