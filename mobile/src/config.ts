import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3699';

export const SUPPORTED_LOCALES = ['en', 'ja', 'ko'] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어',
};
