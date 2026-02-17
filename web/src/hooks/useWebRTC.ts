/**
 * WebRTC Hook — Видео/дуут дуудлагын бүх логик
 * RTCPeerConnection, getUserMedia, ICE candidate, SDP offer/answer
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { socketClient } from '@/lib/socket';

// Дуудлагын төлөв
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

// Ирж буй дуудлагын мэдээлэл
export interface IncomingCallData {
    callId: string;
    callerId: string;
    callerName?: string;
    callerPhoto?: string;
    type: 'voice' | 'video';
    offer?: RTCSessionDescriptionInit;
}

// Hook-ийн буцаах утгын interface
export interface UseWebRTCReturn {
    callState: CallState;
    callType: 'voice' | 'video' | null;
    callDuration: number;
    isMuted: boolean;
    isCameraOff: boolean;
    incomingCall: IncomingCallData | null;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
    startCall: (targetUserId: string, type: 'voice' | 'video') => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleCamera: () => void;
}

// STUN серверүүд — NAT traversal-д ашиглана
const ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3699';

export function useWebRTC(): UseWebRTCReturn {
    // Дуудлагын төлвүүд
    const [callState, setCallState] = useState<CallState>('idle');
    const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);

    // Ref-үүд
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callIdRef = useRef<string | null>(null);
    const targetUserIdRef = useRef<string | null>(null);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const iceCandidatesQueue = useRef<RTCIceCandidateInit[]>([]);

    // API дуудлага хийх туслах функц
    const apiCall = useCallback(async (endpoint: string, body: any) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/v1/webrtc/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            return await res.json();
        } catch (err) {
            console.error(`WebRTC API алдаа (${endpoint}):`, err);
            return null;
        }
    }, []);

    // Хугацаа тоолох эхлүүлэх
    const startDurationTimer = useCallback(() => {
        setCallDuration(0);
        durationIntervalRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    }, []);

    // Хугацаа тоолох зогсоох
    const stopDurationTimer = useCallback(() => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
    }, []);

    // Медиа stream авах (камер/микрофон)
    const getMediaStream = useCallback(async (type: 'voice' | 'video'): Promise<MediaStream | null> => {
        try {
            const constraints: MediaStreamConstraints = {
                audio: true,
                video: type === 'video' ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            return stream;
        } catch (err) {
            console.error('Медиа авахад алдаа:', err);
            alert('Камер/микрофон зөвшөөрөл шаардлагатай');
            return null;
        }
    }, []);

    // PeerConnection үүсгэх
    const createPeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

        // ICE candidate илгээх
        pc.onicecandidate = (event) => {
            if (event.candidate && targetUserIdRef.current && callIdRef.current) {
                socketClient.emit('webrtc_ice_candidate', {
                    targetUserId: targetUserIdRef.current,
                    candidate: event.candidate.toJSON(),
                    callId: callIdRef.current,
                });
            }
        };

        // Алсын stream хүлээн авах
        pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Холболтын төлөв өөрчлөгдөхөд
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') {
                setCallState('connected');
                startDurationTimer();
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                endCall();
            }
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                setCallState('connected');
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [startDurationTimer]);

    // Бүх зүйлийг цэвэрлэх
    const cleanup = useCallback(() => {
        stopDurationTimer();

        // Локал stream зогсоох
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Video element-үүдийг цэвэрлэх
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        // PeerConnection хаах
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // ICE candidate queue цэвэрлэх
        iceCandidatesQueue.current = [];

        callIdRef.current = null;
        targetUserIdRef.current = null;
    }, [stopDurationTimer]);

    // Дуудлага эхлүүлэх (caller тал)
    const startCall = useCallback(async (targetUserId: string, type: 'voice' | 'video') => {
        if (callState !== 'idle') return;

        setCallState('calling');
        setCallType(type);
        targetUserIdRef.current = targetUserId;

        // Медиа stream авах
        const stream = await getMediaStream(type);
        if (!stream) {
            setCallState('idle');
            setCallType(null);
            return;
        }
        localStreamRef.current = stream;

        // Локал видео харуулах
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        // PeerConnection үүсгэх
        const pc = createPeerConnection();

        // Локал track-уудыг нэмэх
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // SDP offer үүсгэх
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // API-аар дуудлага бүртгэх, callId авах
        const result = await apiCall('call', {
            receiverId: targetUserId,
            type,
            offer: offer,
        });

        if (result?.callId) {
            callIdRef.current = result.callId;
        }

        // Socket-ээр offer илгээх
        socketClient.emit('webrtc_offer', {
            targetUserId,
            offer: offer,
            callId: result?.callId || `temp-${Date.now()}`,
            type,
        });
    }, [callState, getMediaStream, createPeerConnection, apiCall]);

    // Ирж буй дуудлагыг хүлээн авах (receiver тал)
    const acceptCall = useCallback(async () => {
        if (!incomingCall) return;

        setCallState('connected');
        setCallType(incomingCall.type);
        callIdRef.current = incomingCall.callId;
        targetUserIdRef.current = incomingCall.callerId;

        // Медиа stream авах
        const stream = await getMediaStream(incomingCall.type);
        if (!stream) {
            setCallState('idle');
            setIncomingCall(null);
            return;
        }
        localStreamRef.current = stream;

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        // PeerConnection үүсгэх
        const pc = createPeerConnection();

        // Локал track-уудыг нэмэх
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // Remote offer тохируулах
        if (incomingCall.offer) {
            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        }

        // Хүлээгдэж буй ICE candidate-уудыг нэмэх
        for (const candidate of iceCandidatesQueue.current) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('ICE candidate нэмэхэд алдаа:', err);
            }
        }
        iceCandidatesQueue.current = [];

        // SDP answer үүсгэх
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // API-аар хариулах
        await apiCall('answer', {
            callId: incomingCall.callId,
            answer: answer,
        });

        // Socket-ээр answer илгээх
        socketClient.emit('webrtc_answer', {
            targetUserId: incomingCall.callerId,
            answer: answer,
            callId: incomingCall.callId,
        });

        setIncomingCall(null);
        startDurationTimer();
    }, [incomingCall, getMediaStream, createPeerConnection, apiCall, startDurationTimer]);

    // Ирж буй дуудлагыг татгалзах
    const rejectCall = useCallback(() => {
        if (!incomingCall) return;

        // Socket-ээр дуусгах мэдэгдэл
        socketClient.emit('webrtc_end_call', {
            targetUserId: incomingCall.callerId,
            callId: incomingCall.callId,
            reason: 'rejected',
        });

        // API-аар бүртгэх
        apiCall('end', {
            callId: incomingCall.callId,
            reason: 'rejected',
        });

        setIncomingCall(null);
    }, [incomingCall, apiCall]);

    // Дуудлага дуусгах
    const endCall = useCallback(() => {
        if (callIdRef.current && targetUserIdRef.current) {
            // Socket-ээр мэдэгдэх
            socketClient.emit('webrtc_end_call', {
                targetUserId: targetUserIdRef.current,
                callId: callIdRef.current,
                reason: 'ended',
            });

            // API-аар бүртгэх
            apiCall('end', {
                callId: callIdRef.current,
                reason: 'ended',
            });
        }

        cleanup();
        setCallState('idle');
        setCallType(null);
        setCallDuration(0);
        setIsMuted(false);
        setIsCameraOff(false);
    }, [cleanup, apiCall]);

    // Микрофон асаах/унтраах
    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, []);

    // Камер асаах/унтраах
    const toggleCamera = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOff(!videoTrack.enabled);
            }
        }
    }, []);

    // Socket event-үүд сонсох
    useEffect(() => {
        const socket = socketClient.getSocket();
        if (!socket) return;

        // Ирж буй дуудлага хүлээн авах
        const handleIncomingCall = (data: {
            callId: string;
            callerId: string;
            type: 'voice' | 'video';
            offer?: RTCSessionDescriptionInit;
        }) => {
            // Аль хэдийн дуудлагад байвал завгүй гэж мэдэгдэх
            if (callState !== 'idle') {
                socketClient.emit('webrtc_end_call', {
                    targetUserId: data.callerId,
                    callId: data.callId,
                    reason: 'busy',
                });
                apiCall('end', { callId: data.callId, reason: 'busy' });
                return;
            }

            setIncomingCall({
                callId: data.callId,
                callerId: data.callerId,
                type: data.type,
                offer: data.offer,
            });
            setCallState('ringing');
        };

        // Дуудлагад хариулсан (caller тал хүлээн авна)
        const handleCallAnswered = async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

                // Хүлээгдэж буй ICE candidate-уудыг нэмэх
                for (const candidate of iceCandidatesQueue.current) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (err) {
                        console.error('ICE candidate нэмэхэд алдаа:', err);
                    }
                }
                iceCandidatesQueue.current = [];

                setCallState('connected');
                startDurationTimer();
            } catch (err) {
                console.error('Answer тохируулахад алдаа:', err);
            }
        };

        // ICE candidate хүлээн авах
        const handleIceCandidate = async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
            const pc = peerConnectionRef.current;
            if (pc && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.error('ICE candidate нэмэхэд алдаа:', err);
                }
            } else {
                // Remote description тохируулаагүй бол queue-д хадгалах
                iceCandidatesQueue.current.push(data.candidate);
            }
        };

        // Дуудлага дуусгасан (нөгөө тал)
        const handleCallEnded = (data: { callId: string; reason: string }) => {
            cleanup();
            setCallState('idle');
            setCallType(null);
            setCallDuration(0);
            setIsMuted(false);
            setIsCameraOff(false);
            setIncomingCall(null);
        };

        socket.on('incoming_call', handleIncomingCall);
        socket.on('call_answered', handleCallAnswered);
        socket.on('ice_candidate', handleIceCandidate);
        socket.on('call_ended', handleCallEnded);

        return () => {
            socket.off('incoming_call', handleIncomingCall);
            socket.off('call_answered', handleCallAnswered);
            socket.off('ice_candidate', handleIceCandidate);
            socket.off('call_ended', handleCallEnded);
        };
    }, [callState, cleanup, apiCall, startDurationTimer]);

    // Компонент unmount-д cleanup хийх
    useEffect(() => {
        return () => {
            cleanup();
            stopDurationTimer();
        };
    }, [cleanup, stopDurationTimer]);

    return {
        callState,
        callType,
        callDuration,
        isMuted,
        isCameraOff,
        incomingCall,
        localVideoRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
    };
}
