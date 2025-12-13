/**
 * Chat Service
 * 
 * Handles messaging with AI-powered translation for cross-language communication
 */

import mongoose from 'mongoose';
import { Message, Conversation, IMessage, IConversation } from './chat.model';
import { userRepository } from '../user/user.repository';
import { createTranslationAdapter, TranslationAdapter } from '../ai/translation.adapter';
import { config } from '../config';
import { logger } from '../common/logger';

export interface SendMessageDTO {
    conversationId: string;
    senderId: string;
    text: string;
    type?: 'text' | 'image' | 'audio';
    attachments?: string[];
}

export interface MessageResponse {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId: string;
    originalText: string;
    translatedText?: string;
    sourceLocale: string;
    targetLocale?: string;
    type: string;
    attachments?: string[];
    isRead: boolean;
    createdAt: Date;
    showTranslation: boolean;
}

export class ChatService {
    private translationAdapter: TranslationAdapter;

    constructor() {
        // Initialize translation adapter based on config
        this.translationAdapter = createTranslationAdapter(
            config.features.chatTranslationEnabled ? config.ai.translationProvider : 'mock',
            config.ai.openaiApiKey
        );
    }

    /**
     * Send a message with automatic translation if needed
     */
    async sendMessage(data: SendMessageDTO): Promise<MessageResponse> {
        const conversation = await Conversation.findById(data.conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Get sender and recipient
        const senderId = new mongoose.Types.ObjectId(data.senderId);
        const recipientId = conversation.participants.find(
            p => !p.equals(senderId)
        );

        if (!recipientId) {
            throw new Error('Recipient not found');
        }

        // Get user locales
        const sender = await userRepository.getById(data.senderId);
        const recipient = await userRepository.getById(recipientId.toString());

        if (!sender || !recipient) {
            throw new Error('Users not found');
        }

        const sourceLocale = sender.locale;
        const targetLocale = recipient.locale;

        let translatedText: string | undefined;
        let needsTranslation = false;

        // Check if translation is needed
        if (
            config.features.chatTranslationEnabled &&
            sourceLocale !== targetLocale &&
            recipient.preferences.autoTranslate
        ) {
            needsTranslation = true;

            try {
                const result = await this.translationAdapter.translate(
                    data.text,
                    sourceLocale,
                    targetLocale
                );
                translatedText = result.translatedText;
                logger.info(`Message translated from ${sourceLocale} to ${targetLocale}`);
            } catch (error) {
                logger.error('Translation failed:', error);
                // Don't fail the message if translation fails
            }
        }

        // Create message
        const message = new Message({
            conversationId: new mongoose.Types.ObjectId(data.conversationId),
            senderId,
            recipientId,
            originalText: data.text,
            translatedText,
            sourceLocale,
            targetLocale: needsTranslation ? targetLocale : undefined,
            type: data.type || 'text',
            attachments: data.attachments,
            isDelivered: false,
            isRead: false,
        });

        await message.save();

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(data.conversationId, {
            $set: {
                lastMessage: {
                    text: data.text,
                    senderId,
                    createdAt: new Date(),
                },
            },
        });

        logger.info(`Message sent in conversation ${data.conversationId}`);

        return this.formatMessageResponse(message, recipient.preferences.autoTranslate);
    }

    /**
     * Get messages for a conversation
     */
    async getMessages(
        conversationId: string,
        userId: string,
        options?: { limit?: number; before?: Date }
    ): Promise<MessageResponse[]> {
        const user = await userRepository.getById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const query: any = {
            conversationId: new mongoose.Types.ObjectId(conversationId),
        };

        if (options?.before) {
            query.createdAt = { $lt: options.before };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(options?.limit || 50);

        // Mark messages as read if recipient
        const unreadMessages = messages.filter(
            m => m.recipientId.toString() === userId && !m.isRead
        );

        if (unreadMessages.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMessages.map(m => m._id) } },
                { $set: { isRead: true, readAt: new Date() } }
            );
        }

        return messages.map(m => this.formatMessageResponse(m, user.preferences.autoTranslate));
    }

    /**
     * Get user's conversations
     */
    async getConversations(userId: string): Promise<IConversation[]> {
        return Conversation.find({
            participants: new mongoose.Types.ObjectId(userId),
            isActive: true,
        })
            .populate('participants', 'firstName photos locale')
            .sort({ updatedAt: -1 });
    }

    /**
     * Create a new conversation from a match
     */
    async createConversation(matchId: string, participantIds: string[]): Promise<IConversation> {
        const existing = await Conversation.findOne({ matchId: new mongoose.Types.ObjectId(matchId) });
        if (existing) {
            return existing;
        }

        const conversation = new Conversation({
            matchId: new mongoose.Types.ObjectId(matchId),
            participants: participantIds.map(id => new mongoose.Types.ObjectId(id)),
        });

        await conversation.save();
        logger.info(`Conversation created for match ${matchId}`);

        return conversation;
    }

    /**
     * Get unread message count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        return Message.countDocuments({
            recipientId: new mongoose.Types.ObjectId(userId),
            isRead: false,
        });
    }

    /**
     * Format message for API response
     */
    private formatMessageResponse(message: IMessage, showTranslation: boolean): MessageResponse {
        return {
            id: message._id.toString(),
            conversationId: message.conversationId.toString(),
            senderId: message.senderId.toString(),
            recipientId: message.recipientId.toString(),
            originalText: message.originalText,
            translatedText: message.translatedText,
            sourceLocale: message.sourceLocale,
            targetLocale: message.targetLocale,
            type: message.type,
            attachments: message.attachments,
            isRead: message.isRead,
            createdAt: message.createdAt,
            showTranslation: showTranslation && !!message.translatedText,
        };
    }
}

export const chatService = new ChatService();

export default chatService;
