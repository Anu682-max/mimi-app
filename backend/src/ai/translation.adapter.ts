/**
 * Translation Adapter Interface
 * 
 * Pluggable interface for translation providers
 */

// OpenAI API response interface
interface OpenAIResponse {
    choices: Array<{
        message?: {
            content?: string;
        };
    }>;
}

export interface TranslationResult {
    translatedText: string;
    sourceLocale: string;
    targetLocale: string;
    confidence?: number;
}

export interface TranslationAdapter {
    /**
     * Translate text from source locale to target locale
     */
    translate(
        text: string,
        sourceLocale: string,
        targetLocale: string
    ): Promise<TranslationResult>;

    /**
     * Detect the language of the text
     */
    detectLanguage?(text: string): Promise<string>;

    /**
     * Check if the adapter supports the given locale pair
     */
    supportsLocales(sourceLocale: string, targetLocale: string): boolean;
}

/**
 * OpenAI Translation Adapter
 * Uses GPT models for high-quality translation
 */
export class OpenAITranslationAdapter implements TranslationAdapter {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async translate(
        text: string,
        sourceLocale: string,
        targetLocale: string
    ): Promise<TranslationResult> {
        // In production, this would call the OpenAI API
        // For now, return a mock implementation

        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translator. Translate the following text from ${sourceLocale} to ${targetLocale}. Only output the translated text, nothing else. Preserve the tone, style, and any emojis.`,
                        },
                        {
                            role: 'user',
                            content: text,
                        },
                    ],
                    temperature: 0.3,
                    max_tokens: 1000,
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json() as OpenAIResponse;
            const translatedText = data.choices[0]?.message?.content?.trim() || text;

            return {
                translatedText,
                sourceLocale,
                targetLocale,
                confidence: 0.95,
            };
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }

    async detectLanguage(text: string): Promise<string> {
        // Simple language detection using OpenAI
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Detect the language of the following text. Only output the ISO 639-1 language code (e.g., en, ja, ko, de).',
                        },
                        {
                            role: 'user',
                            content: text,
                        },
                    ],
                    temperature: 0,
                    max_tokens: 10,
                }),
            });

            const data = await response.json() as OpenAIResponse;
            return data.choices[0]?.message?.content?.trim().toLowerCase() || 'en';
        } catch (error) {
            console.error('Language detection error:', error);
            return 'en';
        }
    }

    supportsLocales(sourceLocale: string, targetLocale: string): boolean {
        // OpenAI supports most major languages
        const supportedLocales = ['en', 'ja', 'ko', 'de', 'fr', 'es', 'zh', 'it', 'pt', 'ru', 'ar'];
        return supportedLocales.includes(sourceLocale) && supportedLocales.includes(targetLocale);
    }
}

/**
 * Mock Translation Adapter for testing
 */
export class MockTranslationAdapter implements TranslationAdapter {
    async translate(
        text: string,
        sourceLocale: string,
        targetLocale: string
    ): Promise<TranslationResult> {
        // Return mock translation for testing
        return {
            translatedText: `[${targetLocale}] ${text}`,
            sourceLocale,
            targetLocale,
            confidence: 1.0,
        };
    }

    async detectLanguage(text: string): Promise<string> {
        return 'en';
    }

    supportsLocales(): boolean {
        return true;
    }
}

/**
 * Translation Adapter Factory
 */
export function createTranslationAdapter(provider: string, apiKey?: string): TranslationAdapter {
    switch (provider) {
        case 'openai':
        case 'openai':
            if (!apiKey) {
                console.warn('OpenAI API key missing. Falling back to Mock translation adapter.');
                return new MockTranslationAdapter();
            }
            return new OpenAITranslationAdapter(apiKey);
        case 'mock':
        default:
            return new MockTranslationAdapter();
    }
}

export default { createTranslationAdapter, OpenAITranslationAdapter, MockTranslationAdapter };
