/**
 * seed.js — Creates a demo user for local testing
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stitchflow_ai';

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Load model AFTER connecting
    const User = require('./src/models/User');

    // Remove existing demo user if present
    await User.deleteOne({ email: 'demo@stitchflow.com' });

    // Create fresh demo user (password will be hashed by the model's pre-save hook)
    const user = await User.create({
        name: 'Demo Tailor',
        email: 'demo@stitchflow.com',
        password: 'Demo@12345',
        boutiqueName: 'StitchFlow Demo Boutique',
        phone: '9876543210',
        role: 'admin',
        isActive: true,
    });

    console.log('\n🎉 Demo user created successfully!\n');
    console.log('─────────────────────────────────');
    console.log('  Email    : demo@stitchflow.com');
    console.log('  Password : Demo@12345');
    console.log('  Boutique :', user.boutiqueName);
    console.log('─────────────────────────────────\n');
    console.log('👉 Open http://localhost:3000/login and use the above credentials.\n');

    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
