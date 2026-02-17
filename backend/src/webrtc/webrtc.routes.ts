/**
 * WebRTC Signaling Routes
 * Видео/дуут дуудлагын signaling серверийн route-ууд
 */

import { Router, Request, Response, NextFunction } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { createError } from '../common/middleware/error.middleware';
import { socketService } from '../socket/socket.service';
import { logger } from '../common/logger';

const router = Router();

// Дуудлагын түүхийн модель
interface ICallHistory extends Document {
    callerId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    type: 'voice' | 'video';
    status: 'initiated' | 'ringing' | 'answered' | 'ended' | 'missed' | 'rejected' | 'busy';
    startedAt?: Date;
    endedAt?: Date;
    duration?: number; // секундээр
    createdAt: Date;
}

const callHistorySchema = new Schema<ICallHistory>({
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['voice', 'video'], required: true },
    status: {
        type: String,
        enum: ['initiated', 'ringing', 'answered', 'ended', 'missed', 'rejected', 'busy'],
        default: 'initiated',
    },
    startedAt: Date,
    endedAt: Date,
    duration: Number,
}, { timestamps: true });

callHistorySchema.index({ callerId: 1, createdAt: -1 });
callHistorySchema.index({ receiverId: 1, createdAt: -1 });

const CallHistory = mongoose.model<ICallHistory>('CallHistory', callHistorySchema);

// Идэвхтэй дуудлагуудыг санах ойд хадгалах
const activeCalls = new Map<string, {
    callId: string;
    callerId: string;
    receiverId: string;
    type: 'voice' | 'video';
    startedAt: Date;
}>();

/**
 * POST /webrtc/call
 * Дуудлага эхлүүлэх
 */
router.post('/call', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const callerId = (req as any).userId;
        const { receiverId, type, offer } = req.body;

        if (!receiverId || !type) {
            throw createError('receiverId and type are required', 400, 'MISSING_FIELDS');
        }

        if (!['voice', 'video'].includes(type)) {
            throw createError('Type must be voice or video', 400, 'INVALID_TYPE');
        }

        // Дуудлагын түүхэнд хадгалах
        let callRecord;
        try {
            callRecord = await CallHistory.create({
                callerId,
                receiverId,
                type,
                status: 'initiated',
            });
        } catch {
            // Mock mode-д in-memory ашиглана
            callRecord = { _id: `call-${Date.now()}`, callerId, receiverId, type };
        }

        const callId = callRecord._id.toString();

        // Идэвхтэй дуудлагад нэмэх
        activeCalls.set(callId, {
            callId,
            callerId,
            receiverId,
            type,
            startedAt: new Date(),
        });

        // Хүлээн авагчид socket-ээр мэдэгдэх
        socketService.emitToUser(receiverId, 'incoming_call', {
            callId,
            callerId,
            type,
            offer,
        });

        logger.info(`Call initiated: ${callerId} -> ${receiverId} (${type})`);

        res.json({ callId, status: 'initiated' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /webrtc/answer
 * Дуудлагад хариулах
 */
router.post('/answer', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { callId, answer } = req.body;

        const call = activeCalls.get(callId);
        if (!call) {
            throw createError('Call not found or expired', 404, 'CALL_NOT_FOUND');
        }

        if (call.receiverId !== userId) {
            throw createError('Not authorized for this call', 403, 'FORBIDDEN');
        }

        // Статус шинэчлэх
        try {
            await CallHistory.findByIdAndUpdate(callId, {
                status: 'answered',
                startedAt: new Date(),
            });
        } catch { /* mock mode */ }

        // Дуудагч руу answer илгээх
        socketService.emitToUser(call.callerId, 'call_answered', {
            callId,
            answer,
        });

        logger.info(`Call answered: ${callId}`);
        res.json({ status: 'answered' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /webrtc/ice-candidate
 * ICE candidate дамжуулах
 */
router.post('/ice-candidate', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { callId, candidate } = req.body;

        const call = activeCalls.get(callId);
        if (!call) {
            throw createError('Call not found', 404, 'CALL_NOT_FOUND');
        }

        // Нөгөө тал руу ICE candidate дамжуулах
        const targetId = call.callerId === userId ? call.receiverId : call.callerId;
        socketService.emitToUser(targetId, 'ice_candidate', { callId, candidate });

        res.json({ status: 'ok' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /webrtc/end
 * Дуудлага дуусгах
 */
router.post('/end', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { callId, reason } = req.body;

        const call = activeCalls.get(callId);
        if (!call) {
            return res.json({ status: 'ok' }); // Аль хэдийн дууссан
        }

        // Хугацаа тооцоолох
        const duration = Math.round((Date.now() - call.startedAt.getTime()) / 1000);
        const status = reason === 'rejected' ? 'rejected' :
                       reason === 'missed' ? 'missed' :
                       reason === 'busy' ? 'busy' : 'ended';

        // DB шинэчлэх
        try {
            await CallHistory.findByIdAndUpdate(callId, {
                status,
                endedAt: new Date(),
                duration,
            });
        } catch { /* mock mode */ }

        // Нөгөө тал руу мэдэгдэх
        const targetId = call.callerId === userId ? call.receiverId : call.callerId;
        socketService.emitToUser(targetId, 'call_ended', { callId, reason, duration });

        // Идэвхтэй дуудлагуудаас устгах
        activeCalls.delete(callId);

        logger.info(`Call ended: ${callId} (${status}, ${duration}s)`);
        res.json({ status: 'ended', duration });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /webrtc/history
 * Дуудлагын түүх
 */
router.get('/history', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const limit = parseInt(req.query.limit as string) || 50;

        const calls = await CallHistory.find({
            $or: [{ callerId: userId }, { receiverId: userId }]
        })
            .populate('callerId', 'firstName photos')
            .populate('receiverId', 'firstName photos')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({ calls });
    } catch (error) {
        next(error);
    }
});

export { CallHistory };
export default router;
