/**
 * Email Service - Gmail SMTP Integration
 */

import nodemailer from 'nodemailer';

export interface EmailConfig {
    service: string;
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private fromEmail: string;
    private isConfigured: boolean = false;

    constructor() {
        this.fromEmail = process.env.GMAIL_USER || 'noreply@indate.com';
        this.initialize();
    }

    private initialize() {
        const gmailUser = process.env.GMAIL_USER;
        const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

        if (!gmailUser || !gmailAppPassword) {
            console.warn('Gmail credentials not configured. Email service disabled.');
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: gmailUser,
                    pass: gmailAppPassword, // Use App Password, not regular password
                },
            });

            this.isConfigured = true;
            console.log('✅ Email service configured successfully');
        } catch (error) {
            console.error('❌ Failed to configure email service:', error);
        }
    }

    /**
     * Send email
     */
    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.isConfigured || !this.transporter) {
            console.warn('Email service not configured. Skipping email send.');
            return false;
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"InDate" <${this.fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || this.stripHtml(options.html),
            });

            console.log('✅ Email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Email send failed:', error);
            return false;
        }
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💕 Welcome to InDate!</h1>
        </div>
        <div class="content">
            <h2>Hi ${name}! 👋</h2>
            <p>Welcome to InDate - where meaningful connections happen!</p>
            <p>We're excited to have you on board. Here's what you can do:</p>
            <ul>
                <li>✨ Complete your profile to attract matches</li>
                <li>💬 Start conversations with your matches</li>
                <li>🎯 Discover people who share your interests</li>
                <li>🔔 Get notified about new matches</li>
            </ul>
            <center>
                <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
            </center>
            <p>Happy dating! 💘</p>
        </div>
        <div class="footer">
            <p>© 2025 InDate. All rights reserved.</p>
            <p>You're receiving this because you signed up for InDate.</p>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendEmail({
            to,
            subject: '💕 Welcome to InDate!',
            html,
        });
    }

    /**
     * Send new match notification
     */
    async sendMatchNotification(to: string, userName: string, matchName: string): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 It's a Match!</h1>
        </div>
        <div class="content">
            <h2>Hi ${userName}! 💕</h2>
            <p>You have a new match with <strong>${matchName}</strong>!</p>
            <p>Why not break the ice and send them a message?</p>
            <center>
                <a href="http://localhost:3000/chat" class="button">Start Chatting</a>
            </center>
            <p>Good luck! 💘</p>
        </div>
        <div class="footer">
            <p>© 2025 InDate. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendEmail({
            to,
            subject: '🎉 You have a new match on InDate!',
            html,
        });
    }

    /**
     * Send message notification
     */
    async sendMessageNotification(to: string, userName: string, senderName: string, messagePreview: string): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px 20px; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 New Message!</h1>
        </div>
        <div class="content">
            <h2>Hi ${userName}!</h2>
            <p><strong>${senderName}</strong> sent you a message:</p>
            <div class="message-box">
                <p><em>"${messagePreview}"</em></p>
            </div>
            <center>
                <a href="http://localhost:3000/chat" class="button">Reply Now</a>
            </center>
        </div>
        <div class="footer">
            <p>© 2025 InDate. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendEmail({
            to,
            subject: `💬 ${senderName} sent you a message on InDate`,
            html,
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Reset Your Password</h1>
        </div>
        <div class="content">
            <p>You requested to reset your password.</p>
            <p>Click the button below to reset your password:</p>
            <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </div>
        </div>
        <div class="footer">
            <p>© 2025 InDate. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;

        return this.sendEmail({
            to,
            subject: '🔐 Reset Your InDate Password',
            html,
        });
    }

    /**
     * Strip HTML tags from text
     */
    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>/g, '');
    }

    /**
     * Verify email configuration
     */
    async verifyConnection(): Promise<boolean> {
        if (!this.transporter) return false;

        try {
            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return true;
        } catch (error) {
            console.error('❌ Email service verification failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export const emailService = new EmailService();
