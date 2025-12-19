import webpush from 'web-push';
import dotenv from 'dotenv';
import { logger } from '../common/logger';

dotenv.config();

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

let isConfigured = false;

if (publicKey && privateKey) {
    try {
        webpush.setVapidDetails(subject, publicKey, privateKey);
        isConfigured = true;
        logger.info('Web Push configured successfully');
    } catch (error) {
        logger.error('Failed to configure Web Push', error);
    }
} else {
    logger.warn('Web Push not configured (missing VAPID keys). Notifications will be mocked.');
}

// In-memory storage for subscriptions (Note: Reset on restart)
// In a real app, store this in MongoDB associated with the User ID
const subscriptions: { userId: string, subscription: webpush.PushSubscription }[] = [];

export class NotificationService {
    addSubscription(userId: string, subscription: webpush.PushSubscription) {
        // Remove existing subscription for this user to avoid duplicates/stale data
        const index = subscriptions.findIndex(s => s.userId === userId);
        if (index >= 0) {
            subscriptions[index] = { userId, subscription };
        } else {
            subscriptions.push({ userId, subscription });
        }
        logger.info(`Notification subscription added for user ${userId}`);
    }

    async sendToUser(userId: string, payload: any) {
        const userSub = subscriptions.find(s => s.userId === userId);
        if (!userSub) {
            logger.debug(`No subscription found for user ${userId}`);
            return false;
        }

        const notificationPayload = JSON.stringify(payload);

        if (!isConfigured) {
            logger.info(`[MOCK PUSH] To: ${userId}, Data: ${notificationPayload}`);
            return true;
        }

        try {
            await webpush.sendNotification(userSub.subscription, notificationPayload);
            logger.info(`Push notification sent to ${userId}`);
            return true;
        } catch (error) {
            logger.error(`Error sending push to ${userId}:`, error);
            // If 410 Gone, remove subscription
            if ((error as any).statusCode === 410) {
                const index = subscriptions.findIndex(s => s.userId === userId);
                if (index > -1) subscriptions.splice(index, 1);
            }
            return false;
        }
    }

    async broadcast(payload: any) {
        const promises = subscriptions.map(sub => this.sendToUser(sub.userId, payload));
        await Promise.all(promises);
    }

    getPublicKey() {
        return publicKey;
    }
}

export const notificationService = new NotificationService();
