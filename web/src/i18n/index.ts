'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import mn from './locales/mn.json';

export const SUPPORTED_LOCALES = ['en', 'ja', 'ko', 'mn'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    mn: 'Монгол',
};

const resources = {
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
    mn: { translation: mn },
};

// SSR дээр LanguageDetector ажиллахгүй тул зөвхөн клиент дээр ашиглана
const isServer = typeof window === 'undefined';

const i18nInstance = i18n.use(initReactI18next);

if (!isServer) {
    i18nInstance.use(LanguageDetector);
}

i18nInstance.init({
    resources,
    fallbackLng: 'en',
    // SSR hydration mismatch-аас зайлсхийхийн тулд lng тохируулна
    lng: isServer ? 'en' : undefined,
    interpolation: {
        escapeValue: false,
    },
    detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
    },
    react: {
        useSuspense: false,
    },
});

export default i18n;
