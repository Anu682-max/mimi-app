/**
 * Chat Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { createError } from '../common/middleware/error.middleware';
import { t } from '../common/i18n';

export const chatRouter: Router = Router();

/**
 * GET /chat/conversations
 * Get all conversations for current user
 */
chatRouter.get('/conversations', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const conversations = await chatService.getConversations(userId);

        res.json({
            conversations: conversations.map(c => ({
                id: c._id,
                participants: c.participants,
                lastMessage: c.lastMessage,
                updatedAt: c.updatedAt,
            })),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /chat/conversations/:id/messages
 * Get messages for a conversation
 */
chatRouter.get('/conversations/:id/messages', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const conversationId = req.params.id;
        const { limit, before } = req.query;

        const messages = await chatService.getMessages(
            conversationId,
            userId,
            {
                limit: limit ? parseInt(limit as string) : 50,
                before: before ? new Date(before as string) : undefined,
            }
        );

        res.json({
            messages,
            count: messages.length,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /chat/conversations/:id/messages
 * Send a message
 */
chatRouter.post('/conversations/:id/messages', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const conversationId = req.params.id;
        const { text, type, attachments } = req.body;
        const locale = req.locale;

        if (!text && !attachments?.length) {
            throw createError('Message cannot be empty', 400, 'EMPTY_MESSAGE');
        }

        const message = await chatService.sendMessage({
            conversationId,
            senderId: userId,
            text,
            type,
            attachments,
        });

        // Emit socket event for real-time delivery
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${message.recipientId}`).emit('new_message', message);
        }

        res.status(201).json({
            message: t('chat.message_sent', locale),
            data: message,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /chat/unread
 * Get unread message count
 */
chatRouter.get('/unread', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const count = await chatService.getUnreadCount(userId);

        res.json({ unreadCount: count });
    } catch (error) {
        next(error);
    }
});

export default chatRouter;
