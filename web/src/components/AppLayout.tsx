'use client';

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import IncomingCallModal from "./IncomingCallModal";
import { useWebRTC } from "@/hooks/useWebRTC";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    // Глобал WebRTC hook — аливаа хуудас дээр ирж буй дуудлагыг хүлээн авах
    const { incomingCall, callState, acceptCall, rejectCall } = useWebRTC();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 lg:ml-64 pb-16 lg:pb-0 w-full">
                    {children}
                </main>
            </div>
            <Footer />
            <MobileNav />

            {/* Глобал ирж буй дуудлагын модал */}
            {incomingCall && callState === 'ringing' && (
                <IncomingCallModal
                    incomingCall={incomingCall}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                />
            )}
        </div>
    );
}
