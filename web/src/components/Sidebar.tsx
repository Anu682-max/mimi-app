'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  Cog6ToothIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

// Хажуугийн цэсний компонент - Tinder загварын дизайн
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  // Идэвхтэй хуудсыг шалгах
  const isActive = (path: string) => pathname === path;

  // Навигацийн цэсний зүйлс
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Discover', path: '/discover', icon: MagnifyingGlassIcon },
    { name: 'Matches', path: '/matches', icon: HeartIcon },
    { name: 'Chat', path: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
  ];

  // Админ хэрэглэгчид зөвхөн admin холбоос харуулна
  if (user?.email === 'test@example.com') {
    navItems.push({
      name: 'Admin Panel',
      path: '/admin',
      icon: Cog6ToothIcon,
    });
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-[#E8E6EA] fixed left-0 top-16 bottom-0 shadow-sm">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-[#FF4458]/10 text-[#FF4458] border border-[#FF4458]/20'
                    : 'text-[#656E7B] hover:text-[#21262E] hover:bg-gray-50'
                  }`}
              >
                <Icon
                  className={`mr-3 shrink-0 h-5 w-5 ${
                    isActive(item.path) ? 'text-[#FF4458]' : 'text-gray-400 group-hover:text-[#FF4458]'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Хэрэглэгчийн мэдээлэл */}
        <div className="px-4 py-4 border-t border-[#E8E6EA]">
          <div className="flex items-center mb-3">
            <div className="shrink-0">
              {/* Хэрэглэгчийн аватар - градиент */}
              <div className="h-10 w-10 rounded-full bg-linear-to-r from-[#FD267A] to-[#FF6036] flex items-center justify-center text-white font-bold">
                {user.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-[#21262E] truncate">{user.firstName || 'User'}</p>
              <p className="text-xs text-[#656E7B] truncate">{user.email}</p>
            </div>
          </div>

          {/* Гарах товч */}
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition gap-2 group border border-red-100"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
