'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

export const SUPPORTED_LOCALES = ['en', 'ja', 'ko'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어',
};

const resources = {
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
