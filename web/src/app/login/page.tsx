'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { login, isLoading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || t('auth.invalid_credentials') || 'Login failed');
        }

        setIsLoading(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back button */}
                <Link href="/" className="text-gray-400 hover:text-white mb-8 block">
                    ← {t('common.back')}
                </Link>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-8">{t('auth.login_title')}</h1>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

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
                            required
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
                            required
                        />
                    </div>

                    <div className="text-right">
                        <button type="button" className="text-pink-400 hover:text-pink-300 text-sm">
                            {t('auth.forgot_password')}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            t('auth.login_button')
                        )}
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
