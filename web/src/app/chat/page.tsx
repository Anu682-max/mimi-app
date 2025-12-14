'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
    id: string;
    participants: { id: string; firstName: string; lastName?: string }[];
    lastMessage?: string;
    lastMessageAt?: string;
}

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    translatedContent?: string;
    originalLocale?: string;
    createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function ChatPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showTranslated, setShowTranslated] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (token) {
            fetchConversations();
        }
    }, [token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const response = await fetch(`${API_URL}/api/v1/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    content: newMessage,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setMessages([...messages, {
                    id: data.message.id,
                    senderId: user?.id || '',
                    senderName: user?.firstName || '',
                    content: data.message.content,
                    createdAt: data.message.createdAt,
                }]);
                setNewMessage('');
                fetchConversations(); // Refresh conversation list
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const selectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
        fetchMessages(conv.id);
    };

    const toggleTranslation = async (msgId: string) => {
        const msg = messages.find(m => m.id === msgId);
        if (!msg) return;

        // If already translated, just toggle view
        if (msg.translatedContent) {
            setShowTranslated(prev => ({
                ...prev,
                [msgId]: !prev[msgId],
            }));
            return;
        }

        // Request translation from API
        try {
            const response = await fetch(`${API_URL}/api/v1/messages/${msgId}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    toLocale: user?.locale || 'en',
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Update message with translation
                setMessages(prev => prev.map(m =>
                    m.id === msgId
                        ? { ...m, translatedContent: data.translatedContent }
                        : m
                ));
                setShowTranslated(prev => ({
                    ...prev,
                    [msgId]: true,
                }));
            }
        } catch (error) {
            console.error('Translation failed:', error);
        }
    };

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find(p => p.id !== user?.id) || conv.participants[0];
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <main className="h-screen flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                    ←
                </Link>
                <h1 className="text-xl font-bold flex-1">
                    {selectedConversation
                        ? getOtherParticipant(selectedConversation).firstName
                        : t('chat.title')
                    }
                </h1>
                {selectedConversation && (
                    <button
                        onClick={() => setSelectedConversation(null)}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        {t('common.back')}
                    </button>
                )}
            </header>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Conversation List */}
                {!selectedConversation && (
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <div className="text-5xl mb-4">💬</div>
                                <h2 className="text-xl font-bold mb-2">No conversations yet</h2>
                                <p className="text-gray-400 mb-4">Match with someone to start chatting!</p>
                                <Link
                                    href="/discover"
                                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold"
                                >
                                    {t('discover.title')}
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-800">
                                {conversations.map((conv) => {
                                    const other = getOtherParticipant(conv);
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => selectConversation(conv)}
                                            className="w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition text-left"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xl">
                                                {other.firstName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold">{other.firstName} {other.lastName}</p>
                                                <p className="text-gray-400 text-sm truncate">{conv.lastMessage || 'No messages'}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Messages */}
                {selectedConversation && (
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                const isOwn = msg.senderId === user?.id;
                                const showingTranslated = showTranslated[msg.id] && msg.translatedContent;

                                return (
                                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                                            <div className={`p-3 rounded-2xl ${isOwn
                                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 rounded-br-sm'
                                                : 'bg-[#1A1A24] rounded-bl-sm'
                                                }`}>
                                                <p>{showingTranslated ? msg.translatedContent : msg.content}</p>
                                            </div>
                                            {!isOwn && (
                                                <button
                                                    onClick={() => toggleTranslation(msg.id)}
                                                    className="text-xs text-gray-500 mt-1 hover:text-gray-300"
                                                >
                                                    {showingTranslated
                                                        ? t('chat.show_original')
                                                        : msg.translatedContent
                                                            ? t('chat.show_translation')
                                                            : `🌐 ${t('chat.translate')}`
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-800">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder={t('chat.type_message')}
                                    className="flex-1 p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl hover:opacity-90 disabled:opacity-50"
                                >
                                    ➤
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
