'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket as useSocketHook } from '@/hooks/useSocket';
import AppLayout from '@/components/AppLayout';
import { PaperAirplaneIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, PhotoIcon, PhoneIcon, VideoCameraIcon, SpeakerXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { getMatches } from '@/utils/mockData';
import { useWebRTC } from '@/hooks/useWebRTC';
import IncomingCallModal from '@/components/IncomingCallModal';

// Зурвасын интерфэйс
interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
    edited?: boolean;
}

// Яриа/харилцааны интерфэйс
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://indate.vercel.app/api/v1';

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    // Socket холболт, бичиж байгаа төлөв
    const { isConnected, typingUsers, startTyping, stopTyping, socket } = useSocketHook({
        conversationId: selectedConversation?.id,
        autoConnect: !!user,
    });
    const [newMessage, setNewMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [viewingAvatar, setViewingAvatar] = useState<{ src: string; name: string } | null>(null);

    // Гар утасны харагдац удирдах төлөв
    const [showMobileChat, setShowMobileChat] = useState(false);

    // WebRTC дуудлагын hook
    const {
        callState, callType: webrtcCallType, callDuration, isMuted, isCameraOff,
        incomingCall, localVideoRef, remoteVideoRef,
        startCall, acceptCall, rejectCall, endCall: endWebRTCCall,
        toggleMute, toggleCamera,
    } = useWebRTC();

    // Бичиж байгаа debounce timer
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Файл сонгох хэсэг
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const imageUrl = data.data.url;

            if (!selectedConversation || !user) return;

            const message: Message = {
                id: Date.now().toString(),
                senderId: user.id,
                senderName: user.firstName,
                content: imageUrl,
                createdAt: new Date().toISOString(),
            };

            setConversations(conversations.map(conv =>
                conv.id === selectedConversation.id
                    ? {
                        ...conv,
                        messages: [...conv.messages, message],
                        lastMessage: 'Sent a photo',
                        lastMessageAt: new Date().toISOString(),
                    }
                    : conv
            ));

            setSelectedConversation({
                ...selectedConversation,
                messages: [...selectedConversation.messages, message],
            });

            if (selectedConversation.id === 'conv-ai-1' && !isConnected) {
                setTimeout(() => simulateAIResponse("Nice photo! 📸"), 1000);
            }

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload image');
        }
    };

    // Дуут дуудлага эхлүүлэх (WebRTC)
    const startVoiceCall = () => {
        if (!selectedConversation) return;
        startCall(selectedConversation.matchId, 'voice');
    };

    // Видео дуудлага эхлүүлэх (WebRTC)
    const startVideoCall = () => {
        if (!selectedConversation) return;
        startCall(selectedConversation.matchId, 'video');
    };

    // Дуудлагын хугацааг формат хийх
    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Socket Event сонсогч
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (payload: any) => {
            console.log('New message received via socket:', payload);

            // Орчуулсан текст байвал харуулах
            const content = payload.showTranslation && payload.translatedText
                ? payload.translatedText
                : payload.originalText;

            const newMessage: Message = {
                id: payload.id,
                senderId: payload.senderId,
                senderName: 'Unknown',
                content: content,
                createdAt: payload.createdAt,
            };

            // Яриа шинэчлэх туслах функц
            const updateConversationList = (prevConvs: Conversation[]) => {
                return prevConvs.map(conv => {
                    if (conv.matchId === payload.senderId || conv.matchId === payload.recipientId) {
                        if (newMessage.senderId === conv.matchId) {
                            newMessage.senderName = conv.matchName;
                        } else {
                            newMessage.senderName = 'You';
                        }

                        // Давхардал шалгах
                        if (conv.messages.some(m => m.id === newMessage.id)) {
                            return conv;
                        }

                        return {
                            ...conv,
                            messages: [...conv.messages, newMessage],
                            lastMessage: newMessage.content,
                            lastMessageAt: newMessage.createdAt
                        };
                    }
                    return conv;
                });
            };

            setConversations(prev => updateConversationList(prev));

            // Сонгосон яриа шинэчлэх
            setSelectedConversation(prev => {
                if (prev && (prev.matchId === payload.senderId || prev.matchId === payload.recipientId)) {
                    if (newMessage.senderId === prev.matchId) {
                        newMessage.senderName = prev.matchName;
                    } else {
                        newMessage.senderName = 'You';
                    }

                    if (prev.messages.some(m => m.id === newMessage.id)) {
                        return prev;
                    }

                    return {
                        ...prev,
                        messages: [...prev.messages, newMessage]
                    };
                }
                return prev;
            });
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message');
        };
    }, [socket]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            // Match-уудаас яриа үүсгэх
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

            // AI хэрэглэгч нэмэх
            mockConversations.unshift({
                id: 'conv-ai-1',
                matchId: 'ai-sophie',
                matchName: 'Sophie (AI) 🤖',
                matchPhoto: '/images/ai-sophie.png',
                lastMessage: 'I am your AI companion. Let\'s chat!',
                lastMessageAt: new Date().toISOString(),
                messages: [
                    {
                        id: 'ai-welcome',
                        senderId: 'ai-sophie',
                        senderName: 'Sophie (AI)',
                        content: `Hello ${user.firstName}! I'm Sophie, your AI assistant on mimi. I can help you with translation, dating advice, or just chat! How are you today? ✨`,
                        createdAt: new Date().toISOString(),
                    }
                ]
            });

            setConversations(mockConversations);
        }
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedConversation]);

    // AI хариу симуляц
    const simulateAIResponse = (text: string) => {
        if (!selectedConversation) return;

        setTimeout(() => {
            const responses = [
                "That's interesting! Tell me more. 🤖",
                "I see! As an AI, I'm learning every day.",
                "How does that make you feel?",
                "Can you elaborate on that?",
                "That sounds fun! 😊",
                "I'm here to listen.",
                "What user activity shall we do next?",
                "Do you like our new mobile design? 📱"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                senderId: 'ai-sophie',
                senderName: 'Sophie (AI)',
                content: randomResponse,
                createdAt: new Date().toISOString(),
            };

            setConversations(prev => prev.map(conv =>
                conv.id === 'conv-ai-1'
                    ? {
                        ...conv,
                        messages: [...conv.messages, aiMessage],
                        lastMessage: randomResponse,
                        lastMessageAt: new Date().toISOString(),
                    }
                    : conv
            ));

            // Сонгосон яриа аюулгүй шинэчлэх
            setSelectedConversation(prev => {
                if (prev && prev.id === 'conv-ai-1') {
                    return {
                        ...prev,
                        messages: [...prev.messages, aiMessage]
                    };
                }
                return prev;
            });
        }, 1500);
    };

    // Зурвас илгээх
    const sendMessage = () => {
        if (!newMessage.trim() || !selectedConversation || !user) return;

        const message: Message = {
            id: Date.now().toString(),
            senderId: user.id,
            senderName: user.firstName,
            content: newMessage,
            createdAt: new Date().toISOString(),
        };

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

        setSelectedConversation({
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
        });

        setNewMessage('');

        // AI-тай ярьж байвал хариу симуляц хийх
        if (selectedConversation.id === 'conv-ai-1' && !isConnected) {
            simulateAIResponse(newMessage);
        }
    };

    // Яриа сонгох
    const selectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
        setEditingMessageId(null);
        setShowMobileChat(true);
    };

    // Яриа жагсаалт руу буцах
    const handleBackToConversations = () => {
        setShowMobileChat(false);
        setSelectedConversation(null);
    };

    // Зурвас засах эхлүүлэх
    const startEdit = (message: Message) => {
        setEditingMessageId(message.id);
        setEditContent(message.content);
    };

    // Засвар хадгалах
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

    // Засвар цуцлах
    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditContent('');
    };

    // Зурвас устгах
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

    // Цаг формат
    const formatTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Ачаалж байгаа үед
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#F0F2F4] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4458]"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="h-screen bg-[#F0F2F4] flex flex-col md:flex-row overflow-hidden fixed inset-0">
            {/* Яриа жагсаалтын хажуу самбар */}
            <div className={`w-full md:w-80 bg-white border-r border-[#E8E6EA] flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'} h-full`}>
                {/* Толгой хэсэг */}
                <div className="p-4 md:p-6 border-b border-[#E8E6EA] shrink-0 safe-top">
                    <h1 className="text-xl md:text-2xl font-bold text-[#21262E]">
                        Messages
                    </h1>
                    <p className="text-xs md:text-sm text-[#656E7B] mt-1">{conversations.length} conversations</p>
                </div>

                {/* Яриа жагсаалт */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-linear-to-r from-[#FD267A] to-[#FF6036] rounded-full mx-auto mb-4 flex items-center justify-center opacity-50">
                                💬
                            </div>
                            <p className="text-[#656E7B]">No conversations yet</p>
                            <p className="text-sm text-[#656E7B] mt-2">Match with someone to start chatting</p>
                        </div>
                    ) : (
                        <div className="space-y-1 p-2">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => selectConversation(conv)}
                                    className={`w-full p-4 rounded-xl flex items-center space-x-3 transition-all ${selectedConversation?.id === conv.id
                                        ? 'bg-[#FF4458]/5 border border-[#E8E6EA]'
                                        : 'hover:bg-gray-50 active:bg-gray-100'
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
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-[#E8E6EA] cursor-pointer hover:border-[#FF4458] transition-colors"
                                        />
                                        {/* Онлайн төлөв */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-semibold text-[#21262E] truncate text-sm md:text-base">{conv.matchName}</p>
                                        <p className="text-xs md:text-sm text-[#656E7B] truncate">
                                            {conv.lastMessage || 'Start a conversation'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Чат хэсэг */}
            <div className={`flex-1 flex flex-col h-full bg-[#F0F2F4] ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Чатын толгой хэсэг */}
                        <div className="p-3 md:p-4 bg-white border-b border-[#E8E6EA] flex items-center gap-3 shrink-0 safe-top shadow-sm">
                            {/* Буцах товч (гар утас) */}
                            <button
                                onClick={handleBackToConversations}
                                className="md:hidden p-2 -ml-2 text-[#656E7B] hover:text-[#FF4458]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>

                            <img
                                src={selectedConversation.matchPhoto}
                                alt={selectedConversation.matchName}
                                onClick={() => setViewingAvatar({ src: selectedConversation.matchPhoto, name: selectedConversation.matchName })}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#E8E6EA] cursor-pointer hover:border-[#FF4458] transition-colors shrink-0 relative"
                            >
                            </img>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base md:text-lg truncate text-[#21262E]">{selectedConversation.matchName}</p>
                                {/* Бичиж байгаа / Онлайн төлөв */}
                                {typingUsers.length > 0 ? (
                                    <p className="text-xs text-[#FF4458] flex items-center italic">
                                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FF4458] rounded-full mr-2 shrink-0 animate-pulse"></span>
                                        typing...
                                    </p>
                                ) : (
                                    <p className={`text-xs flex items-center ${isConnected ? 'text-green-500' : 'text-[#656E7B]'}`}>
                                        <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-2 shrink-0 ${isConnected ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                                        {isConnected ? 'Online' : 'Offline'}
                                    </p>
                                )}
                            </div>

                            {/* Дуудлагын товчнууд */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={startVoiceCall}
                                    className="p-2 md:p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all hover:scale-110 active:scale-95 border border-[#E8E6EA]"
                                    title="Voice call"
                                >
                                    <PhoneIcon className="w-5 h-5 md:w-6 md:h-6 text-[#FF4458]" />
                                </button>
                                <button
                                    onClick={startVideoCall}
                                    className="p-2 md:p-3 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm"
                                    title="Video call"
                                >
                                    <VideoCameraIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Зурвасууд */}
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
                                                className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-[#FF4458]/30 transition-all shrink-0 mb-1"
                                            />
                                        )}

                                        <div className={`flex items-center space-x-2 max-w-[85%] md:max-w-[70%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            {/* Зурвасын агуулга */}
                                            <div className="w-full">
                                                {isEditing ? (
                                                    <div className="bg-white border border-[#E8E6EA] rounded-2xl p-3 space-y-2 shadow-sm">
                                                        <input
                                                            type="text"
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            className="w-full bg-[#F0F2F4] border border-[#E8E6EA] rounded-xl px-3 py-2 text-sm text-[#21262E] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30"
                                                            autoFocus
                                                        />
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={saveEdit}
                                                                className="flex-1 px-3 py-1.5 bg-green-400 hover:bg-green-500 rounded-xl text-sm font-medium transition flex items-center justify-center space-x-1 text-white"
                                                            >
                                                                <CheckIcon className="w-4 h-4" />
                                                                <span>Save</span>
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition flex items-center justify-center space-x-1 text-[#656E7B]"
                                                            >
                                                                <XMarkIcon className="w-4 h-4" />
                                                                <span>Cancel</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm ${isOwnMessage
                                                            ? 'bg-linear-to-r from-[#FD267A] to-[#FF6036] text-white'
                                                            : 'bg-white border border-[#E8E6EA] text-[#21262E]'
                                                            }`}
                                                    >
                                                        {(message.content.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i) || message.content.includes('cloudinary.com')) ? (
                                                            <div className="relative group">
                                                                <img
                                                                    src={message.content}
                                                                    alt="Sent photo"
                                                                    className="max-w-full rounded-xl max-h-60 object-cover cursor-pointer"
                                                                    onClick={() => window.open(message.content, '_blank')}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="wrap-break-word text-sm md:text-base leading-snug">{message.content}</p>
                                                        )}
                                                        <p className={`text-[10px] md:text-xs mt-1 flex items-center space-x-1 ${isOwnMessage ? 'text-white/70' : 'text-[#656E7B]'}`}>
                                                            <span>{formatTime(message.createdAt)}</span>
                                                            {message.edited && <span className="italic">· edited</span>}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Зурвас засах товчнууд (компьютерт) */}
                                            {isOwnMessage && !isEditing && (
                                                <div className="hidden md:flex opacity-0 group-hover:opacity-100 items-center space-x-1 transition-opacity">
                                                    <button
                                                        onClick={() => startEdit(message)}
                                                        className="p-1.5 md:p-2 bg-gray-50 hover:bg-gray-100 border border-[#E8E6EA] rounded-xl transition-colors"
                                                        title="Edit message"
                                                    >
                                                        <PencilIcon className="w-3 h-3 md:w-4 md:h-4 text-[#FF4458]" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Delete this message?')) deleteMessage(message.id);
                                                        }}
                                                        className="p-1.5 md:p-2 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors"
                                                        title="Delete message"
                                                    >
                                                        <TrashIcon className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Зурвас бичих хэсэг */}
                        <div className="p-3 md:p-4 bg-white border-t border-[#E8E6EA] shrink-0 safe-bottom shadow-sm">
                            {/* Socket холболтын төлөв */}
                            {!isConnected && (
                                <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-600 text-xs flex items-center space-x-2">
                                    <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                                    <span>Offline - Messages will be sent when reconnected</span>
                                </div>
                            )}

                            {/* Бичиж байгаа заагч */}
                            {typingUsers.length > 0 && (
                                <div className="mb-2 px-3 py-2 bg-[#FF4458]/5 border border-[#E8E6EA] rounded-xl text-[#FF4458] text-xs italic">
                                    {selectedConversation.matchName} is typing...
                                </div>
                            )}

                            <div className="flex items-center space-x-2 md:space-x-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-2xl p-1.5 md:p-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-[#656E7B] hover:text-[#FF4458] transition-colors hover:bg-gray-100 rounded-xl"
                                    title="Send photo"
                                >
                                    <PhotoIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        // Бичиж байгаа заагч илгээх
                                        if (e.target.value.trim()) {
                                            startTyping();
                                            if (typingTimeoutRef.current) {
                                                clearTimeout(typingTimeoutRef.current);
                                            }
                                            // 2 секундын дараа автоматаар зогсоох
                                            typingTimeoutRef.current = setTimeout(() => {
                                                stopTyping();
                                            }, 2000);
                                        } else {
                                            stopTyping();
                                            if (typingTimeoutRef.current) {
                                                clearTimeout(typingTimeoutRef.current);
                                            }
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            sendMessage();
                                            stopTyping();
                                            if (typingTimeoutRef.current) {
                                                clearTimeout(typingTimeoutRef.current);
                                            }
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-[#21262E] placeholder-[#656E7B] focus:outline-none"
                                />
                                <button
                                    onClick={() => {
                                        sendMessage();
                                        stopTyping();
                                        if (typingTimeoutRef.current) {
                                            clearTimeout(typingTimeoutRef.current);
                                        }
                                    }}
                                    disabled={!newMessage.trim()}
                                    className="bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-2.5 md:p-3 transition-all transform hover:scale-105"
                                >
                                    <PaperAirplaneIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-8 bg-[#F0F2F4]">
                        <div className="text-center">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-r from-[#FD267A] to-[#FF6036] rounded-full mx-auto mb-6 flex items-center justify-center text-3xl md:text-4xl opacity-50 animate-pulse">
                                💬
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-[#21262E] mb-2">Select a conversation</p>
                            <p className="text-sm md:text-base text-[#656E7B]">Choose someone to start chatting with</p>
                            <div className="md:hidden mt-8">
                                <button
                                    onClick={handleBackToConversations}
                                    className="px-6 py-2 bg-[#FF4458]/5 border border-[#E8E6EA] rounded-full text-[#FF4458] text-sm hover:bg-[#FF4458]/10 transition"
                                >
                                    ← Go back to list
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Профайл зураг харах модал */}
            {viewingAvatar && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setViewingAvatar(null)}
                >
                    <div className="relative w-full max-w-lg">
                        <button
                            onClick={() => setViewingAvatar(null)}
                            className="absolute -top-12 right-0 md:-right-12 bg-white hover:bg-gray-50 border border-[#E8E6EA] rounded-full p-2 transition-colors z-10 text-[#656E7B]"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <div className="rounded-3xl overflow-hidden border border-[#E8E6EA] shadow-2xl">
                            <img
                                src={viewingAvatar.src}
                                alt={viewingAvatar.name}
                                className="w-full h-auto object-cover"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="bg-white border-t border-[#E8E6EA] p-4 absolute bottom-0 left-0 right-0">
                                <p className="text-center text-xl font-bold text-[#21262E]">{viewingAvatar.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ирж буй дуудлагын модал */}
            {incomingCall && callState === 'ringing' && (
                <IncomingCallModal
                    incomingCall={{
                        ...incomingCall,
                        callerName: conversations.find(c => c.matchId === incomingCall.callerId)?.matchName,
                        callerPhoto: conversations.find(c => c.matchId === incomingCall.callerId)?.matchPhoto,
                    }}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                />
            )}

            {/* Видео/дуут дуудлагын модал (WebRTC) */}
            {(callState === 'calling' || callState === 'connected') && selectedConversation && (
                <div className="fixed inset-0 z-[100] bg-[#111] flex flex-col items-center justify-center p-4">
                    {/* Дуудлагын UI */}
                    <div className="w-full max-w-4xl flex flex-col items-center">
                        {/* Видео харуулах хэсэг */}
                        {webrtcCallType === 'video' && (
                            <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden mb-8 relative shadow-lg">
                                {/* Алсын видео */}
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                {/* Холбогдож байгаа үед placeholder */}
                                {callState === 'calling' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                                        <div className="text-center">
                                            <img
                                                src={selectedConversation.matchPhoto}
                                                alt={selectedConversation.matchName}
                                                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/20 animate-pulse"
                                            />
                                            <p className="text-white text-xl font-semibold">Calling...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Локал видео (жижиг цонх) */}
                                <div className="absolute top-4 right-4 w-36 h-28 bg-black rounded-xl overflow-hidden shadow-lg border-2 border-white/20 z-20">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`}
                                    />
                                    {isCameraOff && (
                                        <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                                            Camera off
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Дуут дуудлагын UI */}
                        {webrtcCallType === 'voice' && (
                            <div className="mb-8">
                                <div className="relative">
                                    {callState === 'calling' && (
                                        <div className="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-[#FF4458]/20 animate-ping" />
                                    )}
                                    <img
                                        src={selectedConversation.matchPhoto}
                                        alt={selectedConversation.matchName}
                                        className={`w-40 h-40 rounded-full mx-auto mb-6 border-4 border-white/20 shadow-lg relative z-10 ${callState === 'calling' ? 'animate-pulse' : ''}`}
                                    />
                                </div>
                                {/* Дуут дуудлагад нуугдсан audio element-үүд */}
                                <audio ref={remoteVideoRef as React.RefObject<HTMLAudioElement>} autoPlay />
                                <audio ref={localVideoRef as React.RefObject<HTMLAudioElement>} autoPlay muted />
                            </div>
                        )}

                        {/* Дуудлагын мэдээлэл */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">{selectedConversation.matchName}</h2>
                            <p className="text-[#FF4458] text-lg">
                                {webrtcCallType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
                            </p>
                            <p className="text-white/60 text-sm mt-2">
                                {callState === 'calling' ? 'Calling...' : formatDuration(callDuration)}
                            </p>
                        </div>

                        {/* Дуудлагын удирдлага */}
                        <div className="flex items-center gap-4">
                            {/* Микрофон асаах/хаах */}
                            <button
                                onClick={toggleMute}
                                className={`p-5 rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm ${
                                    isMuted
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                                }`}
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? (
                                    <SpeakerXMarkIcon className="w-6 h-6 text-white" />
                                ) : (
                                    <SpeakerWaveIcon className="w-6 h-6 text-white" />
                                )}
                            </button>

                            {/* Дуудлага дуусгах */}
                            <button
                                onClick={endWebRTCCall}
                                className="p-6 bg-red-500 hover:bg-red-600 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg"
                                title="End call"
                            >
                                <PhoneIcon className="w-8 h-8 text-white transform rotate-135" />
                            </button>

                            {/* Камер асаах/хаах (видео дуудлагад) */}
                            {webrtcCallType === 'video' && (
                                <button
                                    onClick={toggleCamera}
                                    className={`p-5 rounded-full transition-all hover:scale-110 active:scale-95 shadow-sm ${
                                        isCameraOff
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-white/10 hover:bg-white/20 border border-white/20'
                                    }`}
                                    title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
                                >
                                    <VideoCameraIcon className="w-6 h-6 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
