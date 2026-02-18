import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import mn from './locales/mn.json';

const resources = {
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
    mn: { translation: mn },
};

// Төхөөрөмжийн хэлийг тодорхойлох
const deviceLocale = Localization.locale.split('-')[0];
const defaultLocale = ['en', 'ja', 'ko', 'mn'].includes(deviceLocale) ? deviceLocale : 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: defaultLocale,
        fallbackLng: 'en',
        compatibilityJSON: 'v3',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
