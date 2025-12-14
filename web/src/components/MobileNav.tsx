'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: 'Discover', path: '/discover', icon: '🔍' },
    { name: 'Matches', path: '/matches', icon: '❤️' },
    { name: 'Chat', path: '/chat', icon: '💬' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#13131A] border-t border-gray-800 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive(item.path)
                ? 'text-pink-400 bg-pink-500/10'
                : 'text-gray-400 hover:text-white'
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
