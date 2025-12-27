import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
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

export default function EditProfileScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { token } = useAuth();

    const [profile, setProfile] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        bio: '',
        age: undefined,
        occupation: '',
        city: '',
        country: '',
        photos: [],
        interests: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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
            const response = await fetch(`${API_URL}/api/v1/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.user) {
                setProfile({
                    firstName: data.user.firstName || '',
                    lastName: data.user.lastName || '',
                    bio: data.user.bio || '',
                    age: data.user.age,
                    occupation: data.user.occupation || '',
                    city: data.user.city || '',
                    country: data.user.country || '',
                    photos: data.user.photos || [],
                    interests: data.user.interests || [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        if (profile.photos.length >= 6) {
            Alert.alert('Maximum Reached', 'You can only upload up to 6 photos');
            return;
        }

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
            const formData = new FormData();
            const filename = imageUri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type,
            } as any);

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

            setProfile(prev => ({
                ...prev,
                photos: updateData.photos || [...prev.photos, imageUrl]
            }));

            Alert.alert('Success', 'Photo uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    const deletePhoto = async (photoUrl: string) => {
        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/api/v1/users/me/photo`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ photoUrl }),
                            });

                            if (!response.ok) throw new Error('Failed to delete photo');

                            const data = await response.json();
                            setProfile(prev => ({
                                ...prev,
                                photos: data.photos || prev.photos.filter(p => p !== photoUrl)
                            }));

                            Alert.alert('Success', 'Photo deleted successfully');
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete photo');
                        }
                    }
                }
            ]
        );
    };

    const saveProfile = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/api/v1/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    bio: profile.bio,
                    age: profile.age,
                    occupation: profile.occupation,
                    city: profile.city,
                    country: profile.country,
                }),
            });

            if (!response.ok) throw new Error('Failed to save profile');

            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setIsSaving(false);
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
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Profile</Text>
                    <TouchableOpacity onPress={saveProfile} disabled={isSaving}>
                        <Text style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Photos Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile Photos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                        {profile.photos.map((photo, index) => (
                            <View key={index} style={styles.photoItem}>
                                <Image source={{ uri: photo }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deletePhoto(photo)}
                                >
                                    <Text style={styles.deleteIcon}>✕</Text>
                                </TouchableOpacity>
                                {index === 0 && (
                                    <View style={styles.mainBadge}>
                                        <Text style={styles.mainBadgeText}>Main</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                        {profile.photos.length < 6 && (
                            <TouchableOpacity
                                style={styles.addPhotoButton}
                                onPress={pickImage}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <ActivityIndicator size="small" color="#EC4899" />
                                ) : (
                                    <>
                                        <Text style={styles.addPhotoIcon}>+</Text>
                                        <Text style={styles.addPhotoText}>Add Photo</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                    <Text style={styles.photoHint}>Upload up to 6 photos. First photo will be your main picture.</Text>
                </View>

                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.row}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                value={profile.firstName}
                                onChangeText={(text) => setProfile({...profile, firstName: text})}
                                placeholder="Enter first name"
                                placeholderTextColor="#6B7280"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                value={profile.lastName}
                                onChangeText={(text) => setProfile({...profile, lastName: text})}
                                placeholder="Enter last name"
                                placeholderTextColor="#6B7280"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={profile.bio}
                            onChangeText={(text) => setProfile({...profile, bio: text})}
                            placeholder="Tell us about yourself..."
                            placeholderTextColor="#6B7280"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                value={profile.age?.toString() || ''}
                                onChangeText={(text) => setProfile({...profile, age: parseInt(text) || undefined})}
                                placeholder="Age"
                                placeholderTextColor="#6B7280"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Occupation</Text>
                            <TextInput
                                style={styles.input}
                                value={profile.occupation}
                                onChangeText={(text) => setProfile({...profile, occupation: text})}
                                placeholder="Your job"
                                placeholderTextColor="#6B7280"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                value={profile.city}
                                onChangeText={(text) => setProfile({...profile, city: text})}
                                placeholder="City"
                                placeholderTextColor="#6B7280"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput
                                style={styles.input}
                                value={profile.country}
                                onChangeText={(text) => setProfile({...profile, country: text})}
                                placeholder="Country"
                                placeholderTextColor="#6B7280"
                            />
                        </View>
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
    saveButton: {
        fontSize: 16,
        color: '#EC4899',
        fontWeight: '600',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 16,
    },
    photosScroll: {
        marginBottom: 8,
    },
    photoItem: {
        marginRight: 12,
        position: 'relative',
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    deleteButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    mainBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: '#EC4899',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    mainBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addPhotoButton: {
        width: 120,
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#374151',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(55, 65, 81, 0.2)',
    },
    addPhotoIcon: {
        fontSize: 32,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    addPhotoText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    photoHint: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    inputContainer: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#1A1A24',
        borderWidth: 1,
        borderColor: '#374151',
        borderRadius: 12,
        padding: 12,
        color: '#FFF',
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
});
