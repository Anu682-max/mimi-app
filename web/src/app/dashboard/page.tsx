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

import { usePushNotification } from '@/hooks/usePushNotification';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const { permission, subscribeUser, isLoading: pushLoading } = usePushNotification();

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

    const NotificationBanner = () => (
        permission === 'default' ? (
            <div className="px-4 lg:px-0 mt-4 mb-4">
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between backdrop-blur-sm">
                    <div>
                        <p className="text-white font-bold text-sm">Enable Notifications</p>
                        <p className="text-purple-200 text-xs text-left">Get instant updates for new matches</p>
                    </div>
                    <button
                        onClick={subscribeUser}
                        disabled={pushLoading}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-xs font-bold transition-colors"
                    >
                        {pushLoading ? 'Enabling...' : 'Enable'}
                    </button>
                </div>
            </div>
        ) : null
    );

    const latestRequests = [
        { id: 1, name: 'Amy', age: 24, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amy', time: '2h ago' },
        { id: 2, name: 'Sophie', age: 26, avatar: '/images/ai-sophie.png', time: '5h ago' },
        { id: 3, name: 'Emma', age: 23, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', time: '1d ago' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-700 to-pink-500 pb-24 relative overflow-x-hidden w-full lg:bg-none lg:bg-[#0A0A0F]">
            {/* Cosmic Background Effects - Hidden on Desktop to use main layout bg */}
            <div className="absolute inset-0 overflow-hidden lg:hidden">
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
            </div>

            {/* Content with relative positioning */}
            <div className="relative z-10 w-full mx-auto max-w-lg lg:max-w-7xl lg:px-8 lg:pt-8">
                {/* Mobile Header */}
                <header className="px-4 py-4 flex justify-between items-center lg:hidden">
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

                <NotificationBanner />

                {/* PC Header */}
                <div className="hidden lg:flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-gray-400 mt-1">Welcome back, {user?.firstName}</p>
                    </div>
                    <button onClick={() => router.push('/settings')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                        <EllipsisVerticalIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Premium Card - Cosmic */}
                        <div className="px-4 lg:px-0 mt-2 lg:mt-0">
                            <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-xl border border-white/20 lg:border-white/10 text-white rounded-3xl p-5 lg:p-8 shadow-2xl relative overflow-hidden group hover:border-pink-500/30 transition-all">
                                <div className="absolute -right-4 -top-4 bg-purple-500/30 w-24 h-24 rounded-full blur-xl group-hover:bg-purple-500/40 transition-all"></div>
                                <div className="flex items-start justify-between relative z-10">
                                    <div>
                                        <h2 className="text-xl lg:text-2xl font-bold mb-1">Premium</h2>
                                        <p className="text-white/70 text-xs lg:text-base mb-3 lg:mb-6">Unlock all features and get more matches</p>
                                        <button className="px-5 py-2 lg:px-8 lg:py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-white/90 transition-colors text-xs lg:text-sm shadow-lg flex items-center gap-1">
                                            <span>$10.99</span>
                                            <span className="text-purple-600/60 font-normal">/mo</span>
                                        </button>
                                    </div>
                                    <div className="bg-white/10 p-2 lg:p-4 rounded-xl backdrop-blur-sm border border-white/10">
                                        <SparklesIcon className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-300 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid - Cosmic */}
                        <div className="px-4 lg:px-0 mt-4 lg:mt-0 grid grid-cols-2 gap-3 lg:gap-6">
                            <button onClick={() => router.push('/chat')} className="bg-white/10 lg:bg-[#1A1A23] backdrop-blur-xl hover:bg-white/20 lg:hover:bg-[#252530] border border-white/20 lg:border-white/5 rounded-2xl p-4 lg:p-6 transition-all text-left group shadow-xl">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-105 transition-transform shadow-lg">
                                    <ChatBubbleLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <h3 className="text-base lg:text-lg font-bold text-white mb-0.5">Messages</h3>
                                <div className="flex items-end gap-2">
                                    <p className="text-xl lg:text-3xl font-black text-white">24</p>
                                    <p className="text-[10px] lg:text-sm text-white/60 mb-1 lg:mb-1.5">unread</p>
                                </div>
                            </button>

                            <button onClick={() => router.push('/matches')} className="bg-white/10 lg:bg-[#1A1A23] backdrop-blur-xl hover:bg-white/20 lg:hover:bg-[#252530] border border-white/20 lg:border-white/5 rounded-2xl p-4 lg:p-6 transition-all text-left group shadow-xl">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-105 transition-transform shadow-lg">
                                    <HeartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <h3 className="text-base lg:text-lg font-bold text-white mb-0.5">Matches</h3>
                                <div className="flex items-end gap-2">
                                    <p className="text-xl lg:text-3xl font-black text-white">99</p>
                                    <p className="text-[10px] lg:text-sm text-white/60 mb-1 lg:mb-1.5">new</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right Column (Recent Activity) */}
                    <div className="lg:col-span-1 mt-6 lg:mt-0">
                        <div className="px-4 lg:px-0">
                            <div className="flex justify-between items-center mb-3 lg:mb-6">
                                <h3 className="text-base lg:text-xl font-bold text-white">Recent Activity</h3>
                                <button onClick={() => router.push('/matches')} className="text-xs lg:text-sm text-white/70 hover:text-white transition-colors">
                                    View all
                                </button>
                            </div>
                            <div className="space-y-2.5 lg:space-y-4">
                                {latestRequests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-3 lg:p-4 bg-white/10 lg:bg-[#1A1A23] backdrop-blur-xl hover:bg-white/20 lg:hover:bg-[#252530] border border-white/20 lg:border-white/5 rounded-2xl transition-all shadow-lg group">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <div className="relative">
                                                <img src={request.avatar} alt={request.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white/30 shrink-0" />
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-white text-sm lg:text-base truncate">{request.name}, {request.age}</h4>
                                                <p className="text-xs lg:text-sm text-white/60 truncate">{request.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <button className="w-8 h-8 lg:w-9 lg:h-9 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors border border-white/20 text-white/70 hover:text-white">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                            <button className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 rounded-full flex items-center justify-center transition-all shadow-lg text-white">
                                                <HeartIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="hidden lg:block p-4 mt-6 bg-linear-to-r from-pink-500/10 to-purple-500/10 rounded-2xl border border-pink-500/20 text-center">
                                    <p className="text-sm text-pink-300 font-medium mb-2">Want more matches?</p>
                                    <button onClick={() => router.push('/discover')} className="w-full py-2 bg-pink-500 text-white rounded-xl text-sm font-bold hover:bg-pink-600 transition-colors">
                                        Start Discovering
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:hidden">
                    <button onClick={() => router.push('/discover')} className="fixed bottom-24 right-5 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 rounded-full shadow-2xl flex items-center justify-center transition-all z-40 border-2 border-white/30">
                        <PlusIcon className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
