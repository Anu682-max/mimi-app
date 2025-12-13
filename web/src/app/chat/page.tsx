'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface Message {
    id: string;
    text: string;
    translatedText?: string;
    sourceLocale: string;
    isOwn: boolean;
    time: string;
    showTranslation: boolean;
}

const MOCK_MESSAGES: Message[] = [
    { id: '1', text: 'こんにちは！元気ですか？', translatedText: 'Hello! How are you?', sourceLocale: 'ja', isOwn: false, time: '10:30', showTranslation: true },
    { id: '2', text: "I'm doing great, thanks for asking!", sourceLocale: 'en', isOwn: true, time: '10:31', showTranslation: false },
    { id: '3', text: '今週末、どこか行きませんか？', translatedText: 'Would you like to go somewhere this weekend?', sourceLocale: 'ja', isOwn: false, time: '10:32', showTranslation: true },
    { id: '4', text: 'That sounds fun! What did you have in mind?', sourceLocale: 'en', isOwn: true, time: '10:33', showTranslation: false },
];

export default function ChatPage() {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');

    const toggleTranslation = (id: string) => {
        setMessages(messages.map(msg =>
            msg.id === id ? { ...msg, showTranslation: !msg.showTranslation } : msg
        ));
    };

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: String(Date.now()),
            text: inputText,
            sourceLocale: i18n.language,
            isOwn: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            showTranslation: false,
        };

        setMessages([...messages, newMessage]);
        setInputText('');
    };

    return (
        <main className="h-screen flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-gray-800 flex items-center gap-3">
                <Link href="/" className="text-gray-400 hover:text-white">
                    ←
                </Link>
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full"></div>
                <div>
                    <h1 className="font-semibold">Yuki</h1>
                    <p className="text-sm text-green-400">{t('chat.typing')}</p>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <p className="text-lg">{t('chat.no_messages')}</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-2xl p-4 ${msg.isOwn
                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 rounded-br-md'
                                        : 'bg-[#1A1A24] rounded-bl-md'
                                    }`}
                            >
                                <p className="text-white">
                                    {msg.translatedText && msg.showTranslation
                                        ? msg.translatedText
                                        : msg.text
                                    }
                                </p>

                                {/* Translation toggle */}
                                {msg.translatedText && (
                                    <button
                                        onClick={() => toggleTranslation(msg.id)}
                                        className="mt-2 text-xs opacity-70 hover:opacity-100 block border-t border-white/20 pt-2"
                                    >
                                        {msg.showTranslation
                                            ? t('chat.show_original')
                                            : t('chat.translated_from', { language: msg.sourceLocale.toUpperCase() })
                                        }
                                    </button>
                                )}

                                <p className={`text-xs mt-1 ${msg.isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={t('chat.type_message')}
                        className="flex-1 p-4 bg-[#1A1A24] rounded-full border border-gray-700 focus:border-pink-500 focus:outline-none"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full font-semibold hover:opacity-90 transition"
                    >
                        {t('chat.send')}
                    </button>
                </div>
            </div>
        </main>
    );
}
