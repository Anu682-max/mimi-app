import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

interface Conversation {
    id: string;
    participants: { id: string; firstName: string; lastName?: string }[];
    lastMessage?: string;
    lastMessageAt?: string;
}

export default function ChatListScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { token, user } = useAuth();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/conversations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find(p => p.id !== user?.id) || conv.participants[0];
    };

    const renderConversation = ({ item }: { item: Conversation }) => {
        const other = getOtherParticipant(item);

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => navigation.navigate('Chat', {
                    conversationId: item.id,
                    name: other.firstName,
                })}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{other.firstName[0]}</Text>
                </View>
                <View style={styles.conversationInfo}>
                    <Text style={styles.conversationName}>
                        {other.firstName} {other.lastName}
                    </Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage || 'No messages yet'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EC4899" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t('chat.title')}</Text>
            </View>

            {/* Conversations List */}
            {conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>💬</Text>
                    <Text style={styles.emptyTitle}>No conversations yet</Text>
                    <Text style={styles.emptyText}>Match with someone to start chatting!</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0F',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0A0A0F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A24',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    list: {
        padding: 16,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A24',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EC4899',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    conversationInfo: {
        flex: 1,
    },
    conversationName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#9CA3AF',
        textAlign: 'center',
    },
});
