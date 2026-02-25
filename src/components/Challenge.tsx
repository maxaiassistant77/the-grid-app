'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockChallenge } from '@/lib/mock-data';

interface ChallengeProps {
  onLogEntry: () => void;
}

export function Challenge({ onLogEntry }: ChallengeProps) {
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const endDate = new Date(mockChallenge.endDate);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    setDaysRemaining(days);
  }, []);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'medal-gold';
    if (index === 1) return 'medal-silver';
    return 'medal-bronze';
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden h-full">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0a0a0f] flex items-center gap-2">
            <span className="text-xl">&#127775;</span> Monthly Challenge
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Ends in</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 font-semibold">
              {daysRemaining} days
            </span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-[#0a0a0f] mb-2">
          {mockChallenge.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {mockChallenge.description}
        </p>

        <div className="flex items-center gap-2 mb-6 bg-gradient-to-r from-[#00B4E6]/10 to-[#10B981]/10 rounded-xl p-3">
          <span className="text-lg">&#127873;</span>
          <span className="text-sm font-medium text-[#0a0a0f]">Prize: {mockChallenge.prize}</span>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top Participants</p>
          {mockChallenge.topParticipants.map((participant, index) => (
            <motion.div
              key={participant.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`w-6 h-6 rounded-full ${getMedalColor(index)} flex items-center justify-center text-white text-xs font-bold`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#0a0a0f] truncate">{participant.name}</p>
                <p className="text-xs text-gray-500 truncate">{participant.agentName}</p>
              </div>
              <span className="text-sm font-semibold text-[#0a0a0f]">${participant.score.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onLogEntry}
          className="w-full py-3 px-4 rounded-xl bg-[#00B4E6] text-white font-medium hover:bg-[#00a0cc] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Log Challenge Entry
        </motion.button>
      </div>
    </div>
  );
}
