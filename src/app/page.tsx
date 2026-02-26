'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';

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
  const { user, loading, signUp, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && !loading) {
      router.push('/dashboard');
    }
  }, [mounted, user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        try {
          await signUp(email.trim(), password);
          router.push('/dashboard');
        } catch (signUpErr: any) {
          // If user exists, try signing in instead
          if (signUpErr.message?.includes('User already registered') || signUpErr.message?.includes('already been registered')) {
            await signIn(email.trim(), password);
            router.push('/dashboard');
          } else {
            throw signUpErr;
          }
        }
      } else {
        await signIn(email.trim(), password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Wrong email or password. Try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Email not confirmed. Try creating a new account with a different email.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const gridDots = useMemo(() => GRID_DOTS, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c5ce7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background animated grid dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {gridDots.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              background: 'linear-gradient(45deg, #6c5ce7, #00e676)',
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
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
        className="text-center mb-8 relative z-10"
      >
        <p className="text-[#00e676] text-sm font-semibold tracking-[0.3em] uppercase mb-2">
          Agents to Life
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          Welcome to <span className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] bg-clip-text text-transparent">The Grid</span>
        </h1>
        <p className="text-gray-300 text-lg">
          Track your AI agent. Climb the leaderboard. Build in public.
        </p>
      </motion.div>

      {/* Sign up card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none transition-all text-white placeholder:text-gray-400"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none transition-all text-white placeholder:text-gray-400"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          {isSignUp ? 'Create your account to start tracking your agent' : 'Welcome back to The Grid'}
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
