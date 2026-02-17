/**
 * Email Verification Service
 * Имэйл баталгаажуулалт - токен үүсгэх, шалгах
 */

import crypto from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';
import { emailService } from '../services/email.service';
import { logger } from '../common/logger';

// Баталгаажуулалтын токен модель
interface IVerificationToken extends Document {
    userId: string;
    email: string;
    token: string;
    type: 'email_verify' | 'password_reset';
    expiresAt: Date;
    createdAt: Date;
}

const verificationTokenSchema = new Schema<IVerificationToken>({
    userId: { type: String, required: true },
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    type: { type: String, enum: ['email_verify', 'password_reset'], required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

verificationTokenSchema.index({ token: 1 });
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

const VerificationToken = mongoose.model<IVerificationToken>('VerificationToken', verificationTokenSchema);

// In-memory fallback (mock mode)
const mockTokens = new Map<string, IVerificationToken>();

/**
 * Баталгаажуулалтын токен үүсгэх
 */
export async function createVerificationToken(
    userId: string,
    email: string,
    type: 'email_verify' | 'password_reset'
): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + (type === 'email_verify' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000));

    try {
        // Хуучин токенуудыг устгах
        await VerificationToken.deleteMany({ userId, type });

        await VerificationToken.create({ userId, email, token, type, expiresAt });
    } catch {
        // Mock mode
        mockTokens.set(token, { userId, email, token, type, expiresAt } as any);
    }

    return token;
}

/**
 * Токен шалгах
 */
export async function verifyToken(
    token: string,
    type: 'email_verify' | 'password_reset'
): Promise<{ userId: string; email: string } | null> {
    try {
        const record = await VerificationToken.findOne({
            token,
            type,
            expiresAt: { $gt: new Date() },
        });

        if (record) {
            await VerificationToken.deleteOne({ _id: record._id });
            return { userId: record.userId, email: record.email };
        }
    } catch {
        // Mock mode
        const record = mockTokens.get(token);
        if (record && record.type === type && new Date(record.expiresAt) > new Date()) {
            mockTokens.delete(token);
            return { userId: record.userId, email: record.email };
        }
    }

    return null;
}

/**
 * Email баталгаажуулалтын мэйл илгээх
 */
export async function sendVerificationEmail(email: string, userId: string, firstName: string): Promise<boolean> {
    const token = await createVerificationToken(userId, email, 'email_verify');
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

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
        .code { font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Имэйл баталгаажуулалт</h1>
        </div>
        <div class="content">
            <h2>Сайн байна уу ${firstName}!</h2>
            <p>mimi-д бүртгүүлсэнд баярлалаа. Имэйлээ баталгаажуулна уу:</p>
            <center>
                <a href="${verifyUrl}" class="button">Имэйл баталгаажуулах</a>
            </center>
            <p>Энэ линк 24 цагийн дотор хүчинтэй.</p>
            <p>Хэрэв та бүртгүүлээгүй бол энэ имэйлийг үл тоомсорлоно уу.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 mimi. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const sent = await emailService.sendEmail({
        to: email,
        subject: 'mimi - Имэйл баталгаажуулалт',
        html,
    });

    if (!sent) {
        logger.info(`[MOCK] Verification email for ${email}: ${verifyUrl}`);
        logger.info(`[MOCK] Token: ${token}`);
    }

    return true;
}

/**
 * Нууц үг сэргээх мэйл илгээх
 */
export async function sendPasswordResetEmail(email: string, userId: string): Promise<boolean> {
    const token = await createVerificationToken(userId, email, 'password_reset');
    return emailService.sendPasswordResetEmail(email, token);
}

export { VerificationToken };
