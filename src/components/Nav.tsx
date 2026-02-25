'use client';

import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { logOut, getUserRank, getLeaderboard } from '@/lib/store';

interface NavProps {
  user: User;
}

export function Nav({ user }: NavProps) {
  const router = useRouter();
  const rank = getUserRank('overall');
  const totalUsers = getLeaderboard('overall').length;

  const handleLogout = () => {
    logOut();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Greeting */}
          <div className="text-xl font-semibold text-[#0a0a0f]">
            Hey, {user.name} 👋
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Community Rank Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-medium text-amber-700">
                Community Rank: #{rank} of {totalUsers}
              </span>
            </div>

            {/* Notification Bell */}
            <button
              className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Red notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Hidden logout - click on greeting area for profile/logout */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-500 hover:text-[#0a0a0f] hover:bg-gray-100 rounded-lg transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
