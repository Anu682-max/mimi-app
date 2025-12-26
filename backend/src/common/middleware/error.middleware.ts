/**
 * Error Handler Middleware
 * 
 * Centralized error handling with i18n support
 */

import { Request, Response, NextFunction } from 'express';
import { t } from '../i18n';
import { logger } from '../logger';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
    params?: Record<string, string | number>;
}

/**
 * Create an application error
 */
export function createError(
    message: string,
    statusCode = 500,
    code?: string,
    params?: Record<string, string | number>
): AppError {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.params = params;
    return error;
}

/**
 * Error handler middleware
 */
export function errorHandler(
    err: AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void {
    const statusCode = err.statusCode || 500;
    const locale = req.locale || 'en';

    // Log the error
    if (statusCode >= 500) {
        logger.error(`Server Error: ${err.message}`, {
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    } else {
        logger.warn(`Client Error: ${err.message}`, {
            path: req.path,
            method: req.method,
        });
    }

    // Translate error message if it's a translation key
    let message = err.message || 'An unexpected error occurred';
    if (err.code) {
        // If error has a code, try to translate it
        const translatedMessage = t(`errors.${err.code}`, locale, err.params);
        if (translatedMessage !== `errors.${err.code}`) {
            message = translatedMessage;
        }
    }

    // Check for validation errors with embedded code
    if (message && message.startsWith('VALIDATION_')) {
        const [code, ...params] = message.split(':');
        const translationKey = code.toLowerCase().replace('validation_', 'validation.');
        message = t(translationKey, locale, { min: params[0] });
    }

    res.status(statusCode).json({
        error: {
            message,
            code: err.code,
            statusCode,
        },
    });
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
    const locale = req.locale || 'en';
    res.status(404).json({
        error: {
            message: t('errors.not_found', locale),
            code: 'NOT_FOUND',
            statusCode: 404,
        },
    });
}

export default { errorHandler, notFoundHandler, createError };
