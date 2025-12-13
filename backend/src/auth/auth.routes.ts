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

export const authRouter = Router();

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
        const existingUser = await userRepository.getByEmail(email);
        if (existingUser) {
            throw createError('Email already registered', 400, 'EMAIL_EXISTS');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await userRepository.create({
            email,
            passwordHash,
            firstName,
            lastName,
            birthday: new Date(birthday),
            gender,
            locale: userLocale,
            timezone: timezone || req.timezone,
        });

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        logger.info(`User registered: ${user.email}`);

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

        // Find user
        const user = await userRepository.getByEmail(email);
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
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
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
 * Request password reset
 */
authRouter.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const locale = req.locale;

        // Always return success to prevent email enumeration
        res.json({
            message: t('auth.password_reset_sent', locale),
        });
    } catch (error) {
        next(error);
    }
});

export default authRouter;
