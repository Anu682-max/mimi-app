/**
 * InDate Backend - Main Entry Point
 * 
 * AI-powered dating app with multi-region internationalization
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { config } from './config';
import { logger } from './common/logger';
import { preloadTranslations } from './common/i18n';
import { authRouter } from './auth/auth.routes';
import { userRouter } from './user/user.routes';
import { matchRouter } from './matching/match.routes';
import { chatRouter } from './chat/chat.routes';
import { localeMiddleware } from './common/middleware/locale.middleware';
import { errorHandler } from './common/middleware/error.middleware';

const app: express.Express = express();
const httpServer = createServer(app);

// Socket.io for real-time chat
const io = new SocketServer(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Locale middleware - sets user's locale from header or user profile
app.use(localeMiddleware);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        region: config.region,
        version: process.env.npm_package_version || '1.0.0',
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

// Socket.io connection handling
io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join', (userId: string) => {
        socket.join(`user:${userId}`);
        logger.info(`User ${userId} joined socket room`);
    });

    socket.on('typing', ({ conversationId, userId }) => {
        socket.to(`conversation:${conversationId}`).emit('typing', { userId });
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });
});

// Attach io to app for use in routes
app.set('io', io);

// Database connection and server start
async function start() {
    try {
        // Preload translations for better performance
        preloadTranslations();
        logger.info('Translations preloaded');

        // Connect to MongoDB (optional for local testing)
        const useMockDb = true; // Force mock DB for local development without MongoDB

        if (!useMockDb && config.database.uri) {
            try {
                await mongoose.connect(config.database.uri);
                logger.info('Connected to MongoDB');
            } catch (dbError) {
                logger.warn('MongoDB connection failed - running in mock mode');
                logger.warn('Set USE_MOCK_DB=true in .env to suppress this warning');
            }
        } else {
            logger.info('Running in mock mode (no database)');
        }

        // Start HTTP server
        httpServer.listen(config.port, () => {
            logger.info(`🚀 Server running on port ${config.port}`);
            logger.info(`📍 Region: ${config.region}`);
            logger.info(`🌐 Default locale: ${config.defaultLocale}`);
            logger.info(`📝 API: http://localhost:${config.port}/api/${config.apiVersion}`);
            logger.info('');
            logger.info('Available endpoints:');
            logger.info(`  GET  /health`);
            logger.info(`  GET  /api/${config.apiVersion}/users/locales`);
            logger.info(`  GET  /api/${config.apiVersion}/users/translations/:locale`);
            logger.info(`  POST /api/${config.apiVersion}/auth/register`);
            logger.info(`  POST /api/${config.apiVersion}/auth/login`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await mongoose.disconnect();
    httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

start();

export { app, io };
