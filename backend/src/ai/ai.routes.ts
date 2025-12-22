/**
 * AI Routes - Claude AI integration endpoints
 */

import { Router, Request, Response } from 'express';
import { ClaudeAdapter } from './claude.adapter';

const router = Router();

// Initialize Claude adapter
const claudeAdapter = new ClaudeAdapter({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * POST /api/v1/ai/conversation-starters
 * Generate conversation starters for a match
 */
router.post('/conversation-starters', async (req: Request, res: Response) => {
    try {
        const { userProfile, matchProfile, count = 3 } = req.body;

        if (!userProfile || !matchProfile) {
            return res.status(400).json({
                success: false,
                message: 'User profile and match profile are required',
            });
        }

        const starters = await claudeAdapter.generateConversationStarters(
            userProfile,
            matchProfile,
            count
        );

        res.json({
            success: true,
            data: starters,
        });
    } catch (error: any) {
        console.error('Conversation starters error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate conversation starters',
            error: error.message,
        });
    }
});

/**
 * POST /api/v1/ai/profile-bio
 * Generate profile bio suggestions
 */
router.post('/profile-bio', async (req: Request, res: Response) => {
    try {
        const { userInfo } = req.body;

        if (!userInfo) {
            return res.status(400).json({
                success: false,
                message: 'User info is required',
            });
        }

        const bios = await claudeAdapter.generateProfileBio(userInfo);

        res.json({
            success: true,
            data: bios,
        });
    } catch (error: any) {
        console.error('Profile bio generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate profile bio',
            error: error.message,
        });
    }
});

/**
 * POST /api/v1/ai/translate
 * Translate chat message with cultural context
 */
router.post('/translate', async (req: Request, res: Response) => {
    try {
        const { text, sourceLocale, targetLocale } = req.body;

        if (!text || !sourceLocale || !targetLocale) {
            return res.status(400).json({
                success: false,
                message: 'Text, source locale, and target locale are required',
            });
        }

        const result = await claudeAdapter.translateMessage(
            text,
            sourceLocale,
            targetLocale
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('Translation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to translate message',
            error: error.message,
        });
    }
});

/**
 * POST /api/v1/ai/dating-advice
 * Get dating advice
 */
router.post('/dating-advice', async (req: Request, res: Response) => {
    try {
        const { question, category = 'general' } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Question is required',
            });
        }

        const advice = await claudeAdapter.getDatingAdvice(question, category);

        res.json({
            success: true,
            data: advice,
        });
    } catch (error: any) {
        console.error('Dating advice error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dating advice',
            error: error.message,
        });
    }
});

/**
 * POST /api/v1/ai/analyze-conversation
 * Analyze conversation for insights
 */
router.post('/analyze-conversation', async (req: Request, res: Response) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                message: 'Messages array is required',
            });
        }

        const analysis = await claudeAdapter.analyzeConversation(messages);

        res.json({
            success: true,
            data: analysis,
        });
    } catch (error: any) {
        console.error('Conversation analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze conversation',
            error: error.message,
        });
    }
});

/**
 * GET /api/v1/ai/icebreakers
 * Get icebreaker questions
 */
router.get('/icebreakers', async (req: Request, res: Response) => {
    try {
        const count = parseInt(req.query.count as string) || 5;

        const icebreakers = await claudeAdapter.generateIcebreakers(count);

        res.json({
            success: true,
            data: icebreakers,
        });
    } catch (error: any) {
        console.error('Icebreakers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate icebreakers',
            error: error.message,
        });
    }
});

export default router;
