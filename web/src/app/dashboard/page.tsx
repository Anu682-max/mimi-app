'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    PaperAirplaneIcon,
    EllipsisVerticalIcon,
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

    // Ачаалж байгаа үед spinner харуулах
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F2F4]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4458]"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // Мэдэгдэл идэвхжүүлэх баннер
    const NotificationBanner = () => (
        permission === 'default' ? (
            <div className="px-4 lg:px-0 mt-4 mb-4">
                <div className="bg-white border border-[#E8E6EA] rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[#21262E] font-bold text-sm">Enable Notifications</p>
                        <p className="text-[#656E7B] text-xs text-left">Get instant updates for new matches</p>
                    </div>
                    <button
                        onClick={subscribeUser}
                        disabled={pushLoading}
                        className="px-4 py-2 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 rounded-full text-white text-xs font-bold transition-all"
                    >
                        {pushLoading ? 'Enabling...' : 'Enable'}
                    </button>
                </div>
            </div>
        ) : null
    );

    // Сүүлийн хүсэлтүүдийн жагсаалт
    const latestRequests = [
        { id: 1, name: 'Amy', age: 24, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amy', time: '2h ago' },
        { id: 2, name: 'Sophie', age: 26, avatar: '/images/ai-sophie.png', time: '5h ago' },
        { id: 3, name: 'Emma', age: 23, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', time: '1d ago' },
    ];

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#F0F2F4] pb-24 relative overflow-x-hidden w-full">
            {/* Контент */}
            <div className="relative z-10 w-full mx-auto max-w-lg lg:max-w-7xl lg:px-8 lg:pt-8">
                {/* Гар утасны толгой хэсэг */}
                <header className="px-4 py-4 flex justify-between items-center lg:hidden">
                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-[#E8E6EA] rounded-xl transition-colors shadow-sm hover:bg-gray-50">
                        <EllipsisVerticalIcon className="w-5 h-5 text-[#21262E]" />
                    </button>
                    <div className="flex items-center space-x-2 text-sm text-[#656E7B] bg-white border border-[#E8E6EA] px-3 py-1.5 rounded-full shadow-sm max-w-50">
                        <MapPinIcon className="w-4 h-4 shrink-0 text-[#FF4458]" />
                        <span className="font-medium truncate text-[#21262E]">Los Angeles</span>
                    </div>
                    <button
                        onClick={() => router.push('/profile')}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E8E6EA] hover:border-[#FF4458] transition-colors"
                    >
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'User'}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>
                </header>

                <NotificationBanner />

                {/* Компьютерийн толгой хэсэг */}
                <div className="hidden lg:flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#21262E]">Dashboard</h1>
                        <p className="text-[#656E7B] mt-1">Welcome back, {user?.firstName}</p>
                    </div>
                    <button onClick={() => router.push('/settings')} className="p-2 bg-white border border-[#E8E6EA] hover:bg-gray-50 rounded-xl transition-colors shadow-sm">
                        <EllipsisVerticalIcon className="w-6 h-6 text-[#656E7B]" />
                    </button>
                </div>

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Үндсэн багана */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Статистикийн сүлжээ */}
                        <div className="px-4 lg:px-0 mt-4 lg:mt-0 grid grid-cols-2 gap-3 lg:gap-6">
                            <button onClick={() => router.push('/chat')} className="bg-white border border-[#E8E6EA] hover:bg-gray-50 rounded-xl p-4 lg:p-6 transition-all text-left group shadow-sm hover:shadow-md">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-linear-to-br from-[#FD267A] to-[#FF6036] rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-105 transition-transform shadow-sm">
                                    <ChatBubbleLeftIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <h3 className="text-base lg:text-lg font-bold text-[#21262E] mb-0.5">Messages</h3>
                                <div className="flex items-end gap-2">
                                    <p className="text-xl lg:text-3xl font-black text-[#21262E]">24</p>
                                    <p className="text-[10px] lg:text-sm text-[#656E7B] mb-1 lg:mb-1.5">unread</p>
                                </div>
                            </button>

                            <button onClick={() => router.push('/matches')} className="bg-white border border-[#E8E6EA] hover:bg-gray-50 rounded-xl p-4 lg:p-6 transition-all text-left group shadow-sm hover:shadow-md">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-linear-to-br from-[#FD267A] to-[#FF6036] rounded-xl flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-105 transition-transform shadow-sm">
                                    <HeartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                                </div>
                                <h3 className="text-base lg:text-lg font-bold text-[#21262E] mb-0.5">Matches</h3>
                                <div className="flex items-end gap-2">
                                    <p className="text-xl lg:text-3xl font-black text-[#21262E]">99</p>
                                    <p className="text-[10px] lg:text-sm text-[#656E7B] mb-1 lg:mb-1.5">new</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Баруун багана (Сүүлийн үйл ажиллагаа) */}
                    <div className="lg:col-span-1 mt-6 lg:mt-0">
                        <div className="px-4 lg:px-0">
                            <div className="flex justify-between items-center mb-3 lg:mb-6">
                                <h3 className="text-base lg:text-xl font-bold text-[#21262E]">Recent Activity</h3>
                                <button onClick={() => router.push('/matches')} className="text-xs lg:text-sm text-[#FF4458] hover:text-[#FD267A] transition-colors">
                                    View all
                                </button>
                            </div>
                            <div className="space-y-2.5 lg:space-y-4">
                                {latestRequests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-3 lg:p-4 bg-white border border-[#E8E6EA] hover:bg-gray-50 rounded-xl transition-all shadow-sm group">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <div className="relative">
                                                <img src={request.avatar} alt={request.name} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-[#E8E6EA] shrink-0" />
                                                {/* Онлайн төлөв */}
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-[#21262E] text-sm lg:text-base truncate">{request.name}, {request.age}</h4>
                                                <p className="text-xs lg:text-sm text-[#656E7B] truncate">{request.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <button className="w-8 h-8 lg:w-9 lg:h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-[#656E7B] hover:text-[#21262E]">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                            <button className="w-8 h-8 lg:w-9 lg:h-9 bg-linear-to-br from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 rounded-full flex items-center justify-center transition-all text-white">
                                                <HeartIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Нэмэлт match олох хэсэг */}
                                <div className="hidden lg:block p-4 mt-6 bg-[#FF4458]/5 rounded-xl border border-[#E8E6EA] text-center">
                                    <p className="text-sm text-[#FF4458] font-medium mb-2">Want more matches?</p>
                                    <button onClick={() => router.push('/discover')} className="w-full py-2 bg-linear-to-r from-[#FD267A] to-[#FF6036] text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-gray-200 transition-all">
                                        Start Discovering
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Гар утасны нээх товч */}
                <div className="lg:hidden">
                    <button onClick={() => router.push('/discover')} className="fixed bottom-24 right-5 w-12 h-12 bg-linear-to-br from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 rounded-full shadow-xl flex items-center justify-center transition-all z-40 border-2 border-white">
                        <PlusIcon className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
        </div>
        </AppLayout>
    );
}
