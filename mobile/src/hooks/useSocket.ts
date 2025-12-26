/**
 * React Native Socket.IO Hooks
 * Custom hooks for real-time chat features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '../services/socket.service';
import { useAuth } from './useAuth';

interface UseSocketOptions {
  conversationId?: string;
  autoConnect?: boolean;
}

interface TypingData {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

/**
 * Main Socket Hook
 * Manages connection, typing indicators, and real-time updates
 */
export const useSocket = ({ conversationId, autoConnect = true }: UseSocketOptions = {}) => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<{ [userId: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (autoConnect && token) {
      socketService.connect(token);
      setIsConnected(socketService.isConnected());
    }

    // Handle typing events
    const handleTyping = (data: TypingData) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(data.userId);
          return newSet;
        });

        // Auto-remove typing status after 3 seconds
        if (typingTimeoutRef.current[data.userId]) {
          clearTimeout(typingTimeoutRef.current[data.userId]);
        }
        typingTimeoutRef.current[data.userId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
    };

    const handleStopTyping = (data: TypingData) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
        if (typingTimeoutRef.current[data.userId]) {
          clearTimeout(typingTimeoutRef.current[data.userId]);
          delete typingTimeoutRef.current[data.userId];
        }
      }
    };

    socketService.onTyping(handleTyping);
    socketService.on('stop_typing', handleStopTyping);

    return () => {
      socketService.offTyping(handleTyping);
      socketService.off('stop_typing', handleStopTyping);
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, [conversationId, autoConnect, token]);

  // Join/Leave conversation
  useEffect(() => {
    if (conversationId && isConnected) {
      socketService.joinConversation(conversationId);
      return () => {
        socketService.leaveConversation(conversationId);
      };
    }
  }, [conversationId, isConnected]);

  const startTyping = useCallback(() => {
    if (conversationId) {
      socketService.startTyping(conversationId);
    }
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (conversationId) {
      socketService.stopTyping(conversationId);
    }
  }, [conversationId]);

  return {
    isConnected,
    typingUsers: Array.from(typingUsers),
    startTyping,
    stopTyping,
    socket: socketService,
  };
};

/**
 * Hook for listening to new messages
 */
export const useSocketMessages = (conversationId?: string) => {
  const [messages, setMessages] = useState<MessageData[]>([]);

  useEffect(() => {
    const handleNewMessage = (data: MessageData) => {
      if (!conversationId || data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.offNewMessage(handleNewMessage);
    };
  }, [conversationId]);

  return messages;
};

/**
 * Hook for tracking user online status
 */
export const useOnlineStatus = (userId?: string) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const handleStatusChange = (data: { userId: string; isOnline: boolean }) => {
      if (data.userId === userId) {
        setIsOnline(data.isOnline);
      }
    };

    socketService.onUserStatusChange(handleStatusChange);

    return () => {
      socketService.offUserStatusChange(handleStatusChange);
    };
  }, [userId]);

  return isOnline;
};

export default useSocket;
