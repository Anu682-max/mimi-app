/**
 * Notification Service
 * Push мэдэгдэл, мэдэгдлийн түүхийг удирдана
 */

import webpush from 'web-push';
import mongoose, { Document, Schema } from 'mongoose';
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

// Push subscription модель - MongoDB-д хадгална
interface IPushSubscription extends Document {
    userId: string;
    subscription: webpush.PushSubscription;
    platform: 'web' | 'mobile';
    createdAt: Date;
    updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>({
    userId: { type: String, required: true, index: true },
    subscription: { type: Schema.Types.Mixed, required: true },
    platform: { type: String, enum: ['web', 'mobile'], default: 'web' },
}, { timestamps: true });

pushSubscriptionSchema.index({ userId: 1, platform: 1 });

const PushSubscription = mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);

// Мэдэгдлийн түүх модель
interface INotificationHistory extends Document {
    userId: string;
    title: string;
    body: string;
    type: 'match' | 'message' | 'like' | 'system' | 'promo';
    data?: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
}

const notificationHistorySchema = new Schema<INotificationHistory>({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['match', 'message', 'like', 'system', 'promo'], default: 'system' },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationHistorySchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const NotificationHistory = mongoose.model<INotificationHistory>('NotificationHistory', notificationHistorySchema);

// In-memory fallback (mock mode-д ашиглана)
const inMemorySubscriptions: { userId: string, subscription: webpush.PushSubscription }[] = [];

export class NotificationService {
    // Subscription нэмэх - MongoDB эсвэл in-memory
    async addSubscription(userId: string, subscription: webpush.PushSubscription, platform: 'web' | 'mobile' = 'web') {
        try {
            await PushSubscription.findOneAndUpdate(
                { userId, platform },
                { userId, subscription, platform },
                { upsert: true, new: true }
            );
        } catch {
            const index = inMemorySubscriptions.findIndex(s => s.userId === userId);
            if (index >= 0) {
                inMemorySubscriptions[index] = { userId, subscription };
            } else {
                inMemorySubscriptions.push({ userId, subscription });
            }
        }
        logger.info(`Notification subscription added for user ${userId} (${platform})`);
    }

    // Хэрэглэгчид push мэдэгдэл илгээх
    async sendToUser(userId: string, payload: any) {
        let subscriptions: { subscription: webpush.PushSubscription }[] = [];

        try {
            subscriptions = await PushSubscription.find({ userId }).select('subscription');
        } catch {
            const sub = inMemorySubscriptions.find(s => s.userId === userId);
            if (sub) subscriptions = [{ subscription: sub.subscription }];
        }

        if (subscriptions.length === 0) {
            logger.debug(`No subscription found for user ${userId}`);
            return false;
        }

        // Мэдэгдлийн түүхэнд хадгалах
        await this.saveNotificationHistory(userId, payload);

        const notificationPayload = JSON.stringify(payload);

        if (!isConfigured) {
            logger.info(`[MOCK PUSH] To: ${userId}, Data: ${notificationPayload}`);
            return true;
        }

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(sub.subscription, notificationPayload);
                    return true;
                } catch (error) {
                    if ((error as any).statusCode === 410) {
                        await PushSubscription.deleteOne({ subscription: sub.subscription });
                    }
                    return false;
                }
            })
        );

        const sent = results.some(r => r.status === 'fulfilled' && r.value);
        if (sent) logger.info(`Push notification sent to ${userId}`);
        return sent;
    }

    // Бүх хэрэглэгчдэд broadcast
    async broadcast(payload: any) {
        try {
            const allSubs = await PushSubscription.find({});
            const userIds = [...new Set(allSubs.map(s => s.userId))];
            await Promise.all(userIds.map(uid => this.sendToUser(uid, payload)));
        } catch {
            await Promise.all(inMemorySubscriptions.map(sub => this.sendToUser(sub.userId, payload)));
        }
    }

    // Мэдэгдлийн түүх хадгалах
    async saveNotificationHistory(userId: string, payload: any) {
        try {
            await NotificationHistory.create({
                userId,
                title: payload.title || 'Мэдэгдэл',
                body: payload.body || '',
                type: payload.type || 'system',
                data: payload.data,
            });
        } catch {
            logger.debug('Could not save notification history (mock mode?)');
        }
    }

    // Хэрэглэгчийн мэдэгдлийн түүх авах
    async getNotifications(userId: string, limit = 50, offset = 0) {
        try {
            return await NotificationHistory.find({ userId })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit);
        } catch {
            return [];
        }
    }

    // Уншаагүй мэдэгдлийн тоо
    async getUnreadCount(userId: string): Promise<number> {
        try {
            return await NotificationHistory.countDocuments({ userId, isRead: false });
        } catch {
            return 0;
        }
    }

    // Мэдэгдлийг уншсан гэж тэмдэглэх
    async markAsRead(userId: string, notificationIds?: string[]) {
        try {
            const filter: any = { userId };
            if (notificationIds?.length) {
                filter._id = { $in: notificationIds.map(id => new mongoose.Types.ObjectId(id)) };
            }
            await NotificationHistory.updateMany(filter, { $set: { isRead: true } });
        } catch (error) {
            logger.error('Failed to mark notifications as read:', error);
        }
    }

    // Subscription устгах
    async removeSubscription(userId: string, platform?: string) {
        try {
            const filter: any = { userId };
            if (platform) filter.platform = platform;
            await PushSubscription.deleteMany(filter);
        } catch {
            const idx = inMemorySubscriptions.findIndex(s => s.userId === userId);
            if (idx > -1) inMemorySubscriptions.splice(idx, 1);
        }
        logger.info(`Notification subscription removed for user ${userId}`);
    }

    getPublicKey() {
        return publicKey;
    }
}

export const notificationService = new NotificationService();
export { NotificationHistory, PushSubscription };
