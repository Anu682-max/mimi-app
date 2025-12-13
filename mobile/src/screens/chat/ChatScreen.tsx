/**
 * Chat Screen
 * 
 * Messaging screen with translation support
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
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useDateFormatter, useLocale } from '../../i18n/hooks';
import { useChat } from '../../hooks/useChat';

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

    const { conversationId, recipientName, recipientPhoto } = route.params as any;
    const { messages, sendMessage, isLoading, isTyping } = useChat(conversationId);

    const [inputText, setInputText] = useState('');

    useEffect(() => {
        // Set header with recipient info
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerTitle}>
                    {recipientPhoto && (
                        <Image source={{ uri: recipientPhoto }} style={styles.headerAvatar} />
                    )}
                    <View>
                        <Text style={styles.headerName}>{recipientName}</Text>
                        {isTyping && <Text style={styles.typingIndicator}>{t('chat.typing')}</Text>}
                    </View>
                </View>
            ),
        });
    }, [navigation, recipientName, recipientPhoto, isTyping, t]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText('');

        await sendMessage(text);

        // Scroll to bottom
        flatListRef.current?.scrollToEnd({ animated: true });
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
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
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
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    typingIndicator: {
        fontSize: 12,
        color: '#FF6B8A',
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
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        paddingBottom: 24,
        backgroundColor: '#1A1A24',
        borderTopWidth: 1,
        borderTopColor: '#2A2A3A',
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
});

export default ChatScreen;
