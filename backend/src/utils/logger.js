const winston = require('winston');

const { combine, timestamp, errors, colorize, printf, json } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
    transports: [
        // Console – human-readable in dev, JSON in prod
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production'
                ? combine(json())
                : combine(colorize(), devFormat),
        }),
        // Persist errors to file
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

module.exports = logger;
