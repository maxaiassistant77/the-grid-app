'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Trophy, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { ScorePill } from './ScorePill';

export function Navbar() {
  const { user, profile, agent } = useAuth();
  const [agentScore, setAgentScore] = useState(0);
  const [agentLevel, setAgentLevel] = useState('Apprentice');

  useEffect(() => {
    if (!agent) return;
    const supabase = createClient();
    supabase
      .from('agent_stats')
      .select('total_score')
      .eq('agent_id', agent.id)
      .single()
      .then(({ data }: { data: any }) => {
        if (data) {
          const score = data.total_score || 0;
          setAgentScore(score);
          setAgentLevel(
            score >= 5000 ? 'Legend' :
            score >= 2500 ? 'Architect' :
            score >= 1000 ? 'Creator' :
            score >= 500 ? 'Builder' : 'Apprentice'
          );
        }
      });
  }, [agent]);
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleGetStarted = () => {
    router.push('/');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', active: pathname === '/dashboard', icon: LayoutDashboard },
    { name: 'Leaderboard', href: '/leaderboard', active: pathname === '/leaderboard', icon: Trophy },
    { name: 'Profile', href: '/profile', active: pathname === '/profile', icon: User },
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
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.name}
                  onClick={() => router.push(link.href)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    link.active
                      ? 'text-[#6c5ce7] border-b-2 border-[#6c5ce7]'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 rounded-lg'
                  }`}
                >
                  <Icon size={16} />
                  <span>{link.name}</span>
                </button>
              );
            })}
          </div>

          {/* User Menu / Get Started */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Score Pill */}
                {agent && <ScorePill score={agentScore} level={agentLevel} />}

                {/* Agent Status - desktop only */}
                {agent && (
                  <div className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'connected' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      agent.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span>{agent.status === 'connected' ? 'Online' : 'Offline'}</span>
                  </div>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#6c5ce7] to-[#00e676] rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {profile?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:inline text-white font-medium">{profile?.name || 'User'}</span>
                    <ChevronDown size={14} className="hidden md:inline text-gray-400" />
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
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left"
                        >
                          <User size={14} />
                          <span>Profile Settings</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push('/connect');
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 text-left"
                        >
                          <Settings size={14} />
                          <span>Agent Setup</span>
                        </button>
                        <div className="border-t border-white/10 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
