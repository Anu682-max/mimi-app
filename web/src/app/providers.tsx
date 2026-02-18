'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Service worker бүртгэх — push notification-д шаардлагатай
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registered:', registration.scope);

                    // Цагт нэг удаа шинэчлэлт шалгах
                    setInterval(() => {
                        registration.update();
                    }, 1000 * 60 * 60);
                })
                .catch((error) => {
                    console.error('ServiceWorker registration failed:', error);
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
                <SocketProvider>
                    {children}
                    <PWAInstallPrompt />
                </SocketProvider>
            </AuthProvider>
        </I18nextProvider>
    );
}
