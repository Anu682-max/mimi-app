/**
 * Vercel Serverless API Entry Point
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { config } from '../config';
import { preloadTranslations } from '../common/i18n';
import { authRouter } from '../auth/auth.routes';
import { userRouter } from '../user/user.routes';
import { matchRouter } from '../matching/match.routes';
import { chatRouter } from '../chat/chat.routes';
import { localeMiddleware } from '../common/middleware/locale.middleware';
import { errorHandler } from '../common/middleware/error.middleware';

// Preload translations
preloadTranslations();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(localeMiddleware);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        region: config.region,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/users`, userRouter);
app.use(`${apiPrefix}/matches`, matchRouter);
app.use(`${apiPrefix}/chat`, chatRouter);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
    });
});

// Error handler
app.use(errorHandler);

// Export for Vercel
export default app;
