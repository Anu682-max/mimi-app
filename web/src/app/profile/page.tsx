'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CameraIcon, PlusIcon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface ProfileData {
    firstName: string;
    lastName: string;
    bio: string;
    age: number | '';
    gender: string;
    interests: string[];
    occupation: string;
    city: string;
    photos: string[];
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3699';

    const [profile, setProfile] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        bio: '',
        age: '',
        gender: '',
        interests: [],
        occupation: '',
        city: '',
        photos: [],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [newInterest, setNewInterest] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            // Load profile from user data
            setProfile({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: 'Love traveling, coffee, and good conversations! 🌍☕',
                age: 25,
                gender: 'male',
                interests: ['Travel', 'Coffee', 'Music', 'Photography'],
                occupation: 'Software Engineer',
                city: 'Ulaanbaatar',
                photos: [],
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        // Simulate save
        setTimeout(() => {
            setIsSaving(false);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        }, 1000);
    };

    const handleChange = (field: keyof ProfileData, value: any) => {
        setProfile({ ...profile, [field]: value });
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
            interests: profile.interests.filter((i) => i !== interest),
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            
            // Upload to backend
            const uploadResponse = await fetch(`${API_URL}/api/v1/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                // Show specific error message
                const errorMsg = uploadData.hint 
                    ? `${uploadData.message}\n\n${uploadData.hint}`
                    : uploadData.message || 'Upload failed';
                throw new Error(errorMsg);
            }

            const imageUrl = uploadData.data.url;

            // Add photo to user profile
            const updateResponse = await fetch(`${API_URL}/api/v1/users/me/photo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ photoUrl: imageUrl })
            });

            if (!updateResponse.ok) throw new Error('Failed to update profile');

            const updateData = await updateResponse.json();
            
            // Update local state
            setProfile(prev => ({
                ...prev,
                photos: updateData.photos || [...prev.photos, imageUrl]
            }));

            setMessage('✅ Photo uploaded successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Photo upload error:', error);
            const errorMsg = error instanceof Error ? error.message : 'Failed to upload photo';
            setMessage(`❌ ${errorMsg}`);
            
            // Don't auto-hide error messages
            if (!errorMsg.includes('not configured')) {
                setTimeout(() => setMessage(''), 5000);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handlePhotoDelete = async (photoUrl: string) => {
        if (!confirm('Remove this photo?')) return;

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_URL}/api/v1/users/me/photo`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ photoUrl })
            });

            if (!response.ok) throw new Error('Failed to delete photo');

            const data = await response.json();
            
            // Update local state
            setProfile(prev => ({
                ...prev,
                photos: data.photos || prev.photos.filter(p => p !== photoUrl)
            }));

            setMessage('Photo removed successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Photo delete error:', error);
            setMessage('Failed to remove photo. Please try again.');
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white pb-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Edit Profile</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                logout();
                                router.push('/');
                            }}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg transition flex items-center gap-2"
                            title="Logout"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg transition disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-center ${
                        message.startsWith('✅') 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : message.startsWith('❌')
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-green-500/20 text-green-400'
                    }`}>
                        <div className="whitespace-pre-line">{message}</div>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-6">
                    {/* Photos */}
                    <div className="bg-[#13131a] border border-gray-800 rounded-xl p-6">
                        <label className="block text-sm font-medium mb-4">Profile Photos</label>
                        
                        {isUploading && (
                            <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-pink-500"></div>
                                    <span className="text-sm text-gray-400">Uploading photo...</span>
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="grid grid-cols-3 gap-4">
                            {profile.photos.map((photo, index) => (
                                <div key={index} className="relative aspect-square group">
                                    <img
                                        src={photo}
                                        alt={`Photo ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => handlePhotoDelete(photo)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition opacity-0 group-hover:opacity-100"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-pink-500 text-xs rounded-full">
                                            Main
                                        </div>
                                    )}
                                </div>
                            ))}
                            {profile.photos.length < 6 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="aspect-square border-2 border-dashed border-gray-700 hover:border-pink-500 rounded-lg flex flex-col items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-500/5"
                                >
                                    <PlusIcon className="w-8 h-8 text-gray-400" />
                                    <span className="text-xs text-gray-400">Add Photo</span>
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            📷 Upload up to 6 photos. First photo will be your main profile picture.
                        </p>
                    </div>

                    {/* Basic Info */}
                    <div className="bg-[#13131a] border border-gray-800 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={profile.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={profile.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Bio</label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                rows={4}
                                className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-pink-500 resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Age</label>
                                <input
                                    type="number"
                                    value={profile.age}
                                    onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : '')}
                                    className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Gender</label>
                                <select
                                    value={profile.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Occupation</label>
                            <input
                                type="text"
                                value={profile.occupation}
                                onChange={(e) => handleChange('occupation', e.target.value)}
                                className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
                                placeholder="What do you do?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">City</label>
                            <input
                                type="text"
                                value={profile.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="w-full p-3 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
                            />
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="bg-[#13131a] border border-gray-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold mb-4">Interests</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                                placeholder="Add an interest..."
                                className="flex-1 p-3 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-pink-500"
                            />
                            <button
                                type="button"
                                onClick={addInterest}
                                className="w-12 h-12 bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center justify-center transition"
                            >
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest, i) => (
                                <span
                                    key={i}
                                    className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-full text-sm flex items-center gap-2"
                                >
                                    {interest}
                                    <button
                                        type="button"
                                        onClick={() => removeInterest(interest)}
                                        className="hover:text-white"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
