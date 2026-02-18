/**
 * Chat Screen
 * 
 * Messaging screen with translation support and real-time features
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useDateFormatter, useLocale } from '../../i18n/hooks';
import { useChat } from '../../hooks/useChat';
import { useSocket, useSocketMessages, useOnlineStatus } from '../../hooks/useSocket';

interface Message {
    id: string;
    senderId: string;
    originalText: string;
    translatedText?: string;
    sourceLocale: string;
    targetLocale?: string;
    createdAt: string;
    showTranslation: boolean;
}

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
    onToggleTranslation: (id: string) => void;
}

function MessageBubble({ message, isOwnMessage, onToggleTranslation }: MessageBubbleProps) {
    const { t } = useTranslation();
    const { formatRelativeTime } = useDateFormatter();
    const { locale } = useLocale();

    const [showingOriginal, setShowingOriginal] = useState(!message.showTranslation);

    const hasTranslation = message.translatedText && message.sourceLocale !== locale;
    const displayText = showingOriginal ? message.originalText : (message.translatedText || message.originalText);

    const toggleView = () => {
        setShowingOriginal(!showingOriginal);
        onToggleTranslation(message.id);
    };

    return (
        <View style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}>
            <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}>
                {displayText}
            </Text>

            {/* Translation indicator & toggle */}
            {hasTranslation && (
                <TouchableOpacity onPress={toggleView} style={styles.translationToggle}>
                    <Text style={styles.translatedFrom}>
                        {showingOriginal
                            ? t('chat.show_translation')
                            : t('chat.translated_from', { language: message.sourceLocale.toUpperCase() })
                        }
                    </Text>
                </TouchableOpacity>
            )}

            <Text style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
            ]}>
                {formatRelativeTime(message.createdAt)}
            </Text>
        </View>
    );
}

