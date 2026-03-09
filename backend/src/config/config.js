const jwt = require('jsonwebtoken');

const config = {
    jwt: {
        secret: process.env.JWT_SECRET || 'change_me_in_production',
        expire: process.env.JWT_EXPIRE || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
        refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
    },
    ai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || process.env.AI_MODEL || 'gpt-4o-mini',
        imageModel: process.env.OPENAI_IMAGE_MODEL || process.env.AI_IMAGE_MODEL || 'dall-e-3',
    },
    smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    upload: {
        maxSize: process.env.MAX_FILE_SIZE || '5mb',
        path: process.env.UPLOAD_PATH || './uploads',
    },
};

module.exports = config;
