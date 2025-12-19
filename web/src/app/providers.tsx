'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { AuthProvider } from '@/contexts/AuthContext';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Register service worker for PWA
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('ServiceWorker registered:', registration.scope);

                        // Check for updates every hour
                        setInterval(() => {
                            registration.update();
                        }, 1000 * 60 * 60);
                    })
                    .catch((error) => {
                        console.error('ServiceWorker registration failed:', error);
                    });
            });
        }

        // Handle mobile viewport height
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVh();
        window.addEventListener('resize', setVh);
        window.addEventListener('orientationchange', setVh);

        return () => {
            window.removeEventListener('resize', setVh);
            window.removeEventListener('orientationchange', setVh);
        };
    }, []);

    return (
        <I18nextProvider i18n={i18n}>
            <AuthProvider>
                {children}
                <PWAInstallPrompt />
            </AuthProvider>
        </I18nextProvider>
    );
}

