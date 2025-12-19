'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HeartIcon, XMarkIcon, ArrowLeftIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/solid';

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

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const currentProfile = profiles[currentIndex];
    const noMoreProfiles = currentIndex >= profiles.length;

    const handleSwipe = (liked: boolean) => {
        if (liked) {
            // Show interest questions before matching
            setShowQuestions(true);
            setCurrentQuestion(0);
            setAnswers([]);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleAnswerQuestion = (answer: string) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (currentQuestion < interestQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // All questions answered, now check for match
            setShowQuestions(false);
            // Simulate match (30% chance)
            if (Math.random() > 0.7) {
                setShowMatch(true);
                setTimeout(() => setShowMatch(false), 3000);
            }
            setCurrentIndex(prev => prev + 1);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-700" />
            
            {/* Header */}
            <header className="relative z-10 px-6 py-5 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-pink-100/50">
                <button
                    onClick={() => router.push('/discover')}
                    className="w-11 h-11 bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all active:scale-95 group"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition-colors" />
                </button>
                <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Browse Profiles
                </h1>
                <div className="w-11" />
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
                {noMoreProfiles ? (
                    <div className="text-center animate-fade-in">
                        <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <SparklesIcon className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3">No More Profiles</h2>
                        <p className="text-gray-600 mb-8">Check back later for new matches!</p>
                        <button
                            onClick={() => setCurrentIndex(0)}
                            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Start Over
                        </button>
                    </div>
                ) : currentProfile ? (
                    <div className="w-full max-w-md animate-fade-in">
                        {/* Profile Card */}
                        <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl border border-white/50">
                            {/* Photo */}
                            <div className="aspect-[3/4] bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center overflow-hidden relative">
                                <img
                                    src={currentProfile.photo}
                                    alt={currentProfile.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                
                                {/* Profile Info on Photo */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h2 className="text-4xl font-black mb-2 drop-shadow-lg">
                                        {currentProfile.name}, {currentProfile.age}
                                    </h2>
                                    <div className="flex items-center space-x-2 mb-3">
                                        <MapPinIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium drop-shadow">{currentProfile.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-6">
                                <p className="text-gray-700 text-lg mb-4 font-medium">{currentProfile.bio}</p>
                                
                                {/* Interests */}
                                <div className="flex flex-wrap gap-2">
                                    {currentProfile.interests.map((interest, i) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm font-bold border border-pink-200"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-6 mt-8">
                            <button
                                onClick={() => handleSwipe(false)}
                                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-gray-200 group"
                            >
                                <XMarkIcon className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </button>
                            <button
                                onClick={() => handleSwipe(true)}
                                className="w-20 h-20 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-pink-500/50 hover:scale-110 active:scale-95 transition-all"
                            >
                                <HeartIcon className="w-10 h-10 text-white" />
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Interest Questions Modal */}
            {showQuestions && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-white/50">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 mb-4 shadow-lg">
                                <SparklesIcon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                Tell Us About Yourself
                            </h3>
                            <p className="text-sm text-gray-600">
                                Question {currentQuestion + 1} of {interestQuestions.length}
                            </p>
                        </div>

                        <div className="mb-6">
                            <p className="text-lg font-bold text-gray-800 text-center mb-6">
                                {interestQuestions[currentQuestion].question}
                            </p>
                            
                            <div className="space-y-3">
                                {interestQuestions[currentQuestion].options.map((option, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswerQuestion(option)}
                                        className="w-full py-4 px-6 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 text-gray-800 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-pink-200"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center gap-2">
                            {interestQuestions.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-2 w-2 rounded-full transition-all ${
                                        idx === currentQuestion
                                            ? 'bg-pink-500 w-8'
                                            : idx < currentQuestion
                                            ? 'bg-pink-400'
                                            : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Match Modal */}
            {showMatch && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="text-center p-8 animate-bounce-slow">
                        <div className="text-8xl mb-6">🎉</div>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
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
