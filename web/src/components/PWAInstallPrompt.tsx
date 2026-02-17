'use client';

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // PWA горимд ажиллаж байгаа эсэхийг шалгах
        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standalone);

        // iOS эсэхийг шалгах
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        setIsIOS(iOS);

        // beforeinstallprompt үйл явдал сонсох (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            // Жижиг мэдэгдлийг харуулахгүй байх
            e.preventDefault();
            // Үйл явдлыг хадгалах
            setDeferredPrompt(e);
            // Хугацааны дараа суулгах санал харуулах
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // iOS хэрэглэгчдэд суулгах санал харуулах
        if (iOS && !standalone) {
            setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    // Суулгах товч дарах
    const handleInstallClick = async () => {
        if (!deferredPrompt && !isIOS) {
            return;
        }

        if (deferredPrompt) {
            // Суулгах цонхыг харуулах
            deferredPrompt.prompt();

            // Хэрэглэгчийн сонголтыг хүлээх
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('PWA суулгагдсан');
            } else {
                console.log('PWA суулгалт цуцлагдсан');
            }

            // Хадгалсан үйл явдлыг цэвэрлэх
            setDeferredPrompt(null);
        }

        // Саналыг нуух
        setShowPrompt(false);
    };

    // Хаах товч дарах
    const handleDismiss = () => {
        setShowPrompt(false);
        // 7 хоногийн дотор дахин харуулахгүй
        if (typeof window !== 'undefined') {
            localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
        }
    };

    // Аль хэдийн суулгасан бол харуулахгүй
    if (isStandalone) return null;

    // localStorage шалгах (зөвхөн client талд)
    if (typeof window !== 'undefined') {
        const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissedTime) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) return null;
        }
    }

    if (!showPrompt) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] transform transition-transform duration-500 ease-out ${showPrompt ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className="bg-white border-b border-[#E8E6EA] shadow-xl safe-top">
                <div className="flex flex-col p-3 sm:p-4 gap-3 max-w-lg mx-auto w-full">

                    <div className="flex items-center gap-3 w-full">
                        {/* Апп дүрс */}
                        <div className="w-10 h-10 rounded-xl bg-linear-to-r from-[#FD267A] to-[#FF6036] flex items-center justify-center shadow-md shrink-0">
                            <span className="text-xl">❤️</span>
                        </div>

                        {/* Гарчиг ба тайлбар */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#21262E] text-sm leading-tight truncate">
                                Install mimi
                            </h3>
                            {isIOS ? (
                                <p className="text-[10px] text-[#656E7B] mt-0.5 leading-tight">
                                    Tap <span className="inline-flex align-middle"><svg className="w-3 h-3 text-[#FF4458]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L12 15M12 2L6 8M12 2L18 8M5 21L19 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Share, then "Add to Home"
                                </p>
                            ) : (
                                <p className="text-[10px] text-[#656E7B] mt-0.5 leading-tight">
                                    Get the best dating experience
                                </p>
                            )}
                        </div>

                        {/* Хаах товч */}
                        <button
                            onClick={handleDismiss}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F0F2F4] hover:bg-[#E8E6EA] text-[#656E7B] hover:text-[#21262E] transition-colors shrink-0"
                            aria-label="Dismiss"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Суулгах товч (бүтэн өргөнтэй) */}
                    {!isIOS && deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-linear-to-r from-[#FD267A] to-[#FF6036] text-white py-2.5 rounded-full text-sm font-bold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>Install Now</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
