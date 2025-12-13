/**
 * Translation Adapter Tests
 */

import {
    MockTranslationAdapter,
    OpenAITranslationAdapter,
    createTranslationAdapter
} from './translation.adapter';

describe('Translation Adapter', () => {
    describe('MockTranslationAdapter', () => {
        const adapter = new MockTranslationAdapter();

        it('should return mock translation', async () => {
            const result = await adapter.translate('Hello', 'en', 'ja');

            expect(result.translatedText).toBe('[ja] Hello');
            expect(result.sourceLocale).toBe('en');
            expect(result.targetLocale).toBe('ja');
        });

        it('should support all locale pairs', () => {
            expect(adapter.supportsLocales('en', 'ja')).toBe(true);
            expect(adapter.supportsLocales('xx', 'yy')).toBe(true);
        });

        it('should detect language as English', async () => {
            const result = await adapter.detectLanguage('any text');
            expect(result).toBe('en');
        });
    });

    describe('createTranslationAdapter', () => {
        it('should create MockTranslationAdapter for mock provider', () => {
            const adapter = createTranslationAdapter('mock');
            expect(adapter).toBeInstanceOf(MockTranslationAdapter);
        });

        it('should throw error for OpenAI without API key', () => {
            expect(() => createTranslationAdapter('openai')).toThrow('OpenAI API key required');
        });

        it('should create OpenAITranslationAdapter with API key', () => {
            const adapter = createTranslationAdapter('openai', 'sk-test-key');
            expect(adapter).toBeInstanceOf(OpenAITranslationAdapter);
        });

        it('should default to MockTranslationAdapter for unknown provider', () => {
            const adapter = createTranslationAdapter('unknown');
            expect(adapter).toBeInstanceOf(MockTranslationAdapter);
        });
    });
});
