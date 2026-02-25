'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser, createUser } from '@/lib/store';

// Pre-computed random positions for grid dots
const GRID_DOTS = [
  { left: 5, top: 12, duration: 3.2, delay: 0.1 },
  { left: 15, top: 45, duration: 4.1, delay: 1.2 },
  { left: 25, top: 78, duration: 3.5, delay: 0.5 },
  { left: 35, top: 23, duration: 4.8, delay: 1.8 },
  { left: 45, top: 56, duration: 3.9, delay: 0.3 },
  { left: 55, top: 89, duration: 4.3, delay: 1.5 },
  { left: 65, top: 34, duration: 3.7, delay: 0.8 },
  { left: 75, top: 67, duration: 4.6, delay: 1.1 },
  { left: 85, top: 8, duration: 3.4, delay: 0.6 },
  { left: 95, top: 41, duration: 4.2, delay: 1.9 },
  { left: 8, top: 62, duration: 3.8, delay: 0.4 },
  { left: 18, top: 95, duration: 4.4, delay: 1.3 },
  { left: 28, top: 28, duration: 3.3, delay: 0.9 },
  { left: 38, top: 51, duration: 4.7, delay: 1.6 },
  { left: 48, top: 84, duration: 3.6, delay: 0.2 },
  { left: 58, top: 17, duration: 4.0, delay: 1.4 },
  { left: 68, top: 50, duration: 3.1, delay: 0.7 },
  { left: 78, top: 83, duration: 4.5, delay: 1.0 },
  { left: 88, top: 36, duration: 3.9, delay: 1.7 },
  { left: 92, top: 69, duration: 4.1, delay: 0.0 },
];

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agentName, setAgentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const user = getCurrentUser();
      if (user) {
        router.push('/dashboard');
      }
    }
  }, [mounted, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !agentName.trim()) return;

    setIsLoading(true);

    // Simulate a brief loading state for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    createUser(name.trim(), email.trim(), agentName.trim());
    router.push('/dashboard');
  };

  const gridDots = useMemo(() => GRID_DOTS, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen grid-pattern flex flex-col items-center justify-center px-4">
      {/* Background animated grid dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {gridDots.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#00B4E6]/20"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              delay: dot.delay,
            }}
          />
        ))}
      </div>

      {/* Header branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-[#00B4E6] text-sm font-semibold tracking-[0.3em] uppercase mb-2">
          Agents to Life
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#0a0a0f] mb-2">
          Welcome to <span className="text-[#00B4E6]">The Grid</span>
        </h1>
        <p className="text-gray-500 text-lg">
          Track your AI agent. Climb the leaderboard. Build in public.
        </p>
      </motion.div>

      {/* Sign up card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4E6] focus:ring-2 focus:ring-[#00B4E6]/20 outline-none transition-all text-[#0a0a0f] placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4E6] focus:ring-2 focus:ring-[#00B4E6]/20 outline-none transition-all text-[#0a0a0f] placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Your AI Agent&apos;s Name
              </label>
              <input
                id="agentName"
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="TaskBot 3000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00B4E6] focus:ring-2 focus:ring-[#00B4E6]/20 outline-none transition-all text-[#0a0a0f] placeholder:text-gray-400"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00B4E6] hover:bg-[#00a0cc] text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entering The Grid...
                </span>
              ) : (
                'Enter The Grid'
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Join the community building AI agents in public
        </p>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute bottom-6 text-center"
      >
        <p className="text-gray-400 text-xs">
          Powered by the Agents to Life community
        </p>
      </motion.div>
    </div>
  );
}
