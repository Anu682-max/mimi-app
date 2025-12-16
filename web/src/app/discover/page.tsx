'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HeartIcon, SparklesIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface SecretSender {
    id: string;
    name: string;
    message: string;
    gradient: string;
}

export default function DiscoverPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [step, setStep] = useState<'guess' | 'hints' | 'reveal'>('guess');
    const [selectedHints, setSelectedHints] = useState<string[]>([]);
    const [currentSenderIndex, setCurrentSenderIndex] = useState(0);

    const secretSenders: SecretSender[] = [
        { 
            id: '1', 
            name: 'Marie Claire', 
            message: 'I love you,',
            gradient: 'from-pink-400 via-red-400 to-rose-500'
        },
        { 
            id: '2', 
            name: 'Sophie Miller', 
            message: 'You are special,',
            gradient: 'from-purple-400 via-pink-400 to-rose-400'
        },
        { 
            id: '3', 
            name: 'Emma Collins', 
            message: 'Thinking of you,',
            gradient: 'from-rose-400 via-pink-500 to-purple-500'
        },
    ];

    const availableHints = [
        { id: 'photo', label: 'Photo', icon: '📷' },
        { id: 'voice', label: 'Voice', icon: '🎤' },
        { id: 'hint', label: 'One Hint', icon: '💡' },
    ];

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const currentSender = secretSenders[currentSenderIndex];

    const toggleHint = (hintId: string) => {
        if (selectedHints.includes(hintId)) {
            setSelectedHints(selectedHints.filter((h) => h !== hintId));
        } else {
            setSelectedHints([...selectedHints, hintId]);
        }
    };

    const handleRespond = () => {
        alert('Your response has been sent! 💕');
        nextSender();
    };

    const handleContinue = () => {
        if (selectedHints.length > 0) {
            setStep('reveal');
        }
    };

    const nextSender = () => {
        if (currentSenderIndex < secretSenders.length - 1) {
            setCurrentSenderIndex(currentSenderIndex + 1);
            setStep('guess');
            setSelectedHints([]);
        } else {
            router.push('/matches');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
            
            {/* Floating Hearts */}
            <HeartIcon className="absolute top-20 right-20 w-8 h-8 text-pink-300/40 animate-float" />
            <HeartIcon className="absolute bottom-32 left-16 w-6 h-6 text-rose-300/40 animate-float-delayed" />
            <SparklesIcon className="absolute top-1/3 right-1/4 w-10 h-10 text-purple-300/40 animate-bounce" />
            
            {/* Back Button */}
            <button
                onClick={() => router.push('/dashboard')}
                className="absolute top-6 left-6 w-12 h-12 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-xl z-50 border border-pink-100 group active:scale-95"
            >
                <ArrowLeftIcon className="w-5 h-5 text-gray-800 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Progress Indicator */}
            <div className="absolute top-6 right-6 flex gap-2.5 z-50">
                {secretSenders.map((_, idx) => (
                    <div 
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-500 ${
                            idx === currentSenderIndex ? 'bg-gradient-to-r from-pink-500 to-rose-500 w-8 shadow-lg' : 
                            idx < currentSenderIndex ? 'bg-pink-400 w-2' : 'bg-white/60 w-2'
                        }`}
                    />
                ))}
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md animate-fade-in">
                {/* Guess Screen */}
                {step === 'guess' && (
                    <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl border border-white/50">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                                Guess Your Secret Sender
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">Someone special sent you a message</p>
                        </div>

                        {/* Heart Card */}
                        <div className={`relative bg-gradient-to-br ${currentSender.gradient} rounded-[28px] p-10 mb-8 shadow-2xl overflow-hidden group hover:scale-105 transition-transform duration-300`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.2)_0%,_transparent_60%)]" />
                            <div className="absolute top-5 right-5 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                                <HeartIcon className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                            
                            <div className="text-center mt-8 relative z-10">
                                <div className="mb-6">
                                    <HeartIcon className="w-20 h-20 text-white mx-auto drop-shadow-2xl animate-bounce-slow" />
                                </div>
                                <p className="text-white text-2xl font-bold mb-3 tracking-wide">{currentSender.message}</p>
                                <p className="text-white text-4xl font-black drop-shadow-lg">{currentSender.name}</p>
                            </div>
                        </div>

                        {/* Response Button */}
                        <button
                            onClick={handleRespond}
                            className="w-full py-5 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 mb-5 text-lg"
                        >
                            Respond Now
                        </button>

                        {/* Ask for Hints */}
                        <div className="text-center pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-3 font-medium">Still don't know who they are?</p>
                            <button
                                onClick={() => setStep('hints')}
                                className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all"
                            >
                                ASK FOR HINTS →
                            </button>
                        </div>
                    </div>
                )}

                {/* Hints Screen */}
                {step === 'hints' && (
                    <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-8 shadow-2xl border border-white/50 animate-fade-in">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Add Hints</h1>
                            <p className="text-sm text-gray-500 font-medium">
                                Choose hints to reveal more about your secret sender
                            </p>
                        </div>

                        {/* Hints Options */}
                        <div className="flex justify-center gap-5 mb-10">
                            {availableHints.map((hint) => (
                                <button
                                    key={hint.id}
                                    onClick={() => toggleHint(hint.id)}
                                    className={`flex flex-col items-center justify-center w-28 h-28 rounded-[22px] transition-all duration-300 ${
                                        selectedHints.includes(hint.id)
                                            ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl scale-110 ring-2 ring-pink-400'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105 shadow-lg'
                                    }`}
                                >
                                    <span className="text-4xl mb-2 transform transition-transform group-hover:scale-110">{hint.icon}</span>
                                    <span className="text-xs font-bold tracking-wide">{hint.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Note */}
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-8 border border-pink-100">
                            <p className="text-xs text-gray-600 text-center font-bold tracking-wider">
                                💎 1 HINT = 50 COINS
                            </p>
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={handleContinue}
                            disabled={selectedHints.length === 0}
                            className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg ${
                                selectedHints.length > 0
                                    ? 'bg-gray-900 hover:bg-gray-800 text-white'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Reveal Screen */}
                {step === 'reveal' && (
                    <div className="relative h-[650px] bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white animate-fade-in">
                        {/* Floating Hearts Animation */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-pulse">
                                <HeartIcon className="w-28 h-28 text-white/30 absolute top-16 left-8 animate-float" />
                                <HeartIcon className="w-20 h-20 text-white/40 absolute top-28 right-12 animate-float-delayed" />
                                <HeartIcon className="w-24 h-24 text-white/20 absolute bottom-28 left-16 animate-float" />
                                <SparklesIcon className="w-16 h-16 text-pink-300/50 absolute top-1/2 right-8 animate-bounce" />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="mb-10 animate-bounce-slow">
                                <div className="w-36 h-36 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl ring-4 ring-white/50">
                                    <HeartIcon className="w-20 h-20 text-white animate-pulse" />
                                </div>
                            </div>

                            <h1 className="text-5xl font-black text-gray-900 mb-3 drop-shadow-lg">
                                {currentSender.message}
                            </h1>
                            <p className="text-6xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-10 drop-shadow-xl">
                                {currentSender.name}
                            </p>

                            {/* Hints Revealed */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-[20px] p-5 mb-8 shadow-lg border border-pink-100">
                                <p className="text-sm font-bold text-gray-700">
                                    🎁 Hints: {selectedHints.map(h => availableHints.find(hint => hint.id === h)?.label).join(', ')}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4 w-full">
                                <button
                                    onClick={handleRespond}
                                    className="w-full py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:via-rose-600 hover:to-purple-700 text-white font-black rounded-2xl transition-all shadow-2xl hover:shadow-pink-500/50 hover:scale-105 active:scale-95 text-lg"
                                >
                                    Send Response 💕
                                </button>
                                <button
                                    onClick={nextSender}
                                    className="w-full py-4 bg-white/90 hover:bg-white text-gray-900 font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                                >
                                    Next Sender →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative Elements */}
            <div className="fixed top-10 right-10 opacity-20 pointer-events-none">
                <SparklesIcon className="w-16 h-16 text-pink-500 animate-pulse" />
            </div>
            <div className="fixed bottom-10 left-10 opacity-20 pointer-events-none">
                <SparklesIcon className="w-20 h-20 text-purple-500 animate-pulse delay-500" />
            </div>
        </div>
    );
}
