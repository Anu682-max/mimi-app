'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface NotificationState {
    isSupported: boolean;
    isSubscribed: boolean;
    permission: NotificationPermission | 'default';
    isLoading: boolean;
}

export function usePushNotifications() {
    const { token, isAuthenticated } = useAuth();
    const [state, setState] = useState<NotificationState>({
        isSupported: false,
        isSubscribed: false,
        permission: 'default',
        isLoading: false,
    });

    // Check if push notifications are supported
    useEffect(() => {
        const isSupported =
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window;

        setState(prev => ({
            ...prev,
            isSupported,
            permission: isSupported ? Notification.permission : 'default',
        }));

        if (isSupported) {
            checkSubscription();
        }
    }, []);

    // Check if already subscribed
    const checkSubscription = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setState(prev => ({
                ...prev,
                isSubscribed: !!subscription,
            }));
        } catch (error) {
            console.error('Check subscription error:', error);
        }
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async () => {
        if (!state.isSupported || !isAuthenticated || !token) return false;

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // Request permission
            const permission = await Notification.requestPermission();
            setState(prev => ({ ...prev, permission }));

            if (permission !== 'granted') {
                setState(prev => ({ ...prev, isLoading: false }));
                return false;
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            // Get VAPID public key from environment
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY;
            
            if (!vapidPublicKey) {
                console.warn('VAPID key not configured');
                setState(prev => ({ ...prev, isLoading: false }));
                return false;
            }

            // Subscribe to push manager
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            // Send subscription to server
            const response = await fetch(`${API_URL}/api/v1/notifications/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subscription }),
            });

            const data = await response.json();

            if (data.success) {
                setState(prev => ({
                    ...prev,
                    isSubscribed: true,
                    isLoading: false,
                }));
                return true;
            }
        } catch (error) {
            console.error('Subscribe error:', error);
        }

        setState(prev => ({ ...prev, isLoading: false }));
        return false;
    }, [state.isSupported, isAuthenticated, token]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        if (!state.isSupported || !token) return false;

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Notify server
                await fetch(`${API_URL}/api/v1/notifications/unsubscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });

                // Unsubscribe locally
                await subscription.unsubscribe();
            }

            setState(prev => ({
                ...prev,
                isSubscribed: false,
                isLoading: false,
            }));
            return true;
        } catch (error) {
            console.error('Unsubscribe error:', error);
        }

        setState(prev => ({ ...prev, isLoading: false }));
        return false;
    }, [state.isSupported, token]);

    return {
        ...state,
        subscribe,
        unsubscribe,
    };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
}
