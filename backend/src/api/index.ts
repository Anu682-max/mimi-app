/**
 * Vercel Serverless API Entry Point
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { config } from '../config';
import { preloadTranslations, t, SUPPORTED_LOCALES, LOCALE_DISPLAY_NAMES, getAllTranslations, Locale } from '../common/i18n';

// Preload translations
preloadTranslations();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
let isConnected = false;

async function connectDB(): Promise<boolean> {
    if (isConnected) return true;

    const uri = process.env.MONGODB_URI || config.database.uri;
    if (!uri || uri === 'mongodb://localhost:27017/indate') {
        return false;
    }

    try {
        await mongoose.connect(uri);
        isConnected = true;
        return true;
    } catch {
        return false;
    }
}

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
    city: { type: String },
    country: { type: String },

    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Health check
app.get('/health', async (_req: Request, res: Response): Promise<void> => {
    const dbConnected = await connectDB();
    res.json({
        status: 'ok',
        region: config.region,
        version: '1.0.0',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

// Root route
app.get('/', (_req: Request, res: Response): void => {
    res.json({
        app: 'InDate API',
        version: '1.0.0',
        docs: '/api/v1/users/locales',
    });
});

// API prefix
const apiPrefix = `/api/${config.apiVersion}`;

// Get available locales
app.get(`${apiPrefix}/users/locales`, (_req: Request, res: Response): void => {
    const locales = SUPPORTED_LOCALES.map((code: Locale) => ({
        code,
        name: LOCALE_DISPLAY_NAMES[code],
    }));

    res.json({
        locales,
        default: config.defaultLocale,
    });
});

// Get translations for a locale
app.get(`${apiPrefix}/users/translations/:locale`, (req: Request, res: Response): void => {
    const locale = req.params.locale;

    if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
        res.status(400).json({
            error: 'Invalid locale',
            message: `Locale '${locale}' is not supported`,
        });
        return;
    }

    const translations = getAllTranslations(locale as Locale);
    res.json(translations);
});

// Real auth endpoint - Login
app.post(`${apiPrefix}/auth/login`, async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            success: false,
            error: t('validation.email_required', 'en'),
        });
        return;
    }

    const dbConnected = await connectDB();
    if (!dbConnected) {
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
        });
        return;
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            res.status(401).json({
                success: false,
                error: t('auth.invalid_credentials', 'en'),
            });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                error: t('auth.invalid_credentials', 'en'),
            });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET || config.jwt.secret;
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: t('auth.login_success', user.locale || 'en'),
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                locale: user.locale,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
});

// Register endpoint
app.post(`${apiPrefix}/auth/register`, async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName, locale = 'en' } = req.body;

    if (!email || !password || !firstName) {
        res.status(400).json({
            success: false,
            error: t('validation.field_required', locale, { field: 'Email, password, firstName' }),
        });
        return;
    }

    const dbConnected = await connectDB();
    if (!dbConnected) {
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
        });
        return;
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: t('auth.email_exists', locale),
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            locale,
        });

        await user.save();

        const jwtSecret = process.env.JWT_SECRET || config.jwt.secret;
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: t('auth.register_success', locale),
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                locale: user.locale,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
});

// Discover API - Get users for swiping
app.get(`${apiPrefix}/discover`, async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const dbConnected = await connectDB();
    if (!dbConnected) {
        res.status(500).json({ success: false, error: 'Database connection failed' });
        return;
    }

    try {
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || config.jwt.secret;
        const decoded = jwt.verify(token, jwtSecret) as { userId: string };

        // Get users excluding current user
        const users = await User.find({
            _id: { $ne: decoded.userId },
            isActive: true,
            role: 'user',
        })
            .select('-password -email')
            .limit(20)
            .lean();

        res.json({
            success: true,
            users: users.map((u: any) => ({
                id: u._id,
                firstName: u.firstName,
                lastName: u.lastName,
                bio: u.bio,
                age: u.age,
                gender: u.gender,
                photos: u.photos || [],
                interests: u.interests || [],
                occupation: u.occupation,
                city: u.city,
                country: u.country,
                locale: u.locale,
            })),
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// Like/Pass API - Record swipe action
app.post(`${apiPrefix}/discover/swipe`, async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const { targetUserId, action } = req.body;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    if (!targetUserId || !['like', 'pass'].includes(action)) {
        res.status(400).json({ success: false, error: 'Invalid request' });
        return;
    }

    // For now, just return success (full matching logic would require a Match collection)
    res.json({
        success: true,
        action,
        targetUserId,
        // In a real app, check if mutual like = match
        isMatch: action === 'like' ? Math.random() > 0.7 : false,
    });
});

// 404 handler
app.use((req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
    });
});

// Export for Vercel
export default app;
