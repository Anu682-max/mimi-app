/**
 * Create Sample Users for Testing Discover Feature
 * 
 * Run with: npx ts-node scripts/create-sample-users.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/indate';

// User Schema with profile fields
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

    // Profile fields
    bio: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    lookingFor: { type: String, enum: ['male', 'female', 'both'] },
    photos: [{ type: String }],
    interests: [{ type: String }],
    occupation: { type: String },
    education: { type: String },

    // Location
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    city: { type: String },
    country: { type: String },

    createdAt: { type: Date, default: Date.now },
});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);

// Sample user data
const sampleUsers = [
    {
        email: 'yuki@example.com',
        firstName: 'Yuki',
        lastName: 'Tanaka',
        locale: 'ja',
        bio: '東京でカフェ巡りが大好き。音楽と映画が趣味です！',
        age: 26,
        gender: 'female',
        lookingFor: 'male',
        interests: ['カフェ', '音楽', '映画', '旅行'],
        occupation: 'デザイナー',
        city: 'Tokyo',
        country: 'Japan',
        location: { type: 'Point', coordinates: [139.6917, 35.6895] },
    },
    {
        email: 'sakura@example.com',
        firstName: 'Sakura',
        lastName: 'Yamamoto',
        locale: 'ja',
        bio: '大阪出身。料理とヨガにハマってます🧘‍♀️',
        age: 24,
        gender: 'female',
        lookingFor: 'male',
        interests: ['料理', 'ヨガ', '読書', 'アート'],
        occupation: 'エンジニア',
        city: 'Osaka',
        country: 'Japan',
        location: { type: 'Point', coordinates: [135.5023, 34.6937] },
    },
    {
        email: 'mina@example.com',
        firstName: 'Mina',
        lastName: 'Kim',
        locale: 'ko',
        bio: '서울에서 패션 블로거로 활동중! K-pop과 맛집 탐방을 좋아해요',
        age: 25,
        gender: 'female',
        lookingFor: 'male',
        interests: ['패션', 'K-pop', '맛집', '사진'],
        occupation: 'Blogger',
        city: 'Seoul',
        country: 'Korea',
        location: { type: 'Point', coordinates: [126.9780, 37.5665] },
    },
    {
        email: 'emma@example.com',
        firstName: 'Emma',
        lastName: 'Johnson',
        locale: 'en',
        bio: 'NYC based artist. Love hiking, coffee, and good conversations!',
        age: 28,
        gender: 'female',
        lookingFor: 'male',
        interests: ['Art', 'Hiking', 'Coffee', 'Music'],
        occupation: 'Artist',
        city: 'New York',
        country: 'USA',
        location: { type: 'Point', coordinates: [-74.0060, 40.7128] },
    },
    {
        email: 'ken@example.com',
        firstName: 'Ken',
        lastName: 'Suzuki',
        locale: 'ja',
        bio: 'スポーツ大好き！サッカーとランニングが趣味です',
        age: 29,
        gender: 'male',
        lookingFor: 'female',
        interests: ['サッカー', 'ランニング', 'ジム', '映画'],
        occupation: 'マーケター',
        city: 'Tokyo',
        country: 'Japan',
        location: { type: 'Point', coordinates: [139.7000, 35.6800] },
    },
];

async function createSampleUsers() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const defaultPassword = await bcrypt.hash('Password123!', 10);

    for (const userData of sampleUsers) {
        try {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists, skipping...`);
                continue;
            }

            const user = new User({
                ...userData,
                password: defaultPassword,
                isActive: true,
                isVerified: true,
            });

            await user.save();
            console.log(`✅ Created: ${userData.firstName} ${userData.lastName} (${userData.email})`);
        } catch (error: any) {
            console.error(`❌ Error creating ${userData.email}:`, error.message);
        }
    }

    console.log('\n🎉 Sample users created!');
    console.log('Password for all: Password123!');

    await mongoose.disconnect();
}

createSampleUsers().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
