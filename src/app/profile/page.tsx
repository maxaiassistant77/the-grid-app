'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';

interface AgentProfile {
  agent: {
    id: string;
    name: string;
    platform: string;
    model: string | null;
    status: string;
    last_seen_at: string | null;
    created_at: string;
  };
  profile: {
    name: string;
    avatar_url: string | null;
  };
  stats: {
    total_score: number;
    level: string;
    tasks_completed: number;
    current_streak: number;
    longest_streak: number;
    sessions_count: number;
    total_session_duration: number;
    uptime_percentage: number;
  };
  radar_data: {
    activity: number;
    capability: number;
    complexity: number;
    memory: number;
    proactivity: number;
    integration: number;
  };
  complexity_distribution: {
    simple: number;
    medium: number;
    complex: number;
    epic: number;
  };
  skills: Array<{
    name: string;
    category: string;
    icon: string | null;
    description: string | null;
    installed_at: string;
  }>;
  integrations: Array<{
    name: string;
    connected_at: string | null;
  }>;
  memory: {
    total_memories: number;
    memory_depth_days: number;
    categories: any;
    last_memory_at: string | null;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    unlocked_at: string;
  }>;
  recent_activities: Array<{
    type: string;
    complexity: string | null;
    description: string | null;
    points_earned: number;
    created_at: string;
  }>;
}

const SKILL_CATEGORY_COLORS = {
  productivity: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  communication: 'bg-green-500/10 text-green-600 border-green-500/20',
  development: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  data: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  integration: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  automation: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  creative: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20'
};

const COMPLEXITY_COLORS = {
  simple: '#00e676',
  medium: '#6c5ce7',
  complex: '#ff6b6b',
  epic: '#ffd93d'
};

