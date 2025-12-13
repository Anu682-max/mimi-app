/**
 * User Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { userRepository } from './user.repository';
import { t, SUPPORTED_LOCALES, LOCALE_DISPLAY_NAMES, getAllTranslations } from '../common/i18n';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { createError } from '../common/middleware/error.middleware';

export const userRouter = Router();

/**
 * GET /users/me
 * Get current user's profile
 */
userRouter.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const user = await userRepository.getById(userId);

        if (!user) {
            throw createError('User not found', 404, 'NOT_FOUND');
        }

        res.json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            birthday: user.birthday,
            age: user.age,
            gender: user.gender,
            bio: user.bio,
            photos: user.photos,
            locale: user.locale,
            timezone: user.timezone,
            region: user.region,
            preferences: user.preferences,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /users/me
 * Update current user's profile
 */
userRouter.patch('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const updates = req.body;
        const locale = req.locale;

        // Validate allowed updates
        const allowedUpdates = [
            'firstName', 'lastName', 'bio', 'photos', 'locale',
            'timezone', 'preferences', 'location', 'city', 'country'
        ];

        const filteredUpdates: any = {};
        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key];
            }
        }

        const user = await userRepository.update(userId, filteredUpdates);

        if (!user) {
            throw createError('User not found', 404, 'NOT_FOUND');
        }

        res.json({
            message: t('profile.profile_updated', locale),
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                bio: user.bio,
                photos: user.photos,
                locale: user.locale,
                timezone: user.timezone,
                preferences: user.preferences,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /users/me/locale
 * Update user's locale preference
 */
userRouter.put('/me/locale', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { locale } = req.body;

        if (!SUPPORTED_LOCALES.includes(locale)) {
            throw createError('Unsupported locale', 400, 'INVALID_LOCALE');
        }

        const user = await userRepository.updateLocale(userId, locale);

        res.json({
            message: t('settings.change_language', locale),
            locale: user?.locale,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /users/me/timezone
 * Update user's timezone
 */
userRouter.put('/me/timezone', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { timezone } = req.body;

        const user = await userRepository.updateTimezone(userId, timezone);

        res.json({
            timezone: user?.timezone,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /users/locales
 * Get available locales (public endpoint)
 */
userRouter.get('/locales', (req: Request, res: Response) => {
    res.json({
        locales: SUPPORTED_LOCALES.map(locale => ({
            code: locale,
            name: LOCALE_DISPLAY_NAMES[locale],
        })),
        default: 'en',
    });
});

/**
 * GET /users/translations/:locale
 * Get all translations for a locale (for mobile app)
 */
userRouter.get('/translations/:locale', (req: Request, res: Response) => {
    const { locale } = req.params;
    const translations = getAllTranslations(locale);

    res.json({
        locale,
        translations,
    });
});

/**
 * GET /users/:id
 * Get a user's public profile
 */
userRouter.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await userRepository.getById(id);

        if (!user || !user.isActive) {
            throw createError('User not found', 404, 'NOT_FOUND');
        }

        // Return public profile only
        res.json({
            id: user._id,
            firstName: user.firstName,
            age: user.age,
            bio: user.bio,
            photos: user.photos,
            isVerified: user.isVerified,
            locale: user.locale,
        });
    } catch (error) {
        next(error);
    }
});

export default userRouter;
