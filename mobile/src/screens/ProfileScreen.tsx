import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
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
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'We need permission to access your photos to upload profile pictures.'
            );
        }
    };

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

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadImage = async (imageUri: string) => {
        setIsUploading(true);
        try {
            // Create form data
            const formData = new FormData();
            const filename = imageUri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type,
            } as any);

            // Upload to backend
            const uploadResponse = await fetch(`${API_URL}/api/v1/media/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Upload failed');
            }

            const imageUrl = uploadData.data.url;

            // Add photo to profile
            const updateResponse = await fetch(`${API_URL}/api/v1/users/me/photo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ photoUrl: imageUrl }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update profile');
            }

            const updateData = await updateResponse.json();

            // Update local state
            setProfile(prev => prev ? {
                ...prev,
                photos: updateData.photos || [...prev.photos, imageUrl]
            } : null);

            Alert.alert('Success', 'Photo uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4458" />
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
                    <TouchableOpacity
                        onPress={pickImage}
                        disabled={isUploading}
                        style={styles.photoContainer}
                    >
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
                        <View style={styles.cameraButton}>
                            <Text style={styles.cameraIcon}>📷</Text>
                        </View>
                        {isUploading && (
                            <View style={styles.uploadingOverlay}>
                                <ActivityIndicator size="large" color="#FF4458" />
                            </View>
                        )}
                    </TouchableOpacity>
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
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text style={styles.editButtonText}>{t('profile.edit_profile')}</Text>
                </TouchableOpacity>
            </ScrollView>
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
        color: '#21262E',
    },
    settingsIcon: {
        fontSize: 24,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profilePhoto: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    photoPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#FF4458',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoPlaceholderText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#FFF',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FF4458',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#F0F2F4',
    },
    cameraIcon: {
        fontSize: 20,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameSection: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#21262E',
        marginRight: 8,
    },
    age: {
        fontSize: 24,
        color: '#656E7B',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8E6EA',
    },
    infoLabel: {
        fontSize: 14,
        color: '#656E7B',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: '#21262E',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestTag: {
        backgroundColor: 'rgba(255, 68, 88, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    interestText: {
        color: '#FF4458',
        fontSize: 14,
    },
    editButton: {
        backgroundColor: '#FF4458',
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
