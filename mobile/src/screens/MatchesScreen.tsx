// Тохирсон хэрэглэгчдийн жагсаалт (Matches)

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');
// Картын өргөн: 2 багана, хоёр талын padding болон дундах зай тооцоолсон
const CARD_WIDTH = (width - 48) / 2;

// Тохирсон хэрэглэгчийн төрөл
interface Match {
    id: string;
    firstName: string;
    age?: number;
    photos: string[];
    matchedAt: string;
}

// API амжилтгүй үед харуулах жишиг өгөгдөл
const MOCK_MATCHES: Match[] = [
    { id: '1', firstName: 'Amy', age: 24, photos: [''], matchedAt: '2h ago' },
    { id: '2', firstName: 'Sophie', age: 26, photos: [''], matchedAt: '5h ago' },
    { id: '3', firstName: 'Emma', age: 23, photos: [''], matchedAt: '1d ago' },
    { id: '4', firstName: 'Lily', age: 25, photos: [''], matchedAt: '2d ago' },
];

export default function MatchesScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { token } = useAuth();

    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchMatches();
    }, []);

    // Тохирсон хэрэглэгчдийг серверээс татах
    const fetchMatches = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/matches`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setMatches(data.matches);
            } else {
                // API алдаатай бол жишиг өгөгдөл ашиглана
                setMatches(MOCK_MATCHES);
            }
        } catch (error) {
            console.error('Failed to fetch matches:', error);
            // Сүлжээний алдаа бол жишиг өгөгдөл ашиглана
            setMatches(MOCK_MATCHES);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Дахин татах (pull to refresh)
    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchMatches();
    }, []);

    // Карт дээр дарахад Chat руу шилжих
    const handleMatchPress = (match: Match) => {
        navigation.navigate('Chat', {
            matchId: match.id,
            name: match.firstName,
        });
    };

    // Тохирсон хэрэглэгчийн карт
    const renderMatchCard = ({ item }: { item: Match }) => {
        const hasPhoto = item.photos && item.photos.length > 0 && item.photos[0] !== '';

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleMatchPress(item)}
                activeOpacity={0.8}
            >
                {/* Зураг эсвэл нэрийн эхний үсэг */}
                <View style={styles.photoContainer}>
                    {hasPhoto ? (
                        <Image source={{ uri: item.photos[0] }} style={styles.photo} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {item.firstName[0]?.toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Нэр, нас, тохирсон хугацаа */}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>
                        {item.firstName}{item.age ? `, ${item.age}` : ''}
                    </Text>
                    <Text style={styles.cardMatchedAt} numberOfLines={1}>
                        {t('matches.matched_ago', { time: item.matchedAt, defaultValue: `Matched ${item.matchedAt}` })}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Ачаалж байгаа төлөв
    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4458" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Толгой хэсэг */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {t('matches.title', { defaultValue: 'Matches' })}
                </Text>
            </View>

            {/* Тохирсон хэрэглэгчдийн жагсаалт */}
            {matches.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyHeart}>{'\u2764\uFE0F'}</Text>
                    <Text style={styles.emptyTitle}>
                        {t('matches.no_matches', { defaultValue: 'No matches yet' })}
                    </Text>
                    <Text style={styles.emptyText}>
                        {t('matches.keep_swiping', { defaultValue: 'Keep swiping to find your match!' })}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    renderItem={renderMatchCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor="#FF4458"
                            colors={['#FF4458']}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F2F4',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F0F2F4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E6EA',
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#21262E',
    },
    list: {
        padding: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    // Тохирсон хэрэглэгчийн карт
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8E6EA',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    photoContainer: {
        width: '100%',
        height: CARD_WIDTH * 1.2,
        backgroundColor: '#E8E6EA',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    // Зураггүй үед нэрийн эхний үсэг харуулах
    avatarPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF4458',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    // Картын доод хэсгийн мэдээлэл
    cardInfo: {
        padding: 12,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#21262E',
        marginBottom: 4,
    },
    cardMatchedAt: {
        fontSize: 12,
        color: '#656E7B',
    },
    // Хоосон төлөв
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyHeart: {
        fontSize: 64,
        color: '#FF4458',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#21262E',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#656E7B',
        textAlign: 'center',
    },
});
