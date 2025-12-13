/**
 * Localization Hooks
 * 
 * Custom hooks for i18n and locale-related functionality
 */

import { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, formatDistance, formatRelative } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { enUS, ja, ko, de, fr, es, zhCN } from 'date-fns/locale';

import {
    changeLanguage,
    getCurrentLanguage,
    Locale,
    SUPPORTED_LOCALES,
    LOCALE_DISPLAY_NAMES,
} from './index';

// Date-fns locale mapping
const dateFnsLocales: Record<Locale, any> = {
    en: enUS,
    ja: ja,
    ko: ko,
    de: de,
    fr: fr,
    es: es,
    zh: zhCN,
};

/**
 * Hook for accessing translations
 */
export function useLocale() {
    const { t, i18n } = useTranslation();
    const [currentLocale, setCurrentLocale] = useState<Locale>(getCurrentLanguage());

    useEffect(() => {
        const handleLanguageChange = (lng: string) => {
            setCurrentLocale(lng as Locale);
        };

        i18n.on('languageChanged', handleLanguageChange);
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    const setLocale = useCallback(async (locale: Locale) => {
        await changeLanguage(locale);
        setCurrentLocale(locale);
    }, []);

    return {
        t,
        locale: currentLocale,
        setLocale,
        supportedLocales: SUPPORTED_LOCALES,
        localeDisplayNames: LOCALE_DISPLAY_NAMES,
        isRTL: false, // Would need to check for RTL languages
    };
}

/**
 * Hook for date/time formatting with locale awareness
 */
export function useDateFormatter(timezone: string = 'UTC') {
    const { locale } = useLocale();
    const dateFnsLocale = dateFnsLocales[locale] || enUS;

    /**
     * Format a date to local string
     */
    const formatDate = useCallback(
        (date: Date | string | number, formatString: string = 'PP') => {
            const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

            if (timezone !== 'UTC') {
                return formatInTimeZone(dateObj, timezone, formatString, { locale: dateFnsLocale });
            }

            return format(dateObj, formatString, { locale: dateFnsLocale });
        },
        [locale, timezone, dateFnsLocale]
    );

    /**
     * Format relative time (e.g., "5 minutes ago")
     */
    const formatRelativeTime = useCallback(
        (date: Date | string | number, baseDate: Date = new Date()) => {
            const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

            // Convert to user's timezone
            const zonedDate = timezone !== 'UTC' ? toZonedTime(dateObj, timezone) : dateObj;
            const zonedBase = timezone !== 'UTC' ? toZonedTime(baseDate, timezone) : baseDate;

            return formatDistance(zonedDate, zonedBase, {
                addSuffix: true,
                locale: dateFnsLocale,
            });
        },
        [locale, timezone, dateFnsLocale]
    );

    /**
     * Format as "today", "yesterday", or date
     */
    const formatRelativeDate = useCallback(
        (date: Date | string | number, baseDate: Date = new Date()) => {
            const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

            const zonedDate = timezone !== 'UTC' ? toZonedTime(dateObj, timezone) : dateObj;
            const zonedBase = timezone !== 'UTC' ? toZonedTime(baseDate, timezone) : baseDate;

            return formatRelative(zonedDate, zonedBase, { locale: dateFnsLocale });
        },
        [locale, timezone, dateFnsLocale]
    );

    /**
     * Format time only
     */
    const formatTime = useCallback(
        (date: Date | string | number) => {
            return formatDate(date, 'p');
        },
        [formatDate]
    );

    /**
     * Format number with locale-aware formatting
     */
    const formatNumber = useCallback(
        (num: number, options?: Intl.NumberFormatOptions) => {
            return new Intl.NumberFormat(locale, options).format(num);
        },
        [locale]
    );

    /**
     * Format distance in km or mi based on locale
     */
    const formatDistance_ = useCallback(
        (distanceKm: number) => {
            // Use km for most locales, miles for US
            const useImperial = locale === 'en'; // Could be more sophisticated

            if (useImperial) {
                const miles = distanceKm * 0.621371;
                return `${formatNumber(Math.round(miles))} mi`;
            }

            return `${formatNumber(Math.round(distanceKm))} km`;
        },
        [locale, formatNumber]
    );

    return {
        formatDate,
        formatRelativeTime,
        formatRelativeDate,
        formatTime,
        formatNumber,
        formatDistance: formatDistance_,
        timezone,
        locale,
    };
}

/**
 * Hook for language selector component
 */
export function useLanguageSelector() {
    const { locale, setLocale, supportedLocales, localeDisplayNames } = useLocale();
    const [isChanging, setIsChanging] = useState(false);

    const languages = supportedLocales.map(code => ({
        code,
        name: localeDisplayNames[code],
        isSelected: code === locale,
    }));

    const selectLanguage = useCallback(
        async (code: Locale) => {
            if (code === locale) return;

            setIsChanging(true);
            try {
                await setLocale(code);
            } finally {
                setIsChanging(false);
            }
        },
        [locale, setLocale]
    );

    return {
        languages,
        currentLanguage: locale,
        selectLanguage,
        isChanging,
    };
}

export default { useLocale, useDateFormatter, useLanguageSelector };
