/**
 * OAuth Routes
 * Google болон Apple нэвтрэлт
 */

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userRepository } from '../user/user.repository';
import { config } from '../config';
import { createError } from '../common/middleware/error.middleware';
import { logger } from '../common/logger';

const router = Router();

/**
 * POST /auth/oauth/google
 * Google OAuth нэвтрэлт
 * Frontend-ээс Google ID token авч шалгана
 */
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { idToken, accessToken } = req.body;

        if (!idToken && !accessToken) {
            throw createError('Google ID token or access token is required', 400, 'TOKEN_REQUIRED');
        }

        // Google token шалгах
        let googleUser: { email: string; name: string; picture?: string; sub: string };

        try {
            // Google tokeninfo endpoint ашиглан шалгах
            const response = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
            );

            if (!response.ok) {
                throw new Error('Invalid Google token');
            }

            const data = await response.json() as { email: string; name?: string; picture?: string; sub: string };
            googleUser = {
                email: data.email,
                name: data.name || data.email.split('@')[0],
                picture: data.picture,
                sub: data.sub,
            };
        } catch {
            throw createError('Invalid Google token', 401, 'INVALID_GOOGLE_TOKEN');
        }

        // Хэрэглэгч аль хэдийн бүртгэлтэй эсэхийг шалгах
        let user = await userRepository.getByEmail(googleUser.email);

        if (!user) {
            // Шинэ хэрэглэгч үүсгэх
            try {
                user = await userRepository.create({
                    email: googleUser.email,
                    passwordHash: `oauth_google_${googleUser.sub}`, // OAuth хэрэглэгч нууц үг хэрэглэхгүй
                    firstName: googleUser.name.split(' ')[0],
                    lastName: googleUser.name.split(' ').slice(1).join(' '),
                    birthday: new Date('2000-01-01'), // Дараа нь профайлдаа засна
                    gender: 'other',
                    locale: 'en',
                    timezone: 'UTC',
                    photos: googleUser.picture ? [googleUser.picture] : [],
                    isVerified: true, // Google аккаунт аль хэдийн баталгаажсан
                });
            } catch {
                // Mock mode fallback
                user = {
                    _id: `google-${Date.now()}`,
                    email: googleUser.email,
                    firstName: googleUser.name.split(' ')[0],
                    lastName: googleUser.name.split(' ').slice(1).join(' '),
                    locale: 'en',
                    timezone: 'UTC',
                    region: 'us-east',
                    isVerified: true,
                } as any;
            }

            logger.info(`New Google user created: ${googleUser.email}`);
        }

        // JWT token үүсгэх
        const token = jwt.sign(
            { userId: user!._id, email: user!.email },
            config.jwt.secret as string,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user!._id,
                email: user!.email,
                firstName: user!.firstName,
                lastName: user!.lastName,
                locale: user!.locale,
                isVerified: true,
            },
            token,
            isNewUser: !(user as any).birthday || (user as any).gender === 'other',
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/oauth/apple
 * Apple Sign-In нэвтрэлт
 */
router.post('/apple', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { identityToken, user: appleUser } = req.body;

        if (!identityToken) {
            throw createError('Apple identity token is required', 400, 'TOKEN_REQUIRED');
        }

        // Apple identity token decode (JWT)
        const decoded = jwt.decode(identityToken) as any;
        if (!decoded || !decoded.email) {
            throw createError('Invalid Apple token', 401, 'INVALID_APPLE_TOKEN');
        }

        const email = decoded.email;
        const firstName = appleUser?.name?.firstName || email.split('@')[0];
        const lastName = appleUser?.name?.lastName || '';

        // Хэрэглэгч олох эсвэл үүсгэх
        let user = await userRepository.getByEmail(email);

        if (!user) {
            try {
                user = await userRepository.create({
                    email,
                    passwordHash: `oauth_apple_${decoded.sub}`,
                    firstName,
                    lastName,
                    birthday: new Date('2000-01-01'),
                    gender: 'other',
                    locale: 'en',
                    timezone: 'UTC',
                    isVerified: true,
                });
            } catch {
                user = {
                    _id: `apple-${Date.now()}`,
                    email,
                    firstName,
                    lastName,
                    locale: 'en',
                    timezone: 'UTC',
                    region: 'us-east',
                    isVerified: true,
                } as any;
            }

            logger.info(`New Apple user created: ${email}`);
        }

        const token = jwt.sign(
            { userId: user!._id, email: user!.email },
            config.jwt.secret as string,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user!._id,
                email: user!.email,
                firstName: user!.firstName,
                lastName: user!.lastName,
                locale: user!.locale,
                isVerified: true,
            },
            token,
            isNewUser: !(user as any).birthday || (user as any).gender === 'other',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
