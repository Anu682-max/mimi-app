'use client';

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running as PWA
        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standalone);

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // Listen for beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing
            e.preventDefault();
            // Save the event for later use
            setDeferredPrompt(e);
            // Show custom install prompt after a delay
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000); // Show after 3 seconds
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Show iOS install prompt if applicable
        if (iOS && !standalone) {
            setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt && !isIOS) {
            return;
        }

        if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('PWA installed');
            } else {
                console.log('PWA installation dismissed');
            }

            // Clear the deferred prompt
            setDeferredPrompt(null);
        }

        // Hide the prompt
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for 7 days
        if (typeof window !== 'undefined') {
            localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
        }
    };

    // Don't show if already installed or dismissed recently
    if (isStandalone) return null;

    // Check localStorage only on client side
    if (typeof window !== 'undefined') {
        const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissedTime) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) return null;
        }
    }

    if (!showPrompt) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] transform transition-transform duration-500 ease-out ${showPrompt ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="bg-gradient-to-r from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] border-b border-purple-500/30 backdrop-blur-xl shadow-2xl safe-top">
                <div className="flex flex-col p-3 sm:p-4 gap-3 max-w-lg mx-auto w-full">

                    <div className="flex items-center gap-3 w-full">
                        {/* App Icon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                            <span className="text-xl animate-pulse">🔮</span>
                        </div>

                        {/* Title & Desc */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm leading-tight truncate">
                                Install InDate
                            </h3>
                            {isIOS ? (
                                <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">
                                    Tap <span className="inline-flex align-middle"><svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L12 15M12 2L6 8M12 2L18 8M5 21L19 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Share, then "Add to Home"
                                </p>
                            ) : (
                                <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">
                                    Get the full magical experience ✨
                                </p>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleDismiss}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
                            aria-label="Dismiss"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Install Action Button (Full width on mobile) */}
                    {!isIOS && deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-white text-purple-900 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>Install Now</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
