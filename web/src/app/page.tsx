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
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-pink-500">InDate</h1>
        <button
          onClick={() => setShowLanguageModal(true)}
          className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
        >
          🌐 {LOCALE_DISPLAY_NAMES[i18n.language as Locale] || 'English'}
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            {t('onboarding.welcome')}
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            {t('onboarding.tagline')}
          </p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold text-lg hover:opacity-90 transition text-center"
            >
              {t('auth.login_button')}
            </Link>
            <Link
              href="/signup"
              className="block w-full py-4 border-2 border-pink-500 rounded-xl font-bold text-lg hover:bg-pink-500/10 transition text-center"
            >
              {t('auth.signup_button')}
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Links */}
      <nav className="p-4 border-t border-gray-800">
        <div className="flex justify-center gap-6">
          <Link href="/settings" className="text-gray-400 hover:text-white transition">
            {t('settings.title')}
          </Link>
          <Link href="/chat" className="text-gray-400 hover:text-white transition">
            {t('chat.title')}
          </Link>
        </div>
      </nav>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50">
          <div className="bg-[#1A1A24] w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
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
