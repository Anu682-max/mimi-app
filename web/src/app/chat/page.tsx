'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PaperAirplaneIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { getMatches } from '@/utils/mockData';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
    edited?: boolean;
}

interface Conversation {
    id: string;
    matchId: string;
    matchName: string;
    matchPhoto: string;
    lastMessage?: string;
    lastMessageAt?: string;
    messages: Message[];
}

export default function ChatPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [viewingAvatar, setViewingAvatar] = useState<{ src: string; name: string } | null>(null);

    // State for mobile view control
    const [showMobileChat, setShowMobileChat] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            // Create conversations from matches with mock messages
            const matches = getMatches(user.id);
            const mockConversations: Conversation[] = matches.map(match => ({
                id: `conv-${match.id}`,
                matchId: match.id,
                matchName: `${match.firstName} ${match.lastName}`,
                matchPhoto: match.photos[0],
                lastMessage: 'Hey! How are you?',
                lastMessageAt: new Date().toISOString(),
                messages: [
                    {
                        id: '1',
                        senderId: match.id,
                        senderName: `${match.firstName} ${match.lastName}`,
                        content: `Hi ${user.firstName}! Nice to match with you! 👋`,
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                    },
                    {
                        id: '2',
                        senderId: user.id,
                        senderName: user.firstName,
                        content: 'Hey! How are you?',
                        createdAt: new Date(Date.now() - 1800000).toISOString(),
                    },
                ],
            }));
            setConversations(mockConversations);
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation]);

    const sendMessage = () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const message: Message = {
            id: Date.now().toString(),
            senderId: user.id,
            senderName: user.firstName,
            content: newMessage,
            createdAt: new Date().toISOString(),
        };

        // Update conversation with new message
        setConversations(conversations.map(conv =>
            conv.id === selectedConversation.id
                ? {
                    ...conv,
                    messages: [...conv.messages, message],
                    lastMessage: newMessage,
                    lastMessageAt: new Date().toISOString(),
                }
                : conv
        ));

        // Update selected conversation
        setSelectedConversation({
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
        });

        setNewMessage('');
    };

    const selectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
        setEditingMessageId(null);
        setShowMobileChat(true); // Switch to chat view on mobile
    };

    const handleBackToConversations = () => {
        setShowMobileChat(false);
        setSelectedConversation(null);
    };

    const startEdit = (message: Message) => {
        setEditingMessageId(message.id);
        setEditContent(message.content);
    };

    const saveEdit = () => {
        if (!editContent.trim() || !selectedConversation) return;

        const updatedMessages = selectedConversation.messages.map(msg =>
            msg.id === editingMessageId
                ? { ...msg, content: editContent, edited: true }
                : msg
        );

        setConversations(conversations.map(conv =>
            conv.id === selectedConversation.id
                ? { ...conv, messages: updatedMessages }
                : conv
        ));

        setSelectedConversation({
            ...selectedConversation,
            messages: updatedMessages,
        });

        setEditingMessageId(null);
        setEditContent('');
    };

    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditContent('');
    };

    const deleteMessage = (messageId: string) => {
        if (!selectedConversation) return;

        const updatedMessages = selectedConversation.messages.filter(msg => msg.id !== messageId);

        setConversations(conversations.map(conv =>
            conv.id === selectedConversation.id
                ? { ...conv, messages: updatedMessages }
                : conv
        ));

        setSelectedConversation({
            ...selectedConversation,
            messages: updatedMessages,
        });
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f] text-white flex flex-col md:flex-row overflow-hidden fixed inset-0">
            {/* Conversations Sidebar - Hidden on mobile when chat is open */}
            <div className={`w-full md:w-80 bg-black/30 backdrop-blur-xl border-r border-white/10 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'} h-full`}>
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-white/10 shrink-0 safe-top">
                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Messages
                    </h1>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">{conversations.length} conversations</p>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center opacity-50">
                                💬
                            </div>
                            <p className="text-gray-400">No conversations yet</p>
                            <p className="text-sm text-gray-500 mt-2">Match with someone to start chatting</p>
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => selectConversation(conv)}
                                    className={`w-full p-4 rounded-xl flex items-center space-x-3 transition-all ${selectedConversation?.id === conv.id
                                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30'
                                        : 'hover:bg-white/5 active:bg-white/10'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <img
                                            src={conv.matchPhoto}
                                            alt={conv.matchName}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingAvatar({ src: conv.matchPhoto, name: conv.matchName });
                                            }}
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-pink-500/50 cursor-pointer hover:border-pink-400 transition-colors"
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-black"></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-semibold text-white truncate text-sm md:text-base">{conv.matchName}</p>
                                        <p className="text-xs md:text-sm text-gray-400 truncate">
                                            {conv.lastMessage || 'Start a conversation'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area - Hidden on mobile when list is shown */}
            <div className={`flex-1 flex flex-col h-full bg-[#0a0a0f]/50 ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 md:p-4 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center gap-3 shrink-0 safe-top">
                            {/* Back Button for Mobile */}
                            <button
                                onClick={handleBackToConversations}
                                className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>

                            <img
                                src={selectedConversation.matchPhoto}
                                alt={selectedConversation.matchName}
                                onClick={() => setViewingAvatar({ src: selectedConversation.matchPhoto, name: selectedConversation.matchName })}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-pink-500/50 cursor-pointer hover:border-pink-400 transition-colors shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base md:text-lg truncate">{selectedConversation.matchName}</p>
                                <p className="text-xs text-green-400 flex items-center">
                                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full mr-2 shrink-0"></span>
                                    Active now
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                            {selectedConversation.messages.map((message) => {
                                const isOwnMessage = message.senderId === user?.id;
                                const isEditing = editingMessageId === message.id;

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex group items-end space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        {!isOwnMessage && (
                                            <img
                                                src={selectedConversation.matchPhoto}
                                                alt={selectedConversation.matchName}
                                                onClick={() => setViewingAvatar({ src: selectedConversation.matchPhoto, name: selectedConversation.matchName })}
                                                className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-pink-400 transition-all shrink-0 mb-1"
                                            />
                                        )}

                                        <div className={`flex items-center space-x-2 max-w-[85%] md:max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            {/* Message Content */}
                                            <div className="w-full">
                                                {isEditing ? (
                                                    <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-3 space-y-2 border border-pink-500/30">
                                                        <input
                                                            type="text"
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500 focus:bg-white/15"
                                                            autoFocus
                                                        />
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={saveEdit}
                                                                className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-1"
                                                            >
                                                                <CheckIcon className="w-4 h-4" />
                                                                <span>Save</span>
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-1"
                                                            >
                                                                <XMarkIcon className="w-4 h-4" />
                                                                <span>Cancel</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-lg ${isOwnMessage
                                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                                                            : 'bg-white/10 backdrop-blur-sm'
                                                            }`}
                                                    >
                                                        <p className="text-white break-words text-sm md:text-base leading-snug">{message.content}</p>
                                                        <p className={`text-[10px] md:text-xs mt-1 flex items-center space-x-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
                                                            <span>{formatTime(message.createdAt)}</span>
                                                            {message.edited && <span className="italic">· edited</span>}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Action Buttons - Desktop Only or Long Press (Future) */}
                                            {isOwnMessage && !isEditing && (
                                                <div className="hidden md:flex opacity-0 group-hover:opacity-100 items-center space-x-1 transition-opacity">
                                                    <button
                                                        onClick={() => startEdit(message)}
                                                        className="p-1.5 md:p-2 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-colors"
                                                        title="Edit message"
                                                    >
                                                        <PencilIcon className="w-3 h-3 md:w-4 md:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this message?')) deleteMessage(message.id);
                                                        }}
                                                        className="p-1.5 md:p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                                                        title="Delete message"
                                                    >
                                                        <TrashIcon className="w-3 h-3 md:w-4 md:h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-3 md:p-4 bg-black/40 backdrop-blur-xl border-t border-white/10 shrink-0 safe-bottom">
                            <div className="flex items-center space-x-2 md:space-x-3 bg-white/5 rounded-2xl p-1.5 md:p-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-2.5 md:p-3 transition-all transform hover:scale-105"
                                >
                                    <PaperAirplaneIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0f] md:bg-transparent">
                        <div className="text-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl md:text-4xl opacity-50 animate-pulse">
                                💬
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-gray-400 mb-2">Select a conversation</p>
                            <p className="text-sm md:text-base text-gray-500">Choose someone to start chatting with</p>
                            <div className="md:hidden mt-8">
                                <button
                                    onClick={handleBackToConversations}
                                    className="px-6 py-2 bg-white/10 rounded-full text-white text-sm"
                                >
                                    ← Go back to list
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Avatar Viewer Modal */}
            {viewingAvatar && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setViewingAvatar(null)}
                >
                    <div className="relative w-full max-w-lg">
                        <button
                            onClick={() => setViewingAvatar(null)}
                            className="absolute -top-12 right-0 md:-right-12 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10 text-white"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                            <img
                                src={viewingAvatar.src}
                                alt={viewingAvatar.name}
                                className="w-full h-auto object-cover"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="bg-black/80 backdrop-blur-xl p-4 absolute bottom-0 left-0 right-0">
                                <p className="text-center text-xl font-bold text-white">{viewingAvatar.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
