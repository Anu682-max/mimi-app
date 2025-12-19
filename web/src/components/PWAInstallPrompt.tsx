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
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    };

    // Don't show if already installed or dismissed recently
    if (isStandalone) return null;

    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) return null;
    }

    if (!showPrompt) return null;

    return (
        <div className={`pwa-install-prompt ${showPrompt ? 'show' : ''} safe-bottom`}>
            <div className="flex items-center justify-between gap-3 max-w-screen-lg mx-auto">
                <div className="flex items-center gap-3 flex-1">
                    <div className="text-3xl">❤️</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-sm mb-1">
                            Install InDate App
                        </h3>
                        {isIOS ? (
                            <p className="text-xs text-white/80">
                                Tap <span className="inline-block mx-1">
                                    <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l.01 7H19v2h-7v13l-2-.01V11H3V9h7.01z" />
                                    </svg>
                                </span> then "Add to Home Screen"
                            </p>
                        ) : (
                            <p className="text-xs text-white/80">
                                Get quick access and offline support
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isIOS && deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="bg-white text-purple-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                        >
                            Install
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="text-white/80 hover:text-white p-2 transition-colors"
                        aria-label="Dismiss"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
