'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Гар утасны доод навигацийн компонент - Tinder загварын дизайн
export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  // Идэвхтэй хуудсыг шалгах
  const isActive = (path: string) => pathname === path;

  // Навигацийн цэсний зүйлс
  const navItems = [
    { name: 'Discover', path: '/discover', icon: '🔍' },
    { name: 'Matches', path: '/matches', icon: '❤️' },
    { name: 'Chat', path: '/chat', icon: '💬' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E6EA] z-50 shadow-md">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(item.path)
                ? 'text-[#FF4458] bg-[#FF4458]/10'
                : 'text-gray-400 hover:text-[#FF4458]'
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
