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
        <main className="min-h-screen bg-white pb-24">
            {/* Minimal Header */}
            <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors">
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-700" />
                </button>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="font-medium">Los Angeles</span>
                </div>
                <button 
                    onClick={() => router.push('/profile')}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors"
                >
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'User'}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </button>
            </header>
            
            {/* Premium Card - Minimal */}
            <div className="mx-6 mt-6">
                <div className="bg-black text-white rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Premium</h2>
                            <p className="text-gray-400 text-sm mb-4">Unlock all features</p>
                            <button className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm">
                                $10.99/month
                            </button>
                        </div>
                        <SparklesIcon className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>
            </div>
            
            {/* Stats Grid - Minimal */}
            <div className="px-6 mt-6 grid grid-cols-2 gap-4">
                <button onClick={() => router.push('/chat')} className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-colors text-left group">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Messages</h3>
                    <p className="text-2xl font-black text-gray-900">24</p>
                    <p className="text-xs text-gray-500 mt-1">unread</p>
                </button>
                
                <button onClick={() => router.push('/matches')} className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-6 transition-colors text-left group">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <HeartIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Matches</h3>
                    <p className="text-2xl font-black text-gray-900">99</p>
                    <p className="text-xs text-gray-500 mt-1">new requests</p>
                </button>
            </div>
            
            {/* Recent Activity - Minimal List */}
            <div className="px-6 mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent</h3>
                    <button onClick={() => router.push('/matches')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        View all
                    </button>
                </div>
                <div className="space-y-3">
                    {latestRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                            <div className="flex items-center space-x-3">
                                <img src={request.avatar} alt={request.name} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">{request.name}, {request.age}</h4>
                                    <p className="text-sm text-gray-500">{request.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="w-9 h-9 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors">
                                    <HeartIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* FAB - Minimal */}
            <button onClick={() => router.push('/discover')} className="fixed bottom-24 right-6 w-14 h-14 bg-black hover:bg-gray-800 rounded-full shadow-lg flex items-center justify-center transition-all z-40">
                <PlusIcon className="w-6 h-6 text-white" />
            </button>
        </main>
    );
}
