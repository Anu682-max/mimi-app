'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LOCALE_DISPLAY_NAMES, SUPPORTED_LOCALES, type Locale } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const changeLanguage = (locale: Locale) => {
    i18n.changeLanguage(locale);
    setShowLanguageModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#13131a] to-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
            💝
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
            InDate
          </h1>
        </div>
        <button
          onClick={() => setShowLanguageModal(true)}
          className="px-5 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center space-x-2"
        >
          <span className="text-xl">🌐</span>
          <span className="text-white/90">{LOCALE_DISPLAY_NAMES[i18n.language as Locale] || 'English'}</span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          {/* Decorative Hearts */}
          <div className="mb-8 flex justify-center gap-4 text-4xl animate-bounce">
            <span className="animate-pulse">💕</span>
            <span className="animate-pulse delay-200">💖</span>
            <span className="animate-pulse delay-500">💗</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            {t('onboarding.welcome')}
          </h2>
          <p className="text-2xl md:text-3xl text-gray-300 mb-12 font-light">
            {t('onboarding.tagline')}
          </p>

          <div className="space-y-4 max-w-md mx-auto">
            <Link
              href="/login"
              className="group block w-full py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-105 text-center relative overflow-hidden"
            >
              <span className="relative z-10">{t('auth.login_button')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/signup"
              className="block w-full py-5 border-2 border-pink-500/50 backdrop-blur-xl bg-white/5 rounded-2xl font-bold text-xl hover:bg-pink-500/20 hover:border-pink-400 transition-all transform hover:scale-105 text-center text-white"
            >
              {t('auth.signup_button')}
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-sm font-medium text-white/90">
              ✨ Smart Matching
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-sm font-medium text-white/90">
              💬 Real-time Chat
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-sm font-medium text-white/90">
              🌍 Global Connections
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <nav className="relative z-10 p-6 backdrop-blur-sm border-t border-white/5">
        <div className="flex justify-center gap-8">
          <Link 
            href="/settings" 
            className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group"
          >
            <span className="group-hover:scale-110 transition-transform">⚙️</span>
            <span>{t('settings.title')}</span>
          </Link>
          <Link 
            href="/chat" 
            className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 group"
          >
            <span className="group-hover:scale-110 transition-transform">💬</span>
            <span>{t('chat.title')}</span>
          </Link>
        </div>
      </nav>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-2xl w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t('settings.change_language')}
              </h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <div className="space-y-3">
              {SUPPORTED_LOCALES.map((locale) => (
                <button
                  key={locale}
                  onClick={() => changeLanguage(locale)}
                  className={`w-full p-5 text-left rounded-2xl flex justify-between items-center transition-all transform hover:scale-105
                    ${i18n.language === locale
                      ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-2 border-pink-500/50 text-white shadow-lg shadow-pink-500/20'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300'
                    }`}
                >
                  <span className="font-semibold text-lg">{LOCALE_DISPLAY_NAMES[locale]}</span>
                  {i18n.language === locale && <span className="text-2xl">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
