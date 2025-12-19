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
            className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-out shadow-2xl ${showPrompt ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="bg-gradient-to-r from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f] border-b border-purple-500/30 backdrop-blur-xl p-4 safe-top">
                <div className="max-w-screen-lg mx-auto flex items-center justify-between gap-4">
                    {/* App Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                            <span className="text-2xl animate-pulse">🔮</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-base leading-tight truncate">
                                Install InDate App
                            </h3>
                            {isIOS ? (
                                <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
                                    Tap <span className="inline-flex items-center justify-center w-5 h-5 bg-white/10 rounded mx-0.5"><svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L12 15M12 2L6 8M12 2L18 8M5 21L19 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span> then "Add to Home Screen"
                                </p>
                            ) : (
                                <p className="text-xs text-gray-300 mt-0.5">
                                    Get the full magical experience ✨
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {!isIOS && deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="bg-white text-purple-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-95 transition-all animate-bounce-slow whitespace-nowrap"
                            >
                                Install
                            </button>
                        )}
                        <button
                            onClick={handleDismiss}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            aria-label="Dismiss"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
