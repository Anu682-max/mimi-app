'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LocationDisplay from './LocationDisplay';
import Logo from './Logo';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

// Дээд навигацийн компонент - Tinder загварын дизайн
export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Идэвхтэй хуудсыг шалгах
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-[#E8E6EA] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Лого */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>

            {/* Байршлын мэдээлэл */}
            <div className="hidden md:block border-l border-[#E8E6EA] pl-4">
              <LocationDisplay />
            </div>
          </div>

          {/* Навигацийн холбоосууд */}
          {user ? (
            <div className="flex items-center space-x-2 lg:hidden">
              <Link
                href="/discover"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive('/discover')
                    ? 'bg-[#FF4458]/10 text-[#FF4458]'
                    : 'text-[#656E7B] hover:text-[#FF4458] hover:bg-gray-50'
                  }`}
              >
                Discover
              </Link>
              <Link
                href="/chat"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive('/chat')
                    ? 'bg-[#FF4458]/10 text-[#FF4458]'
                    : 'text-[#656E7B] hover:text-[#FF4458] hover:bg-gray-50'
                  }`}
              >
                Chat
              </Link>
              <Link
                href="/posts"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive('/posts')
                    ? 'bg-[#FF4458]/10 text-[#FF4458]'
                    : 'text-[#656E7B] hover:text-[#FF4458] hover:bg-gray-50'
                  }`}
              >
                Posts
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive('/profile')
                    ? 'bg-[#FF4458]/10 text-[#FF4458]'
                    : 'text-[#656E7B] hover:text-[#FF4458] hover:bg-gray-50'
                  }`}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive('/settings')
                    ? 'bg-[#FF4458]/10 text-[#FF4458]'
                    : 'text-[#656E7B] hover:text-[#FF4458] hover:bg-gray-50'
                  }`}
              >
                Settings
              </Link>
              {/* Админ хэрэглэгчийн холбоос */}
              {user?.email === 'test@example.com' && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-[#FF4458]/10 text-[#FF4458] rounded-xl text-sm font-medium hover:bg-[#FF4458]/20 transition-colors flex items-center space-x-2"
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              {/* Гарах товч */}
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-[#656E7B] hover:text-[#FF4458] text-sm font-medium transition-colors"
              >
                Login
              </Link>
              {/* Бүртгүүлэх товч - градиент */}
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-[#FD267A] to-[#FF6036] text-white rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
