/**
 * Notification Controller
 * Push subscription, мэдэгдлийн түүх, mark as read
 */

import { Request, Response } from 'express';
import { notificationService } from './notification.service';

// Push notification-д бүртгүүлэх
export const subscribe = async (req: Request, res: Response) => {
    const subscription = req.body;
    const userId = (req as any).userId || 'anonymous';
    const platform = req.body.platform || 'web';

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ status: 'error', message: 'Invalid subscription' });
    }

    await notificationService.addSubscription(userId, subscription, platform);
    res.status(201).json({ status: 'success', message: 'Subscribed to notifications' });
};

// Push notification-оос гарах
export const unsubscribe = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const platform = req.body.platform;

    await notificationService.removeSubscription(userId, platform);
    res.json({ status: 'success', message: 'Unsubscribed from notifications' });
};

// Тест мэдэгдэл илгээх (admin)
export const sendTest = async (req: Request, res: Response) => {
    const { userId, title, body } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'UserId required' });
    }

    const payload = {
        title: title || 'Test Notification',
        body: body || 'This is a test notification from mimi',
        url: '/'
    };

    const success = await notificationService.sendToUser(userId, payload);
    res.json({ success });
};

// VAPID public key авах
export const getPublicKey = (req: Request, res: Response) => {
    const key = notificationService.getPublicKey();
    res.json({ publicKey: key });
};

// Мэдэгдлийн түүх авах
export const getNotifications = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await notificationService.getNotifications(userId, limit, offset);
    res.json({ notifications });
};

// Уншаагүй мэдэгдлийн тоо
export const getUnreadCount = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ unreadCount: count });
};

// Мэдэгдлийг уншсан гэж тэмдэглэх
export const markAsRead = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { notificationIds } = req.body;

    await notificationService.markAsRead(userId, notificationIds);
    res.json({ status: 'success' });
};
