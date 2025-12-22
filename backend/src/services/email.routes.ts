/**
 * Email Routes - Email notification endpoints
 */

import { Router, Request, Response } from 'express';
import { emailService } from '../services/email.service';

const router = Router();

/**
 * POST /api/v1/email/test
 * Send test email
 */
router.post('/test', async (req: Request, res: Response) => {
    try {
        const { to, name = 'User' } = req.body;

        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required',
            });
        }

        const sent = await emailService.sendWelcomeEmail(to, name);

        if (sent) {
            res.json({
                success: true,
                message: 'Test email sent successfully',
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send test email. Email service may not be configured.',
            });
        }
    } catch (error: any) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message,
        });
    }
});

/**
 * POST /api/v1/email/welcome
 * Send welcome email
 */
router.post('/welcome', async (req: Request, res: Response) => {
    try {
        const { to, name } = req.body;

        if (!to || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email and name are required',
            });
        }

        const sent = await emailService.sendWelcomeEmail(to, name);

        res.json({
            success: sent,
            message: sent ? 'Welcome email sent' : 'Failed to send welcome email',
        });
    } catch (error: any) {
        console.error('Welcome email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send welcome email',
            error: error.message,
        });
    }
});

/**
 * POST /api/v1/email/match-notification
 * Send new match notification
 */
router.post('/match-notification', async (req: Request, res: Response) => {
    try {
        const { to, userName, matchName } = req.body;

        if (!to || !userName || !matchName) {
            return res.status(400).json({
                success: false,
                message: 'Email, userName, and matchName are required',
            });
        }

        const sent = await emailService.sendMatchNotification(to, userName, matchName);

        res.json({
            success: sent,
            message: sent ? 'Match notification sent' : 'Failed to send notification',
        });
    } catch (error: any) {
        console.error('Match notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send match notification',
            error: error.message,
        });
    }
});

/**
 * POST /api/v1/email/message-notification
 * Send new message notification
 */
router.post('/message-notification', async (req: Request, res: Response) => {
    try {
        const { to, userName, senderName, messagePreview } = req.body;

        if (!to || !userName || !senderName || !messagePreview) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const sent = await emailService.sendMessageNotification(
            to,
            userName,
            senderName,
            messagePreview
        );

        res.json({
            success: sent,
            message: sent ? 'Message notification sent' : 'Failed to send notification',
        });
    } catch (error: any) {
        console.error('Message notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message notification',
            error: error.message,
        });
    }
});

/**
 * POST /api/v1/email/password-reset
 * Send password reset email
 */
router.post('/password-reset', async (req: Request, res: Response) => {
    try {
        const { to, resetToken } = req.body;

        if (!to || !resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Email and reset token are required',
            });
        }

        const sent = await emailService.sendPasswordResetEmail(to, resetToken);

        res.json({
            success: sent,
            message: sent ? 'Password reset email sent' : 'Failed to send email',
        });
    } catch (error: any) {
        console.error('Password reset email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send password reset email',
            error: error.message,
        });
    }
});

/**
 * GET /api/v1/email/verify
 * Verify email service configuration
 */
router.get('/verify', async (_req: Request, res: Response) => {
    try {
        const verified = await emailService.verifyConnection();

        res.json({
            success: verified,
            message: verified
                ? 'Email service is configured and working'
                : 'Email service is not configured or connection failed',
        });
    } catch (error: any) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email service',
            error: error.message,
        });
    }
});

export default router;
