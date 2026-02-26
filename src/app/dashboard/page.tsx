'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SkeletonStatCard, SkeletonCard } from '@/components/Skeleton';

export default function DashboardPage() {
  const { user, profile, agent, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  const copyApiKey = async () => {
    if (agent?.api_key) {
      try {
        await navigator.clipboard.writeText(agent.api_key);
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy API key:', err);
      }
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
        <Navbar />
        
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Header Skeleton */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-8 w-64 mb-2"></div>
              <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-4 w-48"></div>
            </div>

            {/* Agent Status Card Skeleton */}
            <SkeletonCard className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-8 w-48 mb-2"></div>
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-4 w-64 mb-1"></div>
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-4 w-32"></div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-12 w-20 mb-2"></div>
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-full h-6 w-16"></div>
                </div>
              </div>
            </SkeletonCard>

            {/* Quick Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>

            {/* Coming Soon Sections Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SkeletonCard>
                <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-6 w-32 mb-4"></div>
                <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-4 w-full mb-4"></div>
                <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-10 w-32"></div>
              </SkeletonCard>
              
              <SkeletonCard>
                <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-6 w-24 mb-4"></div>
                <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-4 w-full mb-4"></div>
                <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-10 w-32"></div>
              </SkeletonCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile || !agent) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Hey, {profile.name} 👋
            </h1>
            <p className="text-gray-300">
              Welcome to your AI agent dashboard
            </p>
          </div>
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
          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2">
              Use Bearer authentication with your API key:
            </p>
            <div className="flex items-center space-x-2 bg-black/30 p-3 rounded-lg">
              <code className="text-[#00e676] flex-1 text-sm">
                {showApiKey ? agent.api_key : '••••••••••••••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-gray-400 hover:text-white p-1 transition-colors"
                title={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showApiKey ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L12 12m0 0l2.122 2.122M12 12l2.122-2.122" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
              <button
                onClick={copyApiKey}
                className="text-gray-400 hover:text-white p-1 transition-colors"
                title="Copy API key"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
