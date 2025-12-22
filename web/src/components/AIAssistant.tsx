'use client';

import { useState } from 'react';
import { SparklesIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { claudeAI, type ConversationStarter } from '@/services/claudeAI';

interface AIAssistantProps {
    matchName: string;
    matchInterests?: string[];
    matchBio?: string;
    userName: string;
    userInterests?: string[];
    userBio?: string;
    onSelectMessage: (message: string) => void;
}

export default function AIAssistant({
    matchName,
    matchInterests,
    matchBio,
    userName,
    userInterests,
    userBio,
    onSelectMessage,
}: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [starters, setStarters] = useState<ConversationStarter[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateStarters = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await claudeAI.generateConversationStarters(
                { name: userName, interests: userInterests, bio: userBio },
                { name: matchName, interests: matchInterests, bio: matchBio },
                3
            );
            setStarters(result);
        } catch (err: any) {
            setError(err.message || 'Failed to generate suggestions');
            console.error('AI Assistant error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (starters.length === 0 && !loading && !error) {
            generateStarters();
        }
    };

    const handleSelectMessage = (message: string) => {
        onSelectMessage(message);
        setIsOpen(false);
    };

    const getToneEmoji = (tone: string) => {
        switch (tone) {
            case 'flirty':
                return '😘';
            case 'friendly':
                return '😊';
            case 'funny':
                return '😄';
            case 'thoughtful':
                return '🤔';
            default:
                return '💬';
        }
    };

    const getToneColor = (tone: string) => {
        switch (tone) {
            case 'flirty':
                return 'from-pink-500 to-red-500';
            case 'friendly':
                return 'from-blue-500 to-cyan-500';
            case 'funny':
                return 'from-yellow-500 to-orange-500';
            case 'thoughtful':
                return 'from-purple-500 to-indigo-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <>
            {/* Floating AI Button */}
            <button
                onClick={handleOpen}
                className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-2xl flex items-center justify-center transition-all z-50 animate-pulse hover:animate-none"
                title="AI Assistant"
            >
                <SparklesIcon className="w-7 h-7 text-white" />
            </button>

            {/* AI Assistant Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center z-[100]">
                    <div className="bg-gradient-to-b from-gray-900 to-gray-800 w-full lg:w-[500px] lg:rounded-3xl rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl border border-white/10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <LightBulbIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">AI Assistant</h3>
                                    <p className="text-xs text-gray-400">Conversation starters for {matchName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                                <p className="text-gray-400 text-sm">Generating personalized suggestions...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                                <p className="text-red-400 text-sm">{error}</p>
                                <button
                                    onClick={generateStarters}
                                    className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 text-sm font-medium transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Conversation Starters */}
                        {!loading && !error && starters.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-gray-400 text-sm mb-4">
                                    Select a message to send or use as inspiration:
                                </p>
                                {starters.map((starter, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectMessage(starter.message)}
                                        className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl transition-all group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`w-10 h-10 bg-gradient-to-br ${getToneColor(
                                                    starter.tone
                                                )} rounded-full flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform`}
                                            >
                                                {getToneEmoji(starter.tone)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-gray-400 capitalize">
                                                        {starter.tone}
                                                    </span>
                                                </div>
                                                <p className="text-white text-sm leading-relaxed">
                                                    {starter.message}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}

                                {/* Regenerate Button */}
                                <button
                                    onClick={generateStarters}
                                    disabled={loading}
                                    className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    Generate New Ideas
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
