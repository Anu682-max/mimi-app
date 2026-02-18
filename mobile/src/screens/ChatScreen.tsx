import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    translatedContent?: string;
    createdAt: string;
}

export default function ChatScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { token, user } = useAuth();
    const flatListRef = useRef<FlatList>(null);

    const { conversationId, name } = route.params;

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);

        try {
            const response = await fetch(`${API_URL}/api/v1/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    conversationId,
                    content: newMessage,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setMessages([...messages, {
                    id: data.message.id,
                    senderId: user?.id || '',
                    senderName: user?.firstName || '',
                    content: data.message.content,
                    createdAt: data.message.createdAt,
                }]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const translateMessage = async (messageId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/messages/${messageId}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    toLocale: user?.locale || 'en',
                }),
            });

            const data = await response.json();
            if (data.success) {
                setMessages(prev => prev.map(m =>
                    m.id === messageId
                        ? { ...m, translatedContent: data.translatedContent }
                        : m
                ));
            }
        } catch (error) {
            console.error('Translation failed:', error);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isOwn = item.senderId === user?.id;
        const showTranslation = !!item.translatedContent;

        return (
            <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
                <View style={[styles.messageBubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                    <Text style={[styles.messageText, isOwn ? styles.messageTextOwn : styles.messageTextOther]}>
                        {showTranslation ? item.translatedContent : item.content}
                    </Text>
                </View>
                {!isOwn && (
                    <TouchableOpacity
                        style={styles.translateButton}
                        onPress={() => translateMessage(item.id)}
                    >
                        <Text style={styles.translateText}>
                            {showTranslation ? t('chat.show_original') : `🌐 ${t('chat.translate')}`}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{name}</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder={t('chat.type_message')}
                        placeholderTextColor="#656E7B"
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!newMessage.trim() || isSending}
                    >
                        <Text style={styles.sendButtonText}>➤</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E6EA',
    },
    backButton: {
        fontSize: 24,
        color: '#21262E',
        marginRight: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#21262E',
    },
    headerRight: {
        width: 40,
    },
    messagesList: {
        padding: 16,
    },
    messageRow: {
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    messageRowOwn: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    bubbleOwn: {
        backgroundColor: '#FF4458',
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E8E6EA',
    },
    messageText: {
        fontSize: 16,
    },
    messageTextOwn: {
        color: '#FFFFFF',
    },
    messageTextOther: {
        color: '#21262E',
    },
    translateButton: {
        marginTop: 4,
    },
    translateText: {
        fontSize: 12,
        color: '#FF4458',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8E6EA',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8E6EA',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#21262E',
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        width: 44,
        height: 44,
        backgroundColor: '#FF4458',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        fontSize: 18,
        color: '#FFF',
    },
});
