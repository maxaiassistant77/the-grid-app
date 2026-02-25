'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { User, UserStats, Achievement, ActivityLog } from '@/lib/types';
import {
  getCurrentUser,
  updateUser,
  getStats,
  getAchievements,
  getActivities,
  calculateScore,
  getLevel,
  getLevelColor
} from '@/lib/store';

// Subscribe to nothing (client-only rendering pattern)
const emptySubscribe = () => () => {};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [agentName, setAgentName] = useState('');

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
    setAgentName(currentUser.agentName);
    setStats(getStats());
    setAchievements(getAchievements());
    setActivities(getActivities());
  }, [mounted, router]);

  const handleSaveAgentName = () => {
    if (agentName.trim() && user) {
      const updatedUser = updateUser({ agentName: agentName.trim() });
      if (updatedUser) {
        setUser(updatedUser);
      }
      setIsEditing(false);
    }
  };

  if (!mounted || !user || !stats) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const score = calculateScore(stats, achievements);
  const level = getLevel(score);
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Nav user={user} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0a0a0f] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] border border-gray-100 p-8 mb-6"
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00B4E6] to-[#10B981] flex items-center justify-center text-white font-bold text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#0a0a0f] mb-1">{user.name}</h1>
              <p className="text-gray-500 mb-3">{user.email}</p>

              <div className="flex items-center gap-4 flex-wrap">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${getLevelColor(level)}`}>
                  {level}
                </span>
                <span className="text-sm text-gray-500">
                  Score: <span className="font-semibold text-[#0a0a0f]">{score.toLocaleString()}</span>
                </span>
                <span className="text-sm text-gray-500">
                  Member since <span className="font-medium text-[#0a0a0f]">{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Agent Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-[#0a0a0f] mb-4">Your AI Agent</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Agent Name
              </label>
              {isEditing ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#00B4E6] focus:ring-2 focus:ring-[#00B4E6]/20 outline-none transition-all text-[#0a0a0f]"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveAgentName}
                    className="px-4 py-2 rounded-xl bg-[#00B4E6] text-white font-medium hover:bg-[#00a0cc] transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setAgentName(user.agentName);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[#0a0a0f] font-medium">
                    {user.agentName}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-xl text-[#00B4E6] font-medium hover:bg-[#00B4E6]/10 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-[#00B4E6]/5 to-[#10B981]/5 rounded-xl p-5 border border-[#00B4E6]/10">
              <h3 className="font-semibold text-[#0a0a0f] mb-2 flex items-center gap-2">
                <span>&#128161;</span> OpenClaw Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#00B4E6] mt-1">&#8226;</span>
                  <span>Document what your agent does daily to track progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00B4E6] mt-1">&#8226;</span>
                  <span>Be specific when logging - note what tasks were automated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00B4E6] mt-1">&#8226;</span>
                  <span>Track revenue impact to see your agent&apos;s true value</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00B4E6] mt-1">&#8226;</span>
                  <span>Maintain your streak to unlock bonus achievements</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-[#0a0a0f] mb-4">All-Time Stats</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#0a0a0f]">{stats.tasksCompleted}</p>
              <p className="text-sm text-gray-500">Tasks Completed</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#0a0a0f]">{stats.hoursSaved}</p>
              <p className="text-sm text-gray-500">Hours Saved</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#0a0a0f]">${stats.revenueGenerated.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Revenue Generated</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-[#0a0a0f]">{stats.currentStreak}</p>
              <p className="text-sm text-gray-500">Current Streak</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Activities Logged</p>
                <p className="text-2xl font-bold text-[#0a0a0f]">{activities.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Achievements Unlocked</p>
                <p className="text-2xl font-bold text-[#0a0a0f]">
                  {unlockedAchievements.length} / {achievements.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-[#0a0a0f]">Activity History</h2>
            <p className="text-sm text-gray-500 mt-1">All your logged activities</p>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl mb-3">&#128203;</p>
              <p className="text-gray-500">No activities logged yet</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0a0a0f]">
                        {activity.type === 'tasks' && `Logged ${activity.value} task(s)`}
                        {activity.type === 'hours' && `Logged ${activity.value} hour(s) saved`}
                        {activity.type === 'revenue' && `Logged $${activity.value.toLocaleString()} revenue`}
                        {activity.type === 'challenge' && `Challenge entry: $${activity.value.toLocaleString()}`}
                      </p>
                      {activity.note && (
                        <p className="text-sm text-gray-500 mt-0.5">{activity.note}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
