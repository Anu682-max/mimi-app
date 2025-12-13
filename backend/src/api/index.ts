/**
 * Vercel Serverless API Entry Point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { config } from '../config';
import { preloadTranslations, t, SUPPORTED_LOCALES, LOCALE_DISPLAY_NAMES, getAllTranslations } from '../common/i18n';

// Preload translations
preloadTranslations();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        region: config.region,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// API prefix
const apiPrefix = `/api/${config.apiVersion}`;

// Get available locales
app.get(`${apiPrefix}/users/locales`, (_req, res) => {
    const locales = SUPPORTED_LOCALES.map(code => ({
        code,
        name: LOCALE_DISPLAY_NAMES[code],
    }));

    res.json({
        locales,
        default: config.defaultLocale,
    });
});

// Get translations for a locale
app.get(`${apiPrefix}/users/translations/:locale`, (req, res) => {
    const locale = req.params.locale;

    if (!SUPPORTED_LOCALES.includes(locale as any)) {
        res.status(400).json({
            error: 'Invalid locale',
            message: `Locale '${locale}' is not supported`,
        });
        return;
    }

    const translations = getAllTranslations(locale as any);
    res.json(translations);
});

// Demo auth endpoint
app.post(`${apiPrefix}/auth/login`, (req, res) => {
    const { email } = req.body;
    res.json({
        success: true,
        message: t('auth.login_success', 'en'),
        user: { email, locale: 'en' },
        token: 'demo-token',
    });
});

app.post(`${apiPrefix}/auth/register`, (req, res) => {
    const { email, locale = 'en' } = req.body;
    res.json({
        success: true,
        message: t('auth.register_success', locale),
        user: { email, locale },
        token: 'demo-token',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
    });
});

// Export for Vercel
export default app;
