'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function SecretSenderPage() {
  const router = useRouter();
  const [step, setStep] = useState<'guess' | 'hints' | 'reveal'>('guess');
  const [selectedHints, setSelectedHints] = useState<string[]>([]);
  const [guessName, setGuessName] = useState('');

  const secretSender = 'Marie Claire';
  const availableHints = [
    { id: 'photo', label: 'Photo', icon: '📷' },
    { id: 'voice', label: 'Voice', icon: '🎤' },
    { id: 'hint', label: 'One Hint', icon: '💡' },
  ];

  const toggleHint = (hintId: string) => {
    if (selectedHints.includes(hintId)) {
      setSelectedHints(selectedHints.filter((h) => h !== hintId));
    } else {
      setSelectedHints([...selectedHints, hintId]);
    }
  };

  const handleRespond = () => {
    // Mock response - in real app would send to backend
    alert('Your response has been sent! 💕');
  };

  const handleContinue = () => {
    if (selectedHints.length > 0) {
      setStep('reveal');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
      >
        <ArrowLeftIcon className="w-5 h-5 text-gray-800" />
      </button>

      {/* Main Card */}
      <div className="w-full max-w-md">
        {/* Guess Screen */}
        {step === 'guess' && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Try to guess your secret sender
              </h1>
            </div>

            {/* Heart Card */}
            <div className="relative bg-gradient-to-br from-pink-400 via-red-400 to-rose-500 rounded-3xl p-8 mb-6 shadow-xl overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <HeartIcon className="w-7 h-7 text-white" />
              </div>
              
              <div className="text-center mt-8">
                <div className="mb-4">
                  <HeartIcon className="w-16 h-16 text-white mx-auto drop-shadow-lg" />
                </div>
                <p className="text-white text-2xl font-bold mb-2">I love you,</p>
                <p className="text-white text-3xl font-extrabold">Marie Claire</p>
              </div>
            </div>

            {/* Response Button */}
            <button
              onClick={handleRespond}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-lg mb-4"
            >
              Respond
            </button>

            {/* Ask for Hints */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Still don't know who they are?</p>
              <button
                onClick={() => setStep('hints')}
                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                ASK FOR HINTS
              </button>
            </div>
          </div>
        )}

        {/* Hints Screen */}
        {step === 'hints' && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Add hints</h1>
              <p className="text-sm text-gray-600">
                It'll help you choose one reveal you can see in it
              </p>
            </div>

            {/* Hints Options */}
            <div className="flex justify-center gap-4 mb-8">
              {availableHints.map((hint) => (
                <button
                  key={hint.id}
                  onClick={() => toggleHint(hint.id)}
                  className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl transition-all ${
                    selectedHints.includes(hint.id)
                      ? 'bg-gray-900 text-white shadow-xl scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-3xl mb-2">{hint.icon}</span>
                  <span className="text-xs font-medium">{hint.label}</span>
                </button>
              ))}
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 text-center mb-6">
              1 HINT OR 50 COINS
            </p>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={selectedHints.length === 0}
              className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg ${
                selectedHints.length > 0
                  ? 'bg-gray-900 hover:bg-gray-800 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Reveal Screen */}
        {step === 'reveal' && (
          <div className="relative h-[600px] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-3xl overflow-hidden shadow-2xl">
            {/* Floating Hearts Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse">
                <HeartIcon className="w-24 h-24 text-white/30 absolute top-20 left-10" />
                <HeartIcon className="w-16 h-16 text-white/40 absolute top-32 right-16" />
                <HeartIcon className="w-20 h-20 text-white/20 absolute bottom-32 left-20" />
              </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-8">
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <HeartIcon className="w-16 h-16 text-white" />
                </div>
              </div>

              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                I love you,
              </h1>
              <p className="text-5xl font-black text-gray-900 mb-8">
                {secretSender}
              </p>

              {/* Hints Revealed */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
                <p className="text-sm font-medium text-gray-700">
                  Hints revealed: {selectedHints.map(h => availableHints.find(hint => hint.id === h)?.label).join(', ')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 w-full">
                <button
                  onClick={handleRespond}
                  className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all shadow-lg"
                >
                  Send Response 💕
                </button>
                <button
                  onClick={() => setStep('guess')}
                  className="w-full py-3 bg-white/80 hover:bg-white text-gray-900 font-semibold rounded-2xl transition-all"
                >
                  Back to Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-10 right-10 opacity-20">
        <SparklesIcon className="w-16 h-16 text-pink-500 animate-pulse" />
      </div>
      <div className="fixed bottom-10 left-10 opacity-20">
        <SparklesIcon className="w-20 h-20 text-purple-500 animate-pulse delay-500" />
      </div>
    </div>
  );
}
