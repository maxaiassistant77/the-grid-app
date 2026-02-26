'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Trophy, User, Swords } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/arena', label: 'Arena', icon: Swords },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show on login or connect pages
  if (pathname === '/' || pathname === '/connect') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#6c5ce7] rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`transition-colors ${
                  isActive ? 'text-[#6c5ce7]' : 'text-gray-500'
                }`}
              />
              <span className={`text-[10px] mt-1 font-medium transition-colors ${
                isActive ? 'text-[#6c5ce7]' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
