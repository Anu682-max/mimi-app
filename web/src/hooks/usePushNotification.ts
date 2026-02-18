import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3699';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotification() {
    const { user } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const subscribeUser = async () => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            setError('Push messaging not supported');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // First request permission
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                throw new Error('Permission denied');
            }

            // Get VAPID key from environment variable
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;

            if (!vapidKey) {
                console.warn('No VAPID key configured. Push notifications disabled.');
                setError('Push notifications not configured');
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

            // Check existing subscription
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            }

            // Send subscription to backend
            const token = localStorage.getItem('token');
            const subRes = await fetch(`${API_URL}/api/v1/notifications/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(subscription)
            });

            if (!subRes.ok) throw new Error('Failed to send subscription to server');

            setIsSubscribed(true);
            console.log('User subscribed to push notifications');

        } catch (err: any) {
            console.error('Failed to subscribe to push notifications', err);
            setError(err.message || 'Subscription failed');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isSubscribed,
        isLoading,
        permission,
        subscribeUser,
        error
    };
}
