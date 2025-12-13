/**
 * Locale Middleware
 * 
 * Extracts and sets the user's preferred locale on each request
 */

import { Request, Response, NextFunction } from 'express';
import { isLocaleSupported, DEFAULT_LOCALE, Locale } from '../i18n';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            locale: Locale;
            timezone?: string;
        }
    }
}

/**
 * Extract locale from Accept-Language header
 */
function parseAcceptLanguage(header: string): string | null {
    if (!header) return null;

    // Parse the Accept-Language header (e.g., "en-US,en;q=0.9,ja;q=0.8")
    const languages = header.split(',').map(lang => {
        const [code, qValue] = lang.trim().split(';q=');
        return {
            code: code.split('-')[0].toLowerCase(), // Get primary language tag
            quality: qValue ? parseFloat(qValue) : 1.0,
        };
    });

    // Sort by quality and find first supported locale
    languages.sort((a, b) => b.quality - a.quality);

    for (const lang of languages) {
        if (isLocaleSupported(lang.code)) {
            return lang.code;
        }
    }

    return null;
}

/**
 * Locale middleware
 * 
 * Sets req.locale based on:
 * 1. X-Locale header (explicit override)
 * 2. User's stored locale (if authenticated)
 * 3. Accept-Language header
 * 4. Default locale
 */
export function localeMiddleware(req: Request, res: Response, next: NextFunction): void {
    let locale: Locale = DEFAULT_LOCALE;

    // 1. Check X-Locale header (highest priority)
    const explicitLocale = req.headers['x-locale'] as string;
    if (explicitLocale && isLocaleSupported(explicitLocale)) {
        locale = explicitLocale as Locale;
    }
    // 2. Parse Accept-Language header
    else {
        const acceptLanguage = req.headers['accept-language'] as string;
        const parsedLocale = parseAcceptLanguage(acceptLanguage);
        if (parsedLocale && isLocaleSupported(parsedLocale)) {
            locale = parsedLocale as Locale;
        }
    }

    // Set timezone from header if provided
    const timezone = req.headers['x-timezone'] as string;
    if (timezone) {
        req.timezone = timezone;
    }

    req.locale = locale;

    // Set response header for client
    res.setHeader('Content-Language', locale);

    next();
}

export default localeMiddleware;
