/**
 * i18n Configuration for React Native
 * 
 * Sets up i18next with locale detection and fallbacks
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

// Import locale files
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

// Available locales
export const SUPPORTED_LOCALES = ['en', 'ja', 'ko', 'de', 'fr', 'es', 'zh'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: Locale = 'en';

// Locale display names
export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    zh: '中文',
};

// Language resources
const resources = {
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
};

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = '@indate/language';

/**
 * Get device's preferred language
 */
function getDeviceLanguage(): Locale {
    const locales = RNLocalize.getLocales();

    if (locales.length > 0) {
        const deviceLanguage = locales[0].languageCode;

        // Check if device language is supported
        if (SUPPORTED_LOCALES.includes(deviceLanguage as Locale)) {
            return deviceLanguage as Locale;
        }
    }

    return DEFAULT_LOCALE;
}

/**
 * Load saved language from storage
 */
async function getSavedLanguage(): Promise<Locale | null> {
    try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
            return saved as Locale;
        }
    } catch (error) {
        console.warn('Failed to load saved language:', error);
    }
    return null;
}

/**
 * Save language preference to storage
 */
export async function saveLanguage(locale: Locale): Promise<void> {
    try {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch (error) {
        console.warn('Failed to save language:', error);
    }
}

/**
 * Initialize i18n
 */
export async function initializeI18n(): Promise<void> {
    // Try to get saved language, fallback to device language
    const savedLanguage = await getSavedLanguage();
    const initialLanguage = savedLanguage || getDeviceLanguage();

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: initialLanguage,
            fallbackLng: DEFAULT_LOCALE,

            interpolation: {
                escapeValue: false, // React already escapes values
            },

            // Logging for development
            debug: __DEV__,

            // React specific settings
            react: {
                useSuspense: false,
            },

            // Missing key handling
            saveMissing: true,
            missingKeyHandler: (lngs, ns, key) => {
                console.warn(`Missing translation key: ${key} for languages: ${lngs.join(', ')}`);
            },
        });
}

/**
 * Change the current language
 */
export async function changeLanguage(locale: Locale): Promise<void> {
    await i18n.changeLanguage(locale);
    await saveLanguage(locale);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): Locale {
    return (i18n.language as Locale) || DEFAULT_LOCALE;
}

/**
 * Check if a locale is supported
 */
export function isLocaleSupported(locale: string): locale is Locale {
    return SUPPORTED_LOCALES.includes(locale as Locale);
}

export default i18n;
