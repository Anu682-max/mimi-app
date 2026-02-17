'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HeartIcon, XMarkIcon, ArrowLeftIcon, SparklesIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/solid';

// Профайлын интерфейс
interface Profile {
    id: string;
    name: string;
    age: number;
    photo: string;
    bio: string;
    location: string;
    interests: string[];
}

export default function BrowsePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMatch, setShowMatch] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);

    // Сонирхлын асуултууд
    const interestQuestions = [
        {
            question: 'What do you enjoy doing in your free time?',
            options: ['Reading', 'Sports', 'Traveling', 'Cooking']
        },
        {
            question: 'What kind of music do you like?',
            options: ['Pop', 'Rock', 'Classical', 'Hip Hop']
        },
        {
            question: 'Ideal weekend activity?',
            options: ['Netflix', 'Hiking', 'Party', 'Relaxing']
        },
        {
            question: 'What matters most in a relationship?',
            options: ['Trust', 'Communication', 'Romance', 'Humor']
        },
        {
            question: 'How do you handle conflicts?',
            options: ['Talk it out', 'Need space', 'Compromise', 'Avoid']
        },
        {
            question: "What's your love language?",
            options: ['Quality time', 'Physical touch', 'Words', 'Gifts']
        }
    ];

    // Профайлуудын жагсаалт
    const profiles: Profile[] = [
        {
            id: '1',
            name: 'Sarah',
            age: 24,
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            bio: 'Love traveling and coffee ☕✈️',
            location: 'Los Angeles, CA',
            interests: ['Travel', 'Photography', 'Coffee']
        },
        {
            id: '2',
            name: 'Emma',
            age: 26,
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            bio: 'Yoga instructor & nature lover 🧘‍♀️🌿',
            location: 'San Francisco, CA',
            interests: ['Yoga', 'Hiking', 'Meditation']
        },
        {
            id: '3',
            name: 'Olivia',
            age: 23,
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
            bio: 'Artist & foodie 🎨🍕',
            location: 'New York, NY',
            interests: ['Art', 'Cooking', 'Music']
        },
        {
            id: '4',
            name: 'Sophia',
            age: 25,
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
            bio: 'Book lover & cat mom 📚🐱',
            location: 'Seattle, WA',
            interests: ['Reading', 'Writing', 'Cats']
        },
        {
            id: '5',
            name: 'Mia',
            age: 27,
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
            bio: 'Fitness enthusiast & dancer 💪💃',
            location: 'Miami, FL',
            interests: ['Fitness', 'Dancing', 'Beach']
        },
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

    const currentProfile = profiles[currentIndex];
    const noMoreProfiles = currentIndex >= profiles.length;

    // Шудрах үйлдэл
    const handleSwipe = (liked: boolean) => {
        if (liked) {
            // Like дарсан бол асуултуудыг харуулах
            setShowQuestions(true);
            setCurrentQuestion(0);
            setAnswers([]);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    // Асуултанд хариулах
    const handleAnswerQuestion = (answer: string) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (currentQuestion < interestQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Бүх асуултанд хариулсан, match шалгах
            setShowQuestions(false);
            // Match магадлал (30%)
            if (Math.random() > 0.7) {
                setShowMatch(true);
                setTimeout(() => setShowMatch(false), 3000);
            }
            setCurrentIndex(prev => prev + 1);
        }
    };

    return (
        <main className="min-h-screen bg-[#F0F2F4] relative overflow-hidden">
            {/* Толгой хэсэг */}
            <header className="relative z-10 px-6 py-5 flex justify-between items-center bg-white border-b border-[#E8E6EA]">
                <button
                    onClick={() => router.push('/discover')}
                    className="w-11 h-11 bg-[#F0F2F4] rounded-full shadow-sm flex items-center justify-center hover:bg-[#E8E6EA] transition-all active:scale-95"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-[#656E7B]" />
                </button>
                <h1 className="text-2xl font-black text-[#FF4458]">
                    Browse Profiles
                </h1>
                <div className="w-11" />
            </header>

            {/* Үндсэн агуулга */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
                {noMoreProfiles ? (
                    /* Профайл дууссан дэлгэц */
                    <div className="text-center">
                        <div className="w-24 h-24 bg-linear-to-r from-[#FD267A] to-[#FF6036] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <SparklesIcon className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-[#21262E] mb-3">No More Profiles</h2>
                        <p className="text-[#656E7B] mb-8">Check back later for new matches!</p>
                        <button
                            onClick={() => setCurrentIndex(0)}
                            className="px-8 py-4 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:opacity-90 text-white font-bold rounded-full shadow-md active:scale-95 transition-all"
                        >
                            Start Over
                        </button>
                    </div>
                ) : currentProfile ? (
                    <div className="w-full max-w-md">
                        {/* Профайл карт - Tinder загвар */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#E8E6EA]">
                            {/* Зураг */}
                            <div className="aspect-3/4 bg-[#F0F2F4] flex items-center justify-center overflow-hidden relative">
                                <img
                                    src={currentProfile.photo}
                                    alt={currentProfile.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient давхарга */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                                {/* Зураг дээрх мэдээлэл */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h2 className="text-4xl font-black mb-2 drop-shadow-lg">
                                        {currentProfile.name}, {currentProfile.age}
                                    </h2>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <MapPinIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{currentProfile.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Мэдээллийн хэсэг */}
                            <div className="p-6">
                                <p className="text-[#21262E] text-lg mb-4 font-medium">{currentProfile.bio}</p>

                                {/* Сонирхлууд */}
                                <div className="flex flex-wrap gap-2">
                                    {currentProfile.interests.map((interest, i) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2 bg-[#F0F2F4] text-[#FF4458] rounded-full text-sm font-bold border border-[#E8E6EA]"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Үйлдлийн товчууд - Tinder загвар */}
                        <div className="flex justify-center items-center gap-5 mt-8">
                            {/* Nope товч */}
                            <button
                                onClick={() => handleSwipe(false)}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all border border-[#E8E6EA]"
                            >
                                <XMarkIcon className="w-8 h-8 text-[#656E7B]" />
                            </button>

                            {/* Super Like товч */}
                            <button
                                onClick={() => handleSwipe(true)}
                                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all border border-[#E8E6EA]"
                            >
                                <StarIcon className="w-7 h-7 text-[#17B5EB]" />
                            </button>

                            {/* Like товч */}
                            <button
                                onClick={() => handleSwipe(true)}
                                className="w-16 h-16 bg-linear-to-r from-[#FD267A] to-[#FF6036] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all"
                            >
                                <HeartIcon className="w-8 h-8 text-white" />
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Сонирхлын асуултын цонх */}
            {showQuestions && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl border border-[#E8E6EA]">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-[#FD267A] to-[#FF6036] mb-4 shadow-md">
                                <SparklesIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-[#21262E] mb-2">
                                Tell Us About Yourself
                            </h3>
                            <p className="text-sm text-[#656E7B]">
                                Question {currentQuestion + 1} of {interestQuestions.length}
                            </p>
                        </div>

                        <div className="mb-6">
                            <p className="text-lg font-bold text-[#21262E] text-center mb-6">
                                {interestQuestions[currentQuestion].question}
                            </p>

                            <div className="space-y-3">
                                {interestQuestions[currentQuestion].options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswerQuestion(option)}
                                        className="w-full py-4 px-6 bg-[#F0F2F4] hover:bg-[#E8E6EA] text-[#21262E] rounded-full font-bold transition-all shadow-sm active:scale-95 border border-[#E8E6EA]"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Явцын заалт */}
                        <div className="flex justify-center gap-2">
                            {interestQuestions.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2 w-2 rounded-full transition-all ${
                                        idx === currentQuestion
                                            ? 'bg-[#FF4458] w-8'
                                            : idx < currentQuestion
                                            ? 'bg-[#FF4458]/60'
                                            : 'bg-[#E8E6EA]'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Match цонх */}
            {showMatch && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="text-center p-8">
                        <div className="w-24 h-24 bg-linear-to-r from-[#FD267A] to-[#FF6036] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <HeartIcon className="w-14 h-14 text-white" />
                        </div>
                        <h2 className="text-5xl font-black text-[#FF4458] mb-4">
                            It's a Match!
                        </h2>
                        <p className="text-white text-xl font-medium">
                            You and {currentProfile?.name} liked each other!
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
