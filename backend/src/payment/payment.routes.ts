/**
 * Payment Routes
 * Stripe төлбөр, Premium subscription, Coins систем
 */

import { Router, Request, Response, NextFunction } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import { authMiddleware } from '../common/middleware/auth.middleware';
import { createError } from '../common/middleware/error.middleware';
import { logger } from '../common/logger';

const router = Router();

// Premium plan-ууд
const PLANS = {
    basic: { price: 0, features: ['5_likes_per_day', 'basic_chat'] },
    gold: { price: 999, features: ['unlimited_likes', 'see_who_likes', 'chat_translation', 'super_like_5'] },
    platinum: { price: 1999, features: ['unlimited_likes', 'see_who_likes', 'chat_translation', 'super_like_unlimited', 'priority_profile', 'video_call'] },
};

// Coin багцууд
const COIN_PACKAGES = [
    { id: 'coins_100', amount: 100, price: 199, bonus: 0 },
    { id: 'coins_500', amount: 500, price: 799, bonus: 50 },
    { id: 'coins_1000', amount: 1000, price: 1499, bonus: 150 },
];

// Subscription модель
interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    plan: 'basic' | 'gold' | 'platinum';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status: 'active' | 'canceled' | 'expired' | 'past_due';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    coins: number;
    superLikesRemaining: number;
    createdAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['basic', 'gold', 'platinum'], default: 'basic' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    status: { type: String, enum: ['active', 'canceled', 'expired', 'past_due'], default: 'active' },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    coins: { type: Number, default: 0 },
    superLikesRemaining: { type: Number, default: 0 },
}, { timestamps: true });

const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);

// Транзакцийн түүх
interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'subscription' | 'coins' | 'super_like' | 'boost';
    amount: number; // Центээр
    currency: string;
    stripePaymentIntentId?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    description: string;
    createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['subscription', 'coins', 'super_like', 'boost'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    stripePaymentIntentId: String,
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    description: String,
}, { timestamps: true });

transactionSchema.index({ userId: 1, createdAt: -1 });

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

/**
 * GET /payments/plans
 * Бүх plan жагсаалт авах
 */
router.get('/plans', (_req: Request, res: Response) => {
    res.json({ plans: PLANS, coinPackages: COIN_PACKAGES });
});

/**
 * GET /payments/subscription
 * Одоогийн subscription мэдээлэл авах
 */
