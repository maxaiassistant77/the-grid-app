'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User } from '@/lib/types';
import { logOut } from '@/lib/store';

interface NavProps {
  user: User;
}

export function Nav({ user }: NavProps) {
  const router = useRouter();

  const handleLogout = () => {
    logOut();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00B4E6] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" fill="currentColor" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#0a0a0f]">The Grid</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#0a0a0f]">{user.name}</p>
                <p className="text-xs text-gray-500">{user.agentName}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00B4E6] to-[#10B981] flex items-center justify-center text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>

            <motion.button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-500 hover:text-[#0a0a0f] hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Log Out
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
