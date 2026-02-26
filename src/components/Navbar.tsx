'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const { user, profile, agent } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleGetStarted = () => {
    router.push('/');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', active: pathname === '/dashboard' },
    { name: 'Leaderboard', href: '/leaderboard', active: pathname === '/leaderboard' },
    { name: 'Profile', href: '/profile', active: pathname === '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xl font-bold text-white hover:text-[#6c5ce7] transition-colors"
            >
              The Grid
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => router.push(link.href)}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  link.active
                    ? 'text-[#6c5ce7] border-b-2 border-[#6c5ce7]'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 rounded-lg'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* User Menu / Get Started */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Agent Status */}
                {agent && (
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'connected' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {agent.status === 'connected' ? '🟢 Online' : '🔴 Offline'}
                  </div>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 text-sm bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#6c5ce7] to-[#00e676] rounded-full flex items-center justify-center text-white font-medium">
                      {profile?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-white font-medium">{profile?.name || 'User'}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-xl rounded-lg border border-white/20 py-1 shadow-lg"
                      >
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push('/profile');
                          }}
                          className="block w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left"
                        >
                          Profile Settings
                        </button>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push('/connect');
                          }}
                          className="block w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left"
                        >
                          Agent Setup
                        </button>
                        <div className="border-t border-white/10 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Get Started Button for unauthenticated users */
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-all"
              >
                Get Started
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-black/20 backdrop-blur-xl"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      router.push(link.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      link.active
                        ? 'text-[#6c5ce7] bg-[#6c5ce7]/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
                
                {/* Mobile User Section */}
                <div className="border-t border-white/10 mt-3 pt-3">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#6c5ce7] to-[#00e676] rounded-full flex items-center justify-center text-white font-medium">
                          {profile?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{profile?.name || 'User'}</div>
                          {agent && (
                            <div className={`text-xs ${
                              agent.status === 'connected' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {agent.status === 'connected' ? '🟢 Online' : '🔴 Offline'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          router.push('/connect');
                          setIsMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        Agent Setup
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleGetStarted();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full bg-gradient-to-r from-[#6c5ce7] to-[#00e676] text-white px-3 py-2 rounded-lg font-medium mx-3"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}