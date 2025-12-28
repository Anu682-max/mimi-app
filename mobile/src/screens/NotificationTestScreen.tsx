import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationTestScreen() {
    const navigation = useNavigation<any>();
    const {
        expoPushToken,
        isRegistered,
        isLoading,
        registerForNotifications,
        sendTestNotification,
    } = useNotifications();

    const [testStatus, setTestStatus] = useState<string>('');

    const handleRegister = async () => {
        setTestStatus('Registering...');
        const success = await registerForNotifications();
        if (success) {
            setTestStatus('✅ Registered successfully!');
        } else {
            setTestStatus('❌ Registration failed');
        }
        setTimeout(() => setTestStatus(''), 3000);
    };

    const handleSendTest = async () => {
        setTestStatus('Sending test notification...');
        await sendTestNotification();
        setTestStatus('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>🔔 Notifications Test</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Status Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Registration Status</Text>
                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: isRegistered ? '#10B981' : '#EF4444' },
                            ]}
                        />
                        <Text style={styles.statusText}>
                            {isRegistered ? 'Registered' : 'Not Registered'}
                        </Text>
                    </View>

                    {expoPushToken && (
                        <View style={styles.tokenContainer}>
                            <Text style={styles.tokenLabel}>Expo Push Token:</Text>
                            <Text style={styles.tokenText} numberOfLines={3}>
                                {expoPushToken}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Register Button */}
                {!isRegistered && (
                    <TouchableOpacity
                        style={[styles.button, styles.registerButton]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>🔔 Enable Notifications</Text>
                        )}
                    </TouchableOpacity>
                )}

                {/* Send Test Button */}
                {isRegistered && (
                    <TouchableOpacity
                        style={[styles.button, styles.testButton]}
                        onPress={handleSendTest}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>📤 Send Test Notification</Text>
                        )}
                    </TouchableOpacity>
                )}

                {/* Status Message */}
                {testStatus !== '' && (
                    <View
                        style={[
                            styles.statusMessage,
                            {
                                backgroundColor: testStatus.includes('✅')
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                                borderColor: testStatus.includes('✅')
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : 'rgba(239, 68, 68, 0.3)',
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusMessageText,
                                {
                                    color: testStatus.includes('✅') ? '#10B981' : '#EF4444',
                                },
                            ]}
                        >
                            {testStatus}
                        </Text>
                    </View>
                )}

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>📝 Instructions:</Text>
                    <View style={styles.instructionsList}>
                        <Text style={styles.instructionItem}>1. Enable notifications first</Text>
                        <Text style={styles.instructionItem}>2. Make sure you're logged in</Text>
                        <Text style={styles.instructionItem}>3. Click "Send Test Notification"</Text>
                        <Text style={styles.instructionItem}>4. Check your device notifications</Text>
                    </View>
                </View>

                {/* Debug Info */}
                <View style={styles.debugCard}>
                    <Text style={styles.debugTitle}>Debug Info:</Text>
                    <View style={styles.debugInfo}>
                        <Text style={styles.debugText}>Registered: {String(isRegistered)}</Text>
                        <Text style={styles.debugText}>Loading: {String(isLoading)}</Text>
                        <Text style={styles.debugText}>
                            Has Token: {String(!!expoPushToken)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0F',
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        fontSize: 16,
        color: '#EC4899',
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    card: {
        backgroundColor: '#1A1A24',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    tokenContainer: {
        backgroundColor: '#0A0A0F',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#2A2A3A',
    },
    tokenLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    tokenText: {
        fontSize: 11,
        color: '#9CA3AF',
        fontFamily: 'monospace',
    },
    button: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    registerButton: {
        backgroundColor: '#8B5CF6',
    },
    testButton: {
        backgroundColor: '#10B981',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusMessage: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    statusMessageText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    instructionsCard: {
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    instructionsList: {
        gap: 4,
    },
    instructionItem: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    debugCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    debugTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 8,
    },
    debugInfo: {
        gap: 4,
    },
    debugText: {
        fontSize: 11,
        color: '#6B7280',
        fontFamily: 'monospace',
    },
});
