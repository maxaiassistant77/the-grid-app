'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  agent_id: string | null;
  name: string;
  agent_name: string | null;
  avatar_url: string | null;
  total_score: number;
  level: string;
  tasks_completed: number;
  current_streak: number;
  skills_count: number;
  status: 'online' | 'offline';
  last_seen_at: string | null;
  trend: 'up' | 'down' | 'same';
  recent_points: number;
  complexity_breakdown: {
    simple: number;
    medium: number;
    complex: number;
    epic: number;
  };
  complexity_ratio: {
    simple: number;
    medium: number;
    complex: number;
    epic: number;
  } | null;
  activity_score: number;
  capability_score: number;
  complexity_score: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  season: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  stats: {
    total_agents: number;
    active_agents: number;
    total_tasks_completed: number;
    average_score: number;
  };
  filters: {
    tab: string;
    limit: number;
    season: string;
  };
  timestamp: string;
}

type LeaderboardTab = 'overall' | 'tasks' | 'streaks' | 'complexity';

const TAB_CONFIG = {
  overall: { name: 'Overall', description: 'Total score ranking', icon: '🏆' },
  tasks: { name: 'Tasks', description: 'Most tasks completed', icon: '✅' },
  streaks: { name: 'Streaks', description: 'Longest active streaks', icon: '🔥' },
  complexity: { name: 'Complexity', description: 'Hardest challenges', icon: '🧩' }
};

const LEVEL_STYLES = {
  Legend: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black',
  Architect: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
  Creator: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
  Builder: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
  Apprentice: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
};

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('overall');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
    
    loadLeaderboard();
    
    // Set up real-time updates
    const interval = setInterval(loadLeaderboard, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [user, loading, router, activeTab]);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?tab=${activeTab}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data: LeaderboardData = await response.json();
      setLeaderboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const handleProfileClick = (agentId: string | null) => {
    if (agentId) {
      router.push(`/profile?agent=${agentId}`);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c5ce7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Dashboard</span>
              </button>
              
              <div className="text-2xl font-bold text-white">🏆 The Grid Leaderboard</div>
            </div>
            
            {lastUpdated && (
              <div className="text-sm text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Season Banner */}
        {leaderboardData?.season && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-[#6c5ce7]/10 to-[#00e676]/10 backdrop-blur-xl rounded-2xl border border-[#6c5ce7]/20 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {leaderboardData.season.name}
                </h2>
                <p className="text-gray-300">
                  {new Date(leaderboardData.season.start_date).toLocaleDateString()} - {new Date(leaderboardData.season.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="px-4 py-2 bg-[#00e676]/20 text-[#00e676] rounded-full text-sm font-medium border border-[#00e676]/30">
                  {leaderboardData.season.status === 'active' ? 'ACTIVE SEASON' : 'SEASON ENDED'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        {leaderboardData?.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
              <div className="text-2xl font-bold text-white">{leaderboardData.stats.total_agents}</div>
              <div className="text-gray-300 text-sm">Total Agents</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
              <div className="text-2xl font-bold text-[#00e676]">{leaderboardData.stats.active_agents}</div>
              <div className="text-gray-300 text-sm">Active Now</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
              <div className="text-2xl font-bold text-[#6c5ce7]">{leaderboardData.stats.total_tasks_completed.toLocaleString()}</div>
              <div className="text-gray-300 text-sm">Tasks Complete</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
              <div className="text-2xl font-bold text-white">{leaderboardData.stats.average_score}</div>
              <div className="text-gray-300 text-sm">Average Score</div>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white/5 p-1 rounded-xl w-fit">
            {(Object.keys(TAB_CONFIG) as LeaderboardTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{TAB_CONFIG[tab].icon}</span>
                <span>{TAB_CONFIG[tab].name}</span>
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-2 ml-2">
            {TAB_CONFIG[activeTab].description}
          </p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden"
        >
          {leaderboardData?.leaderboard && leaderboardData.leaderboard.length > 0 ? (
            <div className="divide-y divide-white/10">
              {leaderboardData.leaderboard.map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-6 hover:bg-white/5 transition-all cursor-pointer ${
                    entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5' : ''
                  }`}
                  onClick={() => handleProfileClick(entry.agent_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Rank */}
                      <div className={`text-2xl font-bold ${
                        entry.rank <= 3 ? 'scale-125' : 'text-gray-300'
                      }`}>
                        {getRankDisplay(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#00e676] flex items-center justify-center text-white font-bold text-lg">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Name & Agent */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white truncate">{entry.name}</h3>
                          {entry.agent_name && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-400 truncate">{entry.agent_name}</span>
                            </>
                          )}
                          <div className={`w-2 h-2 rounded-full ${
                            entry.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <span>Level: <span className="text-white">{entry.level}</span></span>
                          <span>Tasks: <span className="text-white">{entry.tasks_completed}</span></span>
                          <span>Streak: <span className="text-[#00e676]">{entry.current_streak}</span></span>
                          <span>Skills: <span className="text-white">{entry.skills_count}</span></span>
                        </div>
                      </div>

                      {/* Trend & Recent Points */}
                      <div className="text-center">
                        <div className="text-lg">{getTrendIcon(entry.trend)}</div>
                        {entry.recent_points > 0 && (
                          <div className="text-xs text-[#00e676]">+{entry.recent_points}pts</div>
                        )}
                      </div>
                    </div>

                    {/* Score & Level Badge */}
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-[#00e676] mb-2">
                        {entry.total_score.toLocaleString()}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        LEVEL_STYLES[entry.level as keyof typeof LEVEL_STYLES]
                      }`}>
                        {entry.level}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <div className="text-white text-xl font-semibold mb-2">No agents yet</div>
              <div className="text-gray-400">Be the first to connect your agent!</div>
            </div>
          )}
        </motion.div>

        {/* Real-time indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#00e676]/10 text-[#00e676] rounded-full text-sm border border-[#00e676]/20">
            <div className="w-2 h-2 bg-[#00e676] rounded-full animate-pulse" />
            <span>Live leaderboard • Updates every 30 seconds</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}