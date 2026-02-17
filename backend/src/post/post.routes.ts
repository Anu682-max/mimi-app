/**
 * Post Routes
 * Нийтлэл үүсгэх, унших, like хийх, comment нэмэх
 */

import { Router, Request, Response, NextFunction } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { createError } from '../common/middleware/error.middleware';
import { logger } from '../common/logger';

const router = Router();

// ==================== Models ====================

interface IPost extends Document {
    userId: string;
    content: string;
    photos: string[];
    likes: string[];
    comments: {
        userId: string;
        content: string;
        createdAt: Date;
    }[];
    visibility: 'public' | 'matches_only';
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true, maxlength: 2000 },
    photos: [{ type: String }],
    likes: [{ type: String }],
    comments: [{
        userId: { type: String, required: true },
        content: { type: String, required: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
    }],
    visibility: { type: String, enum: ['public', 'matches_only'], default: 'public' },
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

// Mock хадгалалт (DB байхгүй үед)
const mockPosts: any[] = [];

function isConnected(): boolean {
    return mongoose.connection.readyState === 1;
}

// ==================== Routes ====================

/**
 * POST /posts
 * Шинэ нийтлэл үүсгэх
 */
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { content, photos, visibility } = req.body;

        if (!content || !content.trim()) {
            throw createError('Post content is required', 400, 'CONTENT_REQUIRED');
        }

        if (content.length > 2000) {
            throw createError('Post content too long (max 2000 characters)', 400, 'CONTENT_TOO_LONG');
        }

        const postData = {
            userId,
            content: content.trim(),
            photos: photos || [],
            likes: [],
            comments: [],
            visibility: visibility || 'public',
        };

        let post;

        if (isConnected()) {
            post = await Post.create(postData);
        } else {
            // Mock mode
            post = {
                _id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ...postData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPosts.unshift(post);
        }

        logger.info(`Post created by user ${userId}`);

        res.status(201).json({
            success: true,
            post,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /posts/feed
 * Бүх нийтлэлүүдийг харах (feed)
 */
router.get('/feed', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
        const skip = (page - 1) * limit;

        let posts;
        let total;

        if (isConnected()) {
            total = await Post.countDocuments({ visibility: 'public' });
            posts = await Post.find({ visibility: 'public' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
        } else {
            // Mock mode
            const publicPosts = mockPosts.filter(p => p.visibility === 'public');
            total = publicPosts.length;
            posts = publicPosts.slice(skip, skip + limit);
        }

        res.json({
            success: true,
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /posts/me
 * Миний нийтлэлүүд
 */
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;

        let posts;

        if (isConnected()) {
            posts = await Post.find({ userId }).sort({ createdAt: -1 }).lean();
        } else {
            posts = mockPosts.filter(p => p.userId === userId);
        }

        res.json({ success: true, posts });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /posts/:id
 * Нэг нийтлэл харах
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        let post;

        if (isConnected()) {
            post = await Post.findById(id).lean();
        } else {
            post = mockPosts.find(p => p._id === id);
        }

        if (!post) {
            throw createError('Post not found', 404, 'POST_NOT_FOUND');
        }

        res.json({ success: true, post });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /posts/:id
 * Нийтлэл устгах (зөвхөн эзэмшигч)
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        if (isConnected()) {
            const post = await Post.findOneAndDelete({ _id: id, userId });
            if (!post) {
                throw createError('Post not found or unauthorized', 404, 'POST_NOT_FOUND');
            }
        } else {
            const index = mockPosts.findIndex(p => p._id === id && p.userId === userId);
            if (index === -1) {
                throw createError('Post not found or unauthorized', 404, 'POST_NOT_FOUND');
            }
            mockPosts.splice(index, 1);
        }

        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /posts/:id/like
 * Нийтлэлд like дарах / цуцлах (toggle)
 */
router.post('/:id/like', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        let post: any;
        let liked: boolean;

        if (isConnected()) {
            post = await Post.findById(id);
            if (!post) throw createError('Post not found', 404, 'POST_NOT_FOUND');

            const likeIndex = post.likes.indexOf(userId);
            if (likeIndex === -1) {
                post.likes.push(userId);
                liked = true;
            } else {
                post.likes.splice(likeIndex, 1);
                liked = false;
            }
            await post.save();
        } else {
            post = mockPosts.find(p => p._id === id);
            if (!post) throw createError('Post not found', 404, 'POST_NOT_FOUND');

            const likeIndex = post.likes.indexOf(userId);
            if (likeIndex === -1) {
                post.likes.push(userId);
                liked = true;
            } else {
                post.likes.splice(likeIndex, 1);
                liked = false;
            }
        }

        res.json({
            success: true,
            liked,
            likesCount: post.likes.length,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /posts/:id/comment
 * Нийтлэлд сэтгэгдэл бичих
 */
router.post('/:id/comment', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            throw createError('Comment content is required', 400, 'CONTENT_REQUIRED');
        }

        if (content.length > 500) {
            throw createError('Comment too long (max 500 characters)', 400, 'COMMENT_TOO_LONG');
        }

        const comment = {
            userId,
            content: content.trim(),
            createdAt: new Date(),
        };

        let post: any;

        if (isConnected()) {
            post = await Post.findByIdAndUpdate(
                id,
                { $push: { comments: comment } },
                { new: true }
            );
            if (!post) throw createError('Post not found', 404, 'POST_NOT_FOUND');
        } else {
            post = mockPosts.find(p => p._id === id);
            if (!post) throw createError('Post not found', 404, 'POST_NOT_FOUND');
            post.comments.push(comment);
        }

        res.json({
            success: true,
            comment,
            commentsCount: post.comments.length,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /posts/user/:userId
 * Тухайн хэрэглэгчийн нийтлэлүүд
 */
router.get('/user/:userId', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;

        let posts;

        if (isConnected()) {
            posts = await Post.find({ userId, visibility: 'public' })
                .sort({ createdAt: -1 })
                .lean();
        } else {
            posts = mockPosts.filter(p => p.userId === userId && p.visibility === 'public');
        }

        res.json({ success: true, posts });
    } catch (error) {
        next(error);
    }
});

export default router;
