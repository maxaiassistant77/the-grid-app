'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChallengeProps {
  onLogEntry: () => void;
}

// Generate consistent color for initials based on name
function getInitialsColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
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

const challengeLeaders = [
  { name: 'Sarah Chen', score: 12400 },
  { name: 'Marcus Williams', score: 9800 },
  { name: 'David Kim', score: 8200 }
];

export function Challenge({ onLogEntry }: ChallengeProps) {
  const [daysRemaining, setDaysRemaining] = useState(4);

  useEffect(() => {
    // Calculate days remaining until end of February 2026
    const endDate = new Date(2026, 1, 28); // Feb 28, 2026
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    setDaysRemaining(days);
  }, []);

  // Progress bar percentage (days remaining out of ~30)
  const progressPercent = Math.max(0, Math.min(100, ((30 - daysRemaining) / 30) * 100));

  const getMedalIcon = (index: number) => {
    if (index === 0) return <span className="text-lg">🥇</span>;
    if (index === 1) return <span className="text-lg">🥈</span>;
    return <span className="text-lg">🥉</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h2 className="text-lg font-semibold text-[#0a0a0f]">February Challenge</h2>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Challenge Card */}
        <div className="bg-amber-50 rounded-xl p-4 mb-5">
          <h3 className="text-lg font-bold text-amber-900 mb-2">
            The Revenue Race
          </h3>
          <p className="text-sm text-amber-800">
            Build an AI workflow that generates the most revenue by Feb 28
          </p>
        </div>

        {/* Prize */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xl">🏆</span>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Prize</p>
            <p className="text-sm font-medium text-[#0a0a0f]">1 Free Month + 1-on-1 Call with Zach</p>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Time Remaining</p>
            <p className="text-sm font-medium text-[#0a0a0f]">{daysRemaining} days left</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${100 - progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Leaders */}
        <div className="mb-5 flex-1">
          <p className="text-sm text-gray-500 mb-3">Current Leaders</p>
          <div className="space-y-3">
            {challengeLeaders.map((leader, index) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                {getMedalIcon(index)}
                <div className={`w-8 h-8 rounded-full ${getInitialsColor(leader.name)} flex items-center justify-center text-white text-xs font-semibold`}>
                  {getInitials(leader.name)}
                </div>
                <p className="flex-1 font-medium text-sm text-[#0a0a0f]">{leader.name}</p>
                <span className="text-sm font-bold text-green-600">${leader.score.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          onClick={onLogEntry}
          className="w-full py-3 px-4 rounded-xl bg-[#1a2b3c] text-white font-medium hover:bg-[#243647] transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Submit Entry
        </motion.button>
      </div>
    </div>
  );
}
