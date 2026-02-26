'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AchievementBadge } from './AchievementBadge';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

interface AchievementToastProps {
  achievements: Achievement[];
  onExpand?: (achievement: Achievement) => void;
  onComplete?: () => void;
}

interface ToastAchievement extends Achievement {
  toastId: string;
  timestamp: number;
}

export function AchievementToast({ achievements, onExpand, onComplete }: AchievementToastProps) {
  const [toastQueue, setToastQueue] = useState<ToastAchievement[]>([]);
  const [visibleToasts, setVisibleToasts] = useState<ToastAchievement[]>([]);

  // Process new achievements into toast queue
  useEffect(() => {
    if (achievements.length > 0) {
      const newToasts = achievements.map(achievement => ({
        ...achievement,
        toastId: `toast-${achievement.id}-${Date.now()}`,
        timestamp: Date.now(),
      }));
      
      setToastQueue(prev => [...prev, ...newToasts]);
    }
  }, [achievements]);

  // Process queue and show toasts one by one
  useEffect(() => {
    if (toastQueue.length > 0 && visibleToasts.length < 3) {
      const [nextToast, ...remainingQueue] = toastQueue;
      setToastQueue(remainingQueue);
      setVisibleToasts(prev => [...prev, nextToast]);
    }
  }, [toastQueue, visibleToasts]);

  const dismissToast = useCallback((toastId: string) => {
    setVisibleToasts(prev => prev.filter(toast => toast.toastId !== toastId));
  }, []);

  const expandToast = useCallback((achievement: ToastAchievement) => {
    dismissToast(achievement.toastId);
    onExpand?.(achievement);
  }, [dismissToast, onExpand]);

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    visibleToasts.forEach(toast => {
      const timer = setTimeout(() => {
        dismissToast(toast.toastId);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [visibleToasts, dismissToast]);

  // Complete callback when all done
  useEffect(() => {
    if (toastQueue.length === 0 && visibleToasts.length === 0 && achievements.length > 0) {
      onComplete?.();
    }
  }, [toastQueue, visibleToasts, achievements.length, onComplete]);

  const categoryColors: Record<string, string> = {
    activity: '#00e676',
    streak: '#ff6b35',
    score: '#ffd700',
    special: '#6c5ce7',
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 space-y-3 max-w-sm w-full px-4 md:px-0">
      <AnimatePresence>
        {visibleToasts.map((achievement, index) => {
          const color = categoryColors[achievement.category] || '#6c5ce7';
          
          return (
            <motion.div
              key={achievement.toastId}
              initial={{ 
                x: 400, 
                opacity: 0, 
                scale: 0.8,
                rotate: 5 
              }}
              animate={{ 
                x: 0, 
                opacity: 1, 
                scale: 1,
                rotate: 0 
              }}
              exit={{ 
                x: 400, 
                opacity: 0, 
                scale: 0.8,
                rotate: -5 
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                delay: index * 0.1
              }}
              className="relative cursor-pointer group"
              onClick={() => expandToast(achievement)}
              style={{ zIndex: 50 - index }}
            >
              {/* Glow effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="absolute inset-0 rounded-2xl blur-lg"
                style={{ backgroundColor: color }}
              />
              
              {/* Toast content */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/20 rounded-2xl p-4 backdrop-blur-xl shadow-2xl overflow-hidden"
              >
                {/* Achievement unlocked header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between mb-3"
                >
                  <span 
                    className="text-xs font-bold tracking-wider uppercase"
                    style={{ color }}
                  >
                    Achievement Unlocked
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissToast(achievement.toastId);
                    }}
                    className="text-gray-400 hover:text-white transition-colors w-4 h-4 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </motion.div>

                {/* Main content */}
                <div className="flex items-center space-x-4">
                  {/* Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 300, 
                      delay: 0.3 
                    }}
                    className="flex-shrink-0"
                  >
                    <AchievementBadge 
                      achievementId={achievement.id} 
                      points={achievement.points} 
                      size={48} 
                    />
                  </motion.div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="font-bold text-white text-sm mb-1 truncate group-hover:text-clip"
                    >
                      {achievement.name}
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-300 text-xs line-clamp-2 mb-1"
                    >
                      {achievement.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center justify-between"
                    >
                      <span 
                        className="text-sm font-bold"
                        style={{ color }}
                      >
                        +{achievement.points} pts
                      </span>
                      <span className="text-xs text-gray-400">
                        Tap to view
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Subtle border animation */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 2 }}
                  className="absolute bottom-0 left-0 h-0.5 origin-left rounded-full"
                  style={{ backgroundColor: color }}
                />

                {/* Background sparkle for higher tier achievements */}
                {achievement.points >= 100 && (
                  <motion.div
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Queue indicator when multiple toasts */}
      {toastQueue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-full px-3 py-1">
            <span className="text-xs text-gray-300">
              +{toastQueue.length} more
            </span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 border border-gray-400 border-t-white rounded-full"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}