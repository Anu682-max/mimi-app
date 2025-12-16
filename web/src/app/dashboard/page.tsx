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
    PlusIcon
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
            <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
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
        <main className="min-h-screen bg-gradient-to-br from-[#FFF5F7] via-[#FFF0F3] to-[#FFE8ED] pb-24">
            {/* Floating Decorative Elements */}
            <div className="absolute top-20 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-40 left-10 w-40 h-40 bg-rose-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            
            <header className="px-6 py-5 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-pink-100/50 sticky top-0 z-50">
                <button className="w-11 h-11 bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all active:scale-95 group">
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition-colors" />
                </button>
                <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95">
                    <MapPinIcon className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">Los Angeles</span>
                </button>
                <button 
                    onClick={() => router.push('/profile')}
                    className="w-11 h-11 rounded-full overflow-hidden border-3 border-pink-400 shadow-lg hover:scale-110 hover:border-pink-500 transition-all active:scale-95 ring-2 ring-pink-200/50"
                >
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'User'}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </button>
            </header>
            <div className="mx-6 mt-8 relative overflow-hidden animate-fade-in">
                <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-[28px] p-8 shadow-2xl relative overflow-hidden group hover:shadow-pink-500/50 transition-all duration-500">
                    {/* Animated Background Shapes */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
                    <HeartIcon className="absolute top-4 left-4 w-10 h-10 text-white/20 animate-pulse" />
                    <SparklesIcon className="absolute top-6 right-6 w-10 h-10 text-yellow-200/60 animate-bounce" />
                    <HeartIcon className="absolute bottom-6 right-10 w-8 h-8 text-white/30 animate-pulse delay-300" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                    
                    <div className="relative z-10 text-center">
                        <div className="inline-block mb-3">
                            <div className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                                <span className="text-xs font-semibold text-white tracking-wider uppercase">Special Offer</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-3 tracking-tight">LoveStory Premium</h2>
                        <p className="text-white/95 text-base mb-7 font-medium">Unlock unlimited matches & features</p>
                        <button className="px-10 py-4 bg-white text-pink-600 font-bold rounded-full shadow-2xl hover:shadow-white/50 hover:scale-105 active:scale-95 transition-all duration-300 text-lg group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-white">
                            Get for $10.99
                        </button>
                    </div>
                </div>
            </div>
            <div className="px-6 mt-8 grid grid-cols-2 gap-5 animate-fade-in">
                <button onClick={() => router.push('/chat')} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-7 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative border border-pink-100/50 active:scale-95">
                    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping absolute" />
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    </div>
                    <div className="mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-[18px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <ChatBubbleLeftIcon className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Messages</h3>
                    <div className="flex items-center space-x-2">
                        <div className="px-2.5 py-0.5 bg-pink-100 rounded-full">
                            <span className="text-sm font-bold text-pink-600">24</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">unread</p>
                    </div>
                </button>
                <button onClick={() => router.push('/matches')} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-7 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative border border-pink-100/50 active:scale-95">
                    <div className="absolute top-5 right-5">
                        <PaperAirplaneIcon className="w-5 h-5 text-pink-500 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-600 rounded-[18px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <HeartIcon className="w-7 h-7 text-white group-hover:animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Requests</h3>
                    <div className="flex items-center space-x-2">
                        <div className="px-2.5 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse">
                            <span className="text-sm font-bold text-white">99</span>
                        </div>
                        <p className="text-sm text-pink-600 font-bold">new</p>
                    </div>
                </button>
            </div>
            <div className="px-6 mt-10 animate-fade-in-up">
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-1">Latest Requests</h3>
                        <p className="text-sm text-gray-500">People who liked you</p>
                    </div>
                    <button onClick={() => router.push('/matches')} className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all active:scale-95 group">
                        <ChevronRightIcon className="w-5 h-5 text-pink-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
                <div className="space-y-4">
                    {latestRequests.map((request, index) => (
                        <div key={request.id} className="bg-white/90 backdrop-blur-xl rounded-[22px] p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between border border-pink-50 group" style={{animationDelay: `${index * 100}ms`}}>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full animate-pulse opacity-30 blur" />
                                    <img src={request.avatar} alt={request.name} className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg relative z-10" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce z-20">
                                        <HeartIcon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 text-lg group-hover:text-pink-600 transition-colors">{request.name}, {request.age}</h4>
                                    <p className="text-sm text-gray-500 font-medium">{request.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center hover:scale-110 hover:from-pink-100 hover:to-rose-100 transition-all active:scale-95 group/btn">
                                    <HeartIcon className="w-6 h-6 text-gray-400 group-hover/btn:text-pink-500 transition-colors" />
                                </button>
                                <button className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50 transition-all active:scale-95">
                                    <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={() => router.push('/discover')} className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:shadow-pink-500/50 transition-all duration-300 z-40 active:scale-95 animate-bounce-slow group">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                <PlusIcon className="w-8 h-8 text-white relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            </button>
        </main>
    );
}
