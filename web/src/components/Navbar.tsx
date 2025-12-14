'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LocationDisplay from './LocationDisplay';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#13131A] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                💘 InDate
              </div>
            </Link>
            
            {/* Location Display */}
            <div className="hidden md:block border-l border-gray-700 pl-4">
              <LocationDisplay />
            </div>
          </div>

          {/* Navigation Links */}
          {user ? (
            <div className="flex items-center space-x-6">
              <Link
                href="/discover"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/discover')
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Discover
              </Link>
              <Link
                href="/chat"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/chat')
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Chat
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile')
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Settings
              </Link>
              {user?.email === 'test@example.com' && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-md text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-linear-to-r from-pink-500 to-purple-600 text-white rounded-md text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
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
