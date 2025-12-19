'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    PaperAirplaneIcon,
    EllipsisVerticalIcon,
    SparklesIcon,
    MapPinIcon,
    ChevronRightIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-pink-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const latestRequests = [
        { id: 1, name: 'Amy', age: 24, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amy', time: '2h ago' },
        { id: 2, name: 'Sophie', age: 26, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', time: '5h ago' },
        { id: 3, name: 'Emma', age: 23, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', time: '1d ago' },
    ];

    return (
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-700 to-pink-500 pb-24 relative overflow-x-hidden w-full">
            {/* Cosmic Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Smoke/Cloud Effects */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/40 to-transparent opacity-60 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-pink-600/50 to-transparent opacity-50 blur-3xl" />

                {/* Floating particles/stars */}
                <div className="absolute top-20 left-10 w-1 h-1 bg-pink-300 rounded-full animate-pulse" />
                <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-300" />
                <div className="absolute top-60 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-500" />
                <div className="absolute top-32 right-1/3 w-1 h-1 bg-purple-200 rounded-full animate-pulse delay-700" />
                <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-pink-300 rounded-full animate-pulse" />
                <div className="absolute bottom-60 right-16 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-300" />
                <div className="absolute top-1/2 left-16 w-1 h-1 bg-pink-200 rounded-full animate-pulse delay-500" />
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-700" />

                {/* Silhouette Shape */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-96 opacity-30">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-b from-blue-900 to-purple-900 rounded-full blur-2xl" />
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-40 h-56 bg-gradient-to-b from-purple-900 to-transparent blur-xl" />
                </div>
            </div>

            {/* Content with relative positioning */}
            <div className="relative z-10 max-w-lg mx-auto w-full">
                {/* Header */}
                <header className="px-4 py-4 flex justify-between items-center">
                    <button className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl transition-colors border border-white/20">
                        <EllipsisVerticalIcon className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex items-center space-x-2 text-sm text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 max-w-[200px]">
                        <MapPinIcon className="w-4 h-4 shrink-0" />
                        <span className="font-medium truncate">Los Angeles</span>
                    </div>
                    <button
                        onClick={() => router.push('/profile')}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/50 transition-colors"
                    >
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'User'}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>
                </header>

                {/* Premium Card - Cosmic */}
                <div className="px-4 mt-2">
                    <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 bg-purple-500/30 w-24 h-24 rounded-full blur-xl"></div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <h2 className="text-xl font-bold mb-1">Premium</h2>
                                <p className="text-white/70 text-xs mb-3">Unlock all features</p>
                                <button className="px-5 py-2 bg-white text-purple-600 font-bold rounded-xl hover:bg-white/90 transition-colors text-xs shadow-lg flex items-center gap-1">
                                    <span>$10.99</span>
                                    <span className="text-purple-600/60 font-normal">/mo</span>
                                </button>
                            </div>
                            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                                <SparklesIcon className="w-6 h-6 text-yellow-300 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Cosmic */}
                <div className="px-4 mt-4 grid grid-cols-2 gap-3">
                    <button onClick={() => router.push('/chat')} className="bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-2xl p-4 transition-all text-left group shadow-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
                            <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-0.5">Messages</h3>
                        <p className="text-xl font-black text-white">24</p>
                        <p className="text-[10px] text-white/60">unread</p>
                    </button>

                    <button onClick={() => router.push('/matches')} className="bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-2xl p-4 transition-all text-left group shadow-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg">
                            <HeartIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-white mb-0.5">Matches</h3>
                        <p className="text-xl font-black text-white">99</p>
                        <p className="text-[10px] text-white/60">new requests</p>
                    </button>
                </div>

                {/* Recent Activity - Cosmic List */}
                <div className="px-4 mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-base font-bold text-white">Recent</h3>
                        <button onClick={() => router.push('/matches')} className="text-xs text-white/70 hover:text-white transition-colors">
                            View all
                        </button>
                    </div>
                    <div className="space-y-2.5">
                        {latestRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-2xl transition-all shadow-lg">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <img src={request.avatar} alt={request.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shrink-0" />
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-white text-sm truncate">{request.name}, {request.age}</h4>
                                        <p className="text-xs text-white/60 truncate">{request.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                    <button className="w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors border border-white/20 text-white/70 hover:text-white">
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                    <button className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 rounded-full flex items-center justify-center transition-all shadow-lg text-white">
                                        <HeartIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => router.push('/discover')} className="fixed bottom-24 right-5 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 rounded-full shadow-2xl flex items-center justify-center transition-all z-40 border-2 border-white/30">
                    <PlusIcon className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
}
