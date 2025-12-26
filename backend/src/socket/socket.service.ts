
import { Server as SocketServer, Socket } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../common/logger';
import User from '../user/user.model';

interface SocketUserPayload {
    id: string;
    email: string;
}

export class SocketService {
    private io!: SocketServer;
    private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

    constructor() {
        // Initial setup handled in init
    }

    public init(httpServer: HttpServer): SocketServer {
        const corsOrigin = process.env.CORS_ORIGIN || '*';
        logger.info(`🔌 Initializing Socket.IO server with CORS origin: ${corsOrigin}`);
        
        this.io = new SocketServer(httpServer, {
            cors: {
                origin: corsOrigin,
                methods: ['GET', 'POST'],
                credentials: true
            },
            pingTimeout: 60000,
            transports: ['websocket', 'polling'],
        });

        logger.info('✅ Socket.IO server initialized successfully');

        // Authentication Middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }

                const decoded = jwt.verify(token, config.jwt.secret) as SocketUserPayload;
                socket.data.user = decoded;

                // Update online status in DB
                await this.updateUserStatus(decoded.id, true);

                next();
            } catch (error) {
                logger.error('Socket authentication error:', error);
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });

        return this.io;
    }

    private handleConnection(socket: Socket) {
        const userId = socket.data.user?.id;
        if (!userId) {
            socket.disconnect();
            return;
        }

        logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

        // Register socket for user
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)?.add(socket.id);

        // Join user-specific room
        socket.join(`user:${userId}`);

        // Handle events
        socket.on('join_conversation', (conversationId: string) => {
            socket.join(`conversation:${conversationId}`);
            logger.info(`User ${userId} joined conversation ${conversationId}`);
        });

        socket.on('leave_conversation', (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`);
        });

        socket.on('typing', (data: { conversationId: string }) => {
            socket.to(`conversation:${data.conversationId}`).emit('typing', {
                userId,
                conversationId: data.conversationId,
                isTyping: true
            });
        });

        socket.on('stop_typing', (data: { conversationId: string }) => {
            socket.to(`conversation:${data.conversationId}`).emit('typing', {
                userId,
                conversationId: data.conversationId,
                isTyping: false
            });
        });

        socket.on('disconnect', async () => {
            this.handleDisconnect(socket, userId);
        });
    }

    private async handleDisconnect(socket: Socket, userId: string) {
        logger.info(`Socket disconnected: ${socket.id} (User: ${userId})`);

        // Remove socket from tracking
        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
            userSocketSet.delete(socket.id);
            if (userSocketSet.size === 0) {
                this.userSockets.delete(userId);
                // Update online status to offline if no more connections
                await this.updateUserStatus(userId, false);
            }
        }
    }

    private async updateUserStatus(userId: string, isOnline: boolean) {
        try {
            await User.findByIdAndUpdate(userId, {
                isOnline,
                lastOnline: new Date()
            });
        } catch (error) {
            logger.error(`Failed to update user status for ${userId}:`, error);
        }
    }

    // Public methods to emit events

    public getIO(): SocketServer {
        if (!this.io) {
            throw new Error('Socket.io not initialized!');
        }
        return this.io;
    }

    public emitToUser(userId: string, event: string, data: any) {
        this.getIO().to(`user:${userId}`).emit(event, data);
    }

    public emitToConversation(conversationId: string, event: string, data: any) {
        this.getIO().to(`conversation:${conversationId}`).emit(event, data);
    }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
