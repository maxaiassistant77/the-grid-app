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
import { InstalledSkills } from '@/components/InstalledSkills';
import { DailyActivity } from '@/components/DailyActivity';
import { Achievements } from '@/components/Achievements';
import { User, UserStats, Achievement } from '@/lib/types';
import {
  getCurrentUser,
  getStats,
  updateStats,
  logActivity,
  calculateScore,
  getLevel,
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
  const levelNumber = score >= 800 ? 15 : score >= 600 ? 12 : score >= 400 ? 9 : score >= 200 ? 6 : 3;
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
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Left side - Agent info */}
            <div className="flex items-center gap-5 flex-1">
              {/* Agent Avatar */}
              <div className="w-20 h-20 rounded-full bg-[#1a2b3c] flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>

              {/* Agent Details */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-[#0a0a0f]">{user.agentName}</h1>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-green-700">Online & Working</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold text-white bg-[#1a3a4a]">
                    Level {levelNumber}
                  </span>
                  <span className="text-gray-500">AI {level}</span>
                </div>
              </div>
            </div>

            {/* Right side - Score Ring */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-2">Employee Score</p>
              <ProgressRing progress={progressPercent} size={120} strokeWidth={8}>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#0a0a0f]">{Math.min(score, 1000)}</p>
                  <p className="text-xs text-gray-400">/ 1000</p>
                </div>
              </ProgressRing>
            </div>
          </div>
        </motion.div>

        {/* Stats Row - 3 cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <StatCard
            title="tasks completed"
            value={stats.tasksCompleted}
          />
          <StatCard
            title="hours saved"
            value={stats.hoursSaved}
          />
          <StatCard
            title="revenue generated"
            value={stats.revenueGenerated}
            prefix="$"
            variant="success"
          />
        </motion.div>

        {/* Leaderboard and Challenge - side by side */}
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

        {/* Installed Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <InstalledSkills />
        </motion.div>

        {/* What Your AI Did Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <DailyActivity />
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
