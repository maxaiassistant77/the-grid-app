'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '@/lib/types';
import { getAchievements } from '@/lib/store';

interface AchievementsProps {
  refreshTrigger?: number;
}

export function Achievements({ refreshTrigger }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(getAchievements());
  }, [refreshTrigger]);

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-[#0a0a0f] flex items-center gap-2">
          <span className="text-xl">&#127941;</span> Achievements
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {achievements.filter(a => a.unlockedAt).length} of {achievements.length} unlocked
        </p>
      </div>

      <div className="p-5 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {achievements.map((achievement, index) => {
          const isUnlocked = !!achievement.unlockedAt;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className="relative group"
            >
              <motion.div
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all cursor-pointer ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-[#00B4E6]/10 to-[#10B981]/10 border-2 border-[#00B4E6]/30'
                    : 'bg-gray-100 border-2 border-gray-200 grayscale opacity-40'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {achievement.icon}
              </motion.div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0a0a0f] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-gray-400">{achievement.description}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a0a0f]" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
