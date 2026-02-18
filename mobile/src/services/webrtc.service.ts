/**
 * WebRTC Signaling Service
 *
 * Socket.IO дамжуулж дуудлага удирдах сервис.
 * Одоогоор зөвхөн signaling хийнэ — бодит медиа stream нь
 * dev-client build-тэй үед нэмэгдэнэ.
 */

import { socketService } from './socket.service';
import { api } from './api';

// Дуудлагын төлөв
export type CallState =
  | 'idle'        // Дуудлага байхгүй
  | 'calling'     // Дуудаж байна
  | 'ringing'     // Хүлээж байна
  | 'connecting'  // Холбогдож байна
  | 'connected'   // Холбогдсон
  | 'ended';      // Дууссан

// Ирж буй дуудлагын мэдээлэл
export interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  callType: 'voice' | 'video';
}

// Дуудлага эхлүүлэх хүсэлтийн хариу
interface StartCallResponse {
  success: boolean;
  callId: string;
}

// Callback-ийн төрлүүд
type CallStateCallback = (state: CallState) => void;
type IncomingCallCallback = (data: IncomingCallData) => void;

class WebRTCService {
  private callId: string | null = null;
  private targetUserId: string | null = null;
  private callType: 'voice' | 'video' | null = null;
  private callState: CallState = 'idle';

  // Callback-ууд
  private onCallStateChange: CallStateCallback | null = null;
  private onIncomingCall: IncomingCallCallback | null = null;

  // Socket event handler-ийн reference (цэвэрлэхэд ашиглана)
  private handleIncomingCall: ((data: IncomingCallData) => void) | null = null;
  private handleCallAnswered: ((data: { callId: string }) => void) | null = null;
  private handleCallEnded: ((data: { callId: string; reason?: string }) => void) | null = null;

  /**
   * Одоогийн дуудлагын төлөв авах
   */
  getCallState(): CallState {
    return this.callState;
  }

  /**
   * Одоогийн дуудлагын ID авах
   */
  getCallId(): string | null {
    return this.callId;
  }

  /**
   * Төлөв өөрчлөгдөх callback бүртгэх
   */
  setOnCallStateChange(callback: CallStateCallback | null) {
    this.onCallStateChange = callback;
  }

  /**
   * Ирж буй дуудлагын callback бүртгэх
   */
  setOnIncomingCall(callback: IncomingCallCallback | null) {
    this.onIncomingCall = callback;
  }

  /**
   * Дуудлагын төлөв шинэчлэх (дотоод)
   */
  private updateCallState(state: CallState) {
    this.callState = state;
    this.onCallStateChange?.(state);
  }

  /**
   * Дуудлага эхлүүлэх — API + Socket
   * @param targetUserId - Дуудах хэрэглэгчийн ID
   * @param type - Дуудлагын төрөл (voice/video)
   * @returns callId
   */
  async startCall(targetUserId: string, type: 'voice' | 'video'): Promise<string> {
    try {
      this.updateCallState('calling');
      this.targetUserId = targetUserId;
      this.callType = type;

      // API руу дуудлага эхлүүлэх хүсэлт илгээх
      const response = await api.post<StartCallResponse>('/webrtc/call', {
        targetUserId,
        callType: type,
      });

      const { callId } = response.data;
      this.callId = callId;

      // Socket-ээр дуудлага эхэлсэн гэдгийг мэдэгдэх
      socketService.emit('call_initiated', {
        callId,
        targetUserId,
        callType: type,
      });

      this.updateCallState('ringing');
      return callId;
    } catch (error) {
      console.error('Дуудлага эхлүүлэхэд алдаа:', error);
      this.updateCallState('ended');
      this.resetCallData();
      throw error;
    }
  }

  /**
   * Дуудлага хүлээн авах
   * @param callId - Хүлээн авах дуудлагын ID
   */
  async acceptCall(callId: string): Promise<void> {
    try {
      this.updateCallState('connecting');

      // API руу хүлээн авсан гэдгийг илгээх
      await api.post('/webrtc/answer', {
        callId,
        accepted: true,
      });

      this.callId = callId;

      // Socket-ээр мэдэгдэх
      socketService.emit('call_accepted', { callId });

      this.updateCallState('connected');
    } catch (error) {
      console.error('Дуудлага хүлээн авахад алдаа:', error);
      this.updateCallState('ended');
      this.resetCallData();
      throw error;
    }
  }

  /**
   * Дуудлага татгалзах
   * @param callId - Татгалзах дуудлагын ID
   */
  rejectCall(callId: string): void {
    try {
      // API руу татгалзсан гэдгийг илгээх
      api.post('/webrtc/end', {
        callId,
        reason: 'rejected',
      }).catch((err) => console.error('Татгалзах хүсэлт амжилтгүй:', err));

      // Socket-ээр мэдэгдэх
      socketService.emit('call_rejected', { callId });

      this.updateCallState('ended');
      this.resetCallData();
    } catch (error) {
      console.error('Дуудлага татгалзахад алдаа:', error);
    }
  }

  /**
   * Дуудлага дуусгах
   */
  endCall(): void {
    if (!this.callId) return;

    try {
      // API руу дууссан гэдгийг илгээх
      api.post('/webrtc/end', {
        callId: this.callId,
        reason: 'ended',
      }).catch((err) => console.error('Дуудлага дуусгах хүсэлт амжилтгүй:', err));

      // Socket-ээр мэдэгдэх
      socketService.emit('call_ended', { callId: this.callId });

      this.updateCallState('ended');
      this.resetCallData();
    } catch (error) {
      console.error('Дуудлага дуусгахад алдаа:', error);
    }
  }

  /**
   * Socket event listener-үүд бүртгэх
   * App-ийн эхэнд нэг удаа дуудна
   */
  registerListeners(): void {
    // Ирж буй дуудлага
    this.handleIncomingCall = (data: IncomingCallData) => {
      console.log('Ирж буй дуудлага:', data);
      this.onIncomingCall?.(data);
    };

    // Дуудлага хариулсан
    this.handleCallAnswered = (data: { callId: string }) => {
      if (data.callId === this.callId) {
        console.log('Дуудлага хариулагдсан:', data.callId);
        this.updateCallState('connected');
      }
    };

    // Дуудлага дууссан (нөгөө талаас)
    this.handleCallEnded = (data: { callId: string; reason?: string }) => {
      if (data.callId === this.callId || !this.callId) {
        console.log('Дуудлага дууссан:', data.callId, data.reason);
        this.updateCallState('ended');
        this.resetCallData();
      }
    };

    // Socket event-үүд бүртгэх
    socketService.on('incoming_call', this.handleIncomingCall);
    socketService.on('call_answered', this.handleCallAnswered);
    socketService.on('call_ended', this.handleCallEnded);
  }

  /**
   * Socket event listener-үүд устгах
   */
  removeListeners(): void {
    if (this.handleIncomingCall) {
      socketService.off('incoming_call', this.handleIncomingCall);
    }
    if (this.handleCallAnswered) {
      socketService.off('call_answered', this.handleCallAnswered);
    }
    if (this.handleCallEnded) {
      socketService.off('call_ended', this.handleCallEnded);
    }

    this.handleIncomingCall = null;
    this.handleCallAnswered = null;
    this.handleCallEnded = null;
  }

  /**
   * Дуудлагын мэдээлэл цэвэрлэх (дотоод)
   */
  private resetCallData(): void {
    this.callId = null;
    this.targetUserId = null;
    this.callType = null;
  }
}

// Singleton instance
export const webrtcService = new WebRTCService();
export default webrtcService;
