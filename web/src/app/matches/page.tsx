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

    // Нэвтрэлт шалгах
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    // Match-уудыг авах
    useEffect(() => {
        if (user) {
            const userMatches = getMatches(user.id);
            setMatches(userMatches);
        }
    }, [user]);

    // Ачаалж байна
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F2F4]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4458]"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F0F2F4]">
            {/* Толгой хэсэг */}
            <header className="p-4 border-b border-[#E8E6EA] bg-white flex justify-between items-center">
                <Link href="/dashboard" className="text-[#656E7B] hover:text-[#21262E] transition-colors font-medium">
                    ← Буцах
                </Link>
                <h1 className="text-xl font-bold text-[#FF4458]">Миний Match-ууд</h1>
                <div className="w-8"></div>
            </header>

            {/* Агуулга */}
            <section className="p-4">
                {matches.length === 0 ? (
                    /* Match байхгүй үед */
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💔</div>
                        <h2 className="text-2xl font-bold text-[#21262E] mb-2">Одоогоор match байхгүй байна</h2>
                        <p className="text-[#656E7B] mb-8">Discover хуудсаар очоод like дарж эхлээрэй!</p>
                        <Link
                            href="/discover"
                            className="inline-block px-6 py-3 bg-linear-to-r from-[#FD267A] to-[#FF6036] text-white rounded-full font-semibold shadow-md hover:opacity-90 transition-all"
                        >
                            Discover руу очих
                        </Link>
                    </div>
                ) : (
                    /* Match-уудын жагсаалт */
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {matches.map((match) => (
                                <Link
                                    key={match.id}
                                    href={`/chat?user=${match.id}`}
                                    className="bg-white rounded-xl overflow-hidden border border-[#E8E6EA] hover:border-[#FF4458]/50 transition-all group shadow-sm hover:shadow-md"
                                >
                                    {/* Зураг */}
                                    <div className="aspect-3/4 bg-[#F0F2F4] relative overflow-hidden">
                                        {match.photos && match.photos.length > 0 ? (
                                            <Image
                                                src={match.photos[0]}
                                                alt={match.firstName}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-6xl bg-[#F0F2F4]">
                                                {match.gender === 'female' ? '👩' : '👨'}
                                            </div>
                                        )}

                                        {/* Match тэмдэг */}
                                        <div className="absolute top-3 right-3 bg-[#FF4458] text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                            ❤️ Match!
                                        </div>
                                    </div>

                                    {/* Мэдээлэл */}
                                    <div className="p-4">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-[#21262E]">{match.firstName}</h3>
                                            {match.age && (
                                                <span className="text-[#656E7B]">{match.age}</span>
                                            )}
                                        </div>

                                        {match.occupation && (
                                            <p className="text-[#656E7B] text-sm mb-2">💼 {match.occupation}</p>
                                        )}

                                        {match.city && (
                                            <p className="text-[#656E7B] text-sm mb-3">📍 {match.city}</p>
                                        )}

                                        {/* Мессеж товч */}
                                        <button className="w-full py-2 bg-linear-to-r from-[#FD267A] to-[#FF6036] text-white rounded-full text-sm font-medium hover:opacity-90 transition-all">
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
