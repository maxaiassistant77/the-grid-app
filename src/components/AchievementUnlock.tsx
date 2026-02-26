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

interface AchievementUnlockProps {
  achievements: Achievement[];
  onComplete?: () => void;
}

// Particle burst component
function Particles({ color }: { color: string }) {
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const distance = 80 + Math.random() * 60;
    const size = 3 + Math.random() * 4;
    const delay = Math.random() * 0.3;
    
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size,
      delay,
    };
  });

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            left: '50%',
            top: '50%',
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.8,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  );
}

// Animated points counter
function PointsCounter({ points }: { points: number }) {
  const [displayPoints, setDisplayPoints] = useState(0);
  
  useEffect(() => {
    const duration = 800;
    const steps = 20;
    const increment = points / steps;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), points);
      setDisplayPoints(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [points]);
  
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
      className="text-3xl font-bold text-[#00e676]"
    >
      +{displayPoints} pts
    </motion.div>
  );
}

export function AchievementUnlock({ achievements, onComplete }: AchievementUnlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const current = achievements[currentIndex];
  
  const dismiss = useCallback(() => {
    if (currentIndex < achievements.length - 1) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsVisible(true);
      }, 300);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }
  }, [currentIndex, achievements.length, onComplete]);
  
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
  }, [currentIndex, dismiss]);

  // Haptic feedback on mobile
  useEffect(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 100]);
    }
  }, [currentIndex]);

  if (!current) return null;

  const categoryColors: Record<string, string> = {
    activity: '#00e676',
    streak: '#ff6b35',
    score: '#ffd700',
    special: '#6c5ce7',
  };
  
  const color = categoryColors[current.category] || '#6c5ce7';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={dismiss}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          {/* Content */}
          <div className="relative flex flex-col items-center z-10">
            {/* Achievement unlocked label */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-semibold tracking-[0.2em] uppercase mb-6"
              style={{ color }}
            >
              Achievement Unlocked
            </motion.div>
            
            {/* Badge with particles */}
            <div className="relative mb-6">
              <Particles color={color} />
              
              {/* Glow ring */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.8, times: [0, 0.5, 1] }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                  transform: 'scale(2)',
                }}
              />
              
              {/* Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
              >
                <AchievementBadge achievementId={current.id} points={current.points} size={120} />
              </motion.div>
            </div>
            
            {/* Achievement name */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2 text-center"
            >
              {current.name}
            </motion.h2>
            
            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-center mb-4 max-w-xs"
            >
              {current.description}
            </motion.p>
            
            {/* Points */}
            <PointsCounter points={current.points} />
            
            {/* Queue indicator */}
            {achievements.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 flex items-center space-x-1"
              >
                {achievements.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex ? 'bg-white' : i < currentIndex ? 'bg-white/40' : 'bg-white/20'
                    }`}
                  />
                ))}
              </motion.div>
            )}
            
            {/* Tap to continue */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-gray-500 text-xs mt-6"
            >
              Tap to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
