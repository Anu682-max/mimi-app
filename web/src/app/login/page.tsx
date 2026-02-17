'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { login, isLoading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /* Нэвтрэх маягтыг илгээх */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password, rememberMe);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || t('auth.invalid_credentials') || 'Login failed');
        }

        setIsLoading(false);
    };

    /* Ачааллах үед дэлгэц */
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F0F2F4]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4458]"></div>
            </div>
        );
    }

    return (
        /* Үндсэн хуудас — Tinder загварын дэвсгэр */
        <main className="min-h-screen bg-[#F0F2F4] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Буцах товч */}
                <Link href="/" className="inline-flex items-center text-[#656E7B] hover:text-[#21262E] mb-8 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#E8E6EA] flex items-center justify-center mr-3 group-hover:-translate-x-1 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </div>
                    <span className="font-medium tracking-wide">{t('common.back')}</span>
                </Link>

                {/* Үндсэн карт */}
                <div className="bg-white rounded-xl shadow-md p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <Logo size="lg" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#21262E] mb-2 tracking-tight">
                            {t('auth.login_title')}
                        </h1>
                        <p className="text-[#656E7B] text-sm">Welcome back to mimi</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Алдааны мэдэгдэл */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        {/* И-мэйл оруулах талбар */}
                        <div className="space-y-1">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full px-5 py-4 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:ring-2 focus:ring-[#FF4458] focus:border-[#FF4458] focus:outline-none transition-all"
                            />
                        </div>

                        {/* Нууц үг оруулах талбар */}
                        <div className="space-y-1 relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-5 py-4 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:ring-2 focus:ring-[#FF4458] focus:border-[#FF4458] focus:outline-none transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#656E7B] hover:text-[#21262E] transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7A9 9 0 0 1 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>

                        {/* Намайг санах / Нууц үг мартсан */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-[#E8E6EA] bg-[#F0F2F4] text-[#FF4458] focus:ring-2 focus:ring-[#FF4458] focus:ring-offset-0 cursor-pointer transition-all"
                                />
                                <span className="ml-2 text-sm text-[#656E7B] group-hover:text-[#21262E] transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <Link href="/forgot-password" className="text-sm font-medium text-[#FF4458] hover:opacity-80 transition-colors">
                                {t('auth.forgot_password')}
                            </Link>
                        </div>

                        {/* Нэвтрэх товч */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:opacity-90 text-white rounded-full font-bold text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>{t('auth.login_button')}</span>
                            )}
                        </button>
                    </form>

                    {/* Хуваагч шугам */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#E8E6EA]"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider">
                            <span className="bg-white px-3 text-[#656E7B]">
                                {t('auth.or_continue_with')}
                            </span>
                        </div>
                    </div>

                    {/* Гуравдагч талын нэвтрэх товчнууд */}
                    <div className="flex gap-4 justify-center">
                        <button
                            className="w-14 h-14 rounded-full bg-[#F0F2F4] border border-[#E8E6EA] hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </button>
                        <button
                            className="w-14 h-14 rounded-full bg-[#F0F2F4] border border-[#E8E6EA] hover:bg-gray-200 text-[#21262E] flex items-center justify-center transition-colors"
                        >
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 384 512">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                            </svg>
                        </button>
                    </div>

                    {/* Бүртгэл үүсгэх холбоос */}
                    <p className="text-center mt-8 text-[#656E7B] text-sm">
                        {t('auth.dont_have_account')}{' '}
                        <Link href="/signup" className="text-[#FF4458] font-semibold hover:opacity-80">
                            {t('auth.signup_button')}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
