'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';
import { SkeletonStatCard, SkeletonCard } from '@/components/Skeleton';
import { CheckCircle2, Flame, BarChart3, Zap, Rocket, Eye, EyeOff, Copy, Brain } from 'lucide-react';
import { OnboardingTooltips } from '@/components/OnboardingTooltips';

export default function DashboardPage() {
  const { user, profile, agent, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [memory, setMemory] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('openclaw');

  const copyApiKey = async () => {
    if (agent?.api_key) {
      try {
        await navigator.clipboard.writeText(agent.api_key);
      } catch (err) {
        console.error('Failed to copy API key:', err);
      }
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
        return;
      }
      if (!agent) {
        router.push('/connect');
        return;
      }
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
      
      // Get agent memory
      const { data: agentMemory } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('agent_id', agent!.id)
        .single();
      
      // Get recent activities
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('agent_id', agent!.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setStats(agentStats);
      setMemory(agentMemory);
      setRecentActivities(activities || []);
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
        <div className="pt-16 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-8 w-64 mb-2"></div>
              <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-4 w-48"></div>
            </div>
            <SkeletonCard className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-8 w-48 mb-2"></div>
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-4 w-64 mb-1"></div>
                  <div className="bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse rounded-lg h-4 w-32"></div>
                </div>
              </div>
            </SkeletonCard>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      <Navbar />
      {/* <OnboardingTooltips /> */}
      
      <div className="pt-16 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8 flex items-center space-x-4">
            <div 
              className="rounded-xl overflow-hidden" 
              style={{ filter: 'drop-shadow(0 0 12px rgba(108, 92, 231, 0.5))' }}
            >
              <Image 
                src="/grid-logo.png" 
                alt="The Grid" 
                width={48} 
                height={48}
                className="w-12 h-12 object-contain"
                style={{ mixBlendMode: 'screen' }}
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Hey, {profile.name}
              </h1>
              <p className="text-gray-300">
                Welcome to your AI agent dashboard
              </p>
            </div>
          </div>

          {/* Agent Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {agent.name}
                </h2>
                <p className="text-gray-300 text-sm">
                  Platform: {agent.platform} · Model: {agent.model || 'Unknown'}
                </p>
                {agent.last_seen_at && (
                  <p className="text-gray-400 text-xs mt-1">
                    Last seen: {new Date(agent.last_seen_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="text-left sm:text-right">
                <div className="text-2xl md:text-3xl font-bold text-[#00e676]">
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-gray-300 text-xs md:text-sm font-medium">Tasks Completed</h3>
                <CheckCircle2 size={20} className="text-[#00e676]" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{stats?.tasks_completed || 0}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-gray-300 text-xs md:text-sm font-medium">Current Streak</h3>
                <Flame size={20} className="text-orange-400" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-[#00e676]">{stats?.current_streak || 0}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-gray-300 text-xs md:text-sm font-medium">Sessions</h3>
                <BarChart3 size={20} className="text-[#6c5ce7]" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{stats?.sessions_count || 0}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-gray-300 text-xs md:text-sm font-medium">Uptime</h3>
                <Zap size={20} className="text-yellow-400" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-[#6c5ce7]">{stats?.uptime_percentage || 0}%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-gray-300 text-xs md:text-sm font-medium">Memory</h3>
                <Brain size={20} className="text-purple-400" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{memory?.memory_depth_days || 0}</div>
              <div className="text-xs text-gray-400">days</div>
            </motion.div>
          </div>

          {/* Recent Activity Section */}
          {recentActivities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 md:p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        activity.complexity === 'epic' ? 'bg-yellow-400' :
                        activity.complexity === 'complex' ? 'bg-red-400' :
                        activity.complexity === 'medium' ? 'bg-purple-400' :
                        'bg-green-400'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {activity.description || activity.type}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {activity.points_earned > 0 && (
                      <div className="text-[#00e676] font-medium text-sm flex-shrink-0 ml-2">
                        +{activity.points_earned} pts
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.push(`/profile?agent=${agent.id}`)}
                  className="text-[#6c5ce7] hover:text-[#5b4bd3] font-medium text-sm transition-colors"
                >
                  View all activity →
                </button>
              </div>
            </motion.div>
          )}

          {/* Coming Soon Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
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
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-4 py-2 rounded-lg transition-all"
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
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-4 py-2 rounded-lg transition-all"
              >
                View Rankings
              </button>
            </motion.div>
          </div>

          {/* MCP Connection Widget - Only show if agent hasn't reported any tasks */}
          {(!stats || stats.tasks_completed === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 md:p-6"
            >
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2 flex items-center space-x-2">
                <Zap size={20} className="text-[#6c5ce7]" />
                <span>Connect Your Agent (2 minutes)</span>
              </h3>
              <p className="text-gray-300 mb-6 text-sm md:text-base">
                Use the MCP server to automatically sync your agent's activity to The Grid
              </p>

              <div className="space-y-6">
                {/* Step 1: Copy API Key */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#6c5ce7] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <h4 className="text-white font-medium">Copy your API key</h4>
                  </div>
                  <div className="flex items-center space-x-2 bg-black/30 p-3 rounded-lg">
                    <code className="text-[#00e676] flex-1 text-xs md:text-sm break-all">
                      {showApiKey ? agent.api_key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-gray-400 hover:text-white p-1 transition-colors flex-shrink-0"
                      title={showApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={copyApiKey}
                      className="text-gray-400 hover:text-white p-1 transition-colors flex-shrink-0"
                      title="Copy API key"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Step 2: Add to Agent Config */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[#6c5ce7] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <h4 className="text-white font-medium">Add to your agent config</h4>
                  </div>
                  
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 bg-black/30 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('openclaw')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeTab === 'openclaw' 
                          ? 'bg-[#6c5ce7] text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      OpenClaw
                    </button>
                    <button
                      onClick={() => setActiveTab('claude')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeTab === 'claude' 
                          ? 'bg-[#6c5ce7] text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Claude Desktop
                    </button>
                    <button
                      onClick={() => setActiveTab('other')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        activeTab === 'other' 
                          ? 'bg-[#6c5ce7] text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Other
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="bg-black/30 p-3 rounded-lg">
                    {activeTab === 'openclaw' && (
                      <code className="text-[#00e676] text-xs block whitespace-pre">
{`# Install the Grid skill
clawhub install grid-sync

# Your API key is automatically loaded
# from ~/.openclaw/workspace/TOOLS.md`}
                      </code>
                    )}
                    {activeTab === 'claude' && (
                      <code className="text-[#00e676] text-xs block whitespace-pre">
{`{
  "mcpServers": {
    "grid": {
      "command": "npx",
      "args": ["@grid/mcp-server"],
      "env": {
        "GRID_API_KEY": "${agent.api_key}"
      }
    }
  }
}`}
                      </code>
                    )}
                    {activeTab === 'other' && (
                      <code className="text-[#00e676] text-xs block whitespace-pre">
{`export GRID_API_KEY="${agent.api_key}"
# Then configure your MCP client
# to connect to The Grid`}
                      </code>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => router.push('/connect')}
                  className="bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00d967] text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                >
                  <span>View Full Setup Guide</span>
                  <Rocket size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
