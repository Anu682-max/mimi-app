/**
 * Socket Hook for React Components
 * Easy integration of real-time features
 */

import { useEffect, useState, useCallback } from 'react';
import { socketClient } from '@/lib/socket';

interface UseSocketOptions {
  conversationId?: string;
  autoConnect?: boolean;
}

export function useSocket({ conversationId, autoConnect = true }: UseSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!autoConnect) return;

    // Get token from localStorage or auth context
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found for socket connection');
      return;
    }

    // Connect socket
    socketClient.connect(token);
    setIsConnected(socketClient.isConnected());

    // Update connection status
    socketClient.on('connect', () => {
      setIsConnected(true);
    });

    socketClient.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketClient.disconnect();
    };
  }, [autoConnect]);

  useEffect(() => {
    if (!conversationId) return;

    // Join conversation room
    socketClient.joinConversation(conversationId);

    // Listen for typing events
    socketClient.onTyping((data) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    });

    return () => {
      socketClient.leaveConversation(conversationId);
      socketClient.offTyping();
    };
  }, [conversationId]);

  const startTyping = useCallback(() => {
    if (conversationId) {
      socketClient.startTyping(conversationId);
    }
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (conversationId) {
      socketClient.stopTyping(conversationId);
    }
  }, [conversationId]);

  return {
    isConnected,
    typingUsers: Array.from(typingUsers),
    startTyping,
    stopTyping,
    socket: socketClient,
  };
}

// Hook for new messages
export function useSocketMessages(conversationId?: string) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    socketClient.onNewMessage((message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketClient.offNewMessage();
    };
  }, [conversationId]);

  return messages;
}

// Hook for online status
export function useOnlineStatus(userId?: string) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;

    socketClient.onUserStatusChange((data) => {
      if (data.userId === userId) {
        setIsOnline(data.isOnline);
      }
    });

    return () => {
      socketClient.offUserStatusChange();
    };
  }, [userId]);

  return isOnline;
}
