/**
 * Block & Report Routes
 * Хэрэглэгч блоклох, мэдэгдэл (report) илгээх систем
 */

import { Router, Request, Response, NextFunction } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { createError } from '../common/middleware/error.middleware';
import { logger } from '../common/logger';

const router = Router();

// Block модель
interface IBlock extends Document {
    blockerId: mongoose.Types.ObjectId;
    blockedId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const blockSchema = new Schema<IBlock>({
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockedId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
blockSchema.index({ blockerId: 1 });

const Block = mongoose.model<IBlock>('Block', blockSchema);

// Report модель
interface IReport extends Document {
    reporterId: mongoose.Types.ObjectId;
    reportedId: mongoose.Types.ObjectId;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    adminNote?: string;
    createdAt: Date;
}

const reportSchema = new Schema<IReport>({
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportedId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
        type: String,
        enum: ['spam', 'harassment', 'fake_profile', 'inappropriate_content', 'scam', 'underage', 'other'],
        required: true,
    },
    description: { type: String, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
    adminNote: String,
}, { timestamps: true });

reportSchema.index({ reporterId: 1, reportedId: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model<IReport>('Report', reportSchema);

/**
 * POST /block-report/block/:userId
 * Хэрэглэгч блоклох
 */
router.post('/block/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = (req as any).userId;
        const targetUserId = req.params.userId;

        if (currentUserId === targetUserId) {
            throw createError('Cannot block yourself', 400, 'INVALID_ACTION');
        }

        await Block.findOneAndUpdate(
            { blockerId: currentUserId, blockedId: targetUserId },
            { blockerId: currentUserId, blockedId: targetUserId },
            { upsert: true }
        );

        logger.info(`User ${currentUserId} blocked ${targetUserId}`);
        res.json({ status: 'success', message: 'User blocked' });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /block-report/block/:userId
 * Блок арилгах
 */
router.delete('/block/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = (req as any).userId;
        const targetUserId = req.params.userId;

        await Block.findOneAndDelete({ blockerId: currentUserId, blockedId: targetUserId });

        logger.info(`User ${currentUserId} unblocked ${targetUserId}`);
        res.json({ status: 'success', message: 'User unblocked' });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /block-report/blocked
 * Блоклосон хэрэглэгчдийн жагсаалт
 */
router.get('/blocked', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = (req as any).userId;

        const blocks = await Block.find({ blockerId: currentUserId })
            .populate('blockedId', 'firstName photos')
            .sort({ createdAt: -1 });

        res.json({
            blockedUsers: blocks.map(b => ({
                id: (b.blockedId as any)?._id,
                firstName: (b.blockedId as any)?.firstName,
                photos: (b.blockedId as any)?.photos,
                blockedAt: b.createdAt,
            })),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /block-report/is-blocked/:userId
 * Тухайн хэрэглэгч блоклогдсон эсэх
 */
router.get('/is-blocked/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = (req as any).userId;
        const targetUserId = req.params.userId;

        const block = await Block.findOne({
            $or: [
                { blockerId: currentUserId, blockedId: targetUserId },
                { blockerId: targetUserId, blockedId: currentUserId },
            ]
        });

        res.json({ isBlocked: !!block });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /block-report/report/:userId
 * Хэрэглэгчийг мэдэгдэх (report)
 */
router.post('/report/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reporterId = (req as any).userId;
        const reportedId = req.params.userId;
        const { reason, description } = req.body;

        if (reporterId === reportedId) {
            throw createError('Cannot report yourself', 400, 'INVALID_ACTION');
        }

        if (!reason) {
            throw createError('Reason is required', 400, 'REASON_REQUIRED');
        }

        const report = await Report.create({
            reporterId,
            reportedId,
            reason,
            description,
        });

        logger.info(`User ${reporterId} reported ${reportedId} for ${reason}`);
        res.status(201).json({ status: 'success', reportId: report._id });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /block-report/reports (admin)
 * Бүх report-ийн жагсаалт
 */
router.get('/reports', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string || 'pending';
        const limit = parseInt(req.query.limit as string) || 50;

        const reports = await Report.find({ status })
            .populate('reporterId', 'firstName email')
            .populate('reportedId', 'firstName email photos')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({ reports });
    } catch (error) {
        next(error);
    }
});

// Блоклосон хэрэглэгчийн ID-г авах helper
export async function getBlockedUserIds(userId: string): Promise<string[]> {
    try {
        const blocks = await Block.find({
            $or: [{ blockerId: userId }, { blockedId: userId }]
        });

        return blocks.map(b => {
            const blockerId = b.blockerId.toString();
            const blockedId = b.blockedId.toString();
            return blockerId === userId ? blockedId : blockerId;
        });
    } catch {
        return [];
    }
}

export { Block, Report };
export default router;