export function ChatScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();
    const flatListRef = useRef<FlatList>(null);

    const { conversationId, recipientName, recipientPhoto, recipientId } = route.params as any;
    const { messages, sendMessage, isLoading, isTyping } = useChat(conversationId);

    const [inputText, setInputText] = useState('');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Socket.IO real-time features
    const { 
        isConnected, 
        typingUsers, 
        startTyping: emitStartTyping, 
        stopTyping: emitStopTyping 
    } = useSocket({ 
        conversationId, 
        autoConnect: true 
    });
    const socketMessages = useSocketMessages(conversationId);
    const isRecipientOnline = useOnlineStatus(recipientId);

    /**
     * Дуу дуудлага эхлүүлэх
     */
    const handleVoiceCall = () => {
        (navigation as any).navigate('Call', {
            targetUserId: recipientId,
            targetName: recipientName,
            targetPhoto: recipientPhoto,
            callType: 'voice',
        });
    };

    /**
     * Видео дуудлага эхлүүлэх
     */
    const handleVideoCall = () => {
        (navigation as any).navigate('Call', {
            targetUserId: recipientId,
            targetName: recipientName,
            targetPhoto: recipientPhoto,
            callType: 'video',
        });
    };

    useEffect(() => {
        // Header-д хэрэглэгчийн мэдээлэл, онлайн статус, дуудлагын товчлуурууд
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerTitle}>
                    {recipientPhoto && (
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: recipientPhoto }} style={styles.headerAvatar} />
                            {/* Онлайн статусын индикатор */}
                            {isRecipientOnline && (
                                <View style={styles.onlineIndicator} />
                            )}
                        </View>
                    )}
                    <View>
                        <Text style={styles.headerName}>{recipientName}</Text>
                        {/* Бичиж байгаа индикатор */}
                        {typingUsers.length > 0 && (
                            <Text style={styles.typingIndicator}>
                                {t('chat.typing')}
                            </Text>
                        )}
                        {/* Онлайн/Оффлайн статус */}
                        {!typingUsers.length && (
                            <Text style={[styles.statusText, isRecipientOnline && styles.onlineText]}>
                                {isRecipientOnline ? t('chat.online') : t('chat.offline')}
                            </Text>
                        )}
                    </View>
                </View>
            ),
            // Дуудлагын товчлуурууд (header-ийн баруун тал)
            headerRight: () => (
                <View style={styles.headerCallButtons}>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={handleVoiceCall}
                    >
                        <Ionicons name="call-outline" size={22} color="#FF4458" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={handleVideoCall}
                    >
                        <Ionicons name="videocam-outline" size={24} color="#FF4458" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, recipientName, recipientPhoto, isRecipientOnline, typingUsers, t]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText('');
        
        // Stop typing indicator
        emitStopTyping();
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        await sendMessage(text);

        // Scroll to bottom
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    const handleInputChange = (text: string) => {
        setInputText(text);
        
        // Emit typing indicator
        if (text.trim()) {
            emitStartTyping();
            
            // Auto-stop typing after 3 seconds
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                emitStopTyping();
            }, 3000);
        } else {
            emitStopTyping();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const handleToggleTranslation = (messageId: string) => {
        // Could update local state or call API to track preference
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <MessageBubble
            message={item}
            isOwnMessage={item.senderId === 'currentUser'} // Replace with actual user ID check
            onToggleTranslation={handleToggleTranslation}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('chat.no_messages')}</Text>
            <Text style={styles.emptySubtext}>{t('chat.start_conversation')}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.messageList}
                inverted={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {/* Input Bar */}
            <View style={styles.inputBar}>
                {/* Connection status indicator */}
                {!isConnected && (
                    <View style={styles.offlineBar}>
                        <Text style={styles.offlineText}>{t('chat.offline_mode')}</Text>
                    </View>
                )}
                
                {/* Typing indicator for recipient */}
                {typingUsers.length > 0 && (
                    <View style={styles.typingBubble}>
                        <Text style={styles.typingBubbleText}>
                            {recipientName} {t('chat.is_typing')}
                        </Text>
                    </View>
                )}
                
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={handleInputChange}
                        placeholder={t('chat.type_message')}
                        placeholderTextColor="#666"
                        multiline
                        maxLength={5000}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <Text style={styles.sendButtonText}>{t('chat.send')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0F',
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 10,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4ADE80',
        borderWidth: 2,
        borderColor: '#0A0A0F',
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    typingIndicator: {
        fontSize: 12,
        color: '#FF6B8A',
        fontStyle: 'italic',
    },
    statusText: {
        fontSize: 11,
        color: '#666',
    },
    onlineText: {
        color: '#4ADE80',
    },
    messageList: {
        padding: 16,
        flexGrow: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
    },
    messageBubble: {
        maxWidth: '80%',
        marginBottom: 12,
        padding: 12,
        borderRadius: 16,
    },
    ownMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#FF4D6A',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#1A1A24',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    ownMessageText: {
        color: '#FFFFFF',
    },
    otherMessageText: {
        color: '#FFFFFF',
    },
    translationToggle: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    translatedFrom: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
        fontStyle: 'italic',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
    },
    ownMessageTime: {
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'right',
    },
    otherMessageTime: {
        color: '#666',
    },
    inputBar: {
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 12,
        paddingBottom: 24,
        backgroundColor: '#1A1A24',
        borderTopWidth: 1,
        borderTopColor: '#2A2A3A',
    },
    offlineBar: {
        backgroundColor: '#FFA500',
        padding: 8,
        marginBottom: 8,
        borderRadius: 8,
    },
    offlineText: {
        color: '#FFFFFF',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '600',
    },
    typingBubble: {
        backgroundColor: '#2A2A3A',
        padding: 8,
        marginBottom: 8,
        borderRadius: 12,
    },
    typingBubbleText: {
        color: '#FF6B8A',
        fontSize: 12,
        fontStyle: 'italic',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#0A0A0F',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: '#FFFFFF',
        maxHeight: 100,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#FF4D6A',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // Дуудлагын товчлуурууд (header)
    headerCallButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginRight: 4,
    },
    callButton: {
        padding: 6,
    },
});

export default ChatScreen;
