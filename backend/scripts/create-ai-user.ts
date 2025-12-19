
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
// Use require for bcrypt to avoid type issues if @types/bcrypt is missing
const bcrypt = require('bcrypt');
import User from '../src/user/user.model';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAIUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Ensure URI is defined
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(uri);
        console.log('Connected.');

        const aiUsers = [
            {
                email: 'sophie.ai@indate.app',
                password: 'password123', // Dummy password
                firstName: 'Sophie',
                lastName: '(AI)',
                birthday: new Date('1998-05-15'), // 27 years old
                gender: 'woman',
                bio: 'Hi! I am Sophie, your AI companion. I love art, music, and deep conversations. Let\'s chat! 🤖✨',
                photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie'],
                location: {
                    type: 'Point',
                    coordinates: [-118.2437, 34.0522] // Los Angeles
                },
                city: 'Los Angeles',
                country: 'USA',
                isAI: true,
                isVerified: true
            },
            {
                email: 'alex.ai@indate.app',
                password: 'password123',
                firstName: 'Alex',
                lastName: '(AI)',
                birthday: new Date('1996-08-20'), // 29 years old
                gender: 'man',
                bio: 'Hey there! I\'m Alex. Creating connections through technology. Always down for a chat about tech or travel. 🌍',
                photos: ['https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'],
                location: {
                    type: 'Point',
                    coordinates: [-118.2437, 34.0522] // Los Angeles
                },
                city: 'Los Angeles',
                country: 'USA',
                isAI: true,
                isVerified: true
            }
        ];

        for (const userData of aiUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`AI User ${userData.firstName} already exists.`);

                if (!existingUser.isAI) {
                    existingUser.isAI = true;
                    // Fix TS error by casting or checking schema
                    (existingUser as any).isAI = true;
                    await existingUser.save();
                    console.log(`Updated ${userData.firstName} to be an AI user.`);
                }

                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(userData.password, salt);

            const newUser = new User({
                ...userData,
                passwordHash,
                preferences: {
                    showMe: ['man', 'woman'],
                    ageRange: { min: 18, max: 100 },
                    maxDistance: 100,
                    autoTranslate: true
                },
                locale: 'en',
                timezone: 'UTC',
                region: 'us-west'
            });

            await newUser.save();
            console.log(`Created AI User: ${userData.firstName}`);
        }

        console.log('Done!');
    } catch (error) {
        console.error('Error creating AI users:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createAIUser();
