'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { sampleUsers, handleSwipe } from '@/utils/mockData';

interface UserProfile {
    id: string;
    firstName: string;
    lastName?: string;
    bio?: string;
    age?: number;
    gender?: string;
    photos: string[];
    interests: string[];
    occupation?: string;
    city?: string;
    country?: string;
}

export default function DiscoverPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [users, setUsers] = useState<UserProfile[]>(sampleUsers);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showMatch, setShowMatch] = useState(false);
    const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleSwipeAction = async (action: 'like' | 'pass') => {
        if (currentIndex >= users.length || !user) return;

        const currentUser = users[currentIndex];
        
        // Handle swipe and check for match
        const result = handleSwipe(user.id, currentUser.id, action);

        if (result.isMatch) {
            setMatchedUser(currentUser);
            setShowMatch(true);
        }

        setCurrentIndex((prev) => prev + 1);
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    const currentUser = users[currentIndex];
    const noMoreUsers = currentIndex >= users.length;

    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                    ← {t('common.back')}
                </Link>
                <h1 className="text-xl font-bold text-pink-500">{t('discover.title')}</h1>
                <div className="w-8"></div>
            </header>

            {/* Main Content */}
            <section className="flex-1 flex items-center justify-center p-4">
                {noMoreUsers ? (
                    <div className="text-center">
                        <div className="text-6xl mb-4">💔</div>
                        <h2 className="text-2xl font-bold mb-2">{t('discover.no_more_profiles')}</h2>
                        <p className="text-gray-400 mb-8">Check back later for new matches!</p>
                        <button
                            onClick={() => { setCurrentIndex(0); }}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold"
                        >
                            Refresh
                        </button>
                    </div>
                ) : currentUser ? (
                    <div className="w-full max-w-md">
                        {/* Profile Card */}
                        <div className="bg-gradient-to-b from-pink-500/10 to-transparent rounded-3xl overflow-hidden border border-gray-700">
                            {/* Photo */}
                            <div className="aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                                {currentUser.photos && currentUser.photos.length > 0 ? (
                                    <img
                                        src={currentUser.photos[0]}
                                        alt={currentUser.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-8xl">
                                        {currentUser.gender === 'female' ? '👩' : '👨'}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h2 className="text-2xl font-bold">{currentUser.firstName}</h2>
                                    {currentUser.age && (
                                        <span className="text-xl text-gray-400">{currentUser.age}</span>
                                    )}
                                </div>

                                {currentUser.occupation && (
                                    <p className="text-gray-400 mb-2">💼 {currentUser.occupation}</p>
                                )}

                                {currentUser.city && (
                                    <p className="text-gray-400 mb-4">📍 {currentUser.city}, {currentUser.country}</p>
                                )}

                                {currentUser.bio && (
                                    <p className="text-gray-300 mb-4">{currentUser.bio}</p>
                                )}

                                {currentUser.interests && currentUser.interests.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {currentUser.interests.map((interest, i) => (
                                            <span key={i} className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">
                                                {interest}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Swipe Buttons */}
                        <div className="flex justify-center gap-8 mt-6">
                            <button
                                onClick={() => handleSwipeAction('pass')}
                                className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-3xl hover:bg-gray-700 transition border-2 border-gray-600"
                            >
                                ✕
                            </button>
                            <button
                                onClick={() => handleSwipeAction('like')}
                                className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-3xl hover:opacity-90 transition"
                            >
                                ❤️
                            </button>
                        </div>
                    </div>
                ) : null}
            </section>

            {/* Match Modal */}
            {showMatch && matchedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
                    <div className="text-center animate-bounce-in">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-4xl font-bold text-pink-500 mb-2">
                            {t('matching.its_a_match')}
                        </h2>
                        <p className="text-gray-400 mb-8">
                            You and {matchedUser.firstName} liked each other!
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link
                                href="/chat"
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold"
                            >
                                {t('matching.send_message')}
                            </Link>
                            <button
                                onClick={() => setShowMatch(false)}
                                className="px-6 py-3 bg-gray-800 rounded-xl font-semibold border border-gray-600"
                            >
                                {t('matching.keep_swiping')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
