/**
 * i18n Helper Unit Tests
 */

import { t, isLocaleSupported, getLocaleDisplayName, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../common/i18n';

describe('i18n Helper', () => {
    describe('t() - Translation function', () => {
        it('should return English translation for English locale', () => {
            expect(t('auth.login_title', 'en')).toBe('Log In');
            expect(t('common.ok', 'en')).toBe('OK');
        });

        it('should return Japanese translation for Japanese locale', () => {
            expect(t('auth.login_title', 'ja')).toBe('ログイン');
            expect(t('common.cancel', 'ja')).toBe('キャンセル');
        });

        it('should return Korean translation for Korean locale', () => {
            expect(t('auth.login_title', 'ko')).toBe('로그인');
            expect(t('common.save', 'ko')).toBe('저장');
        });

        it('should interpolate parameters correctly', () => {
            expect(t('validation.password_min_length', 'en', { min: 8 }))
                .toBe('Password must be at least 8 characters');

            expect(t('validation.password_min_length', 'ja', { min: 8 }))
                .toBe('パスワードは8文字以上である必要があります');

            expect(t('profile.distance', 'en', { distance: 5 }))
                .toBe('5 km away');
        });

        it('should interpolate multiple parameters', () => {
            expect(t('validation.field_too_short', 'en', { field: 'Username', min: 3 }))
                .toBe('Username must be at least 3 characters');
        });

        it('should fallback to English when translation is missing', () => {
            // If a key exists in English but not in another locale, it should fallback
            const result = t('common.ok', 'de'); // German file doesn't exist yet
            expect(result).toBe('OK');
        });

        it('should return key when translation is not found in any locale', () => {
            expect(t('nonexistent.key', 'en')).toBe('nonexistent.key');
        });

        it('should use default locale when invalid locale is provided', () => {
            expect(t('auth.login_title', 'invalid')).toBe('Log In');
        });

        it('should handle nested keys correctly', () => {
            expect(t('notifications.new_match', 'en', { name: 'John' }))
                .toBe('You have a new match with John!');
        });
    });

    describe('isLocaleSupported()', () => {
        it('should return true for supported locales', () => {
            expect(isLocaleSupported('en')).toBe(true);
            expect(isLocaleSupported('ja')).toBe(true);
            expect(isLocaleSupported('ko')).toBe(true);
        });

        it('should return false for unsupported locales', () => {
            expect(isLocaleSupported('xx')).toBe(false);
            expect(isLocaleSupported('')).toBe(false);
            expect(isLocaleSupported('invalid')).toBe(false);
        });
    });

    describe('getLocaleDisplayName()', () => {
        it('should return display name for supported locales', () => {
            expect(getLocaleDisplayName('en')).toBe('English');
            expect(getLocaleDisplayName('ja')).toBe('日本語');
            expect(getLocaleDisplayName('ko')).toBe('한국어');
        });

        it('should return locale code for unsupported locales', () => {
            expect(getLocaleDisplayName('xx')).toBe('xx');
        });
    });

    describe('SUPPORTED_LOCALES', () => {
        it('should include all expected locales', () => {
            expect(SUPPORTED_LOCALES).toContain('en');
            expect(SUPPORTED_LOCALES).toContain('ja');
            expect(SUPPORTED_LOCALES).toContain('ko');
        });
    });

    describe('DEFAULT_LOCALE', () => {
        it('should be English', () => {
            expect(DEFAULT_LOCALE).toBe('en');
        });
    });
});
