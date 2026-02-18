/**
 * Call Screen
 *
 * Бүтэн дэлгэцийн дуудлагын UI.
 * Дуу болон видео дуудлагын удирдлага, хугацааны тоолуур,
 * дуу чимээ хаах, чанга яригч зэрэг функцүүдийг агуулна.
 *
 * Анхааруулга: WebRTC медиа stream нь dev-client build шаардана.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { webrtcService, CallState } from '../services/webrtc.service';

// Дэлгэцийн хэмжээ
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Navigation параметрүүд
interface CallScreenParams {
  targetUserId: string;
  targetName: string;
  targetPhoto?: string;
  callType: 'voice' | 'video';
  callId?: string;
  isIncoming?: boolean;
}

/**
 * Хугацааг форматлах (секундыг MM:SS болгох)
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function CallScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as CallScreenParams;

  const {
    targetUserId,
    targetName,
    targetPhoto,
    callType,
    callId: incomingCallId,
    isIncoming = false,
  } = params;

  // Төлөвүүд
  const [callState, setCallState] = useState<CallState>(
    isIncoming ? 'ringing' : 'idle'
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [duration, setDuration] = useState(0);
  const [callId, setCallId] = useState<string | null>(incomingCallId || null);

  // Хугацааны тоолуурын ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Дуудлагын төлөв өөрчлөгдөх callback
   */
  const handleCallStateChange = useCallback(
    (state: CallState) => {
      setCallState(state);

      if (state === 'ended') {
        // Дуудлага дууссан — буцах
        stopTimer();
        setTimeout(() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }, 1500);
      }
    },
    [navigation]
  );

  /**
   * Хугацааны тоолуур эхлүүлэх
   */
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  /**
   * Хугацааны тоолуур зогсоох
   */
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Компонент mount болоход дуудлага эхлүүлэх
   */
  useEffect(() => {
    // Төлөв өөрчлөгдөх callback бүртгэх
    webrtcService.setOnCallStateChange(handleCallStateChange);

    // Ирж буй дуудлага биш бол шууд дуудлага эхлүүлэх
    if (!isIncoming) {
      initiateCall();
    }

    return () => {
      // Цэвэрлэх
      webrtcService.setOnCallStateChange(null);
      stopTimer();
    };
  }, []);

  /**
   * Холбогдсон үед тоолуур эхлүүлэх
   */
  useEffect(() => {
    if (callState === 'connected') {
      startTimer();
    }
  }, [callState, startTimer]);

  /**
   * Дуудлага эхлүүлэх
   */
  const initiateCall = async () => {
    try {
      const newCallId = await webrtcService.startCall(targetUserId, callType);
      setCallId(newCallId);
    } catch (error) {
      console.error('Дуудлага эхлүүлэхэд алдаа:', error);
      setCallState('ended');
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }, 2000);
    }
  };

  /**
   * Ирж буй дуудлага хүлээн авах
   */
  const handleAccept = async () => {
    if (!callId) return;
    try {
      await webrtcService.acceptCall(callId);
    } catch (error) {
      console.error('Дуудлага хүлээн авахад алдаа:', error);
    }
  };

  /**
   * Ирж буй дуудлага татгалзах
   */
  const handleDecline = () => {
    if (callId) {
      webrtcService.rejectCall(callId);
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  /**
   * Дуудлага дуусгах
   */
  const handleEndCall = () => {
    webrtcService.endCall();
    stopTimer();
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  /**
   * Дуу чимээ хаах/нээх
   */
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    // TODO: Бодит медиа stream-д mute хийх (dev-client build шаардлагатай)
  };

  /**
   * Чанга яригч асаах/унтраах
   */
  const toggleSpeaker = () => {
    setIsSpeakerOn((prev) => !prev);
    // TODO: Бодит audio output-д speaker toggle хийх (dev-client build шаардлагатай)
  };

  /**
   * Дуудлагын төлөвийн текст
   */
  const getStatusText = (): string => {
    switch (callState) {
      case 'idle':
      case 'calling':
        return 'Дуудаж байна...';
      case 'ringing':
        return isIncoming ? 'Ирж буй дуудлага...' : 'Хүлээж байна...';
      case 'connecting':
        return 'Холбогдож байна...';
      case 'connected':
        return formatDuration(duration);
      case 'ended':
        return 'Дуудлага дууслаа';
      default:
        return '';
    }
  };

  // Ирж буй дуудлагын UI (хүлээн авах/татгалзах товчлуурууд)
  const isIncomingRinging = isIncoming && callState === 'ringing';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      {/* Дуудлагын төрлийн индикатор */}
      <View style={styles.callTypeIndicator}>
        <Ionicons
          name={callType === 'video' ? 'videocam' : 'call'}
          size={20}
          color="rgba(255, 255, 255, 0.6)"
        />
        <Text style={styles.callTypeText}>
          {callType === 'video' ? 'Видео дуудлага' : 'Дуу дуудлага'}
        </Text>
      </View>

      {/* Хэрэглэгчийн зураг */}
      <View style={styles.avatarSection}>
        {targetPhoto ? (
          <Image source={{ uri: targetPhoto }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={60} color="rgba(255, 255, 255, 0.5)" />
          </View>
        )}
        <Text style={styles.callerName}>{targetName}</Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* dev-client шаардлагатай гэсэн мэдэгдэл */}
      <Text style={styles.devNote}>
        WebRTC медиа stream нь dev-client build-тэй үед ажиллана
      </Text>

      {/* Ирж буй дуудлагын товчлуурууд */}
      {isIncomingRinging ? (
        <View style={styles.incomingActions}>
          {/* Татгалзах */}
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={handleDecline}
          >
            <Ionicons name="close" size={36} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Хүлээн авах */}
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
          >
            <Ionicons name="call" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Дуудлагын удирдлагын товчлуурууд */
        <View style={styles.controls}>
          {/* Дуу чимээ хаах */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.controlLabel}>
              {isMuted ? 'Нээх' : 'Хаах'}
            </Text>
          </TouchableOpacity>

          {/* Дуудлага дуусгах */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Чанга яригч */}
          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-medium'}
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.controlLabel}>
              {isSpeakerOn ? 'Чанга' : 'Яригч'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 60,
  },

  // Дуудлагын төрлийн индикатор
  callTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callTypeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Хэрэглэгчийн зурагны хэсэг
  avatarSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Dev-client анхааруулга
  devNote: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.25)',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },

  // Ирж буй дуудлагын товчлуурууд
  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
    paddingBottom: 20,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },

  // Дуудлагын удирдлагын товчлуурууд
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingBottom: 20,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 76,
  },
  controlButtonActive: {
    opacity: 0.5,
  },
  controlLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 6,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
});

export default CallScreen;
