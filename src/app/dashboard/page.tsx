'use client';

import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Nav } from '@/components/Nav';
import { ProgressRing } from '@/components/ProgressRing';
import { StatCard } from '@/components/StatCard';
import { LogModal } from '@/components/LogModal';
import { Leaderboard } from '@/components/Leaderboard';
import { Challenge } from '@/components/Challenge';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Achievements } from '@/components/Achievements';
import { User, UserStats, Achievement } from '@/lib/types';
import {
  getCurrentUser,
  getStats,
  updateStats,
  logActivity,
  calculateScore,
  getLevel,
  getLevelColor,
  checkAndUnlockAchievements,
  getAchievements
} from '@/lib/store';

type ModalType = 'tasks' | 'hours' | 'revenue' | 'challenge' | null;

// Subscribe to nothing (client-only rendering pattern)
const emptySubscribe = () => () => {};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [score, setScore] = useState(0);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use useSyncExternalStore for hydration-safe client detection
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!mounted) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }
    setUser(currentUser);
    const currentStats = getStats();
    setStats(currentStats);
    const currentAchievements = getAchievements();
    setAchievements(currentAchievements);
    setScore(calculateScore(currentStats, currentAchievements));
  }, [mounted, router]);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00B4E6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    });
  }, []);

  const handleLogSubmit = useCallback((type: 'tasks' | 'hours' | 'revenue' | 'challenge', value: number, note: string) => {
    // Update stats
    const statType = type === 'challenge' ? 'revenue' : type;
    const newStats = updateStats(statType, value);
    setStats(newStats);

    // Log activity
    logActivity(type, value, note);

    // Calculate new score
    const newAchievements = getAchievements();
    const newScore = calculateScore(newStats, newAchievements);
    setScore(newScore);

    // Check for unlocked achievements
    const unlocked = checkAndUnlockAchievements(newStats, newScore);
    if (unlocked.length > 0) {
      setAchievements(getAchievements());
      // Delay confetti for achievement unlock
      setTimeout(triggerConfetti, 300);
    }

    // Check for milestone (every 100 points)
    const oldScore = calculateScore(stats!, achievements);
    if (Math.floor(newScore / 100) > Math.floor(oldScore / 100)) {
      triggerConfetti();
    }

    // Update refresh trigger to re-render components
    setRefreshTrigger(prev => prev + 1);
  }, [stats, achievements, triggerConfetti]);

  const handleModalSubmit = useCallback((value: number, note: string) => {
    if (modalType) {
      handleLogSubmit(modalType, value, note);
    }
  }, [modalType, handleLogSubmit]);

  if (!mounted || !user || !stats) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const level = getLevel(score);
  const progressPercent = Math.min(100, (score / 1000) * 100);

  const getModalTitle = () => {
    switch (modalType) {
      case 'tasks': return 'Log Tasks Completed';
      case 'hours': return 'Log Hours Saved';
      case 'revenue': return 'Log Revenue Generated';
      case 'challenge': return 'Log Challenge Entry';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Nav user={user} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Card - Agent Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Progress ring */}
            <ProgressRing progress={progressPercent} size={140} strokeWidth={10}>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0a0a0f]">{Math.min(score, 1000)}</p>
                <p className="text-xs text-gray-500">/1000</p>
              </div>
            </ProgressRing>

            {/* Agent info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl font-bold text-[#0a0a0f]">{user.agentName}</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700">Online</span>
                </div>
              </div>

              <p className="text-gray-500 mb-4">Agent Score: {score.toLocaleString()} points</p>

              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${getLevelColor(level)}`}>
                  {level}
                </span>
                {score > 1000 && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    +{(score - 1000).toLocaleString()} bonus
                  </span>
                )}
              </div>
            </div>

            {/* Level info */}
            <div className="hidden lg:block text-right bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Level Progress</p>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center gap-2 ${score >= 800 ? 'text-[#0a0a0f] font-semibold' : 'text-gray-400'}`}>
                  <span>800+</span>
                  <span>Legend</span>
                </div>
                <div className={`flex items-center gap-2 ${score >= 600 && score < 800 ? 'text-[#0a0a0f] font-semibold' : 'text-gray-400'}`}>
                  <span>600+</span>
                  <span>Architect</span>
                </div>
                <div className={`flex items-center gap-2 ${score >= 400 && score < 600 ? 'text-[#0a0a0f] font-semibold' : 'text-gray-400'}`}>
                  <span>400+</span>
                  <span>Creator</span>
                </div>
                <div className={`flex items-center gap-2 ${score >= 200 && score < 400 ? 'text-[#0a0a0f] font-semibold' : 'text-gray-400'}`}>
                  <span>200+</span>
                  <span>Builder</span>
                </div>
                <div className={`flex items-center gap-2 ${score < 200 ? 'text-[#0a0a0f] font-semibold' : 'text-gray-400'}`}>
                  <span>0+</span>
                  <span>Apprentice</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <StatCard
            title="Tasks Completed"
            value={stats.tasksCompleted}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            onAdd={() => setModalType('tasks')}
          />
          <StatCard
            title="Hours Saved"
            value={stats.hoursSaved}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            onAdd={() => setModalType('hours')}
          />
          <StatCard
            title="Revenue Generated"
            value={stats.revenueGenerated}
            prefix="$"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            onAdd={() => setModalType('revenue')}
          />
          <StatCard
            title="Day Streak"
            value={stats.currentStreak}
            suffix={stats.currentStreak > 0 ? " 🔥" : ""}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            }
            onAdd={() => setModalType('tasks')}
          />
        </motion.div>

        {/* Leaderboard and Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-5 gap-6 mb-6"
        >
          <div className="lg:col-span-3">
            <Leaderboard refreshTrigger={refreshTrigger} />
          </div>
          <div className="lg:col-span-2">
            <Challenge onLogEntry={() => setModalType('challenge')} />
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <ActivityFeed refreshTrigger={refreshTrigger} />
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Achievements refreshTrigger={refreshTrigger} />
        </motion.div>
      </main>

      {/* Log Modal */}
      <LogModal
        isOpen={modalType !== null && modalType !== 'challenge'}
        onClose={() => setModalType(null)}
        onSubmit={handleModalSubmit}
        title={getModalTitle()}
        type={(modalType === 'challenge' ? 'revenue' : modalType) || 'tasks'}
      />

      {/* Challenge Modal - uses the same modal */}
      <LogModal
        isOpen={modalType === 'challenge'}
        onClose={() => setModalType(null)}
        onSubmit={(value, note) => handleLogSubmit('challenge', value, note)}
        title="Log Challenge Entry"
        type="revenue"
      />
    </div>
  );
}
