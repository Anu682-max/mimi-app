/**
 * Push Notification Service for React Native (Expo)
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { API_URL } from '../config';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    private expoPushToken: string | null = null;

    /**
     * Register for push notifications and get Expo push token
     */
    async registerForPushNotifications(): Promise<string | null> {
        try {
            // Check if physical device
            if (!Device.isDevice) {
                console.warn('Push notifications require a physical device');
                return null;
            }

            // Check existing permission
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permission if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Push notification permission denied');
                return null;
            }

            // Get Expo push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: 'your-project-id', // Replace with your Expo project ID from app.json
            });

            this.expoPushToken = tokenData.data;
            console.log('✅ Expo Push Token:', this.expoPushToken);

            // Configure Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF4D6A',
                });
            }

            return this.expoPushToken;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
            return null;
        }
    }

    /**
     * Subscribe push token to backend
     */
    async subscribeToBackend(token: string, expoPushToken: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/api/v1/notifications/subscribe/expo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    expoPushToken,
                    deviceInfo: {
                        platform: Platform.OS,
                        deviceName: Device.deviceName,
                        osVersion: Device.osVersion,
                    },
                }),
            });

            const data = await response.json();
            return data.success || false;
        } catch (error) {
            console.error('Error subscribing to backend:', error);
            return false;
        }
    }

    /**
     * Send a test notification to current user
     */
    async sendTestNotification(token: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/api/v1/notifications/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: '💕 Test Notification',
                    body: 'This is a test notification from mimi!',
                }),
            });

            const data = await response.json();
            return data.success || false;
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }

    /**
     * Add notification received listener
     */
    addNotificationReceivedListener(
        callback: (notification: Notifications.Notification) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Add notification response listener (when user taps notification)
     */
    addNotificationResponseListener(
        callback: (response: Notifications.NotificationResponse) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }

    /**
     * Schedule a local notification
     */
    async scheduleLocalNotification(
        title: string,
        body: string,
        data?: any,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> {
        return await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: trigger || null, // null = show immediately
        });
    }

    /**
     * Get current Expo push token
     */
    getExpoPushToken(): string | null {
        return this.expoPushToken;
    }

    /**
     * Cancel all scheduled notifications
     */
    async cancelAllNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    /**
     * Get badge count
     */
    async getBadgeCount(): Promise<number> {
        return await Notifications.getBadgeCountAsync();
    }

    /**
     * Set badge count
     */
    async setBadgeCount(count: number): Promise<void> {
        await Notifications.setBadgeCountAsync(count);
    }
}

export const notificationService = new NotificationService();
export default notificationService;
