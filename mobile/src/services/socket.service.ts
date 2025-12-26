/**
 * Socket.IO Service for React Native
 * Real-time chat with typing indicators and online status
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3699'; // Change to your backend URL

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

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }

  // Conversation Management
  joinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave_conversation', conversationId);
  }

  // Typing Indicators
  startTyping(conversationId: string) {
    this.socket?.emit('typing', { conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('stop_typing', { conversationId });
  }

  onTyping(callback: (data: TypingData) => void) {
    this.socket?.on('typing', callback);
    this.addListener('typing', callback);
  }

  offTyping(callback?: (data: TypingData) => void) {
    if (callback) {
      this.socket?.off('typing', callback);
      this.removeListener('typing', callback);
    } else {
      this.socket?.off('typing');
      this.listeners.delete('typing');
    }
  }

  // Message Events
  onNewMessage(callback: (data: MessageData) => void) {
    this.socket?.on('new_message', callback);
    this.addListener('new_message', callback);
  }

  offNewMessage(callback?: (data: MessageData) => void) {
    if (callback) {
      this.socket?.off('new_message', callback);
      this.removeListener('new_message', callback);
    } else {
      this.socket?.off('new_message');
      this.listeners.delete('new_message');
    }
  }

  // Online Status
  onUserStatusChange(callback: (data: { userId: string; isOnline: boolean }) => void) {
    this.socket?.on('user_status', callback);
    this.addListener('user_status', callback);
  }

  offUserStatusChange(callback?: Function) {
    if (callback) {
      this.socket?.off('user_status', callback as any);
      this.removeListener('user_status', callback);
    } else {
      this.socket?.off('user_status');
      this.listeners.delete('user_status');
    }
  }

  // Generic methods
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
    this.addListener(event, callback);
  }

  off(event: string, callback?: Function) {
    if (callback) {
      this.socket?.off(event, callback as any);
      this.removeListener(event, callback);
    } else {
      this.socket?.off(event);
      this.listeners.delete(event);
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Helper methods for listener management
  private addListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  private removeListener(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
    if (this.listeners.get(event)?.size === 0) {
      this.listeners.delete(event);
    }
  }

  // Clean up all listeners
  removeAllListeners() {
    this.listeners.forEach((_, event) => {
      this.socket?.off(event);
    });
    this.listeners.clear();
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
