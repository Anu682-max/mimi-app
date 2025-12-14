/**
 * Create Admin2 User
 * Run: npx ts-node scripts/create-admin2.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// User Schema (same as in the app)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    birthday: { type: Date, required: true },
    gender: { type: String, enum: ['man', 'woman', 'nonbinary', 'other'], required: true },
    bio: { type: String },
    photos: { type: [String], default: [] },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    city: String,
    country: String,
    locale: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    region: { type: String, default: 'us-east' },
    preferences: {
        showMe: { type: [String], default: ['man', 'woman'] },
        ageRange: {
            min: { type: Number, default: 18 },
            max: { type: Number, default: 100 }
        },
        maxDistance: { type: Number, default: 50 },
        autoTranslate: { type: Boolean, default: true }
    },
    isVerified: { type: Boolean, default: true },
    verificationStatus: { type: String, default: 'approved' },
    isActive: { type: Boolean, default: true },
    isOnline: { type: Boolean, default: false },
    lastOnline: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin2() {
    try {
        // Get MongoDB URI from environment
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            console.error('❌ Error: MONGODB_URI not found in .env file');
            console.log('\nPlease add MONGODB_URI to backend/.env file');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Admin2 user details
        const admin2Email = 'admin2@indate.com';
        const admin2Password = 'Admin123!';

        // Check if admin2 already exists
        const existingAdmin = await User.findOne({ email: admin2Email });

        if (existingAdmin) {
            console.log('⚠️  Admin2 user already exists!');
            console.log('\nUser details:');
            console.log('Email:', existingAdmin.email);
            console.log('Name:', existingAdmin.firstName, existingAdmin.lastName);
            console.log('Created:', existingAdmin.createdAt);

            // Update password
            console.log('\n🔄 Updating password to: Admin123!');
            const hashedPassword = await bcrypt.hash(admin2Password, 12);
            existingAdmin.passwordHash = hashedPassword;
            await existingAdmin.save();
            console.log('✅ Password updated successfully!');
        } else {
            console.log('👤 Creating new Admin2 user...');

            // Hash password
            const hashedPassword = await bcrypt.hash(admin2Password, 12);

            // Create admin2 user
            const admin2 = new User({
                email: admin2Email,
                passwordHash: hashedPassword,
                firstName: 'Admin',
                lastName: 'Two',
                birthday: new Date('1990-01-01'),
                gender: 'man',
                bio: 'System Administrator 2',
                locale: 'en',
                timezone: 'UTC',
                region: 'us-east',
                role: 'admin',
                isVerified: true,
                verificationStatus: 'approved',
                isActive: true,
            });

            await admin2.save();
            console.log('✅ Admin2 user created successfully!\n');
        }

        // Display login credentials
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    ', admin2Email);
        console.log('Password: ', admin2Password);
        console.log('Role:     ', 'admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // List all admin users
        const allAdmins = await User.find({ role: 'admin' }).select('email firstName lastName createdAt');
        console.log('👥 All Admin Users:');
        allAdmins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.email} - ${admin.firstName} ${admin.lastName || ''} (Created: ${admin.createdAt.toLocaleDateString()})`);
        });

        console.log('\n✅ Done! You can now login with admin2@indate.com');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the script
createAdmin2();
