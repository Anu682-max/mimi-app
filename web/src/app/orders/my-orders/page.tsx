'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
    menuItem: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    restaurant: {
        _id: string;
        name: string;
        phone: string;
        address: string;
    };
    items: OrderItem[];
    totalAmount: number;
    deliveryAddress: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
    paymentMethod: string;
    createdAt: string;
}

export default function MyOrdersPage() {
    const router = useRouter();
    const { token, user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token || !user) {
            router.push('/login');
            return;
        }
        fetchOrders();
    }, [token, user]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3699/api/v1/orders/my-orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError('Захиалгуудыг ачааллахад алдаа гарлаа');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            preparing: 'bg-purple-100 text-purple-800',
            delivering: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            pending: '⏳ Хүлээгдэж байна',
            confirmed: '✅ Баталгаажсан',
            preparing: '👨‍🍳 Бэлтгэж байна',
            delivering: '🚚 Хүргэж байна',
            delivered: '✅ Хүргэгдсэн',
            cancelled: '❌ Цуцлагдсан',
        };
        return texts[status] || status;
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Та энэ захиалгыг цуцлахдаа итгэлтэй байна уу?')) return;

        try {
            const response = await fetch(`http://localhost:3699/api/v1/orders/${orderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to cancel order');

            alert('Захиалга цуцлагдлаа');
            fetchOrders();
        } catch (err) {
            alert('Захиалга цуцлахад алдаа гарлаа');
            console.error(err);
        }
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
                    <button
                        onClick={() => router.push('/restaurants')}
                        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
                    >
                        ← Ресторан руу буцах
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">📦 Миний захиалгууд</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500 text-lg mb-4">Танд одоогоор захиалга байхгүй байна</p>
                        <button
                            onClick={() => router.push('/restaurants')}
                            className="bg-[#FF4458] hover:bg-[#FF4458]/90 text-white px-6 py-2 rounded-lg font-semibold"
                        >
                            Рестораны жагсаалт руу очих
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-[#FD267A] to-[#FF6036] px-6 py-4 text-white">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold">{order.restaurant.name}</h3>
                                            <p className="text-gray-100 text-sm mt-1">
                                                {new Date(order.createdAt).toLocaleString('mn-MN')}
                                            </p>
                                        </div>
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Body */}
                                <div className="p-6">
                                    {/* Items */}
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Захиалсан бараа:</h4>
                                        <div className="space-y-2">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center text-gray-700">
                                                    <span>
                                                        {item.menuItem} <span className="text-gray-500">x{item.quantity}</span>
                                                    </span>
                                                    <span className="font-semibold">{(item.price * item.quantity).toLocaleString()}₮</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="mb-4 pb-4 border-b">
                                        <h4 className="font-semibold text-gray-900 mb-2">Хүргэлтийн хаяг:</h4>
                                        <p className="text-gray-700">📍 {order.deliveryAddress}</p>
                                    </div>

                                    {/* Restaurant Info */}
                                    <div className="mb-4 pb-4 border-b">
                                        <h4 className="font-semibold text-gray-900 mb-2">Ресторан:</h4>
                                        <p className="text-gray-700">📞 {order.restaurant.phone}</p>
                                        <p className="text-gray-700">📍 {order.restaurant.address}</p>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Нийт дүн:</span>
                                        <span className="text-[#FF4458] text-2xl">{order.totalAmount.toLocaleString()}₮</span>
                                    </div>

                                    {/* Actions */}
                                    {order.status === 'pending' && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
                                            >
                                                Захиалга цуцлах
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
