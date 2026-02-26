'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAchievements } from '@/contexts/AchievementContext';
import { Trophy, Zap, Target, Star, Crown, Flame } from 'lucide-react';

// Demo achievements for testing
const DEMO_ACHIEVEMENTS = [
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your very first task',
    icon: '🎯',
    category: 'activity',
    points: 25,
  },
  {
    id: 'tasks-10',
    name: 'Getting Started',
    description: 'Complete 10 tasks',
    icon: '✅',
    category: 'activity',
    points: 50,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    points: 75,
  },
  {
    id: 'score-1000',
    name: 'Rising Star',
    description: 'Reach 1000 points',
    icon: '⭐',
    category: 'score',
    points: 100,
  },
  {
    id: 'epic-first',
    name: 'Epic Achievement',
    description: 'Complete your first epic task',
    icon: '🚀',
    category: 'special',
    points: 150,
  },
  {
    id: 'tasks-500',
    name: 'Machine God',
    description: 'Complete 500 tasks - You are inevitable',
    icon: '🤖',
    category: 'special',
    points: 250,
  },
];

export function AchievementDemo() {
  const { showFullScreenUnlock, showToastNotification } = useAchievements();
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);

  const handleAchievementToggle = (achievementId: string) => {
    setSelectedAchievements(prev =>
      prev.includes(achievementId)
        ? prev.filter(id => id !== achievementId)
        : [...prev, achievementId]
    );
  };

  const triggerFullScreen = () => {
    const selected = DEMO_ACHIEVEMENTS.filter(a => selectedAchievements.includes(a.id));
    if (selected.length > 0) {
      showFullScreenUnlock(selected);
      setSelectedAchievements([]);
    }
  };

  const triggerToast = () => {
    const selected = DEMO_ACHIEVEMENTS.filter(a => selectedAchievements.includes(a.id));
    if (selected.length > 0) {
      showToastNotification(selected);
      setSelectedAchievements([]);
    }
  };

  const quickDemo = (type: 'single' | 'multiple') => {
    if (type === 'single') {
      showFullScreenUnlock([DEMO_ACHIEVEMENTS[0]]);
    } else {
      showFullScreenUnlock(DEMO_ACHIEVEMENTS.slice(0, 3));
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Trophy size={20} className="text-[#6c5ce7]" />
          <span>Achievement Demo</span>
        </h3>
        <div className="text-sm text-gray-300">Test the epic unlock system</div>
      </div>

      {/* Quick demo buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => quickDemo('single')}
          className="p-4 rounded-xl bg-gradient-to-r from-[#6c5ce7]/20 to-[#00e676]/20 border border-[#6c5ce7]/30 text-white font-medium hover:border-[#6c5ce7]/50 transition-colors"
        >
          <Zap size={20} className="mx-auto mb-2 text-[#6c5ce7]" />
          Single Achievement
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => quickDemo('multiple')}
          className="p-4 rounded-xl bg-gradient-to-r from-[#ff6b35]/20 to-[#ffd700]/20 border border-[#ff6b35]/30 text-white font-medium hover:border-[#ff6b35]/50 transition-colors"
        >
          <Star size={20} className="mx-auto mb-2 text-[#ffd700]" />
          Multiple Achievements
        </motion.button>
      </div>

      {/* Achievement selection */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-3">Select Achievements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEMO_ACHIEVEMENTS.map((achievement) => {
            const isSelected = selectedAchievements.includes(achievement.id);
            const categoryColors = {
              activity: '#00e676',
              streak: '#ff6b35',
              score: '#ffd700',
              special: '#6c5ce7',
            };
            const color = categoryColors[achievement.category as keyof typeof categoryColors];

            return (
              <motion.button
                key={achievement.id}
                onClick={() => handleAchievementToggle(achievement.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'bg-white/20 border border-white/30 shadow-lg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : 'bg-white/30'}`}
                    style={{ backgroundColor: isSelected ? color : undefined }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{achievement.name}</div>
                    <div className="text-xs text-gray-400">{achievement.points} pts • {achievement.category}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <motion.button
          whileHover={{ scale: selectedAchievements.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selectedAchievements.length > 0 ? 0.98 : 1 }}
          onClick={triggerFullScreen}
          disabled={selectedAchievements.length === 0}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
            selectedAchievements.length > 0
              ? 'bg-gradient-to-r from-[#6c5ce7] to-[#00e676] text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Trophy size={18} className="inline mr-2" />
          Full-Screen Unlock ({selectedAchievements.length})
        </motion.button>

        <motion.button
          whileHover={{ scale: selectedAchievements.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selectedAchievements.length > 0 ? 0.98 : 1 }}
          onClick={triggerToast}
          disabled={selectedAchievements.length === 0}
          className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
            selectedAchievements.length > 0
              ? 'bg-gradient-to-r from-[#ff6b35] to-[#ffd700] text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Target size={18} className="inline mr-2" />
          Toast Notification ({selectedAchievements.length})
        </motion.button>
      </div>

      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <p className="text-sm text-gray-400">
          <Crown size={16} className="inline mr-2 text-[#ffd700]" />
          Test the epic gaming-level achievement unlock animations. Full-screen overlays auto-dismiss after 4 seconds or tap to continue. Toasts appear in bottom-right and can be clicked to expand.
        </p>
      </div>
    </div>
  );
}