'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Demo - just show alert
        alert(`${t('auth.login_button')}: ${email}`);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back button */}
                <Link href="/" className="text-gray-400 hover:text-white mb-8 block">
                    ← {t('common.back')}
                </Link>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-8">{t('auth.login_title')}</h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('auth.email')}
                            className="w-full p-4 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('auth.password')}
                            className="w-full p-4 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none transition"
                        />
                    </div>

                    <div className="text-right">
                        <button type="button" className="text-pink-400 hover:text-pink-300 text-sm">
                            {t('auth.forgot_password')}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold text-lg hover:opacity-90 transition"
                    >
                        {t('auth.login_button')}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-gray-500 text-sm">{t('auth.or_continue_with')}</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* Social buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="py-4 bg-[#1A1A24] rounded-xl border border-gray-700 hover:bg-gray-800 transition">
                        Google
                    </button>
                    <button className="py-4 bg-[#1A1A24] rounded-xl border border-gray-700 hover:bg-gray-800 transition">
                        Apple
                    </button>
                </div>

                {/* Sign up link */}
                <p className="text-center mt-8 text-gray-400">
                    {t('auth.dont_have_account')}{' '}
                    <Link href="/signup" className="text-pink-400 hover:text-pink-300">
                        {t('auth.signup_button')}
                    </Link>
                </p>
            </div>
        </main>
    );
}
