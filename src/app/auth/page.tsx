'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset-sent';

function AuthPageContent() {
  const { user, loading, signUp, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Set initial mode based on URL params
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  useEffect(() => {
    if (mounted && user && !loading) {
      router.push('/dashboard');
    }
  }, [mounted, user, loading, router]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setShowPassword(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await signIn(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Try again.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signUp(email.trim(), password);
      // Update profile name after signup
      const supabase = createClient();
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase
          .from('profiles')
          // @ts-ignore - Supabase type inference issue
          .update({ name: name.trim() })
          .eq('id', newUser.id);
      }
      router.push('/connect');
    } catch (err: any) {
      if (err.message?.includes('already')) {
        setError('An account with this email already exists. Try signing in.');
      } else {
        setError(err.message || 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      switchMode('reset-sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const gridDots = useMemo(() => GRID_DOTS, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
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
            style={{ left: `${dot.left}%`, top: `${dot.top}%`, background: 'linear-gradient(45deg, #6c5ce7, #00e676)' }}
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: dot.duration, repeat: Infinity, delay: dot.delay }}
          />
        ))}
      </div>

      {/* Header branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="mb-4 flex justify-center">
          <div 
            className="rounded-xl overflow-hidden" 
            style={{ filter: 'drop-shadow(0 0 12px rgba(108, 92, 231, 0.5))' }}
          >
            <Image 
              src="/grid-logo.png" 
              alt="The Grid" 
              width={100} 
              height={100}
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
        </div>
        <p className="text-[#00e676] text-sm font-semibold tracking-[0.3em] uppercase mb-2">
          No Code Creators
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          Welcome to <span className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] bg-clip-text text-transparent">The Grid</span>
        </h1>
        <p className="text-gray-300 text-lg">
          Track your AI agent. Climb the leaderboard. Build in public.
        </p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 sm:p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* ====== SIGN IN ====== */}
            {mode === 'signin' && (
              <motion.div key="signin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-2xl font-bold text-white mb-1">Sign In</h2>
                <p className="text-gray-400 text-sm mb-6">Welcome back to The Grid</p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none text-white placeholder:text-gray-500 transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-300">Password</label>
                      <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-[#6c5ce7] hover:text-[#a29bfe] transition-colors">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none text-white placeholder:text-gray-500 transition-all"
                        required
                        disabled={isLoading}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70"
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Signing in...
                      </span>
                    ) : 'Sign In'}
                  </motion.button>
                </form>

                <div className="mt-5 text-center">
                  <span className="text-gray-500 text-sm">Don't have an account? </span>
                  <button onClick={() => switchMode('signup')} className="text-sm text-[#00e676] hover:text-[#00ff88] font-medium transition-colors">
                    Create one
                  </button>
                </div>
              </motion.div>
            )}

            {/* ====== SIGN UP ====== */}
            {mode === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
                <p className="text-gray-400 text-sm mb-6">Join The Grid and start tracking your agent</p>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none text-white placeholder:text-gray-500 transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none text-white placeholder:text-gray-500 transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none text-white placeholder:text-gray-500 transition-all"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none text-white placeholder:text-gray-500 transition-all"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70"
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Creating account...
                      </span>
                    ) : 'Create Account'}
                  </motion.button>
                </form>

                <div className="mt-5 text-center">
                  <span className="text-gray-500 text-sm">Already have an account? </span>
                  <button onClick={() => switchMode('signin')} className="text-sm text-[#00e676] hover:text-[#00ff88] font-medium transition-colors">
                    Sign in
                  </button>
                </div>
              </motion.div>
            )}

            {/* ====== FORGOT PASSWORD ====== */}
            {mode === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => switchMode('signin')} className="flex items-center space-x-1 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
                  <ArrowLeft size={14} />
                  <span>Back to sign in</span>
                </button>

                <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
                <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send you a reset link</p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-[#6c5ce7] focus:ring-2 focus:ring-[#6c5ce7]/20 outline-none text-white placeholder:text-gray-500 transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-70"
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ====== RESET SENT ====== */}
            {mode === 'reset-sent' && (
              <motion.div key="reset-sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00e676]/20 flex items-center justify-center">
                  <Mail size={28} className="text-[#00e676]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400 text-sm mb-6">
                  We sent a password reset link to <span className="text-white font-medium">{email}</span>
                </p>
                <button
                  onClick={() => switchMode('signin')}
                  className="text-sm text-[#6c5ce7] hover:text-[#a29bfe] font-medium transition-colors"
                >
                  Back to sign in
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center relative z-10"
      >
        <p className="text-gray-500 text-xs">
          Powered by the No Code Creators community
        </p>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c5ce7]"></div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}