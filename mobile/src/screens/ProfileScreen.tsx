import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

interface ProfileData {
    firstName: string;
    lastName?: string;
    bio?: string;
    age?: number;
    occupation?: string;
    city?: string;
    country?: string;
    photos: string[];
    interests: string[];
}

export default function ProfileScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { token, user } = useAuth();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setProfile(data.profile);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
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
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{t('profile.title')}</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Text style={styles.settingsIcon}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* Profile Photo */}
                <View style={styles.photoSection}>
                    {profile?.photos && profile.photos.length > 0 ? (
                        <Image
                            source={{ uri: profile.photos[0] }}
                            style={styles.profilePhoto}
                        />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Text style={styles.photoPlaceholderText}>
                                {profile?.firstName?.[0] || '?'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.nameSection}>
                        <Text style={styles.name}>
                            {profile?.firstName} {profile?.lastName}
                        </Text>
                        {profile?.age && <Text style={styles.age}>{profile.age}</Text>}
                    </View>
                </View>

                {/* Info Cards */}
                {profile?.bio && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Bio</Text>
                        <Text style={styles.infoText}>{profile.bio}</Text>
                    </View>
                )}

                {profile?.occupation && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>💼 Occupation</Text>
                        <Text style={styles.infoText}>{profile.occupation}</Text>
                    </View>
                )}

                {profile?.city && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>📍 Location</Text>
                        <Text style={styles.infoText}>
                            {profile.city}, {profile.country}
                        </Text>
                    </View>
                )}

                {/* Interests */}
                {profile?.interests && profile.interests.length > 0 && (
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>✨ Interests</Text>
                        <View style={styles.interestsContainer}>
                            {profile.interests.map((interest, i) => (
                                <View key={i} style={styles.interestTag}>
                                    <Text style={styles.interestText}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Edit Profile Button */}
                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>{t('profile.edit_profile')}</Text>
                </TouchableOpacity>
            </ScrollView>
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
    scrollContent: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    settingsIcon: {
        fontSize: 24,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    profilePhoto: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 16,
    },
    photoPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#EC4899',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    photoPlaceholderText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#FFF',
    },
    nameSection: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginRight: 8,
    },
    age: {
        fontSize: 24,
        color: '#9CA3AF',
    },
    infoCard: {
        backgroundColor: '#1A1A24',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: '#FFF',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    interestText: {
        color: '#EC4899',
        fontSize: 14,
    },
    editButton: {
        backgroundColor: '#EC4899',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
