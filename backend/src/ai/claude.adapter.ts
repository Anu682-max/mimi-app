/**
 * Claude AI Adapter
 * Anthropic Claude integration for dating app features
 */

import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeConfig {
    apiKey: string;
    model?: string;
    maxTokens?: number;
}

export interface ConversationStarter {
    message: string;
    tone: 'flirty' | 'friendly' | 'funny' | 'thoughtful';
}

export interface ProfileBioSuggestion {
    bio: string;
    style: 'casual' | 'professional' | 'witty' | 'romantic';
}

export interface DatingAdvice {
    advice: string;
    category: 'conversation' | 'profile' | 'first-date' | 'general';
}

export class ClaudeAdapter {
    private client: Anthropic;
    private model: string;
    private maxTokens: number;

    constructor(config: ClaudeConfig) {
        this.client = new Anthropic({
            apiKey: config.apiKey,
        });
        this.model = config.model || 'claude-sonnet-4-5';
        this.maxTokens = config.maxTokens || 1024;
    }

    /**
     * Generate conversation starters based on user profiles
     */
    async generateConversationStarters(
        userProfile: { name: string; interests?: string[]; bio?: string },
        matchProfile: { name: string; interests?: string[]; bio?: string },
        count: number = 3
    ): Promise<ConversationStarter[]> {
        const prompt = `You are a dating coach helping users start conversations. Generate ${count} conversation starters for ${userProfile.name} to send to ${matchProfile.name}.

User interests: ${userProfile.interests?.join(', ') || 'not specified'}
User bio: ${userProfile.bio || 'not provided'}

Match interests: ${matchProfile.interests?.join(', ') || 'not specified'}
Match bio: ${matchProfile.bio || 'not provided'}

Generate ${count} different conversation starters with varying tones (flirty, friendly, funny, thoughtful). Format as JSON array:
[
  {"message": "...", "tone": "flirty"},
  {"message": "...", "tone": "friendly"},
  {"message": "...", "tone": "funny"}
]

Keep each message under 100 characters, natural, and engaging.`;

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
            const jsonMatch = content.text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }

        // Fallback if parsing fails
        return [
            { message: `Hey ${matchProfile.name}! 👋`, tone: 'friendly' },
            { message: `${matchProfile.name}, your profile caught my eye! 😊`, tone: 'flirty' },
            { message: `So... are you as interesting as your profile suggests? 🤔`, tone: 'funny' },
        ];
    }

    /**
     * Generate profile bio suggestions
     */
    async generateProfileBio(
        userInfo: {
            name: string;
            age: number;
            interests?: string[];
            occupation?: string;
            style?: 'casual' | 'professional' | 'witty' | 'romantic';
        }
    ): Promise<ProfileBioSuggestion[]> {
        const style = userInfo.style || 'casual';
        const prompt = `Generate 3 dating profile bio suggestions for ${userInfo.name}, age ${userInfo.age}.

Interests: ${userInfo.interests?.join(', ') || 'not specified'}
Occupation: ${userInfo.occupation || 'not specified'}
Preferred style: ${style}

Generate 3 bios with different styles (casual, witty, romantic). Each bio should be:
- 2-3 sentences
- Authentic and engaging
- Show personality
- Avoid clichés

Format as JSON array:
[
  {"bio": "...", "style": "casual"},
  {"bio": "...", "style": "witty"},
  {"bio": "...", "style": "romantic"}
]`;

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: this.maxTokens,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
            const jsonMatch = content.text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }

        // Fallback
        return [
            {
                bio: `${userInfo.age}-year-old who loves ${userInfo.interests?.[0] || 'good conversation'}. Looking to meet someone genuine.`,
                style: 'casual',
            },
        ];
    }

    /**
     * Translate chat messages with cultural context
     */
    async translateMessage(
        text: string,
        sourceLocale: string,
        targetLocale: string
    ): Promise<{ translatedText: string; confidence: number }> {
        const prompt = `Translate this dating app message from ${sourceLocale} to ${targetLocale}. 
Maintain the tone, emotion, and cultural context. If it's flirty, keep it flirty. If casual, keep it casual.

Message: "${text}"

Respond with only the translated text, no explanations.`;

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
            return {
                translatedText: content.text.trim(),
                confidence: 0.95,
            };
        }

        return {
            translatedText: text,
            confidence: 0,
        };
    }

    /**
     * Provide dating advice
     */
    async getDatingAdvice(
        question: string,
        category: 'conversation' | 'profile' | 'first-date' | 'general' = 'general'
    ): Promise<DatingAdvice> {
        const prompt = `You are a helpful dating coach. Answer this ${category} question concisely and supportively:

"${question}"

Keep your answer under 150 words, practical, and positive.`;

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 300,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
            return {
                advice: content.text.trim(),
                category,
            };
        }

        return {
            advice: "I'm here to help! Could you rephrase your question?",
            category,
        };
    }

    /**
     * Analyze chat conversation for suggestions
     */
    async analyzeConversation(
        messages: Array<{ sender: string; text: string; timestamp: Date }>
    ): Promise<{
        tone: string;
        engagement: 'high' | 'medium' | 'low';
        suggestions: string[];
    }> {
        const conversationText = messages
            .map((m) => `${m.sender}: ${m.text}`)
            .join('\n');

        const prompt = `Analyze this dating app conversation and provide insights:

${conversationText}

Provide analysis as JSON:
{
  "tone": "friendly/romantic/playful/formal",
  "engagement": "high/medium/low",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Keep suggestions brief and actionable.`;

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }

        return {
            tone: 'neutral',
            engagement: 'medium',
            suggestions: ['Keep the conversation flowing!'],
        };
    }

    /**
     * Generate icebreaker questions
     */
    async generateIcebreakers(count: number = 5): Promise<string[]> {
        const prompt = `Generate ${count} fun, engaging icebreaker questions for dating app conversations. 
Make them creative, not generic. Avoid "What's your favorite..." questions.

Return as JSON array: ["question 1", "question 2", ...]`;

        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const content = response.content[0];
        if (content.type === 'text') {
            const jsonMatch = content.text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }

        return [
            "If you could have dinner with any person, living or dead, who would it be?",
            "What's the most spontaneous thing you've ever done?",
            "If your life was a movie, what genre would it be?",
            "What's a skill you'd love to learn?",
            "What's your go-to karaoke song?",
        ];
    }
}

// Export singleton instance factory
export function createClaudeAdapter(apiKey: string): ClaudeAdapter {
    return new ClaudeAdapter({ apiKey });
}
