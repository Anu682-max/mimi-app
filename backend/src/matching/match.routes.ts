/**
 * Match Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { userRepository } from '../user/user.repository';
import { chatService } from '../chat/chat.service';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { createError } from '../common/middleware/error.middleware';
import { t } from '../common/i18n';
import { config, getRegionConfig } from '../config';
import { logger } from '../common/logger';

export const matchRouter: Router = Router();

// Match model (inline for brevity)
const matchSchema = new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: [{
        userId: mongoose.Schema.Types.ObjectId,
        createdAt: { type: Date, default: Date.now },
    }],
    isMatch: { type: Boolean, default: false },
    matchedAt: Date,
    region: String,
    aiScore: Number,
}, { timestamps: true });

matchSchema.index({ users: 1 });
matchSchema.index({ region: 1, isMatch: 1 });

const Match = mongoose.model('Match', matchSchema);

/**
 * GET /matches/discover
 * Get profiles to swipe on
 */
matchRouter.get('/discover', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const user = await userRepository.getById(userId);

        if (!user) {
            throw createError('User not found', 404, 'NOT_FOUND');
        }

        // Get users already liked/passed
        const existingMatches = await Match.find({
            users: user._id,
        }).select('users');

        const excludeIds = existingMatches
            .flatMap(m => m.users)
            .map(id => id.toString())
            .concat(userId);

        // Get region config for defaults
        const regionConfig = getRegionConfig(user.region);

        // Find nearby users
        const profiles = await userRepository.findNearby({
            latitude: user.location.coordinates[1],
            longitude: user.location.coordinates[0],
            maxDistanceKm: user.preferences.maxDistance || regionConfig?.rules.defaultSearchRadius || 50,
            gender: user.preferences.showMe,
            ageRange: user.preferences.ageRange,
            excludeUserIds: excludeIds,
            region: user.region,
            limit: 20,
        });

        res.json({
            profiles: profiles.map(p => ({
                id: p._id,
                firstName: p.firstName,
                age: p.age,
                bio: p.bio,
                photos: p.photos,
                isVerified: p.isVerified,
                locale: p.locale,
                // Calculate distance
                distance: calculateDistance(
                    user.location.coordinates[1],
                    user.location.coordinates[0],
                    p.location.coordinates[1],
                    p.location.coordinates[0]
                ),
            })),
            count: profiles.length,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /matches/like/:userId
 * Like a user
 */
matchRouter.post('/like/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = (req as any).userId;
        const targetUserId = req.params.userId;
        const locale = req.locale;

        if (currentUserId === targetUserId) {
            throw createError('Cannot like yourself', 400, 'INVALID_ACTION');
        }

        const currentUser = await userRepository.getById(currentUserId);
        const targetUser = await userRepository.getById(targetUserId);

        if (!targetUser) {
            throw createError('User not found', 404, 'NOT_FOUND');
        }

        // Find or create match record
        let match = await Match.findOne({
            users: { $all: [currentUserId, targetUserId] },
        });

        if (!match) {
            match = new Match({
                users: [currentUserId, targetUserId],
                likes: [],
                region: currentUser?.region,
            });
        }

        // Add like
        const alreadyLiked = match.likes.some(l => l.userId?.toString() === currentUserId);
        if (!alreadyLiked) {
            match.likes.push({ userId: new mongoose.Types.ObjectId(currentUserId) });
        }

        // Check if it's a match (both users liked each other)
        const isMatch = match.likes.length === 2;
        if (isMatch && !match.isMatch) {
            match.isMatch = true;
            match.matchedAt = new Date();

            // Create conversation
            await chatService.createConversation(
                match._id.toString(),
                [currentUserId, targetUserId]
            );

            logger.info(`New match between ${currentUserId} and ${targetUserId}`);
        }

        await match.save();

        if (isMatch) {
            res.json({
                isMatch: true,
                message: t('matching.its_a_match', locale),
                matchedUser: {
                    id: targetUser._id,
                    firstName: targetUser.firstName,
                    photos: targetUser.photos,
                },
            });
        } else {
            res.json({
                isMatch: false,
                message: t('matching.you_liked', locale, { name: targetUser.firstName }),
            });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST /matches/pass/:userId
 * Pass on a user
 */
matchRouter.post('/pass/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUserId = (req as any).userId;
        const targetUserId = req.params.userId;

        // Create a record to track the pass (so we don't show this user again)
        let match = await Match.findOne({
            users: { $all: [currentUserId, targetUserId] },
        });

        if (!match) {
            const currentUser = await userRepository.getById(currentUserId);
            match = new Match({
                users: [currentUserId, targetUserId],
                likes: [],
                region: currentUser?.region,
            });
            await match.save();
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /matches
 * Get all matches for current user
 */
matchRouter.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;

        const matches = await Match.find({
            users: userId,
            isMatch: true,
        })
            .populate('users', 'firstName photos locale isVerified')
            .sort({ matchedAt: -1 });

        res.json({
            matches: matches.map(m => {
                const otherUser = m.users.find((u: any) => u._id.toString() !== userId);
                return {
                    matchId: m._id,
                    matchedAt: m.matchedAt,
                    user: otherUser,
                };
            }),
            count: matches.length,
        });
    } catch (error) {
        next(error);
    }
});

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

export default matchRouter;
