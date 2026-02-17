'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HeartIcon, SparklesIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';

// Нууц илгээгчийн интерфейс
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

    // Нууц илгээгчдийн жагсаалт
    const secretSenders: SecretSender[] = [
        {
            id: '1',
            name: 'Marie Claire',
            message: 'I love you,',
            gradient: 'from-[#FD267A] to-[#FF6036]'
        },
        {
            id: '2',
            name: 'Sophie Miller',
            message: 'You are special,',
            gradient: 'from-[#FD267A] to-[#FF6036]'
        },
        {
            id: '3',
            name: 'Emma Collins',
            message: 'Thinking of you,',
            gradient: 'from-[#FD267A] to-[#FF6036]'
        },
    ];

    // Зөвлөмж сонголтууд
    const availableHints = [
        { id: 'photo', label: 'Photo', icon: '📷' },
        { id: 'voice', label: 'Voice', icon: '🎤' },
        { id: 'hint', label: 'One Hint', icon: '💡' },
    ];

    // Нэвтрэлт шалгах
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // Ачаалж байна
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F2F4]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4458]"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const currentSender = secretSenders[currentSenderIndex];

    // Зөвлөмж сонгох/болих
    const toggleHint = (hintId: string) => {
        if (selectedHints.includes(hintId)) {
            setSelectedHints(selectedHints.filter((h) => h !== hintId));
        } else {
            setSelectedHints([...selectedHints, hintId]);
        }
    };

    // Хариу илгээх
    const handleRespond = () => {
        alert('Your response has been sent! 💕');
        nextSender();
    };

    // Үргэлжлүүлэх
    const handleContinue = () => {
        if (selectedHints.length > 0) {
            setStep('reveal');
        }
    };

    // Дараагийн илгээгч рүү шилжих
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
        <div className="min-h-screen bg-[#F0F2F4] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Буцах товч */}
            <button
                onClick={() => router.push('/dashboard')}
                className="absolute top-6 left-6 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-md z-50 border border-[#E8E6EA] active:scale-95"
            >
                <ArrowLeftIcon className="w-5 h-5 text-[#21262E]" />
            </button>

            {/* Профайл үзэх товч */}
            <button
                onClick={() => router.push('/browse')}
                className="absolute top-6 right-24 px-5 py-2.5 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:opacity-90 text-white font-bold rounded-full shadow-md transition-all z-50 active:scale-95 text-sm"
            >
                Browse Profiles
            </button>

            {/* Явцын заалт */}
            <div className="absolute top-6 right-6 flex gap-2.5 z-50">
                {secretSenders.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-500 ${
                            idx === currentSenderIndex ? 'bg-[#FF4458] w-8' :
                            idx < currentSenderIndex ? 'bg-[#FF4458]/60 w-2' : 'bg-[#E8E6EA] w-2'
                        }`}
                    />
                ))}
            </div>

            {/* Үндсэн картын хэсэг */}
            <div className="w-full max-w-md">
                {/* Таах дэлгэц */}
                {step === 'guess' && (
                    <div className="bg-white rounded-xl p-8 shadow-md border border-[#E8E6EA]">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-[#21262E] mb-3 tracking-tight">
                                Guess Your Secret Sender
                            </h1>
                            <p className="text-sm text-[#656E7B] font-medium">Someone special sent you a message</p>
                        </div>

                        {/* Зүрхэн карт */}
                        <div className={`relative bg-linear-to-r ${currentSender.gradient} rounded-xl p-10 mb-8 shadow-lg overflow-hidden`}>
                            <div className="absolute top-5 right-5 w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                                <HeartIcon className="w-8 h-8 text-white" />
                            </div>

                            <div className="text-center mt-8 relative z-10">
                                <div className="mb-6">
                                    <HeartIcon className="w-20 h-20 text-white mx-auto" />
                                </div>
                                <p className="text-white text-2xl font-bold mb-3">{currentSender.message}</p>
                                <p className="text-white text-4xl font-black">{currentSender.name}</p>
                            </div>
                        </div>

                        {/* Хариу өгөх товч */}
                        <button
                            onClick={handleRespond}
                            className="w-full py-5 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:opacity-90 text-white font-bold rounded-full transition-all shadow-md active:scale-95 mb-5 text-lg"
                        >
                            Respond Now
                        </button>

                        {/* Зөвлөмж асуух */}
                        <div className="text-center pt-4 border-t border-[#E8E6EA]">
                            <p className="text-sm text-[#656E7B] mb-3 font-medium">Still don't know who they are?</p>
                            <button
                                onClick={() => setStep('hints')}
                                className="text-sm font-bold text-[#FF4458] hover:opacity-80 transition-all"
                            >
                                ASK FOR HINTS →
                            </button>
                        </div>
                    </div>
                )}

                {/* Зөвлөмж дэлгэц */}
                {step === 'hints' && (
                    <div className="bg-white rounded-xl p-8 shadow-md border border-[#E8E6EA]">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-[#21262E] mb-3 tracking-tight">Add Hints</h1>
                            <p className="text-sm text-[#656E7B] font-medium">
                                Choose hints to reveal more about your secret sender
                            </p>
                        </div>

                        {/* Зөвлөмж сонголтууд */}
                        <div className="flex justify-center gap-5 mb-10">
                            {availableHints.map((hint) => (
                                <button
                                    key={hint.id}
                                    onClick={() => toggleHint(hint.id)}
                                    className={`flex flex-col items-center justify-center w-28 h-28 rounded-xl transition-all duration-300 ${
                                        selectedHints.includes(hint.id)
                                            ? 'bg-linear-to-r from-[#FD267A] to-[#FF6036] text-white shadow-lg scale-110'
                                            : 'bg-[#F0F2F4] text-[#656E7B] hover:bg-[#E8E6EA] shadow-sm'
                                    }`}
                                >
                                    <span className="text-4xl mb-2">{hint.icon}</span>
                                    <span className="text-xs font-bold tracking-wide">{hint.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Зоос мэдэгдэл */}
                        <div className="bg-[#F0F2F4] rounded-xl p-4 mb-8 border border-[#E8E6EA]">
                            <p className="text-xs text-[#656E7B] text-center font-bold tracking-wider">
                                1 HINT = 50 COINS
                            </p>
                        </div>

                        {/* Үргэлжлүүлэх товч */}
                        <button
                            onClick={handleContinue}
                            disabled={selectedHints.length === 0}
                            className={`w-full py-4 font-bold rounded-full transition-all shadow-md ${
                                selectedHints.length > 0
                                    ? 'bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:opacity-90 text-white'
                                    : 'bg-[#E8E6EA] text-[#656E7B] cursor-not-allowed'
                            }`}
                        >
                            Continue
                        </button>
                    </div>
                )}

                {/* Илчлэх дэлгэц */}
                {step === 'reveal' && (
                    <div className="relative h-[650px] bg-white rounded-xl overflow-hidden shadow-lg border border-[#E8E6EA]">
                        {/* Үндсэн агуулга */}
                        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="mb-10">
                                <div className="w-36 h-36 bg-linear-to-r from-[#FD267A] to-[#FF6036] rounded-full flex items-center justify-center mx-auto shadow-lg">
                                    <HeartIcon className="w-20 h-20 text-white" />
                                </div>
                            </div>

                            <h1 className="text-5xl font-black text-[#21262E] mb-3">
                                {currentSender.message}
                            </h1>
                            <p className="text-6xl font-black text-[#FF4458] mb-10">
                                {currentSender.name}
                            </p>

                            {/* Илэрсэн зөвлөмжүүд */}
                            <div className="bg-[#F0F2F4] rounded-xl p-5 mb-8 shadow-sm border border-[#E8E6EA]">
                                <p className="text-sm font-bold text-[#21262E]">
                                    Hints: {selectedHints.map(h => availableHints.find(hint => hint.id === h)?.label).join(', ')}
                                </p>
                            </div>

                            {/* Үйлдлийн товчууд */}
                            <div className="space-y-4 w-full">
                                <button
                                    onClick={handleRespond}
                                    className="w-full py-5 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:opacity-90 text-white font-black rounded-full transition-all shadow-md active:scale-95 text-lg"
                                >
                                    Send Response
                                </button>
                                <button
                                    onClick={nextSender}
                                    className="w-full py-4 bg-white hover:bg-[#F0F2F4] text-[#21262E] font-bold rounded-full transition-all shadow-sm border border-[#E8E6EA] active:scale-95"
                                >
                                    Next Sender →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
