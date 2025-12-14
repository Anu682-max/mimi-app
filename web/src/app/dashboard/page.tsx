'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF0F3]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const users = [
        { id: 1, name: 'Amy Thumann', action: 'requested to chat with you', seed: 'Amy' },
        { id: 2, name: 'Emma Collins', action: 'requested to chat with you', seed: 'Emma' },
        { id: 3, name: 'Sophie Miller', action: 'requested to chat with you', seed: 'Sophie' },
    ];

    return (
        <main className="min-h-screen bg-[#FFF0F3] pb-24 text-gray-900 font-sans">
            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center">
                {/* Filter / Menu Button */}
                <button
                    onClick={handleLogout}
                    className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-800 hover:bg-gray-50 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                </button>

                {/* Location */}
                <div className="flex items-center gap-2 text-[#FB6F92] font-semibold text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-90"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                    <span>Los Angeles</span>
                </div>

                {/* User Profile */}
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-pink-100 relative">
                    <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'User'}`}
                        alt="Profile"
                        fill
                        className="object-cover"
                    />
                </div>
            </header>

            <div className="px-6 space-y-8">
                {/* Premium Banner */}
                <div className="relative bg-[#F47895] rounded-[35px] p-8 text-white shadow-xl shadow-pink-200 overflow-hidden">
                    {/* Decorative Hearts */}
                    <div className="absolute top-4 left-4 text-4xl opacity-90 animate-bounce delay-700">❤️</div>
                    <div className="absolute top-8 right-6 text-4xl opacity-90 animate-bounce">💖</div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <h2 className="text-3xl font-serif font-italic mb-1 opacity-95" style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic' }}>LoveStory Premium</h2>
                        <h3 className="text-lg font-medium mb-6 opacity-95">Get LoveStory Premium</h3>

                        <button className="bg-white text-[#F47895] px-8 py-3 rounded-full font-bold text-lg shadow-md hover:scale-105 transition-transform">
                            Get for $10.99
                        </button>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-5">
                    {/* Messages */}
                    <div className="bg-white p-6 rounded-[30px] border-2 border-dashed border-pink-200 flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center text-[#FB6F92]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                            </div>
                            <div className="text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Messages</h3>
                            <p className="text-sm text-gray-500 font-medium">24 unread</p>
                        </div>
                    </div>

                    {/* Requests */}
                    <div className="bg-white p-6 rounded-[30px] border-2 border-dashed border-pink-200 flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center text-[#FB6F92]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m2 21 21-9L2 3v7l15 2-15 2v7z" /></svg>
                            </div>
                            <div className="text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Requests</h3>
                            <p className="text-sm text-gray-500 font-medium">99 new</p>
                        </div>
                    </div>
                </div>

                {/* Latest Requests List */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Latest Requests</h2>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm">
                                <div className="w-16 h-16 rounded-full overflow-hidden relative bg-gray-100 flex-shrink-0">
                                    <Image
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.seed}`}
                                        alt={user.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-lg text-gray-900 truncate">{user.name}</h4>
                                    <p className="text-sm text-gray-500 truncate">{user.action}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="bg-[#FB6F92] hover:bg-[#ff5c86] text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-pink-200">
                                        Accept
                                    </button>
                                    <button className="border-2 border-[#ffc4d3] text-[#FB6F92] hover:bg-pink-50 px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center z-50 rounded-t-[30px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#FB6F92]' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill={activeTab === 'home' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </button>
                <button
                    onClick={() => setActiveTab('matches')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'matches' ? 'text-[#FB6F92]' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill={activeTab === 'matches' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </button>
                <div className="w-14 h-14 bg-[#FB6F92] rounded-full flex items-center justify-center -mt-8 shadow-lg shadow-pink-300 text-white cursor-pointer hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-[#FB6F92]' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill={activeTab === 'chat' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-[#FB6F92]' : 'text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill={activeTab === 'profile' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </button>
            </div>
        </main>
    );
}
