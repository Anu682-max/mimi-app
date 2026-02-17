/**
 * Authentication Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../user/user.repository';
import { t } from '../common/i18n';
import { config } from '../config';
import { createError } from '../common/middleware/error.middleware';
import { logger } from '../common/logger';
import { sendVerificationEmail, sendPasswordResetEmail, verifyToken } from './emailVerification';

export const authRouter: Router = Router();

// In-memory users for mock mode (when no database)
const mockUsers: Map<string, any> = new Map();

// Add a default test user
const defaultPassword = bcrypt.hashSync('password123', 12);
mockUsers.set('test@example.com', {
    _id: 'test-user-1',
    email: 'test@example.com',
    passwordHash: defaultPassword,
    firstName: 'Test',
    lastName: 'User',
    locale: 'en',
    timezone: 'UTC',
    region: 'us-east',
    isVerified: true,
    role: 'user',
    createdAt: new Date(),
});

/**
 * POST /auth/register
 * Register a new user
 */
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, firstName, lastName, birthday, gender, locale, timezone } = req.body;
        const userLocale = locale || req.locale;

        // Validate required fields
        if (!email) {
            throw createError(t('validation.email_required', userLocale), 400, 'EMAIL_REQUIRED');
        }
        if (!password) {
            throw createError(t('validation.password_required', userLocale), 400, 'PASSWORD_REQUIRED');
        }
        if (password.length < 8) {
            throw createError(t('validation.password_min_length', userLocale, { min: 8 }), 400, 'PASSWORD_MIN_LENGTH');
        }
        if (!firstName) {
            throw createError(t('validation.field_required', userLocale, { field: 'First name' }), 400, 'FIELD_REQUIRED');
        }
        if (!birthday) {
            throw createError(t('validation.field_required', userLocale, { field: 'Birthday' }), 400, 'FIELD_REQUIRED');
        }
        if (!gender) {
            throw createError(t('validation.field_required', userLocale, { field: 'Gender' }), 400, 'FIELD_REQUIRED');
        }

        // Check if user already exists
        let existingUser = await userRepository.getByEmail(email);
        
        // Fallback to mock users if no database
        if (!existingUser && mockUsers.has(email)) {
            existingUser = mockUsers.get(email);
        }
        
        if (existingUser) {
            throw createError('Email already registered', 400, 'EMAIL_EXISTS');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = {
            _id: `user-${Date.now()}`,
            email,
            passwordHash,
            firstName,
            lastName,
            birthday: new Date(birthday),
            gender,
            locale: userLocale,
            timezone: timezone || req.timezone,
            region: 'us-east',
            isVerified: false,
            role: 'user',
            createdAt: new Date(),
        };

        // Create user (try database first, fallback to mock)
        let user;
        try {
            user = await userRepository.create({
                email,
                passwordHash,
                firstName,
                lastName,
                birthday: new Date(birthday),
                gender,
                locale: userLocale,
                timezone: timezone || req.timezone,
            });
        } catch (err) {
            // If database fails, use mock storage
            mockUsers.set(email, newUser);
            user = newUser;
            logger.info('User created in mock storage (no database)');
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            config.jwt.secret as string,
            { expiresIn: '7d' }
        );

        logger.info(`User registered: ${user.email}`);

        // Email баталгаажуулалтын мэйл илгээх
        sendVerificationEmail(email, user._id.toString(), firstName).catch(err => {
            logger.error('Failed to send verification email:', err);
        });

        res.status(201).json({
            message: t('auth.verification_sent', userLocale),
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                locale: user.locale,
                region: user.region,
            },
            token,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/login
 * Login user
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, locale } = req.body;
        const userLocale = locale || req.locale;

        if (!email || !password) {
            throw createError(t('validation.email_required', userLocale), 400, 'CREDENTIALS_REQUIRED');
        }

        // Find user (try database first, fallback to mock)
        let user = await userRepository.getByEmail(email);
        
        if (!user && mockUsers.has(email)) {
            user = mockUsers.get(email);
        }
        
        if (!user) {
            throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
        }

        // Update user's locale if different
        if (locale && locale !== user.locale) {
            await userRepository.updateLocale(user._id.toString(), locale);
        }

        // Update online status
        await userRepository.updateOnlineStatus(user._id.toString(), true);

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            config.jwt.secret as string,
            { expiresIn: '7d' }
        );

        logger.info(`User logged in: ${user.email}`);

        res.json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                locale: locale || user.locale,
                timezone: user.timezone,
                region: user.region,
                isVerified: user.isVerified,
            },
            token,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/logout
 * Logout user
 */
authRouter.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;

        if (userId) {
            await userRepository.updateOnlineStatus(userId, false);
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/forgot-password
 * Нууц үг сэргээх хүсэлт
 */
authRouter.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const locale = req.locale;

        // Хэрэглэгч олох (email enumeration-аас хамгаалахын тулд үргэлж амжилттай хариу буцаана)
        const user = await userRepository.getByEmail(email);
        if (user) {
            sendPasswordResetEmail(email, user._id.toString()).catch(err => {
                logger.error('Failed to send password reset email:', err);
            });
        }

        res.json({
            message: t('auth.password_reset_sent', locale),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/verify-email
 * Имэйл баталгаажуулах
 */
authRouter.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;

        if (!token) {
            throw createError('Token is required', 400, 'TOKEN_REQUIRED');
        }

        const result = await verifyToken(token, 'email_verify');
        if (!result) {
            throw createError('Invalid or expired token', 400, 'INVALID_TOKEN');
        }

        // Хэрэглэгчийг баталгаажуулсан гэж тэмдэглэх
        try {
            await userRepository.update(result.userId, { isVerified: true });
        } catch {
            // Mock mode-д mockUsers шинэчлэх
            for (const [, user] of mockUsers) {
                if (user._id === result.userId) {
                    user.isVerified = true;
                    break;
                }
            }
        }

        logger.info(`Email verified for user ${result.userId}`);
        res.json({ status: 'success', message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/reset-password
 * Нууц үг шинэчлэх (токеноор)
 */
authRouter.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            throw createError('Token and new password are required', 400, 'MISSING_FIELDS');
        }

        if (newPassword.length < 8) {
            throw createError('Password must be at least 8 characters', 400, 'PASSWORD_MIN_LENGTH');
        }

        const result = await verifyToken(token, 'password_reset');
        if (!result) {
            throw createError('Invalid or expired token', 400, 'INVALID_TOKEN');
        }

        // Шинэ нууц үг хэшлэх
        const passwordHash = await bcrypt.hash(newPassword, 12);

        try {
            await userRepository.update(result.userId, { passwordHash });
        } catch {
            // Mock mode
            for (const [, user] of mockUsers) {
                if (user._id === result.userId) {
                    user.passwordHash = passwordHash;
                    break;
                }
            }
        }

        logger.info(`Password reset for user ${result.userId}`);
        res.json({ status: 'success', message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/resend-verification
 * Баталгаажуулалтын мэйл дахин илгээх
 */
authRouter.post('/resend-verification', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const user = await userRepository.getByEmail(email);
        if (user && !user.isVerified) {
            sendVerificationEmail(email, user._id.toString(), user.firstName).catch(err => {
                logger.error('Failed to resend verification email:', err);
            });
        }

        res.json({ message: 'If the email exists and is not verified, a verification email has been sent.' });
    } catch (error) {
        next(error);
    }
});

export default authRouter;
