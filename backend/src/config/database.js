const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    const uri = process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI;

    try {
        const conn = await mongoose.connect(uri, {
            autoIndex: process.env.NODE_ENV !== 'production',
        });
        logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        logger.error(`❌ MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }

    mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
    });
};

module.exports = connectDB;
