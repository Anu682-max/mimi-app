'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getMatches } from '@/utils/mockData';

export default function MatchesPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            const userMatches = getMatches(user.id);
            setMatches(userMatches);
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                    ← Буцах
                </Link>
                <h1 className="text-xl font-bold text-pink-500">Миний Match-ууд</h1>
                <div className="w-8"></div>
            </header>

            {/* Content */}
            <section className="p-4">
                {matches.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💔</div>
                        <h2 className="text-2xl font-bold mb-2">Одоогоор match байхгүй байна</h2>
                        <p className="text-gray-400 mb-8">Discover хуудсаар очоод like дарж эхлээрэй!</p>
                        <Link
                            href="/discover"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold"
                        >
                            Discover руу очих
                        </Link>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {matches.map((match) => (
                                <Link
                                    key={match.id}
                                    href={`/chat?user=${match.id}`}
                                    className="bg-[#13131A] rounded-2xl overflow-hidden border border-gray-800 hover:border-pink-500/50 transition-all group"
                                >
                                    {/* Photo */}
                                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-700 to-gray-800 relative overflow-hidden">
                                        {match.photos && match.photos.length > 0 ? (
                                            <Image
                                                src={match.photos[0]}
                                                alt={match.firstName}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                                {match.gender === 'female' ? '👩' : '👨'}
                                            </div>
                                        )}
                                        
                                        {/* Match badge */}
                                        <div className="absolute top-3 right-3 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            ❤️ Match!
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <h3 className="text-lg font-bold">{match.firstName}</h3>
                                            {match.age && (
                                                <span className="text-gray-400">{match.age}</span>
                                            )}
                                        </div>

                                        {match.occupation && (
                                            <p className="text-gray-400 text-sm mb-2">💼 {match.occupation}</p>
                                        )}

                                        {match.city && (
                                            <p className="text-gray-400 text-sm mb-3">📍 {match.city}</p>
                                        )}

                                        <button className="w-full py-2 bg-pink-500/20 text-pink-400 rounded-lg text-sm font-medium hover:bg-pink-500/30 transition-colors">
                                            Мессеж илгээх
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
