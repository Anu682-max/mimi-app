import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Animated,
    PanResponder,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface UserProfile {
    id: string;
    firstName: string;
    lastName?: string;
    bio?: string;
    age?: number;
    gender?: string;
    photos: string[];
    interests: string[];
    occupation?: string;
    city?: string;
    country?: string;
}

export default function DiscoverScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { token } = useAuth();

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showMatch, setShowMatch] = useState(false);
    const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

    const position = useRef(new Animated.ValueXY()).current;
    const rotate = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
    });

    const likeOpacity = position.x.interpolate({
        inputRange: [0, width / 4],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const nopeOpacity = position.x.interpolate({
        inputRange: [-width / 4, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
            position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dx > SWIPE_THRESHOLD) {
                swipeRight();
            } else if (gesture.dx < -SWIPE_THRESHOLD) {
                swipeLeft();
            } else {
                resetPosition();
            }
        },
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/discover`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const swipeRight = async () => {
        const currentUser = users[currentIndex];
        Animated.timing(position, {
            toValue: { x: width + 100, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => {
            handleSwipe('like', currentUser);
        });
    };

    const swipeLeft = () => {
        const currentUser = users[currentIndex];
        Animated.timing(position, {
            toValue: { x: -width - 100, y: 0 },
            duration: 250,
            useNativeDriver: false,
        }).start(() => {
            handleSwipe('pass', currentUser);
        });
    };

    const handleSwipe = async (action: 'like' | 'pass', user: UserProfile) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/discover/swipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetUserId: user.id,
                    action,
                }),
            });

            const data = await response.json();

            if (data.isMatch) {
                setMatchedUser(user);
                setShowMatch(true);
            }
        } catch (error) {
            console.error('Swipe error:', error);
        }

        setCurrentIndex((prev) => prev + 1);
        position.setValue({ x: 0, y: 0 });
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
        }).start();
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EC4899" />
            </SafeAreaView>
        );
    }

    const currentUser = users[currentIndex];
    const noMoreUsers = currentIndex >= users.length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>mimi</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Cards */}
            <View style={styles.cardsContainer}>
                {noMoreUsers ? (
                    <View style={styles.noUsersContainer}>
                        <Text style={styles.noUsersEmoji}>💔</Text>
                        <Text style={styles.noUsersTitle}>{t('discover.no_more_profiles')}</Text>
                        <Text style={styles.noUsersText}>Check back later!</Text>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={() => { setCurrentIndex(0); fetchUsers(); }}
                        >
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                ) : currentUser ? (
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                transform: [
                                    { translateX: position.x },
                                    { translateY: position.y },
                                    { rotate },
                                ],
                            },
                        ]}
                        {...panResponder.panHandlers}
                    >
                        {/* LIKE/NOPE overlay */}
                        <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
                            <Text style={styles.likeLabelText}>LIKE</Text>
                        </Animated.View>
                        <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
                            <Text style={styles.nopeLabelText}>NOPE</Text>
                        </Animated.View>

                        {/* Photo */}
                        <View style={styles.photoContainer}>
                            {currentUser.photos && currentUser.photos.length > 0 ? (
                                <Image
                                    source={{ uri: currentUser.photos[0] }}
                                    style={styles.photo}
                                />
                            ) : (
                                <View style={styles.placeholderPhoto}>
                                    <Text style={styles.placeholderEmoji}>
                                        {currentUser.gender === 'female' ? '👩' : '👨'}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Info */}
                        <View style={styles.info}>
                            <View style={styles.nameRow}>
                                <Text style={styles.name}>{currentUser.firstName}</Text>
                                {currentUser.age && (
                                    <Text style={styles.age}>{currentUser.age}</Text>
                                )}
                            </View>
                            {currentUser.occupation && (
                                <Text style={styles.occupation}>💼 {currentUser.occupation}</Text>
                            )}
                            {currentUser.city && (
                                <Text style={styles.location}>
                                    📍 {currentUser.city}, {currentUser.country}
                                </Text>
                            )}
                            {currentUser.bio && (
                                <Text style={styles.bio} numberOfLines={2}>
                                    {currentUser.bio}
                                </Text>
                            )}
                        </View>
                    </Animated.View>
                ) : null}
            </View>

            {/* Action Buttons */}
            {!noMoreUsers && currentUser && (
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.passButton} onPress={swipeLeft}>
                        <Text style={styles.passButtonText}>✕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.likeButton} onPress={swipeRight}>
                        <Text style={styles.likeButtonText}>❤️</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Match Modal */}
            <Modal visible={showMatch} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.matchModal}>
                        <Text style={styles.matchEmoji}>🎉</Text>
                        <Text style={styles.matchTitle}>{t('matching.its_a_match')}</Text>
                        <Text style={styles.matchText}>
                            You and {matchedUser?.firstName} liked each other!
                        </Text>
                        <View style={styles.matchButtons}>
                            <TouchableOpacity
                                style={styles.messageButton}
                                onPress={() => {
                                    setShowMatch(false);
                                    navigation.navigate('ChatList');
                                }}
                            >
                                <Text style={styles.messageButtonText}>
                                    {t('matching.send_message')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.keepSwipingButton}
                                onPress={() => setShowMatch(false)}
                            >
                                <Text style={styles.keepSwipingText}>
                                    {t('matching.keep_swiping')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    logo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#EC4899',
    },
    settingsIcon: {
        fontSize: 24,
    },
    cardsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    card: {
        width: width - 32,
        height: height * 0.65,
        backgroundColor: '#1A1A24',
        borderRadius: 20,
        overflow: 'hidden',
    },
    likeLabel: {
        position: 'absolute',
        top: 50,
        left: 30,
        zIndex: 10,
        transform: [{ rotate: '-20deg' }],
    },
    likeLabelText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10B981',
        borderWidth: 3,
        borderColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    nopeLabel: {
        position: 'absolute',
        top: 50,
        right: 30,
        zIndex: 10,
        transform: [{ rotate: '20deg' }],
    },
    nopeLabelText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#EF4444',
        borderWidth: 3,
        borderColor: '#EF4444',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    photoContainer: {
        flex: 1,
        backgroundColor: '#374151',
    },
    photo: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderPhoto: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderEmoji: {
        fontSize: 100,
    },
    info: {
        padding: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginRight: 8,
    },
    age: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    occupation: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: '#D1D5DB',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        paddingVertical: 24,
    },
    passButton: {
        width: 64,
        height: 64,
        backgroundColor: '#374151',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6B7280',
    },
    passButtonText: {
        fontSize: 28,
        color: '#FFF',
    },
    likeButton: {
        width: 64,
        height: 64,
        backgroundColor: '#EC4899',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    likeButtonText: {
        fontSize: 28,
    },
    noUsersContainer: {
        alignItems: 'center',
    },
    noUsersEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    noUsersTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    noUsersText: {
        fontSize: 16,
        color: '#9CA3AF',
        marginBottom: 24,
    },
    refreshButton: {
        backgroundColor: '#EC4899',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    refreshButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    matchModal: {
        alignItems: 'center',
        padding: 24,
    },
    matchEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    matchTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#EC4899',
        marginBottom: 8,
    },
    matchText: {
        fontSize: 16,
        color: '#9CA3AF',
        marginBottom: 32,
    },
    matchButtons: {
        gap: 16,
    },
    messageButton: {
        backgroundColor: '#EC4899',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    messageButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    keepSwipingButton: {
        backgroundColor: '#374151',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#6B7280',
    },
    keepSwipingText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
