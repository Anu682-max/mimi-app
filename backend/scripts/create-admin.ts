/**
 * Create Admin User Script
 * 
 * Run with: npx ts-node scripts/create-admin.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/indate';

// User Schema (simplified)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    locale: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    region: { type: String, default: 'us-east' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const adminEmail = 'admin@indate.com';
    const adminPassword = 'Admin123!';

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
        console.log('Admin user already exists!');
        console.log('Email:', adminEmail);
        await mongoose.disconnect();
        return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const admin = new User({
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        locale: 'en',
        timezone: 'UTC',
        region: 'us-east',
        isActive: true,
        isVerified: true,
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('================================');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('================================');
    console.log('\n⚠️  Please change the password after first login!');

    await mongoose.disconnect();
}

createAdmin().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
