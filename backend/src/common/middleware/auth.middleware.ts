/**
 * Auth Middleware
 * 
 * JWT authentication middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { createError } from './error.middleware';
import { t } from '../i18n';
import { userRepository } from '../../user/user.repository';

interface JwtPayload {
    userId: string;
    email: string;
}

/**
 * Authentication middleware
 * Validates JWT token and sets user info on request
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const locale = req.locale;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError(t('errors.unauthorized', locale), 401, 'UNAUTHORIZED');
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

            // Set user info on request
            (req as any).userId = decoded.userId;
            (req as any).userEmail = decoded.email;

            // Optionally fetch user to get their locale
            const user = await userRepository.getById(decoded.userId);
            if (user) {
                // Override locale with user's stored preference
                req.locale = user.locale;
                req.timezone = user.timezone;
            }

            next();
        } catch (jwtError) {
            throw createError(t('errors.session_expired', locale), 401, 'SESSION_EXPIRED');
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Optional auth middleware
 * Sets user info if token exists, but doesn't require authentication
 */
export async function optionalAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            try {
                const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
                (req as any).userId = decoded.userId;
                (req as any).userEmail = decoded.email;

                const user = await userRepository.getById(decoded.userId);
                if (user) {
                    req.locale = user.locale;
                    req.timezone = user.timezone;
                }
            } catch {
                // Token invalid, but don't fail - just continue without auth
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}

export default { authMiddleware, optionalAuthMiddleware };
