'use client';

/**
 * Ирж буй дуудлагын глобал модал
 * Аливаа хуудас дээр дуудлага ирэхэд харагдана
 */

import { PhoneIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/solid';
import type { IncomingCallData } from '@/hooks/useWebRTC';

interface IncomingCallModalProps {
    incomingCall: IncomingCallData;
    onAccept: () => void;
    onReject: () => void;
}

export default function IncomingCallModal({ incomingCall, onAccept, onReject }: IncomingCallModalProps) {
    return (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
                {/* Дуудагчийн зураг */}
                <div className="relative mx-auto mb-6">
                    {/* Анимацтай ring effect */}
                    <div className="absolute inset-0 w-28 h-28 mx-auto rounded-full bg-[#FF4458]/20 animate-ping" />
                    <div className="relative w-28 h-28 mx-auto">
                        <img
                            src={incomingCall.callerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCall.callerId}`}
                            alt={incomingCall.callerName || 'Caller'}
                            className="w-28 h-28 rounded-full object-cover border-4 border-[#E8E6EA] relative z-10"
                        />
                    </div>
                </div>

                {/* Дуудагчийн нэр */}
                <h2 className="text-2xl font-bold text-[#21262E] mb-1">
                    {incomingCall.callerName || 'Unknown'}
                </h2>

                {/* Дуудлагын төрөл */}
                <p className="text-[#656E7B] mb-8 flex items-center justify-center gap-2">
                    {incomingCall.type === 'video' ? (
                        <>
                            <VideoCameraIcon className="w-5 h-5 text-[#FF4458]" />
                            <span>Видео дуудлага ирж байна...</span>
                        </>
                    ) : (
                        <>
                            <PhoneIcon className="w-5 h-5 text-[#FF4458]" />
                            <span>Дуут дуудлага ирж байна...</span>
                        </>
                    )}
                </p>

                {/* Товчнууд */}
                <div className="flex items-center justify-center gap-8">
                    {/* Татгалзах */}
                    <button
                        onClick={onReject}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 shadow-lg">
                            <XMarkIcon className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-xs text-[#656E7B] font-medium">Decline</span>
                    </button>

                    {/* Хүлээн авах */}
                    <button
                        onClick={onAccept}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 bg-linear-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 rounded-full flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 shadow-lg">
                            <PhoneIcon className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-xs text-[#656E7B] font-medium">Accept</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
