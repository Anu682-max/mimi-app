'use client';

import { useState, useEffect } from 'react';
import { usePushNotification } from '@/hooks/usePushNotification';

export default function TestPushPage() {
    const { permission, subscribeUser, isLoading } = usePushNotification();
    const [testResult, setTestResult] = useState<string>('');
    const [sending, setSending] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const sendTestNotification = async () => {
        setSending(true);
        setTestResult('');

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setTestResult('❌ Please login first');
                setSending(false);
                return;
            }

            const response = await fetch('http://localhost:3699/api/v1/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: '💕 New Match!',
                    body: 'You have a new match! Say hello 👋',
                    url: '/dashboard',
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setTestResult('✅ Notification sent successfully! Check your browser.');
            } else {
                setTestResult('❌ Failed: ' + (data.error || data.message));
            }
        } catch (error: any) {
            setTestResult('❌ Error: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-700 to-[#FF4458] p-8">
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <h1 className="text-3xl font-bold text-white mb-8">🔔 Push Notification Test</h1>

                {/* Permission Status */}
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-2">Permission Status</h2>
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-3 h-3 rounded-full ${
                                permission === 'granted'
                                    ? 'bg-green-500'
                                    : permission === 'denied'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                            }`}
                        />
                        <span className="text-white capitalize">{permission}</span>
                    </div>
                </div>

                {/* Subscribe Button */}
                {permission !== 'granted' && (
                    <div className="mb-6">
                        <button
                            onClick={subscribeUser}
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-[#FD267A] to-[#FF6036] hover:from-[#FD267A]/90 hover:to-[#FF6036]/90 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-bold text-lg transition-all shadow-lg"
                        >
                            {isLoading ? '⏳ Requesting Permission...' : '🔔 Enable Push Notifications'}
                        </button>
                        <p className="text-white/60 text-sm mt-2 text-center">
                            Click to request notification permission
                        </p>
                    </div>
                )}

                {/* Test Send Button */}
                {permission === 'granted' && (
                    <div className="mb-6">
                        <button
                            onClick={sendTestNotification}
                            disabled={sending}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 rounded-xl text-white font-bold text-lg transition-all shadow-lg"
                        >
                            {sending ? '📤 Sending...' : '📤 Send Test Notification'}
                        </button>
                        <p className="text-white/60 text-sm mt-2 text-center">
                            Send a test push notification to this browser
                        </p>
                    </div>
                )}

                {/* Result */}
                {testResult && (
                    <div
                        className={`p-4 rounded-xl border ${
                            testResult.includes('✅')
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                        }`}
                    >
                        <p
                            className={`font-medium ${
                                testResult.includes('✅') ? 'text-green-300' : 'text-red-300'
                            }`}
                        >
                            {testResult}
                        </p>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-2">📝 Instructions:</h3>
                    <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
                        <li>Enable push notifications by clicking the button above</li>
                        <li>Make sure you're logged in</li>
                        <li>Click "Send Test Notification"</li>
                        <li>Check your browser for the notification</li>
                    </ol>
                </div>

                {/* Debug Info */}
                <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/10">
                    <h3 className="text-xs font-semibold text-white/60 mb-2">Debug Info:</h3>
                    {mounted ? (
                        <pre className="text-white/50 text-xs overflow-x-auto">
                            {JSON.stringify(
                                {
                                    permission,
                                    isLoading,
                                    'service-worker': 'serviceWorker' in navigator,
                                    'push-manager': 'PushManager' in window,
                                    logged_in: !!localStorage.getItem('token'),
                                },
                                null,
                                2
                            )}
                        </pre>
                    ) : (
                        <p className="text-white/50 text-xs">Loading...</p>
                    )}
                </div>

                {/* Back Link */}
                <a
                    href="/dashboard"
                    className="mt-6 block text-center text-white/70 hover:text-white underline"
                >
                    ← Back to Dashboard
                </a>
            </div>
        </div>
    );
}
