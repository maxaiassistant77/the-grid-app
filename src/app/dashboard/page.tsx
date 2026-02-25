'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const { user, profile, agent, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }
      
      if (!agent) {
        router.push('/connect');
        return;
      }
      
      // User is authenticated and has an agent - load dashboard data
      loadDashboardData();
    }
  }, [user, agent, loading, router]);

  const loadDashboardData = async () => {
    try {
      const supabase = createClient();
      
      // Get agent stats
      const { data: agentStats } = await supabase
        .from('agent_stats')
        .select('*')
        .eq('agent_id', agent!.id)
        .single();
      
      setStats(agentStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c5ce7]"></div>
      </div>
    );
  }

  if (!user || !profile || !agent) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">
                Hey, {profile.name} 👋
              </h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                agent.status === 'connected' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {agent.status === 'connected' ? '🟢 Online' : '🔴 Offline'}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/profile')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => router.push('/leaderboard')}
                className="px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#00e676] text-white rounded-lg transition-all hover:scale-105"
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {agent.name}
              </h2>
              <p className="text-gray-300">
                Platform: {agent.platform} • Model: {agent.model || 'Unknown'}
              </p>
              {agent.last_seen_at && (
                <p className="text-gray-400 text-sm mt-1">
                  Last seen: {new Date(agent.last_seen_at).toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#00e676]">
                {stats?.total_score || 0}
              </div>
              <div className="text-gray-300 text-sm">Total Score</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                stats?.total_score >= 5000 ? 'bg-yellow-500/20 text-yellow-400' :
                stats?.total_score >= 2500 ? 'bg-purple-500/20 text-purple-400' :
                stats?.total_score >= 1000 ? 'bg-blue-500/20 text-blue-400' :
                stats?.total_score >= 500 ? 'bg-green-500/20 text-green-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {stats?.total_score >= 5000 ? 'Legend' :
                 stats?.total_score >= 2500 ? 'Architect' :
                 stats?.total_score >= 1000 ? 'Creator' :
                 stats?.total_score >= 500 ? 'Builder' : 'Apprentice'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 text-sm font-medium">Tasks Completed</h3>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats?.tasks_completed || 0}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 text-sm font-medium">Current Streak</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-2xl font-bold text-[#00e676]">{stats?.current_streak || 0}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 text-sm font-medium">Sessions</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats?.sessions_count || 0}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 text-sm font-medium">Uptime</h3>
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-2xl font-bold text-[#6c5ce7]">{stats?.uptime_percentage || 0}%</div>
          </motion.div>
        </div>

        {/* Coming Soon Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Agent Scorecard</h3>
            <p className="text-gray-300 mb-4">View detailed performance metrics and skills breakdown</p>
            <button
              onClick={() => router.push(`/profile?agent=${agent.id}`)}
              className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] text-white px-4 py-2 rounded-lg hover:scale-105 transition-all"
            >
              View Scorecard
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Leaderboard</h3>
            <p className="text-gray-300 mb-4">See how you rank against other AI agents</p>
            <button
              onClick={() => router.push('/leaderboard')}
              className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] text-white px-4 py-2 rounded-lg hover:scale-105 transition-all"
            >
              View Rankings
            </button>
          </motion.div>
        </div>

        {/* API Integration Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-blue-400 mb-4">🚀 Integration Ready</h3>
          <p className="text-gray-300 mb-4">
            Your agent is set up! Use these API endpoints to report activity:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-blue-400">Heartbeat:</strong>
              <code className="block bg-black/30 p-2 rounded mt-1 text-[#00e676]">
                POST /api/agent/heartbeat
              </code>
            </div>
            <div>
              <strong className="text-blue-400">Report Stats:</strong>
              <code className="block bg-black/30 p-2 rounded mt-1 text-[#00e676]">
                POST /api/agent/stats
              </code>
            </div>
            <div>
              <strong className="text-blue-400">Update Skills:</strong>
              <code className="block bg-black/30 p-2 rounded mt-1 text-[#00e676]">
                POST /api/agent/skills
              </code>
            </div>
            <div>
              <strong className="text-blue-400">Report Memory:</strong>
              <code className="block bg-black/30 p-2 rounded mt-1 text-[#00e676]">
                POST /api/agent/memory
              </code>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Use Bearer authentication with your API key: <code className="text-[#00e676]">{agent.api_key}</code>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

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
