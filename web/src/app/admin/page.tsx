'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    UsersIcon,
    HeartIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Stats {
    totalUsers: number;
    activeUsers: number;
    totalMatches: number;
    totalMessages: number;
    reportedUsers: number;
    newUsersToday: number;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    city: string;
    status: 'active' | 'suspended' | 'banned';
    createdAt: string;
}

export default function AdminPanel() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<Stats>({
        totalUsers: 156,
        activeUsers: 89,
        totalMatches: 342,
        totalMessages: 1248,
        reportedUsers: 3,
        newUsersToday: 12,
    });
    const [users, setUsers] = useState<User[]>([
        {
            id: '1',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            age: 25,
            city: 'Ulaanbaatar',
            status: 'active',
            createdAt: '2024-12-01',
        },
        {
            id: '2',
            firstName: 'Ariuka',
            lastName: 'Bat',
            email: 'ariuka@example.com',
            age: 28,
            city: 'Seoul',
            status: 'active',
            createdAt: '2024-12-10',
        },
        {
            id: '3',
            firstName: 'Boldbaatar',
            lastName: 'Ganbold',
            email: 'bold@example.com',
            age: 32,
            city: 'Tokyo',
            status: 'active',
            createdAt: '2024-12-12',
        },
    ]);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'reports'>('overview');

    // Check if user is admin
    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        // In production, check if user has admin role
        // For now, only test@example.com can access
        if (user.email !== 'test@example.com') {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleUserAction = (userId: string, action: 'suspend' | 'activate' | 'ban') => {
        setUsers(users.map(u => 
            u.id === userId 
                ? { ...u, status: action === 'activate' ? 'active' : action === 'suspend' ? 'suspended' : 'banned' }
                : u
        ));
    };

    if (!user || user.email !== 'test@example.com') {
        return null;
    }

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'from-blue-500 to-cyan-500' },
        { label: 'Active Users', value: stats.activeUsers, icon: ShieldCheckIcon, color: 'from-green-500 to-emerald-500' },
        { label: 'Total Matches', value: stats.totalMatches, icon: HeartIcon, color: 'from-pink-500 to-rose-500' },
        { label: 'Messages', value: stats.totalMessages, icon: ChatBubbleLeftRightIcon, color: 'from-purple-500 to-indigo-500' },
        { label: 'New Today', value: stats.newUsersToday, icon: ChartBarIcon, color: 'from-orange-500 to-amber-500' },
        { label: 'Reports', value: stats.reportedUsers, icon: ExclamationTriangleIcon, color: 'from-red-500 to-rose-500' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                    <p className="text-gray-400 mt-2">Manage users, monitor activity, and handle reports</p>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-gray-800">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setSelectedTab('overview')}
                            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                                selectedTab === 'overview'
                                    ? 'border-pink-500 text-pink-500'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setSelectedTab('users')}
                            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                                selectedTab === 'users'
                                    ? 'border-pink-500 text-pink-500'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            User Management
                        </button>
                        <button
                            onClick={() => setSelectedTab('reports')}
                            className={`pb-4 px-2 border-b-2 font-medium transition-colors ${
                                selectedTab === 'reports'
                                    ? 'border-pink-500 text-pink-500'
                                    : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                        >
                            Reports
                        </button>
                    </div>
                </div>

                {/* Overview Tab */}
                {selectedTab === 'overview' && (
                    <div>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {statCards.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={stat.label}
                                        className="bg-[#13131a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                                                <p className="text-3xl font-bold">{stat.value}</p>
                                            </div>
                                            <div className={`w-12 h-12 bg-linear-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-[#13131a] border border-gray-800 rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {[
                                    { action: 'New user registered', user: 'Ariuka Bat', time: '5 minutes ago' },
                                    { action: 'Match created', user: 'Boldbaatar & Nandin', time: '12 minutes ago' },
                                    { action: 'Report submitted', user: 'User #123', time: '1 hour ago' },
                                    { action: 'New user registered', user: 'Enkhjin Dorj', time: '2 hours ago' },
                                ].map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                                        <div>
                                            <p className="text-white font-medium">{activity.action}</p>
                                            <p className="text-gray-400 text-sm">{activity.user}</p>
                                        </div>
                                        <p className="text-gray-500 text-sm">{activity.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {selectedTab === 'users' && (
                    <div className="bg-[#13131a] border border-gray-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">User Management</h2>
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="px-4 py-2 bg-[#0a0a0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Location</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                                                        {user.firstName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                                                        <p className="text-sm text-gray-400">{user.age} years</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-400">{user.email}</td>
                                            <td className="py-4 px-4 text-gray-400">{user.city}</td>
                                            <td className="py-4 px-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.status === 'active'
                                                            ? 'bg-green-500/20 text-green-500'
                                                            : user.status === 'suspended'
                                                            ? 'bg-yellow-500/20 text-yellow-500'
                                                            : 'bg-red-500/20 text-red-500'
                                                    }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-400">{user.createdAt}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex space-x-2">
                                                    {user.status !== 'active' && (
                                                        <button
                                                            onClick={() => handleUserAction(user.id, 'activate')}
                                                            className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm hover:bg-green-500/30 transition"
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                    {user.status === 'active' && (
                                                        <button
                                                            onClick={() => handleUserAction(user.id, 'suspend')}
                                                            className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-lg text-sm hover:bg-yellow-500/30 transition"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUserAction(user.id, 'ban')}
                                                        className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-sm hover:bg-red-500/30 transition"
                                                    >
                                                        Ban
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Reports Tab */}
                {selectedTab === 'reports' && (
                    <div className="bg-[#13131a] border border-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-6">User Reports</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    id: '1',
                                    reporter: 'User #456',
                                    reported: 'User #123',
                                    reason: 'Inappropriate behavior',
                                    status: 'pending',
                                    date: '2024-12-15',
                                },
                                {
                                    id: '2',
                                    reporter: 'User #789',
                                    reported: 'User #234',
                                    reason: 'Spam messages',
                                    status: 'pending',
                                    date: '2024-12-14',
                                },
                                {
                                    id: '3',
                                    reporter: 'User #321',
                                    reported: 'User #654',
                                    reason: 'Fake profile',
                                    status: 'resolved',
                                    date: '2024-12-13',
                                },
                            ].map((report) => (
                                <div key={report.id} className="bg-[#0a0a0f] border border-gray-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-4">
                                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                                            <div>
                                                <p className="font-medium">{report.reason}</p>
                                                <p className="text-sm text-gray-400">
                                                    {report.reporter} reported {report.reported}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                report.status === 'pending'
                                                    ? 'bg-yellow-500/20 text-yellow-500'
                                                    : 'bg-gray-500/20 text-gray-500'
                                            }`}
                                        >
                                            {report.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500">{report.date}</p>
                                        {report.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <button className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg text-sm hover:bg-green-500/30 transition">
                                                    Review
                                                </button>
                                                <button className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg text-sm hover:bg-red-500/30 transition">
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
