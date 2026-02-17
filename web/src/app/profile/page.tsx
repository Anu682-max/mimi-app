'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CameraIcon, PlusIcon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// Профайл мэдээллийн интерфэйс
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
    const { user, token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
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
            // Хэрэглэгчийн мэдээллээс профайл ачаалах
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

    // Профайл хадгалах
    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        // Хадгалалтыг симуляц хийх
        setTimeout(() => {
            setIsSaving(false);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        }, 1000);
    };

    // Талбар өөрчлөх
    const handleChange = (field: keyof ProfileData, value: any) => {
        setProfile({ ...profile, [field]: value });
    };

    // Сонирхол нэмэх
    const addInterest = () => {
        if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
            setProfile({
                ...profile,
                interests: [...profile.interests, newInterest.trim()],
            });
            setNewInterest('');
        }
    };

    // Сонирхол устгах
    const removeInterest = (interest: string) => {
        setProfile({
            ...profile,
            interests: profile.interests.filter((i) => i !== interest),
        });
    };

    // Зураг байршуулах
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        setMessage('');

        try {
            // Backend руу байршуулах
            const uploadResponse = await fetch(`${API_URL}/api/v1/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                // Тодорхой алдааны мессеж харуулах
                const errorMsg = uploadData.hint
                    ? `${uploadData.message}\n\n${uploadData.hint}`
                    : uploadData.message || 'Upload failed';
                throw new Error(errorMsg);
            }

            const imageUrl = uploadData.data.url;

            // Зураг профайлд нэмэх
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

            // Локал төлөв шинэчлэх
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

            // Алдааны мессежийг автоматаар нуухгүй
            if (!errorMsg.includes('not configured')) {
                setTimeout(() => setMessage(''), 5000);
            }
        } finally {
            setIsUploading(false);
        }
    };

    // Зураг устгах
    const handlePhotoDelete = async (photoUrl: string) => {
        if (!confirm('Remove this photo?')) return;

        try {
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

            // Локал төлөв шинэчлэх
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

    // Ачаалж байгаа үед
    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#F0F2F4] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4458]"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F0F2F4] text-[#21262E] pb-20">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Толгой хэсэг */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-[#21262E]">Edit Profile</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                logout();
                                router.push('/');
                            }}
                            className="px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-400 rounded-xl transition flex items-center gap-2"
                            title="Logout"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 text-white rounded-full transition disabled:opacity-50 font-medium"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Мессеж */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-center ${
                        message.startsWith('✅')
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : message.startsWith('❌')
                            ? 'bg-red-50 text-red-500 border border-red-200'
                            : 'bg-green-50 text-green-600 border border-green-200'
                    }`}>
                        <div className="whitespace-pre-line">{message}</div>
                    </div>
                )}

                {/* Форм */}
                <div className="space-y-6">
                    {/* Зурагнууд */}
                    <div className="bg-white border border-[#E8E6EA] rounded-xl p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-[#21262E] mb-4">Profile Photos</label>

                        {isUploading && (
                            <div className="mb-4 p-4 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#FF4458]"></div>
                                    <span className="text-sm text-[#656E7B]">Uploading photo...</span>
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
                                        className="w-full h-full object-cover rounded-xl border border-[#E8E6EA]"
                                    />
                                    <button
                                        onClick={() => handlePhotoDelete(photo)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-400 hover:bg-red-500 rounded-full transition opacity-0 group-hover:opacity-100 text-white"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-linear-to-r from-[#FD267A] to-[#FF6036] text-white text-xs rounded-full">
                                            Main
                                        </div>
                                    )}
                                </div>
                            ))}
                            {profile.photos.length < 6 && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="aspect-square border-2 border-dashed border-[#E8E6EA] hover:border-[#FF4458] rounded-xl flex flex-col items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    <PlusIcon className="w-8 h-8 text-[#656E7B]" />
                                    <span className="text-xs text-[#656E7B]">Add Photo</span>
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-[#656E7B] mt-3">
                            Upload up to 6 photos. First photo will be your main profile picture.
                        </p>
                    </div>

                    {/* Үндсэн мэдээлэл */}
                    <div className="bg-white border border-[#E8E6EA] rounded-xl p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-[#21262E] mb-4">Basic Information</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-[#656E7B] mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={profile.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    className="w-full p-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#656E7B] mb-2">Last Name</label>
                                <input
                                    type="text"
                                    value={profile.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    className="w-full p-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-[#656E7B] mb-2">Bio</label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                rows={4}
                                className="w-full p-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30 resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-[#656E7B] mb-2">Age</label>
                                <input
                                    type="number"
                                    value={profile.age}
                                    onChange={(e) => handleChange('age', e.target.value ? parseInt(e.target.value) : '')}
                                    className="w-full p-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#656E7B] mb-2">Gender</label>
                                <select
                                    value={profile.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className="w-full p-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30"
                                >
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-[#656E7B] mb-2">Occupation</label>
                            <input
                                type="text"
                                value={profile.occupation}
                                onChange={(e) => handleChange('occupation', e.target.value)}
                                className="w-full p-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30"
                                placeholder="What do you do?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[#656E7B] mb-2">City</label>
                            <input
                                type="text"
                                value={profile.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="w-full p-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30"
                            />
                        </div>
                    </div>

                    {/* Сонирхлууд */}
                    <div className="bg-white border border-[#E8E6EA] rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-[#21262E] mb-4">Interests</h2>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                                placeholder="Add an interest..."
                                className="flex-1 p-3 bg-[#F0F2F4] border border-[#E8E6EA] rounded-lg text-[#21262E] placeholder-[#656E7B] focus:outline-none focus:ring-2 focus:ring-[#FF4458]/30"
                            />
                            <button
                                type="button"
                                onClick={addInterest}
                                className="w-12 h-12 bg-linear-to-r from-[#FD267A] to-[#FF6036] hover:shadow-lg hover:shadow-gray-200 rounded-xl flex items-center justify-center transition text-white"
                            >
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest, i) => (
                                <span
                                    key={i}
                                    className="px-4 py-2 bg-[#FF4458]/10 text-[#FF4458] border border-[#FF4458]/20 rounded-full text-sm flex items-center gap-2"
                                >
                                    {interest}
                                    <button
                                        type="button"
                                        onClick={() => removeInterest(interest)}
                                        className="hover:text-[#FD267A] transition-colors"
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
