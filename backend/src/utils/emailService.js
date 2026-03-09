const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port == 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
});

/**
 * Send an email
 * @param {{ to, subject, html, text }} options
 */
async function sendEmail({ to, subject, html, text }) {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.FROM_NAME || 'StitchFlow AI'}" <${process.env.FROM_EMAIL}>`,
            to, subject, html, text,
        });
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (err) {
        logger.error(`Email failed: ${err.message}`);
        throw err;
    }
}

module.exports = { sendEmail };
