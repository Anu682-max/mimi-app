'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate email format
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setError('Please enter a valid email address');
                setIsLoading(false);
                return;
            }

            // Simulate API call
            setTimeout(() => {
                setIsLoading(false);
                setIsSubmitted(true);
            }, 1500);
        } catch (err) {
            setError('Unable to send password reset link. Please try again.');
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <main className="min-h-screen bg-[#050505] relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
                {/* Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050505] to-[#050505] z-0" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent_40%,_#050505_100%)] z-0" />
                
                {/* Moving Orbs - Smaller on mobile */}
                <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/30 rounded-full blur-[80px] sm:blur-[120px] animate-float z-0" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-float-delayed z-0" />

                <div className="w-full max-w-md z-10 relative">
                    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl sm:rounded-[32px] p-6 sm:p-8 border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-600 mb-4 sm:mb-6 shadow-lg shadow-green-500/25 ring-1 ring-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                                Check Your Email
                            </h1>
                            <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 px-2">
                                We've sent a password reset link to<br />
                                <span className="text-violet-400 font-medium break-all">{email}</span>
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center w-full py-3.5 sm:py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:from-violet-700 active:to-fuchsia-700 text-white rounded-full font-bold text-base sm:text-lg shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-white/10"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050505] to-[#050505] z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent_40%,_#050505_100%)] z-0" />
            
            {/* Moving Orbs - Smaller on mobile */}
            <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/30 rounded-full blur-[80px] sm:blur-[120px] animate-float z-0" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-float-delayed z-0" />
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#FF4458]/10 rounded-full blur-[60px] sm:blur-[100px] z-0" />

            <div className="w-full max-w-md z-10 relative">
                {/* Back Button */}
                <Link href="/login" className="inline-flex items-center text-gray-400 hover:text-white mb-6 sm:mb-8 transition-colors group active:scale-95">
                    <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mr-2 sm:mr-3 group-hover:-translate-x-1 transition-transform backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </div>
                    <span className="font-medium tracking-wide text-sm sm:text-base">Back</span>
                </Link>

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl sm:rounded-[32px] p-6 sm:p-8 border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 mb-4 sm:mb-6 shadow-lg shadow-violet-500/25 ring-1 ring-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm px-2">
                            Enter your email and we'll send you a reset link
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 sm:p-4 rounded-2xl text-xs sm:text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full px-4 py-3.5 sm:px-5 sm:py-4 bg-black/20 rounded-xl border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:outline-none transition-all text-sm sm:text-base"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:from-violet-700 active:to-fuchsia-700 text-white rounded-full font-bold text-base sm:text-lg shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/10"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>Send Reset Link</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 sm:mt-8 text-center">
                        <p className="text-xs sm:text-sm text-gray-400">
                            Remember your password?{' '}
                            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors active:text-violet-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
