'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
    _id?: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    image?: string;
    isAvailable?: boolean;
}

interface Restaurant {
    _id: string;
    name: string;
    address: string;
    phone: string;
    cuisine: string;
    rating: number;
    menu: MenuItem[];
}

interface OrderItem {
    menuItem: string;
    quantity: number;
    price: number;
}

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { token, user } = useAuth();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [ordering, setOrdering] = useState(false);

    useEffect(() => {
        fetchRestaurant();
    }, [params.id]);

    const fetchRestaurant = async () => {
        try {
            const response = await fetch(`http://localhost:3699/api/v1/restaurants/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch restaurant');
            const data = await response.json();
            setRestaurant(data);
        } catch (err) {
            setError('Рестораныг ачааллахад алдаа гарлаа');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item: MenuItem) => {
        const existingItem = cart.find(cartItem => cartItem.menuItem === item.name);
        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.menuItem === item.name
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { menuItem: item.name, quantity: 1, price: item.price }]);
        }
    };

    const removeFromCart = (itemName: string) => {
        setCart(cart.filter(item => item.menuItem !== itemName));
    };

    const updateQuantity = (itemName: string, quantity: number) => {
        if (quantity === 0) {
            removeFromCart(itemName);
        } else {
            setCart(cart.map(item =>
                item.menuItem === itemName ? { ...item, quantity } : item
            ));
        }
    };

    const getTotalAmount = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleOrder = async () => {
        if (!token || !user) {
            alert('Захиалга өгөхийн тулд нэвтэрнэ үү');
            router.push('/login');
            return;
        }

        if (cart.length === 0) {
            alert('Захиалгын сагс хоосон байна');
            return;
        }

        if (!deliveryAddress.trim()) {
            alert('Хүргэлтийн хаяг оруулна уу');
            return;
        }

        setOrdering(true);
        try {
            const response = await fetch('http://localhost:3699/api/v1/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    restaurant: params.id,
                    items: cart,
                    totalAmount: getTotalAmount(),
                    deliveryAddress,
                    paymentMethod: 'cash',
                }),
            });

            if (!response.ok) throw new Error('Failed to create order');

            alert('Захиалга амжилттай үүслээ! 🎉');
            setCart([]);
            setDeliveryAddress('');
            router.push('/orders/my-orders');
        } catch (err) {
            alert('Захиалга үүсгэхэд алдаа гарлаа');
            console.error(err);
        } finally {
            setOrdering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{error || 'Ресторан олдсонгүй'}</p>
                    <button
                        onClick={() => router.push('/restaurants')}
                        className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
                    >
                        Буцах
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => router.push('/restaurants')}
                        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
                    >
                        ← Буцах
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                            <div className="mt-3 space-y-1">
                                <p className="text-gray-600">🍽️ {restaurant.cuisine}</p>
                                <p className="text-gray-600">📍 {restaurant.address}</p>
                                <p className="text-gray-600">📞 {restaurant.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-yellow-500 text-2xl">⭐</span>
                            <span className="ml-2 text-xl font-semibold">{restaurant.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Menu */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Цэс</h2>
                        {restaurant.menu.length === 0 ? (
                            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                                Цэс байхгүй байна
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {restaurant.menu.map((item, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                                {item.description && (
                                                    <p className="mt-1 text-gray-600 text-sm">{item.description}</p>
                                                )}
                                                <p className="mt-2 text-pink-600 font-bold text-xl">{item.price.toLocaleString()}₮</p>
                                            </div>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="ml-4 bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                                            >
                                                + Сагсанд
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">🛒 Захиалгын сагс</h2>
                            
                            {cart.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Сагс хоосон байна</p>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-4">
                                        {cart.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between border-b pb-3">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{item.menuItem}</p>
                                                    <p className="text-sm text-gray-600">{item.price.toLocaleString()}₮</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                                                        className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                                                        className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold mb-4">
                                            <span>Нийт:</span>
                                            <span className="text-pink-600">{getTotalAmount().toLocaleString()}₮</span>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Хүргэлтийн хаяг
                                            </label>
                                            <textarea
                                                value={deliveryAddress}
                                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                                placeholder="Хаягаа оруулна уу..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                        </div>

                                        <button
                                            onClick={handleOrder}
                                            disabled={ordering}
                                            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
                                        >
                                            {ordering ? 'Захиалж байна...' : '🛍️ Захиалах'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
