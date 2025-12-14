'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LOCALE_DISPLAY_NAMES, SUPPORTED_LOCALES, type Locale } from '@/i18n';

interface ProfileData {
    firstName: string;
    lastName: string;
    bio: string;
    age: number | '';
    gender: string;
    lookingFor: string;
    interests: string[];
    occupation: string;
    city: string;
    country: string;
    locale: string;
    photos: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function ProfilePage() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { token, isAuthenticated, isLoading: authLoading } = useAuth();

    const [profile, setProfile] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        bio: '',
        age: '',
        gender: '',
        lookingFor: '',
        interests: [],
        occupation: '',
        city: '',
        country: '',
        locale: 'en',
        photos: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setProfile({
                    firstName: data.profile.firstName || '',
                    lastName: data.profile.lastName || '',
                    bio: data.profile.bio || '',
                    age: data.profile.age || '',
                    gender: data.profile.gender || '',
                    lookingFor: data.profile.lookingFor || '',
                    interests: data.profile.interests || [],
                    occupation: data.profile.occupation || '',
                    city: data.profile.city || '',
                    country: data.profile.country || '',
                    locale: data.profile.locale || 'en',
                    photos: data.profile.photos || [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/api/v1/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(profile),
            });

            const data = await response.json();
            if (data.success) {
                setMessage('✅ Profile updated successfully!');
                // Update i18n locale if changed
                if (profile.locale !== i18n.language) {
                    i18n.changeLanguage(profile.locale);
                }
            } else {
                setMessage('❌ Failed to update profile');
            }
        } catch (error) {
            setMessage('❌ Error saving profile');
        } finally {
            setIsSaving(false);
        }
    };

    const addInterest = () => {
        if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
            setProfile({
                ...profile,
                interests: [...profile.interests, newInterest.trim()],
            });
            setNewInterest('');
        }
    };

    const removeInterest = (interest: string) => {
        setProfile({
            ...profile,
            interests: profile.interests.filter(i => i !== interest),
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 500KB)
        if (file.size > 500000) {
            setMessage('❌ Image too large. Max 500KB.');
            return;
        }

        setIsUploading(true);
        setMessage('');

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target?.result as string;

                const response = await fetch(`${API_URL}/api/v1/profile/photos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ photo: base64 }),
                });

                const data = await response.json();
                if (data.success) {
                    setMessage('✅ Photo uploaded!');
                    setProfile(prev => ({
                        ...prev,
                        photos: [...prev.photos, base64],
                    }));
                } else {
                    setMessage(`❌ ${data.error}`);
                }
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setMessage('❌ Upload failed');
            setIsUploading(false);
        }
    };

    const deletePhoto = async (index: number) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/profile/photos/${index}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                setProfile(prev => ({
                    ...prev,
                    photos: prev.photos.filter((_, i) => i !== index),
                }));
                setMessage('✅ Photo deleted');
            }
        } catch (error) {
            setMessage('❌ Delete failed');
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pb-20">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#0A0A0F] z-10">
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                    ← {t('common.back')}
                </Link>
                <h1 className="text-xl font-bold">{t('profile.edit_profile')}</h1>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-pink-500 rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
                >
                    {isSaving ? '...' : t('common.save')}
                </button>
            </header>

            {/* Message */}
            {message && (
                <div className="mx-4 mt-4 p-4 bg-gray-800 rounded-xl text-center">
                    {message}
                </div>
            )}

            {/* Form */}
            <section className="p-4 max-w-lg mx-auto">
                <div className="space-y-6">
                    {/* Photos */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Photos ({profile.photos.length}/6)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {profile.photos.map((photo, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                    <img
                                        src={photo}
                                        alt={`Photo ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => deletePhoto(i)}
                                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {profile.photos.length < 6 && (
                                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-pink-500 transition">
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                                    ) : (
                                        <span className="text-3xl text-gray-500">+</span>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">First Name</label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Bio</label>
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={3}
                            className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none resize-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {/* Age & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Age</label>
                            <input
                                type="number"
                                value={profile.age}
                                onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : '' })}
                                className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Gender</label>
                            <select
                                value={profile.gender}
                                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                            >
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Looking For */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Looking For</label>
                        <select
                            value={profile.lookingFor}
                            onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
                            className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                        >
                            <option value="">Select...</option>
                            <option value="male">Men</option>
                            <option value="female">Women</option>
                            <option value="both">Everyone</option>
                        </select>
                    </div>

                    {/* Occupation */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Occupation</label>
                        <input
                            type="text"
                            value={profile.occupation}
                            onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                            className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                            placeholder="What do you do?"
                        />
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">City</label>
                            <input
                                type="text"
                                value={profile.city}
                                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Country</label>
                            <input
                                type="text"
                                value={profile.country}
                                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                                className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Interests</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                                placeholder="Add an interest..."
                                className="flex-1 p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={addInterest}
                                className="px-4 py-3 bg-pink-500 rounded-xl hover:bg-pink-600"
                            >
                                +
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm flex items-center gap-2"
                                >
                                    {interest}
                                    <button
                                        type="button"
                                        onClick={() => removeInterest(interest)}
                                        className="hover:text-white"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">{t('settings.language')}</label>
                        <select
                            value={profile.locale}
                            onChange={(e) => setProfile({ ...profile, locale: e.target.value })}
                            className="w-full p-3 bg-[#1A1A24] rounded-xl border border-gray-700 focus:border-pink-500 focus:outline-none"
                        >
                            {SUPPORTED_LOCALES.map((locale) => (
                                <option key={locale} value={locale}>
                                    {LOCALE_DISPLAY_NAMES[locale]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>
        </main>
    );
}
