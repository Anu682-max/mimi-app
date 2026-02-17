'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Restaurant {
    _id: string;
    name: string;
    address: string;
    phone: string;
    cuisine: string;
    rating: number;
    isActive: boolean;
}

export default function RestaurantsPage() {
    const router = useRouter();
    const { token } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('http://localhost:3699/api/v1/restaurants');
            if (!response.ok) throw new Error('Failed to fetch restaurants');
            const data = await response.json();
            setRestaurants(data);
        } catch (err) {
            setError('Рестораныг ачааллахад алдаа гарлаа');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestaurantClick = (id: string) => {
        router.push(`/restaurants/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4458]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">🍽️ Рестораны жагсаалт</h1>
                    <p className="mt-2 text-gray-600">Өөрт тохирох рестораныг сонгоод захиална уу</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {restaurants.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500 text-lg">Одоогоор ресторан байхгүй байна</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {restaurants.map((restaurant) => (
                            <div
                                key={restaurant._id}
                                onClick={() => handleRestaurantClick(restaurant._id)}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden"
                            >
                                {/* Restaurant Image Placeholder */}
                                <div className="h-48 bg-gradient-to-br from-[#FD267A] to-[#FF6036] flex items-center justify-center">
                                    <span className="text-6xl">🍔</span>
                                </div>

                                {/* Restaurant Info */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                                        <div className="flex items-center">
                                            <span className="text-yellow-500">⭐</span>
                                            <span className="ml-1 text-sm font-semibold text-gray-700">
                                                {restaurant.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <span className="mr-2">🍽️</span>
                                            <span>{restaurant.cuisine}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <span className="mr-2">📍</span>
                                            <span className="line-clamp-1">{restaurant.address}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <span className="mr-2">📞</span>
                                            <span>{restaurant.phone}</span>
                                        </div>
                                    </div>

                                    <button className="mt-4 w-full bg-[#FF4458] hover:bg-[#FF4458]/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                                        Цэс үзэх
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
