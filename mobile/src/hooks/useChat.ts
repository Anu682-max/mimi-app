/**
 * Chat Hook
 * 
 * Real-time messaging with Socket.io
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

import { api } from '../services/api';
import { useAuth } from './useAuth';

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId: string;
    originalText: string;
    translatedText?: string;
    sourceLocale: string;
    targetLocale?: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    showTranslation: boolean;
}

interface UseChatReturn {
    messages: Message[];
    isLoading: boolean;
    isTyping: boolean;
    sendMessage: (text: string) => Promise<void>;
    loadMoreMessages: () => Promise<void>;
    markAsRead: () => Promise<void>;
}

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3000';

export function useChat(conversationId: string): UseChatReturn {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize socket connection
    useEffect(() => {
        if (!token || !user) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket connected');
            socket.emit('join', user.id);
        });

        socket.on('new_message', (message: Message) => {
            if (message.conversationId === conversationId) {
                setMessages(prev => [...prev, message]);
            }
        });

        socket.on('typing', ({ userId }) => {
            if (userId !== user.id) {
                setIsTyping(true);

                // Clear typing after 3 seconds
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 3000);
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            socket.disconnect();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [conversationId, token, user]);

    // Load initial messages
    useEffect(() => {
        loadMessages();
    }, [conversationId]);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/chat/conversations/${conversationId}/messages`);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreMessages = useCallback(async () => {
        if (messages.length === 0) return;

        const oldestMessage = messages[0];
        try {
            const response = await api.get(
                `/chat/conversations/${conversationId}/messages`,
                { params: { before: oldestMessage.createdAt, limit: 20 } }
            );
            setMessages(prev => [...response.data.messages, ...prev]);
        } catch (error) {
            console.error('Failed to load more messages:', error);
        }
    }, [conversationId, messages]);

    const sendMessage = useCallback(async (text: string) => {
        try {
            const response = await api.post(
                `/chat/conversations/${conversationId}/messages`,
                { text }
            );

            // Optimistically add message (will be deduplicated if socket delivers it)
            const newMessage: Message = response.data.data;
            setMessages(prev => {
                // Check if message already exists (from socket)
                if (prev.some(m => m.id === newMessage.id)) {
                    return prev;
                }
                return [...prev, newMessage];
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }, [conversationId]);

    const markAsRead = useCallback(async () => {
        // Messages are marked as read when fetched
        // This could be called explicitly if needed
    }, []);

    // Emit typing event
    const emitTyping = useCallback(() => {
        if (socketRef.current && user) {
            socketRef.current.emit('typing', {
                conversationId,
                userId: user.id,
            });
        }
    }, [conversationId, user]);

    return {
        messages,
        isLoading,
        isTyping,
        sendMessage,
        loadMoreMessages,
        markAsRead,
    };
}

export default useChat;
