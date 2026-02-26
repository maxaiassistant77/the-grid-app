'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Trophy, User, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/connect', label: 'Connect', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/' || pathname === '/connect') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glow effect behind the nav */}
      <div className="absolute inset-x-0 -top-4 h-8 bg-gradient-to-t from-[#6c5ce7]/10 to-transparent pointer-events-none" />
      
      <div className="bg-black/90 backdrop-blur-xl border-t border-[#6c5ce7]/20 shadow-[0_-4px_24px_rgba(108,92,231,0.08)]">
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
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#00e676]"
                    style={{ boxShadow: '0 0 12px rgba(108,92,231,0.6), 0 0 4px rgba(108,92,231,0.4)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-[#6c5ce7] drop-shadow-[0_0_6px_rgba(108,92,231,0.5)]' : 'text-gray-500'
                    }`}
                  />
                </motion.div>
                <span className={`text-[10px] mt-1 font-semibold transition-colors duration-200 ${
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
      </div>
    </nav>
  );
}
