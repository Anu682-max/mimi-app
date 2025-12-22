'use client';

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MobileNav from "./MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
        </div>
    );
}