export default function ProfilePage() {
  const { user, agent, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentIdParam = searchParams.get('agent');
  
  const [profileData, setProfileData] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }
      
      // Use agent from param or current user's agent
      const targetAgentId = agentIdParam || agent?.id;
      
      if (!targetAgentId) {
        router.push('/connect');
        return;
      }
      
      loadAgentProfile(targetAgentId);
    }
  }, [user, agent, loading, router, agentIdParam]);

  const loadAgentProfile = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agent/profile/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent profile');
      }
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error loading agent profile:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const RadarChart = ({ data }: { data: AgentProfile['radar_data'] }) => {
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const angles = [0, 60, 120, 180, 240, 300]; // 6 points
    const labels = ['Activity', 'Capability', 'Complexity', 'Memory', 'Proactivity', 'Integration'];
    const values = [data.activity, data.capability, data.complexity, data.memory, data.proactivity, data.integration];

    // Generate points for the radar chart
    const generatePath = (values: number[], maxValue = 100) => {
      const points = angles.map((angle, i) => {
        const value = values[i] || 0;
        const normalizedValue = (value / maxValue) * radius;
        const radian = (angle - 90) * (Math.PI / 180);
        const x = center + normalizedValue * Math.cos(radian);
        const y = center + normalizedValue * Math.sin(radian);
        return [x, y];
      });

      return `M ${points.map(p => p.join(' ')).join(' L ')} Z`;
    };

    const backgroundPath = generatePath(new Array(6).fill(100));
    const dataPath = generatePath(values);

    return (
      <div className="flex items-center justify-center p-6">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background web */}
          <defs>
            <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6c5ce7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#6c5ce7" stopOpacity="0.05" />
            </radialGradient>
          </defs>
          
          {/* Grid circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((factor, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius * factor}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines */}
          {angles.map((angle, i) => {
            const radian = (angle - 90) * (Math.PI / 180);
            const x = center + radius * Math.cos(radian);
            const y = center + radius * Math.sin(radian);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Data area */}
          <path
            d={dataPath}
            fill="url(#radarGradient)"
            stroke="#6c5ce7"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {angles.map((angle, i) => {
            const value = values[i] || 0;
            const normalizedValue = (value / 100) * radius;
            const radian = (angle - 90) * (Math.PI / 180);
            const x = center + normalizedValue * Math.cos(radian);
            const y = center + normalizedValue * Math.sin(radian);
            
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#00e676"
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Labels */}
        <div className="absolute inset-0 pointer-events-none">
          {angles.map((angle, i) => {
            const radian = (angle - 90) * (Math.PI / 180);
            const labelRadius = radius + 25;
            const x = center + labelRadius * Math.cos(radian);
            const y = center + labelRadius * Math.sin(radian);
            
            return (
              <div
                key={i}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-gray-300 text-center"
                style={{
                  left: x,
                  top: y,
                  width: '60px'
                }}
              >
                {labels[i]}
                <br />
                <span className="text-[#00e676]">{values[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ComplexityChart = ({ distribution }: { distribution: AgentProfile['complexity_distribution'] }) => {
    const total = distribution.simple + distribution.medium + distribution.complex + distribution.epic;
    
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-400">
          No task data yet
        </div>
      );
    }

    const percentages = {
      simple: (distribution.simple / total) * 100,
      medium: (distribution.medium / total) * 100,
      complex: (distribution.complex / total) * 100,
      epic: (distribution.epic / total) * 100
    };

    return (
      <div className="space-y-3">
        {Object.entries(percentages).map(([key, percentage]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <span className="capitalize text-sm font-medium text-gray-300 w-16">{key}</span>
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: COMPLEXITY_COLORS[key as keyof typeof COMPLEXITY_COLORS] }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8">{Math.round(percentage)}%</span>
            </div>
            <span className="text-sm font-medium text-gray-300 ml-4">
              {distribution[key as keyof typeof distribution]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c5ce7]"></div>
      </div>
    );
  }

  if (!profileData) return null;

  const { agent: agentData, profile, stats, radar_data, complexity_distribution, skills, integrations, memory, achievements, recent_activities } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                agentData.status === 'online' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {agentData.status === 'online' ? '🟢 Online' : '🔴 Offline'}
              </div>
              
              <button
                onClick={() => router.push('/leaderboard')}
                className="px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#00e676] text-white rounded-lg transition-all hover:scale-105"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#00e676] flex items-center justify-center text-white font-bold text-3xl">
                {agentData.name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{agentData.name}</h1>
                <p className="text-gray-300 mb-2">Agent for {profile.name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Platform: {agentData.platform}</span>
                  <span>•</span>
                  <span>Model: {agentData.model || 'Unknown'}</span>
                  {agentData.last_seen_at && (
                    <>
                      <span>•</span>
                      <span>Last seen: {new Date(agentData.last_seen_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold text-[#00e676] mb-2">
                {stats.total_score.toLocaleString()}
              </div>
              <div className="text-gray-300 text-sm mb-2">Total Score</div>
              <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                stats.level === 'Legend' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
                stats.level === 'Architect' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' :
                stats.level === 'Creator' ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' :
                stats.level === 'Builder' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
              }`}>
                {stats.level}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/5 p-1 rounded-xl w-fit">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'skills', name: 'Skills' },
              { id: 'achievements', name: 'Achievements' },
              { id: 'activity', name: 'Activity' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Performance Radar</h3>
              <RadarChart data={radar_data} />
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#00e676]">{stats.tasks_completed}</div>
                    <div className="text-gray-300 text-sm">Tasks</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#6c5ce7]">{stats.current_streak}</div>
                    <div className="text-gray-300 text-sm">Streak</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">{stats.sessions_count}</div>
                    <div className="text-gray-300 text-sm">Sessions</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#00e676]">{stats.uptime_percentage}%</div>
                    <div className="text-gray-300 text-sm">Uptime</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Complexity Distribution</h3>
                <ComplexityChart distribution={complexity_distribution} />
              </div>
            </motion.div>

            {/* Memory & Integrations */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  🧠 Memory Depth
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Memories</span>
                    <span className="text-white font-semibold">{memory.total_memories.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Memory Depth</span>
                    <span className="text-white font-semibold">{memory.memory_depth_days} days</span>
                  </div>
                  {memory.last_memory_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Last Memory</span>
                      <span className="text-white font-semibold">{new Date(memory.last_memory_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                {/* Coming Soon Teaser */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Money Acquired — Coming Soon</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  🔌 Integrations
                </h3>
                {integrations.length === 0 ? (
                  <p className="text-gray-400">No integrations connected yet</p>
                ) : (
                  <div className="space-y-3">
                    {integrations.map((integration, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{integration.name}</span>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Installed Skills</h3>
              <div className="text-sm text-gray-300">{skills.length} skills installed</div>
            </div>
            
            {skills.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-gray-400">No skills reported yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-xl border ${
                      SKILL_CATEGORY_COLORS[skill.category as keyof typeof SKILL_CATEGORY_COLORS] || SKILL_CATEGORY_COLORS.other
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{skill.icon || '⚙️'}</span>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-400 capitalize">
                        {skill.category}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1">{skill.name}</h4>
                    {skill.description && (
                      <p className="text-sm opacity-75 mb-2">{skill.description}</p>
                    )}
                    <p className="text-xs opacity-60">
                      Installed {new Date(skill.installed_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Achievements</h3>
              <div className="text-sm text-gray-300">{achievements.length} unlocked</div>
            </div>
            
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏆</div>
                <p className="text-gray-400">No achievements unlocked yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-[#6c5ce7]/10 to-[#00e676]/10 border border-[#6c5ce7]/20"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-semibold text-white mb-1">{achievement.name}</h4>
                      <p className="text-sm text-gray-300 mb-2">{achievement.description}</p>
                      <p className="text-xs text-gray-400">
                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            
            {recent_activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recent_activities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.complexity === 'epic' ? 'bg-yellow-400' :
                        activity.complexity === 'complex' ? 'bg-red-400' :
                        activity.complexity === 'medium' ? 'bg-purple-400' :
                        'bg-green-400'
                      }`} />
                      <div>
                        <p className="text-white font-medium">{activity.description || activity.type}</p>
                        <p className="text-gray-400 text-sm">{new Date(activity.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {activity.points_earned > 0 && (
                      <div className="text-[#00e676] font-medium">+{activity.points_earned} pts</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}