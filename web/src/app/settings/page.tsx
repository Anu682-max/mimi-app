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
    const [darkMode, setDarkMode] = useState(false);

    // Хэл солих
    const changeLanguage = (locale: Locale) => {
        i18n.changeLanguage(locale);
        setShowLanguageModal(false);
    };

    // Гарах
    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Мэдэгдэл асаах/унтраах
    const handleNotificationToggle = async () => {
        if (isSubscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
    };

    return (
        <main className="min-h-screen bg-[#F0F2F4]">
            {/* Толгой хэсэг */}
            <header className="p-6 border-b border-[#E8E6EA] bg-white">
                <Link href={isAuthenticated ? "/dashboard" : "/"} className="inline-flex items-center text-[#656E7B] hover:text-[#21262E] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center mr-3 group-hover:-translate-x-1 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </div>
                    <span className="font-medium tracking-wide">{t('common.back')}</span>
                </Link>
                <h1 className="text-2xl font-bold mt-4 text-[#21262E]">{t('settings.title')}</h1>
            </header>

            {/* Тохиргооны жагсаалт */}
            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                {/* Бүртгэл хэсэг */}
                <section>
                    <h2 className="text-sm font-semibold text-[#656E7B] uppercase tracking-wider mb-3">
                        {t('settings.account')}
                    </h2>
                    <div className="space-y-2">
                        <Link
                            href="/profile"
                            className="w-full p-4 bg-white rounded-xl flex justify-between items-center hover:bg-gray-50 transition border border-[#E8E6EA] shadow-sm"
                        >
                            <span className="text-[#21262E] font-medium">{t('profile.edit_profile')}</span>
                            <span className="text-[#656E7B]">›</span>
                        </Link>
                    </div>
                </section>

                {/* Тохиргоо хэсэг */}
                <section>
                    <h2 className="text-sm font-semibold text-[#656E7B] uppercase tracking-wider mb-3">
                        {t('settings.language')}
                    </h2>
                    <div className="space-y-2">
                        {/* Хэл солих товч */}
                        <button
                            onClick={() => setShowLanguageModal(true)}
                            className="w-full p-4 bg-white rounded-xl flex justify-between items-center hover:bg-gray-50 transition border border-[#E8E6EA] shadow-sm"
                        >
                            <span className="text-[#21262E] font-medium">{t('settings.change_language')}</span>
                            <span className="text-[#656E7B] text-sm">
                                {LOCALE_DISPLAY_NAMES[i18n.language as Locale] || 'English'} ›
                            </span>
                        </button>

                        {/* Харанхуй горим */}
                        <div className="w-full p-4 bg-white rounded-xl flex justify-between items-center border border-[#E8E6EA] shadow-sm">
                            <span className="text-[#21262E] font-medium">{t('settings.dark_mode')}</span>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-12 h-6 rounded-full transition ${darkMode ? 'bg-[#FF4458]' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition transform shadow-sm ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                            </button>
                        </div>

                        {/* Мэдэгдэл */}
                        <div className="w-full p-4 bg-white rounded-xl flex justify-between items-center border border-[#E8E6EA] shadow-sm">
                            <div>
                                <span className="text-[#21262E] font-medium">{t('settings.notifications')}</span>
                                {!isSupported && (
                                    <p className="text-xs text-[#656E7B] mt-1">Not supported in this browser</p>
                                )}
                                {isSupported && permission === 'denied' && (
                                    <p className="text-xs text-red-400 mt-1">Blocked - enable in browser settings</p>
                                )}
                            </div>
                            <button
                                onClick={handleNotificationToggle}
                                disabled={!isSupported || permission === 'denied' || isLoading}
                                className={`w-12 h-6 rounded-full transition ${isSubscribed ? 'bg-[#FF4458]' : 'bg-gray-300'} disabled:opacity-50`}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 ml-0.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                ) : (
                                    <div className={`w-5 h-5 bg-white rounded-full transition transform shadow-sm ${isSubscribed ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Нууцлал хэсэг */}
                <section>
                    <h2 className="text-sm font-semibold text-[#656E7B] uppercase tracking-wider mb-3">
                        {t('settings.privacy')}
                    </h2>
                    <div className="space-y-2">
                        <button className="w-full p-4 bg-white rounded-xl flex justify-between items-center hover:bg-gray-50 transition border border-[#E8E6EA] shadow-sm">
                            <span className="text-[#21262E] font-medium">{t('settings.privacy')}</span>
                            <span className="text-[#656E7B]">›</span>
                        </button>
                    </div>
                </section>

                {/* Гарах */}
                {isAuthenticated && (
                    <section>
                        <button
                            onClick={handleLogout}
                            className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-500 font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
                        >
                            <span>{t('settings.logout')}</span>
                        </button>
                    </section>
                )}
            </div>

            {/* Хэл сонгох модал */}
            {showLanguageModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-xl p-8 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#21262E]">{t('settings.change_language')}</h3>
                            <button
                                onClick={() => setShowLanguageModal(false)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-[#656E7B] transition-all"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-2">
                            {SUPPORTED_LOCALES.map((locale) => (
                                <button
                                    key={locale}
                                    onClick={() => changeLanguage(locale)}
                                    className={`w-full p-4 text-left rounded-xl flex justify-between items-center transition-all
                                        ${i18n.language === locale
                                            ? 'bg-[#FF4458]/10 border-2 border-[#FF4458] text-[#FF4458]'
                                            : 'bg-gray-50 border border-[#E8E6EA] hover:bg-gray-100 text-[#656E7B]'
                                        }`}
                                >
                                    <span className="font-medium">{LOCALE_DISPLAY_NAMES[locale]}</span>
                                    {i18n.language === locale && <span className="text-[#FF4458]">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
