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

// Profile API - Get current user profile
app.get(`${apiPrefix}/profile`, async (req: Request, res: Response): Promise<void> => {
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

        const user = await User.findById(decoded.userId).select('-password').lean();

        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.json({
            success: true,
            profile: user,
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// Profile API - Update current user profile
app.put(`${apiPrefix}/profile`, async (req: Request, res: Response): Promise<void> => {
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

        const allowedFields = ['firstName', 'lastName', 'bio', 'age', 'gender', 'lookingFor', 'interests', 'occupation', 'city', 'country', 'locale'];
        const updates: Record<string, any> = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { $set: updates },
            { new: true }
        ).select('-password').lean();

        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.json({
            success: true,
            message: t('profile.updated', (user as any).locale || 'en'),
            profile: user,
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    translatedContent: { type: String },
    originalLocale: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// Chat API - Get conversations
app.get(`${apiPrefix}/conversations`, async (req: Request, res: Response): Promise<void> => {
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

        const conversations = await Conversation.find({
            participants: decoded.userId
        })
            .populate('participants', 'firstName lastName')
            .sort({ lastMessageAt: -1 })
            .lean();

        res.json({
            success: true,
            conversations: conversations.map((c: any) => ({
                id: c._id,
                participants: c.participants.map((p: any) => ({
                    id: p._id,
                    firstName: p.firstName,
                    lastName: p.lastName,
                })),
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt,
            })),
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// Chat API - Get messages for a conversation
app.get(`${apiPrefix}/messages/:conversationId`, async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const { conversationId } = req.params;

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
        jwt.verify(token, jwtSecret);

        const messages = await Message.find({ conversationId })
            .populate('senderId', 'firstName lastName')
            .sort({ createdAt: 1 })
            .lean();

        res.json({
            success: true,
            messages: messages.map((m: any) => ({
                id: m._id,
                senderId: m.senderId._id,
                senderName: m.senderId.firstName,
                content: m.content,
                translatedContent: m.translatedContent,
                originalLocale: m.originalLocale,
                createdAt: m.createdAt,
            })),
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// Chat API - Send message
app.post(`${apiPrefix}/messages`, async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const { conversationId, receiverId, content } = req.body;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    if (!content) {
        res.status(400).json({ success: false, error: 'Content required' });
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

        const sender = await User.findById(decoded.userId).lean() as any;

        let conversation;

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        } else if (receiverId) {
            // Find or create conversation
            conversation = await Conversation.findOne({
                participants: { $all: [decoded.userId, receiverId] }
            });

            if (!conversation) {
                conversation = new Conversation({
                    participants: [decoded.userId, receiverId],
                });
                await conversation.save();
            }
        } else {
            res.status(400).json({ success: false, error: 'conversationId or receiverId required' });
            return;
        }

        // Create message
        const message = new Message({
            conversationId: conversation._id,
            senderId: decoded.userId,
            content,
            originalLocale: sender?.locale || 'en',
        });

        await message.save();

        // Update conversation
        conversation.lastMessage = content.substring(0, 100);
        conversation.lastMessageAt = new Date();
        await conversation.save();

        res.json({
            success: true,
            message: {
                id: message._id,
                conversationId: conversation._id,
                content: message.content,
                createdAt: message.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

// AI Translation API
app.post(`${apiPrefix}/translate`, async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const { text, fromLocale, toLocale } = req.body;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    if (!text || !toLocale) {
        res.status(400).json({ success: false, error: 'text and toLocale required' });
        return;
    }

    try {
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!openaiKey) {
            // Mock translation for demo (just return original with language tag)
            res.json({
                success: true,
                translatedText: `[${toLocale.toUpperCase()}] ${text}`,
                fromLocale: fromLocale || 'auto',
                toLocale,
                mock: true,
            });
            return;
        }

        // Real OpenAI translation
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a translator. Translate the following text to ${toLocale}. Only respond with the translation, nothing else.`,
                    },
                    {
                        role: 'user',
                        content: text,
                    },
                ],
                max_tokens: 500,
                temperature: 0.3,
            }),
        });

        const data = await response.json();
        const translatedText = data.choices?.[0]?.message?.content?.trim() || text;

        res.json({
            success: true,
            translatedText,
            fromLocale: fromLocale || 'auto',
            toLocale,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Translation failed' });
    }
});

// Translate message in conversation
app.post(`${apiPrefix}/messages/:messageId/translate`, async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const { messageId } = req.params;
    const { toLocale } = req.body;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    if (!toLocale) {
        res.status(400).json({ success: false, error: 'toLocale required' });
        return;
    }

    const dbConnected = await connectDB();
    if (!dbConnected) {
        res.status(500).json({ success: false, error: 'Database connection failed' });
        return;
    }

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            res.status(404).json({ success: false, error: 'Message not found' });
            return;
        }

        const openaiKey = process.env.OPENAI_API_KEY;
        let translatedContent: string;

        if (!openaiKey) {
            // Mock translation
            translatedContent = `[${toLocale.toUpperCase()}] ${message.content}`;
        } else {
            // Real OpenAI translation
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a translator. Translate the following text to ${toLocale}. Only respond with the translation, nothing else.`,
                        },
                        {
                            role: 'user',
                            content: message.content,
                        },
                    ],
                    max_tokens: 500,
                    temperature: 0.3,
                }),
            });

            const data = await response.json();
            translatedContent = data.choices?.[0]?.message?.content?.trim() || message.content;
        }

        // Save translation to message
        message.translatedContent = translatedContent;
        await message.save();

        res.json({
            success: true,
            messageId,
            originalContent: message.content,
            translatedContent,
            toLocale,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Translation failed' });
    }
});

// Photo Upload API - Add photo to profile
app.post(`${apiPrefix}/profile/photos`, async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const { photo } = req.body; // Base64 encoded image

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    if (!photo) {
        res.status(400).json({ success: false, error: 'Photo data required' });
        return;
    }

    // Validate base64 image (simple check)
    if (!photo.startsWith('data:image/')) {
        res.status(400).json({ success: false, error: 'Invalid image format. Use base64 data URL.' });
        return;
    }

    // Check size (limit to ~500KB base64 which is ~375KB image)
    if (photo.length > 500000) {
        res.status(400).json({ success: false, error: 'Image too large. Max 500KB.' });
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

        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Limit to 6 photos
        if (user.photos && user.photos.length >= 6) {
            res.status(400).json({ success: false, error: 'Maximum 6 photos allowed' });
            return;
        }

        // Add photo
        if (!user.photos) user.photos = [];
        user.photos.push(photo);
        await user.save();

        res.json({
            success: true,
            message: 'Photo uploaded',
            photoCount: user.photos.length,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Upload failed' });
    }
});

// Delete photo from profile
app.delete(`${apiPrefix}/profile/photos/:index`, async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    const { index } = req.params;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const photoIndex = parseInt(index);
    if (isNaN(photoIndex) || photoIndex < 0) {
        res.status(400).json({ success: false, error: 'Invalid photo index' });
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

        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        if (!user.photos || photoIndex >= user.photos.length) {
            res.status(404).json({ success: false, error: 'Photo not found' });
            return;
        }

        // Remove photo
        user.photos.splice(photoIndex, 1);
        await user.save();

        res.json({
            success: true,
            message: 'Photo deleted',
            photoCount: user.photos.length,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Delete failed' });
    }
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
