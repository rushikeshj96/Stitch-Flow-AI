/**
 * Operational error class that carries an HTTP status code.
 * Thrown from services and caught by the global error handler.
 */
class AppError extends Error {
    /**
     * @param {string} message  Human-readable error description
     * @param {number} statusCode  HTTP status code (4xx or 5xx)
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;   // distinguishes from unexpected programmer errors
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
