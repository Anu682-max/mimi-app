/**
 * Internationalization (i18n) Helper Module
 * 
 * Provides locale-aware translation functionality for the backend.
 * Supports parameter interpolation and fallback to default locale.
 */

import fs from 'fs';
import path from 'path';
import { logger } from './logger';

// Supported locales
export type Locale = 'en' | 'ja' | 'ko' | 'de' | 'fr' | 'es' | 'zh';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'ja', 'ko', 'de', 'fr', 'es', 'zh'];
export const DEFAULT_LOCALE: Locale = 'en';

// Translation cache
const translationCache: Map<Locale, Record<string, unknown>> = new Map();

// Locale display names for UI
export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    zh: '中文',
};

/**
 * Load translations for a given locale
 */
function loadTranslations(locale: Locale): Record<string, unknown> {
    if (translationCache.has(locale)) {
        return translationCache.get(locale)!;
    }

    const localePath = path.join(__dirname, '../locales', `${locale}.json`);

    try {
        if (fs.existsSync(localePath)) {
            const content = fs.readFileSync(localePath, 'utf-8');
            const translations = JSON.parse(content);
            translationCache.set(locale, translations);
            return translations;
        }
    } catch (error) {
        logger.error(`Failed to load translations for locale: ${locale}`, error);
    }

    // Return empty object if locale file doesn't exist
    return {};
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, key: string): string | undefined {
    const keys = key.split('.');
    let current: unknown = obj;

    for (const k of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[k];
    }

    return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate parameters into a translation string
 * Supports {{param}} syntax
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = params[key];
        return value !== undefined ? String(value) : match;
    });
}

/**
 * Main translation function
 * 
 * @param key - The translation key (dot notation, e.g., "auth.login_title")
 * @param locale - The target locale
 * @param params - Optional parameters for interpolation
 * @returns The translated string, or the key if not found
 * 
 * @example
 * t('auth.login_title', 'ja') // Returns "ログイン"
 * t('validation.password_min_length', 'en', { min: 8 }) // Returns "Password must be at least 8 characters"
 */
export function t(
    key: string,
    locale: Locale | string = DEFAULT_LOCALE,
    params?: Record<string, string | number>
): string {
    // Validate locale
    const validLocale = SUPPORTED_LOCALES.includes(locale as Locale)
        ? (locale as Locale)
        : DEFAULT_LOCALE;

    // Load translations for the requested locale
    const translations = loadTranslations(validLocale);
    let text = getNestedValue(translations, key);

    // Fallback to default locale if translation not found
    if (!text && validLocale !== DEFAULT_LOCALE) {
        logger.warn(`Translation missing for key "${key}" in locale "${validLocale}", falling back to ${DEFAULT_LOCALE}`);
        const fallbackTranslations = loadTranslations(DEFAULT_LOCALE);
        text = getNestedValue(fallbackTranslations, key);
    }

    // Return key if no translation found
    if (!text) {
        logger.warn(`Translation missing for key "${key}" in all locales`);
        return key;
    }

    // Interpolate parameters
    return interpolate(text, params);
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): locale is Locale {
    return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Get the display name for a locale
 */
export function getLocaleDisplayName(locale: Locale | string): string {
    if (isLocaleSupported(locale)) {
        return LOCALE_DISPLAY_NAMES[locale];
    }
    return locale;
}

/**
 * Preload all translation files into cache
 * Call this on server startup for better performance
 */
export function preloadTranslations(): void {
    for (const locale of SUPPORTED_LOCALES) {
        loadTranslations(locale);
    }
    logger.info(`Preloaded translations for ${SUPPORTED_LOCALES.length} locales`);
}

/**
 * Clear the translation cache
 * Useful for development hot-reloading
 */
export function clearTranslationCache(): void {
    translationCache.clear();
}

/**
 * Get all translations for a locale
 * Useful for sending to frontend
 */
export function getAllTranslations(locale: Locale | string = DEFAULT_LOCALE): Record<string, unknown> {
    const validLocale = SUPPORTED_LOCALES.includes(locale as Locale)
        ? (locale as Locale)
        : DEFAULT_LOCALE;

    return loadTranslations(validLocale);
}

export default {
    t,
    isLocaleSupported,
    getLocaleDisplayName,
    preloadTranslations,
    clearTranslationCache,
    getAllTranslations,
    SUPPORTED_LOCALES,
    DEFAULT_LOCALE,
    LOCALE_DISPLAY_NAMES,
};
