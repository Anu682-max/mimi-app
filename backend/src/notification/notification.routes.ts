/**
 * Notification Routes
 * Push мэдэгдэл бүртгэх, мэдэгдлийн түүх, unsubscribe
 */

import { Router } from 'express';
import { subscribe, unsubscribe, sendTest, getPublicKey, getNotifications, markAsRead, getUnreadCount } from './notification.controller';
import { authMiddleware } from '../common/middleware/auth.middleware';

const router = Router();

// Нийтийн endpoint - VAPID public key авах
router.get('/vapid-key', getPublicKey);

// Auth шаардсан endpoint-ууд
router.post('/subscribe', authMiddleware, subscribe);
router.post('/unsubscribe', authMiddleware, unsubscribe);
router.get('/history', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.post('/mark-read', authMiddleware, markAsRead);

// Admin зөвхөн - тест мэдэгдэл илгээх
router.post('/send', sendTest);

export default router;
