'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry, LeaderboardTab } from '@/lib/types';
import { getLeaderboard, getCurrentUser } from '@/lib/store';

const tabs: { key: LeaderboardTab; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'revenue', label: 'Money Made' },
  { key: 'hours', label: 'Time Saved' },
  { key: 'tasks', label: 'Most Built' }
];

interface LeaderboardProps {
  refreshTrigger?: number;
}

// Generate consistent color for initials based on name
function getInitialsColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

// Get initials from name
function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
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

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-gray-400 font-medium w-6 text-center">{rank}</span>;
  };

  const getTrendDisplay = (entry: LeaderboardEntry) => {
    const trendValue = Math.floor(Math.random() * 5) + 1; // Mock trend value
    switch (entry.trend) {
      case 'up':
        return <span className="text-green-500 text-sm font-medium flex items-center gap-0.5">▲ +{trendValue}</span>;
      case 'down':
        return <span className="text-red-400 text-sm font-medium flex items-center gap-0.5">▼ -{trendValue}</span>;
      default:
        return <span className="text-gray-400 text-sm">-</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h2 className="text-lg font-semibold text-[#0a0a0f]">Community Leaderboard</h2>
          <span className="text-gray-400 text-sm ml-2">- February 2026</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-3 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#1a2b3c] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard list */}
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
                    isCurrentUser ? 'bg-cyan-50 border-l-4 border-l-cyan-400' : ''
                  }`}
                >
                  {/* Rank/Medal */}
                  <div className="w-8 flex justify-center">
                    {getMedalIcon(rank)}
                  </div>

                  {/* Initials Avatar */}
                  <div className={`w-10 h-10 rounded-full ${getInitialsColor(entry.name)} flex items-center justify-center text-white text-sm font-semibold`}>
                    {getInitials(entry.name)}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isCurrentUser ? 'text-[#0a0a0f]' : 'text-[#0a0a0f]'}`}>
                        {entry.name}
                      </p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">Agent: {entry.agentName}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right min-w-[70px]">
                    <p className="font-bold text-[#0a0a0f]">{getValue(entry)}</p>
                  </div>

                  {/* Trend */}
                  <div className="w-12 text-right">
                    {getTrendDisplay(entry)}
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
