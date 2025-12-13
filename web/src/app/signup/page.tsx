'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function SignupPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`${t('auth.signup_button')}: ${email}`);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="text-gray-400 hover:text-white mb-8 block">
                    ← {t('common.back')}
                </Link>

                <h1 className="text-3xl font-bold mb-8">{t('auth.signup_title')}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('auth.email')}
                            className="w-full p-4 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('auth.password')}
                            className="w-full p-4 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold text-lg hover:opacity-90 transition"
                    >
                        {t('auth.signup_button')}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-400">
                    {t('auth.dont_have_account')}{' '}
                    <Link href="/login" className="text-pink-400 hover:text-pink-300">
                        {t('auth.login_button')}
                    </Link>
                </p>
            </div>
        </main>
    );
}
