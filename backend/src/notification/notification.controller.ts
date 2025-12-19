import { Request, Response } from 'express';
import { notificationService } from './notification.service';

export const subscribe = (req: Request, res: Response) => {
    const subscription = req.body;
    // Assuming auth middleware populates req.user
    const userId = (req as any).user?.id || 'anonymous'; // Fallback for testing

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ status: 'error', message: 'Invalid subscription' });
    }

    notificationService.addSubscription(userId, subscription);
    res.status(201).json({ status: 'success', message: 'Subscribed to notifications' });
};

export const sendTest = async (req: Request, res: Response) => {
    const { userId, title, body } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'UserId required' });
    }

    const payload = {
        title: title || 'Test Notification',
        body: body || 'This is a test notification from InDate',
        url: '/'
    };

    const success = await notificationService.sendToUser(userId, payload);
    res.json({ success });
};

export const getPublicKey = (req: Request, res: Response) => {
    const key = notificationService.getPublicKey();
    res.json({ publicKey: key });
};
