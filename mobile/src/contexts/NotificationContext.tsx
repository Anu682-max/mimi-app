/**
 * Notification Context for Mobile App
 * Manages push notifications state and handlers
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    expoPushToken: string | null;
    isRegistered: boolean;
    isLoading: boolean;
    notification: Notifications.Notification | null;
    registerForNotifications: () => Promise<boolean>;
    sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { token, isAuthenticated } = useAuth();
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);

    useEffect(() => {
        // Auto-register when user logs in
        if (isAuthenticated && token && !isRegistered) {
            registerForNotifications();
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        // Set up notification listeners
        const notificationListener = notificationService.addNotificationReceivedListener(
            (notification) => {
                console.log('📩 Notification received:', notification);
                setNotification(notification);
            }
        );

        const responseListener = notificationService.addNotificationResponseListener(
            (response) => {
                console.log('📱 Notification tapped:', response);
                // Handle navigation based on notification data
                const data = response.notification.request.content.data;
                if (data?.url) {
                    // Navigate to specific screen based on URL
                    console.log('Navigate to:', data.url);
                }
            }
        );

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);

    const registerForNotifications = async (): Promise<boolean> => {
        if (isLoading || isRegistered) return false;

        setIsLoading(true);

        try {
            // Get Expo push token
            const pushToken = await notificationService.registerForPushNotifications();

            if (!pushToken) {
                Alert.alert(
                    'Notification Permission',
                    'Please enable notifications in your device settings to receive updates.'
                );
                setIsLoading(false);
                return false;
            }

            setExpoPushToken(pushToken);

            // Subscribe to backend (if token available)
            if (token) {
                const subscribed = await notificationService.subscribeToBackend(token, pushToken);
                
                if (subscribed) {
                    setIsRegistered(true);
                    console.log('✅ Notifications registered successfully');
                    return true;
                } else {
                    console.warn('⚠️ Failed to subscribe to backend');
                }
            } else {
                // Store token for later subscription after login
                setIsRegistered(true);
                return true;
            }
        } catch (error) {
            console.error('Error registering for notifications:', error);
            Alert.alert('Error', 'Failed to register for notifications');
        } finally {
            setIsLoading(false);
        }

        return false;
    };

    const sendTestNotification = async () => {
        if (!token) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        setIsLoading(true);

        try {
            const success = await notificationService.sendTestNotification(token);
            
            if (success) {
                Alert.alert('Success', 'Test notification sent! Check your notifications.');
            } else {
                Alert.alert('Error', 'Failed to send test notification');
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            Alert.alert('Error', 'Failed to send test notification');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                expoPushToken,
                isRegistered,
                isLoading,
                notification,
                registerForNotifications,
                sendTestNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications(): NotificationContextType {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

export default { NotificationProvider, useNotifications };
