/**
 * Rate Limiting Middleware
 * IP болон хэрэглэгчийн хүсэлтийн тоог хязгаарлана
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory хадгалалт (production-д Redis ашиглах хэрэгтэй)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Хуучин бичлэгүүдийг тогтмол цэвэрлэх
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Минут тутамд цэвэрлэнэ

interface RateLimitOptions {
    windowMs: number;      // Цонхны хугацаа (ms)
    maxRequests: number;   // Хамгийн их хүсэлтийн тоо
    message?: string;      // Хязгаарлагдсан үед гарах мессеж
    keyGenerator?: (req: Request) => string; // Түлхүүр үүсгэгч
}

/**
 * Rate limit middleware үүсгэгч
 */
export function rateLimit(options: RateLimitOptions) {
    const {
        windowMs,
        maxRequests,
        message = 'Too many requests, please try again later.',
        keyGenerator,
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        // Түлхүүр тодорхойлох - IP эсвэл хэрэглэгчийн ID
        const key = keyGenerator
            ? keyGenerator(req)
            : (req as any).userId || req.ip || 'unknown';

        const now = Date.now();
        const entry = rateLimitStore.get(key);

        if (!entry || now > entry.resetTime) {
            // Шинэ цонх эхлүүлэх
            rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
            res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
            return next();
        }

        entry.count++;

        if (entry.count > maxRequests) {
            logger.warn(`Rate limit exceeded for ${key}`);
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', 0);
            res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
            res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
            return res.status(429).json({
                error: {
                    message,
                    code: 'RATE_LIMIT_EXCEEDED',
                    statusCode: 429,
                },
            });
        }

        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - entry.count);
        res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
        next();
    };
}

// Тохиргоотой rate limiter-ууд
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 минут
    maxRequests: 20,            // 15 минутад 20 хүсэлт
    message: 'Too many login attempts. Please try again in 15 minutes.',
});

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000,       // 1 минут
    maxRequests: 100,           // Минутад 100 хүсэлт
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,       // 1 минут
    maxRequests: 10,            // Минутад 10 upload
    message: 'Too many uploads. Please try again later.',
});

export const messageLimiter = rateLimit({
    windowMs: 60 * 1000,       // 1 минут
    maxRequests: 60,            // Минутад 60 мессеж
    message: 'You are sending messages too quickly.',
});
