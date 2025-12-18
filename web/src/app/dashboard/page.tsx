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
        <main className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-700 to-pink-500 pb-24 relative overflow-hidden">
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
            <div className="relative z-10">
                {/* Header */}
                <header className="px-6 py-4 flex justify-between items-center">
                    <button className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl transition-colors border border-white/20">
                        <EllipsisVerticalIcon className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex items-center space-x-2 text-sm text-white/90 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="font-medium">Los Angeles</span>
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
                <div className="mx-6 mt-6">
                    <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Premium</h2>
                                <p className="text-white/70 text-sm mb-4">Unlock all features</p>
                                <button className="px-6 py-2.5 bg-white text-purple-600 font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm shadow-lg">
                                    $10.99/month
                                </button>
                            </div>
                            <SparklesIcon className="w-8 h-8 text-yellow-300 animate-pulse" />
                        </div>
                    </div>
                </div>
                
                {/* Stats Grid - Cosmic */}
                <div className="px-6 mt-6 grid grid-cols-2 gap-4">
                    <button onClick={() => router.push('/chat')} className="bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-3xl p-6 transition-all text-left group shadow-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-lg">
                            <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Messages</h3>
                        <p className="text-2xl font-black text-white">24</p>
                        <p className="text-xs text-white/60 mt-1">unread</p>
                    </button>
                    
                    <button onClick={() => router.push('/matches')} className="bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-3xl p-6 transition-all text-left group shadow-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-lg">
                            <HeartIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Matches</h3>
                        <p className="text-2xl font-black text-white">99</p>
                        <p className="text-xs text-white/60 mt-1">new requests</p>
                    </button>
                </div>
                
                {/* Recent Activity - Cosmic List */}
                <div className="px-6 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Recent</h3>
                        <button onClick={() => router.push('/matches')} className="text-sm text-white/70 hover:text-white transition-colors">
                            View all
                        </button>
                    </div>
                    <div className="space-y-3">
                        {latestRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl hover:bg-white/20 border border-white/20 rounded-2xl transition-all shadow-lg">
                                <div className="flex items-center space-x-3">
                                    <img src={request.avatar} alt={request.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
                                    <div>
                                        <h4 className="font-semibold text-white">{request.name}, {request.age}</h4>
                                        <p className="text-sm text-white/60">{request.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button className="w-9 h-9 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors border border-white/20">
                                        <XMarkIcon className="w-5 h-5 text-white" />
                                    </button>
                                    <button className="w-9 h-9 bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 rounded-full flex items-center justify-center transition-all shadow-lg">
                                        <HeartIcon className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* FAB - Cosmic */}
                <button onClick={() => router.push('/discover')} className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 rounded-full shadow-2xl flex items-center justify-center transition-all z-40 border-2 border-white/30">
                    <PlusIcon className="w-6 h-6 text-white" />
                </button>
            </div>
        </main>
    );
}
