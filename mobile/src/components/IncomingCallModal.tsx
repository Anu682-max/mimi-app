/**
 * Incoming Call Modal
 *
 * Ирж буй дуудлагын бүтэн дэлгэцийн мэдэгдэл.
 * Socket.IO-ийн `incoming_call` event дээр гарч ирнэ.
 * Хүлээн авах/татгалзах товчлуурууд, хэрэглэгчийн зураг,
 * анимацтай пульс эффект агуулна.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { webrtcService, IncomingCallData } from '../services/webrtc.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function IncomingCallModal() {
  const navigation = useNavigation<any>();
  const [visible, setVisible] = useState(false);
  const [callData, setCallData] = useState<IncomingCallData | null>(null);

  // Пульс анимацын утгууд
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  /**
   * Ирж буй дуудлага хүлээн авах callback бүртгэх
   */
  useEffect(() => {
    // WebRTC service-д ирж буй дуудлагын callback бүртгэх
    webrtcService.setOnIncomingCall((data: IncomingCallData) => {
      setCallData(data);
      setVisible(true);
    });

    // Socket listener-үүд бүртгэх
    webrtcService.registerListeners();

    return () => {
      webrtcService.setOnIncomingCall(null);
      webrtcService.removeListeners();
    };
  }, []);

  /**
   * Пульс анимац эхлүүлэх
   */
  useEffect(() => {
    if (!visible) return;

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.6);
    };
  }, [visible, pulseAnim, opacityAnim]);

  /**
   * Дуудлага хүлээн авах
   */
  const handleAccept = () => {
    if (!callData) return;

    setVisible(false);

    // CallScreen руу шилжих
    navigation.navigate('Call', {
      targetUserId: callData.callerId,
      targetName: callData.callerName,
      targetPhoto: callData.callerPhoto,
      callType: callData.callType,
      callId: callData.callId,
      isIncoming: true,
    });

    setCallData(null);
  };

  /**
   * Дуудлага татгалзах
   */
  const handleDecline = () => {
    if (!callData) return;

    webrtcService.rejectCall(callData.callId);
    setVisible(false);
    setCallData(null);
  };

  if (!visible || !callData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Дуудлагын төрлийн индикатор */}
        <View style={styles.callTypeRow}>
          <Ionicons
            name={callData.callType === 'video' ? 'videocam' : 'call'}
            size={22}
            color="rgba(255, 255, 255, 0.8)"
          />
          <Text style={styles.callTypeText}>
            {callData.callType === 'video'
              ? 'Ирж буй видео дуудлага'
              : 'Ирж буй дуу дуудлага'}
          </Text>
        </View>

        {/* Хэрэглэгчийн зураг — пульс анимацтай */}
        <View style={styles.avatarSection}>
          {/* Пульс эффект */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
          {callData.callerPhoto ? (
            <Image
              source={{ uri: callData.callerPhoto }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons
                name="person"
                size={50}
                color="rgba(255, 255, 255, 0.5)"
              />
            </View>
          )}
        </View>

        {/* Нэр */}
        <Text style={styles.callerName}>{callData.callerName}</Text>
        <Text style={styles.statusText}>Ирж буй дуудлага...</Text>

        {/* Хүлээн авах / Татгалзах товчлуурууд */}
        <View style={styles.actions}>
          {/* Татгалзах */}
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={handleDecline}
          >
            <Ionicons name="close" size={36} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Татгалзах</Text>
          </TouchableOpacity>

          {/* Хүлээн авах */}
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
          >
            <Ionicons name="call" size={32} color="#FFFFFF" />
            <Text style={styles.actionLabel}>Хариулах</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 17, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  // Дуудлагын төрөл
  callTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  callTypeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Зурагны хэсэг
  avatarSection: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FF4458',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Текстүүд
  callerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 60,
  },

  // Товчлуурууд
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 70,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
  },
});

export default IncomingCallModal;
