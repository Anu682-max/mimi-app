'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3699';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { token } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // If we have a token and no socket, connect
        if (token && !socketRef.current) {
            console.log('Initializing socket connection to:', API_URL);

            const socketInstance = io(API_URL, {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling'], // Allow polling fallack
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected:', socketInstance.id);
                setIsConnected(true);
            });

            socketInstance.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (err) => {
                // Only log authentication errors if we actually have a token
                if (token && err.message !== 'Authentication error') {
                    console.error('Socket connection error:', err.message);
                }
                setIsConnected(false);
            });

            socketRef.current = socketInstance;
            setSocket(socketInstance);

            return () => {
                if (socketRef.current) {
                    console.log('Cleaning up socket connection');
                    socketRef.current.disconnect();
                    socketRef.current = null;
                    setSocket(null);
                    setIsConnected(false);
                }
            };
        }
        // If we have no token but a socket exists, disconnect (logout)
        else if (!token && socketRef.current) {
            console.log('Token removed, disconnecting socket');
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        }
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
