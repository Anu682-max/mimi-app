'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <main className="min-h-screen">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-pink-500">InDate</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400">
                        {user?.firstName} {user?.lastName}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                        {t('settings.logout')}
                    </button>
                </div>
            </header>

            {/* Welcome Section */}
            <section className="p-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-2">
                        {t('onboarding.welcome').replace('InDate', user?.firstName || 'User')} 👋
                    </h2>
                    <p className="text-gray-400 mb-8">{t('onboarding.tagline')}</p>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Link
                            href="/discover"
                            className="p-6 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl border border-pink-500/30 hover:border-pink-500 transition text-center"
                        >
                            <div className="text-3xl mb-2">💕</div>
                            <span className="font-semibold">{t('discover.title')}</span>
                        </Link>

                        <Link
                            href="/chat"
                            className="p-6 bg-[#1A1A24] rounded-2xl border border-gray-700 hover:border-pink-500 transition text-center"
                        >
                            <div className="text-3xl mb-2">💬</div>
                            <span className="font-semibold">{t('chat.title')}</span>
                        </Link>

                        <Link
                            href="/settings"
                            className="p-6 bg-[#1A1A24] rounded-2xl border border-gray-700 hover:border-pink-500 transition text-center"
                        >
                            <div className="text-3xl mb-2">⚙️</div>
                            <span className="font-semibold">{t('settings.title')}</span>
                        </Link>

                        <Link
                            href="/profile"
                            className="p-6 bg-[#1A1A24] rounded-2xl border border-gray-700 hover:border-pink-500 transition text-center"
                        >
                            <div className="text-3xl mb-2">👤</div>
                            <span className="font-semibold">{t('profile.title')}</span>
                        </Link>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-[#1A1A24] rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">{t('profile.title')}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400">Email:</span>
                                <p className="font-medium">{user?.email}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Role:</span>
                                <p className="font-medium capitalize">{user?.role}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">Locale:</span>
                                <p className="font-medium">{user?.locale}</p>
                            </div>
                            <div>
                                <span className="text-gray-400">ID:</span>
                                <p className="font-medium text-xs text-gray-500">{user?.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
