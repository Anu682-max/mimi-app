'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LOCALE_DISPLAY_NAMES, SUPPORTED_LOCALES, type Locale } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function SettingsPage() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { logout, isAuthenticated } = useAuth();
    const { isSupported, isSubscribed, permission, isLoading, subscribe, unsubscribe } = usePushNotifications();

    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    const changeLanguage = (locale: Locale) => {
        i18n.changeLanguage(locale);
        setShowLanguageModal(false);
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleNotificationToggle = async () => {
        if (isSubscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
    };

    return (
        <main className="min-h-screen">
            {/* Header */}
            <header className="p-4 border-b border-gray-800">
                <Link href={isAuthenticated ? "/dashboard" : "/"} className="text-gray-400 hover:text-white">
                    ← {t('common.back')}
                </Link>
                <h1 className="text-2xl font-bold mt-4">{t('settings.title')}</h1>
            </header>

            {/* Settings List */}
            <div className="p-4 space-y-6">
                {/* Account Section */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {t('settings.account')}
                    </h2>
                    <div className="space-y-2">
                        <Link
                            href="/profile"
                            className="w-full p-4 bg-[#1A1A24] rounded-xl flex justify-between items-center hover:bg-gray-800 transition"
                        >
                            <span>{t('profile.edit_profile')}</span>
                            <span className="text-gray-500">›</span>
                        </Link>
                    </div>
                </section>

                {/* Preferences Section */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {t('settings.language')}
                    </h2>
                    <div className="space-y-2">
                        <button
                            onClick={() => setShowLanguageModal(true)}
                            className="w-full p-4 bg-[#1A1A24] rounded-xl flex justify-between items-center hover:bg-gray-800 transition"
                        >
                            <span>{t('settings.change_language')}</span>
                            <span className="text-gray-400">
                                {LOCALE_DISPLAY_NAMES[i18n.language as Locale] || 'English'} ›
                            </span>
                        </button>

                        <div className="w-full p-4 bg-[#1A1A24] rounded-xl flex justify-between items-center">
                            <span>{t('settings.dark_mode')}</span>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-12 h-6 rounded-full transition ${darkMode ? 'bg-pink-500' : 'bg-gray-600'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>

                        <div className="w-full p-4 bg-[#1A1A24] rounded-xl flex justify-between items-center">
                            <div>
                                <span>{t('settings.notifications')}</span>
                                {!isSupported && (
                                    <p className="text-xs text-gray-500 mt-1">Not supported in this browser</p>
                                )}
                                {isSupported && permission === 'denied' && (
                                    <p className="text-xs text-red-400 mt-1">Blocked - enable in browser settings</p>
                                )}
                            </div>
                            <button
                                onClick={handleNotificationToggle}
                                disabled={!isSupported || permission === 'denied' || isLoading}
                                className={`w-12 h-6 rounded-full transition ${isSubscribed ? 'bg-pink-500' : 'bg-gray-600'} disabled:opacity-50`}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 ml-0.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                ) : (
                                    <div className={`w-5 h-5 bg-white rounded-full transition transform ${isSubscribed ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Privacy Section */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {t('settings.privacy')}
                    </h2>
                    <div className="space-y-2">
                        <button className="w-full p-4 bg-[#1A1A24] rounded-xl flex justify-between items-center hover:bg-gray-800 transition">
                            <span>{t('settings.privacy')}</span>
                            <span className="text-gray-500">›</span>
                        </button>
                    </div>
                </section>

                {/* Logout */}
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        className="w-full p-4 bg-[#1A1A24] rounded-xl text-pink-400 font-semibold hover:bg-gray-800 transition"
                    >
                        {t('settings.logout')}
                    </button>
                )}
            </div>

            {/* Language Modal */}
            {showLanguageModal && (
                <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
                    <div className="bg-[#1A1A24] w-full max-w-md rounded-t-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{t('settings.change_language')}</h3>
                            <button
                                onClick={() => setShowLanguageModal(false)}
                                className="text-2xl text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2">
                            {SUPPORTED_LOCALES.map((locale) => (
                                <button
                                    key={locale}
                                    onClick={() => changeLanguage(locale)}
                                    className={`w-full p-4 text-left rounded-xl flex justify-between items-center transition
                    ${i18n.language === locale
                                            ? 'bg-pink-500/20 text-pink-400'
                                            : 'bg-gray-800 hover:bg-gray-700'
                                        }`}
                                >
                                    <span>{LOCALE_DISPLAY_NAMES[locale]}</span>
                                    {i18n.language === locale && <span>✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
