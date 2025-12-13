/**
 * Chat Message Model
 * 
 * Stores messages with original and translated text
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    recipientId: mongoose.Types.ObjectId;

    // Message content
    originalText: string;
    translatedText?: string;
    sourceLocale: string;
    targetLocale?: string;

    // Message metadata
    type: 'text' | 'image' | 'audio' | 'system';
    attachments?: string[];

    // Status
    isRead: boolean;
    readAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipientId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Original message
        originalText: {
            type: String,
            required: true,
            maxlength: 5000,
        },

        // Translation
        translatedText: String,
        sourceLocale: {
            type: String,
            required: true,
        },
        targetLocale: String,

        // Type and attachments
        type: {
            type: String,
            enum: ['text', 'image', 'audio', 'system'],
            default: 'text',
        },
        attachments: [String],

        // Read status
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: Date,
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, isRead: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);

// Conversation model
export interface IConversation extends Document {
    _id: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    matchId: mongoose.Types.ObjectId;
    lastMessage?: {
        text: string;
        senderId: mongoose.Types.ObjectId;
        createdAt: Date;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        matchId: {
            type: Schema.Types.ObjectId,
            ref: 'Match',
            required: true,
        },
        lastMessage: {
            text: String,
            senderId: Schema.Types.ObjectId,
            createdAt: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ matchId: 1 }, { unique: true });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);

export default { Message, Conversation };
