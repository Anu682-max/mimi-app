'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LOCALE_DISPLAY_NAMES, SUPPORTED_LOCALES, type Locale } from '@/i18n';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

export default function Home() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Нэвтэрсэн хэрэглэгчийг dashboard руу чиглүүлэх */
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  /* Хэл солих функц */
  const changeLanguage = (locale: Locale) => {
    i18n.changeLanguage(locale);
    setShowLanguageModal(false);
  };

  /* Ачааллах төлөв */
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4458]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Толгой хэсэг */}
      <header className="flex justify-between items-center p-6">
        <Logo size="lg" />
        <button
          onClick={() => setShowLanguageModal(true)}
          className="px-4 py-2 bg-[#F0F2F4] border border-[#E8E6EA] rounded-full hover:bg-gray-200 transition-all flex items-center space-x-2"
        >
          <span className="text-lg">🌐</span>
          <span className="text-[#656E7B] text-sm font-medium">{LOCALE_DISPLAY_NAMES[i18n.language as Locale] || 'English'}</span>
        </button>
      </header>

      {/* Гол хэсэг */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#21262E] leading-tight">
            {t('onboarding.welcome')}
          </h2>
          <p className="text-xl md:text-2xl text-[#656E7B] mb-12 font-light">
            {t('onboarding.tagline')}
          </p>

          {/* Үндсэн товчнууд */}
          <div className="space-y-4 max-w-sm mx-auto">
            <Link
              href="/login"
              className="block w-full py-4 bg-linear-to-r from-[#FD267A] to-[#FF6036] rounded-full font-semibold text-lg text-white hover:opacity-90 transition-all text-center"
            >
              {t('auth.login_button')}
            </Link>
            <Link
              href="/signup"
              className="block w-full py-4 border border-[#E8E6EA] bg-white rounded-full font-semibold text-lg hover:bg-[#F0F2F4] transition-all text-center text-[#21262E]"
            >
              {t('auth.signup_button')}
            </Link>
          </div>

          {/* Онцлог шинж тэмдэглэгээнүүд */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            <div className="px-5 py-2.5 bg-[#F0F2F4] rounded-full border border-[#E8E6EA] text-sm font-medium text-[#656E7B]">
              ✨ Smart Matching
            </div>
            <div className="px-5 py-2.5 bg-[#F0F2F4] rounded-full border border-[#E8E6EA] text-sm font-medium text-[#656E7B]">
              💬 Real-time Chat
            </div>
            <div className="px-5 py-2.5 bg-[#F0F2F4] rounded-full border border-[#E8E6EA] text-sm font-medium text-[#656E7B]">
              🌍 Global Connections
            </div>
          </div>
        </div>
      </section>

      {/* Хөл хэсгийн навигаци */}
      <nav className="p-6">
        <div className="flex justify-center gap-8">
          <Link
            href="/settings"
            className="text-[#656E7B] hover:text-[#FF4458] transition-colors flex items-center space-x-2 text-sm"
          >
            <span>⚙️</span>
            <span>{t('settings.title')}</span>
          </Link>
          <Link
            href="/chat"
            className="text-[#656E7B] hover:text-[#FF4458] transition-colors flex items-center space-x-2 text-sm"
          >
            <span>💬</span>
            <span>{t('chat.title')}</span>
          </Link>
        </div>
      </nav>

      {/* Хэл сонгох модал цонх */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#21262E]">
                {t('settings.change_language')}
              </h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="w-8 h-8 flex items-center justify-center bg-[#F0F2F4] hover:bg-gray-200 rounded-full text-[#656E7B] transition-all"
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
                      : 'bg-[#F0F2F4] border border-[#E8E6EA] hover:bg-gray-200 text-[#656E7B]'
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
