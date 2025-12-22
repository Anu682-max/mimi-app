/**
 * Claude AI Service - Frontend integration
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3699';

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

export interface ConversationAnalysis {
    tone: string;
    engagement: 'high' | 'medium' | 'low';
    suggestions: string[];
}

class ClaudeAIService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = `${API_URL}/api/v1/ai`;
    }

    /**
     * Get authentication token
     */
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    /**
     * Generate conversation starters
     */
    async generateConversationStarters(
        userProfile: { name: string; interests?: string[]; bio?: string },
        matchProfile: { name: string; interests?: string[]; bio?: string },
        count: number = 3
    ): Promise<ConversationStarter[]> {
        const token = this.getToken();
        const response = await fetch(`${this.apiUrl}/conversation-starters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ userProfile, matchProfile, count }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to generate conversation starters');
        }

        return data.data;
    }

    /**
     * Generate profile bio suggestions
     */
    async generateProfileBio(userInfo: {
        name: string;
        age: number;
        interests?: string[];
        occupation?: string;
        style?: 'casual' | 'professional' | 'witty' | 'romantic';
    }): Promise<ProfileBioSuggestion[]> {
        const token = this.getToken();
        const response = await fetch(`${this.apiUrl}/profile-bio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ userInfo }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to generate profile bio');
        }

        return data.data;
    }

    /**
     * Translate message with cultural context
     */
    async translateMessage(
        text: string,
        sourceLocale: string,
        targetLocale: string
    ): Promise<{ translatedText: string; confidence: number }> {
        const token = this.getToken();
        const response = await fetch(`${this.apiUrl}/translate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ text, sourceLocale, targetLocale }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to translate message');
        }

        return data.data;
    }

    /**
     * Get dating advice
     */
    async getDatingAdvice(
        question: string,
        category: 'conversation' | 'profile' | 'first-date' | 'general' = 'general'
    ): Promise<DatingAdvice> {
        const token = this.getToken();
        const response = await fetch(`${this.apiUrl}/dating-advice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ question, category }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to get dating advice');
        }

        return data.data;
    }

    /**
     * Analyze conversation for insights
     */
    async analyzeConversation(
        messages: Array<{ sender: string; text: string; timestamp: Date }>
    ): Promise<ConversationAnalysis> {
        const token = this.getToken();
        const response = await fetch(`${this.apiUrl}/analyze-conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ messages }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to analyze conversation');
        }

        return data.data;
    }

    /**
     * Get icebreaker questions
     */
    async getIcebreakers(count: number = 5): Promise<string[]> {
        const token = this.getToken();
        const response = await fetch(`${this.apiUrl}/icebreakers?count=${count}`, {
            method: 'GET',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to get icebreakers');
        }

        return data.data;
    }
}

export const claudeAI = new ClaudeAIService();