router.get('/subscription', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;

        let subscription = await Subscription.findOne({ userId });
        if (!subscription) {
            // Анхны basic plan үүсгэх
            subscription = await Subscription.create({ userId, plan: 'basic' });
        }

        res.json({
            plan: subscription.plan,
            status: subscription.status,
            coins: subscription.coins,
            superLikesRemaining: subscription.superLikesRemaining,
            currentPeriodEnd: subscription.currentPeriodEnd,
            features: PLANS[subscription.plan]?.features || [],
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /payments/subscribe
 * Premium plan-д бүртгүүлэх
 * Stripe тохиргоо хийгдээгүй тохиолдолд mock mode ажиллана
 */
router.post('/subscribe', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { plan } = req.body;

        if (!plan || !['gold', 'platinum'].includes(plan)) {
            throw createError('Invalid plan', 400, 'INVALID_PLAN');
        }

        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

        if (stripeSecretKey) {
            // Stripe ашиглах (production)
            // TODO: Stripe Checkout Session үүсгэх
            // const stripe = require('stripe')(stripeSecretKey);
            // const session = await stripe.checkout.sessions.create({...});
            // return res.json({ sessionUrl: session.url });

            return res.status(501).json({
                message: 'Stripe integration pending. Use mock mode for testing.',
                hint: 'Set STRIPE_SECRET_KEY in .env to enable real payments.',
            });
        }

        // Mock mode - шууд subscription үүсгэх (тест зорилгоор)
        const subscription = await Subscription.findOneAndUpdate(
            { userId },
            {
                userId,
                plan,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                superLikesRemaining: plan === 'platinum' ? 999 : 5,
            },
            { upsert: true, new: true }
        );

        await Transaction.create({
            userId,
            type: 'subscription',
            amount: PLANS[plan as keyof typeof PLANS].price,
            status: 'completed',
            description: `${plan} plan subscription (mock)`,
        });

        logger.info(`User ${userId} subscribed to ${plan} (mock mode)`);

        res.json({
            status: 'success',
            plan: subscription.plan,
            features: PLANS[plan as keyof typeof PLANS].features,
            message: `Successfully subscribed to ${plan} plan!`,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /payments/cancel
 * Subscription цуцлах
 */
router.post('/cancel', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;

        const subscription = await Subscription.findOneAndUpdate(
            { userId },
            { status: 'canceled', plan: 'basic', superLikesRemaining: 0 },
            { new: true }
        );

        if (!subscription) {
            throw createError('No subscription found', 404, 'NOT_FOUND');
        }

        logger.info(`User ${userId} canceled subscription`);
        res.json({ status: 'success', message: 'Subscription canceled' });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /payments/buy-coins
 * Coin худалдаж авах
 */
router.post('/buy-coins', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { packageId } = req.body;

        const coinPackage = COIN_PACKAGES.find(p => p.id === packageId);
        if (!coinPackage) {
            throw createError('Invalid coin package', 400, 'INVALID_PACKAGE');
        }

        const totalCoins = coinPackage.amount + coinPackage.bonus;

        // Mock mode - шууд coin нэмэх
        const subscription = await Subscription.findOneAndUpdate(
            { userId },
            { $inc: { coins: totalCoins } },
            { upsert: true, new: true }
        );

        await Transaction.create({
            userId,
            type: 'coins',
            amount: coinPackage.price,
            status: 'completed',
            description: `Purchased ${totalCoins} coins (mock)`,
        });

        logger.info(`User ${userId} purchased ${totalCoins} coins`);

        res.json({
            status: 'success',
            coinsAdded: totalCoins,
            totalCoins: subscription.coins,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /payments/use-super-like
 * Super like ашиглах
 */
router.post('/use-super-like', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;

        const subscription = await Subscription.findOne({ userId });
        if (!subscription || subscription.superLikesRemaining <= 0) {
            throw createError('No super likes remaining', 400, 'NO_SUPER_LIKES');
        }

        subscription.superLikesRemaining--;
        await subscription.save();

        res.json({
            status: 'success',
            superLikesRemaining: subscription.superLikesRemaining,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /payments/use-coins
 * Coin ашиглах (boost, gift гм)
 */
router.post('/use-coins', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const { amount, purpose } = req.body;

        if (!amount || amount <= 0) {
            throw createError('Invalid amount', 400, 'INVALID_AMOUNT');
        }

        const subscription = await Subscription.findOne({ userId });
        if (!subscription || subscription.coins < amount) {
            throw createError('Insufficient coins', 400, 'INSUFFICIENT_COINS');
        }

        subscription.coins -= amount;
        await subscription.save();

        await Transaction.create({
            userId,
            type: 'boost',
            amount: 0,
            status: 'completed',
            description: `Used ${amount} coins for ${purpose || 'boost'}`,
        });

        res.json({
            status: 'success',
            coinsUsed: amount,
            remainingCoins: subscription.coins,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /payments/transactions
 * Транзакцийн түүх
 */
router.get('/transactions', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        const limit = parseInt(req.query.limit as string) || 50;

        const transactions = await Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({ transactions });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /payments/webhook
 * Stripe webhook (production-д ашиглагдана)
 */
router.post('/webhook', async (req: Request, res: Response) => {
    // Stripe webhook handler
    // TODO: Stripe webhook signature шалгах, event боловсруулах
    logger.info('Stripe webhook received (not configured)');
    res.json({ received: true });
});

export { Subscription, Transaction };
export default router;
