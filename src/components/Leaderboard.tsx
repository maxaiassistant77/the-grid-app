'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry, LeaderboardTab } from '@/lib/types';
import { getLeaderboard, getCurrentUser, getLevelColor } from '@/lib/store';

const tabs: { key: LeaderboardTab; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'hours', label: 'Hours Saved' },
  { key: 'tasks', label: 'Tasks' }
];

interface LeaderboardProps {
  refreshTrigger?: number;
}

export function Leaderboard({ refreshTrigger }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('overall');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.id);
    }
    setLeaderboard(getLeaderboard(activeTab));
  }, [activeTab, refreshTrigger]);

  const getValue = (entry: LeaderboardEntry) => {
    switch (activeTab) {
      case 'revenue': return `$${entry.revenueGenerated.toLocaleString()}`;
      case 'hours': return `${entry.hoursSaved}h`;
      case 'tasks': return entry.tasksCompleted.toString();
      default: return entry.score.toString();
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="w-6 h-6 rounded-full medal-gold flex items-center justify-center text-white text-xs font-bold">1</div>;
    if (rank === 2) return <div className="w-6 h-6 rounded-full medal-silver flex items-center justify-center text-white text-xs font-bold">2</div>;
    if (rank === 3) return <div className="w-6 h-6 rounded-full medal-bronze flex items-center justify-center text-white text-xs font-bold">3</div>;
    return <span className="text-gray-400 font-medium w-6 text-center">{rank}</span>;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">&#9650;</span>;
      case 'down':
        return <span className="text-red-400">&#9660;</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#0a0a0f] flex items-center gap-2">
          <span className="text-xl">&#127942;</span> Community Leaderboard
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 bg-gray-50 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-[#0a0a0f] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.id === userId;
              const rank = index + 1;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center gap-4 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    isCurrentUser ? 'glow-cyan bg-[#00B4E6]/5' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankBadge(rank)}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isCurrentUser ? 'text-[#00B4E6]' : 'text-[#0a0a0f]'}`}>
                      {entry.name}
                      {isCurrentUser && <span className="ml-1.5 text-xs">(You)</span>}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{entry.agentName}</p>
                  </div>

                  {/* Level badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${getLevelColor(entry.level)}`}>
                    {entry.level}
                  </span>

                  {/* Score */}
                  <div className="text-right min-w-[70px]">
                    <p className="font-semibold text-[#0a0a0f]">{getValue(entry)}</p>
                  </div>

                  {/* Trend */}
                  <div className="w-4">
                    {getTrendIcon(entry.trend)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
