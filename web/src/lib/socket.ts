/**
 * Socket.IO Client Service
 * Real-time chat, typing indicators, and online status
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3699';

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

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected manually');
    }
  }

  // Chat Events
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
  }

  offTyping() {
    this.socket?.off('typing');
  }

  // New Message Events
  onNewMessage(callback: (data: MessageData) => void) {
    this.socket?.on('new_message', callback);
  }

  offNewMessage() {
    this.socket?.off('new_message');
  }

  // Online Status Events
  onUserStatusChange(callback: (data: { userId: string; isOnline: boolean }) => void) {
    this.socket?.on('user_status', callback);
  }

  offUserStatusChange() {
    this.socket?.off('user_status');
  }

  // Generic event listener
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const socketClient = new SocketClient();
export default socketClient;
