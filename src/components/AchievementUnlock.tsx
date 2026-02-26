'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AchievementBadge, getTierFromPoints } from './AchievementBadge';

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

// Enhanced gaming-level particle burst with confetti explosion
function EpicParticles({ color, tier }: { color: string; tier: string }) {
  const particleCount = tier === 'diamond' ? 40 : tier === 'gold' ? 30 : 25;
  
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = 120 + Math.random() * 100;
    const size = tier === 'diamond' ? 4 + Math.random() * 6 : 3 + Math.random() * 4;
    const delay = Math.random() * 0.4;
    
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size,
      delay,
      rotation: Math.random() * 360,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    };
  });

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            left: '50%',
            top: '50%',
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 1, 
            scale: 1, 
            rotate: 0 
          }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            scale: 0,
            rotate: p.rotation + 360,
          }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </>
  );
}

// Radial burst of sparkles for legendary achievements
function SparkleExplosion({ color }: { color: string }) {
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 150;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: i * 0.05,
    };
  });

  return (
    <>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute w-2 h-2"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: -4,
            marginTop: -4,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: s.x,
            y: s.y,
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 0.8,
            delay: s.delay + 0.3,
            ease: 'easeOut',
          }}
        >
          <div 
            className="w-full h-full transform rotate-45"
            style={{ backgroundColor: color }}
          />
        </motion.div>
      ))}
    </>
  );
}

// Slot machine style animated counter with satisfying number roll
function EpicPointsCounter({ points, tier }: { points: number; tier: string }) {
  const [displayPoints, setDisplayPoints] = useState(0);
  
  useEffect(() => {
    const duration = tier === 'diamond' ? 1200 : 1000;
    const steps = 30;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      // Easing function for more satisfying animation
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      current = Math.round(points * eased);
      setDisplayPoints(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [points, tier]);
  
  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: 0.7, 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }}
      className="relative"
    >
      <motion.div
        key={displayPoints}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl md:text-5xl font-black text-[#00e676] relative"
        style={{
          textShadow: '0 0 20px rgba(0, 230, 118, 0.5)',
        }}
      >
        +{displayPoints.toLocaleString()}
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xl md:text-2xl ml-2 font-bold"
        >
          pts
        </motion.span>
      </motion.div>
      
      {/* Glow effect behind text */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="absolute inset-0 blur-xl bg-[#00e676] rounded-full"
        style={{ transform: 'scale(2)' }}
      />
    </motion.div>
  );
}

// Pulsing glow ring around the badge
function PulsingGlow({ color, tier }: { color: string; tier: string }) {
  return (
    <>
      {/* Outer glow ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.8, 1.6], 
          opacity: [0, 0.4, 0.2] 
        }}
        transition={{ 
          duration: 1.5, 
          times: [0, 0.6, 1],
          repeat: tier === 'diamond' ? Infinity : 2,
          repeatType: 'reverse'
        }}
        className="absolute inset-0 rounded-full border-4"
        style={{
          borderColor: color,
          filter: 'blur(8px)',
          transform: 'scale(2.5)',
        }}
      />
      
      {/* Inner pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.3, 1.1], 
          opacity: [0, 0.6, 0.3] 
        }}
        transition={{ 
          duration: 1, 
          times: [0, 0.5, 1],
          delay: 0.2
        }}
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
          transform: 'scale(2)',
        }}
      />
    </>
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

  // Enhanced haptic feedback based on achievement tier
  useEffect(() => {
    const tier = getTierFromPoints(current.points);
    if ('vibrate' in navigator) {
      const pattern = tier === 'diamond' ? [100, 50, 100, 50, 200] : 
                    tier === 'gold' ? [80, 30, 150] : [50, 30, 100];
      navigator.vibrate(pattern);
    }
  }, [currentIndex, current.points]);

  // Sound effect hook (ready for future implementation)
  useEffect(() => {
    const tier = getTierFromPoints(current.points);
    // Add data attribute for sound system integration
    document.body.setAttribute('data-achievement-tier', tier);
    document.body.setAttribute('data-achievement-unlock', 'true');
    
    return () => {
      document.body.removeAttribute('data-achievement-tier');
      document.body.removeAttribute('data-achievement-unlock');
    };
  }, [current.points]);

  if (!current) return null;

  const categoryColors: Record<string, string> = {
    activity: '#00e676',
    streak: '#ff6b35', 
    score: '#ffd700',
    special: '#6c5ce7',
  };
  
  const color = categoryColors[current.category] || '#6c5ce7';
  const tier = getTierFromPoints(current.points);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={dismiss}
        >
          {/* Enhanced backdrop with deeper blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/90"
          />
          
          {/* Epic content */}
          <div className="relative flex flex-col items-center z-10 max-w-md w-full">
            {/* Achievement unlocked header with enhanced styling */}
            <motion.div
              initial={{ y: -40, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <motion.h1
                animate={{ 
                  textShadow: [
                    `0 0 20px ${color}80`,
                    `0 0 40px ${color}60`,
                    `0 0 20px ${color}80`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg md:text-xl font-black tracking-[0.3em] uppercase text-white text-center"
              >
                Achievement Unlocked
              </motion.h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mt-2"
              />
            </motion.div>
            
            {/* Epic badge showcase with particles */}
            <div className="relative mb-8 flex items-center justify-center">
              <PulsingGlow color={color} tier={tier} />
              <EpicParticles color={color} tier={tier} />
              {tier === 'diamond' && <SparkleExplosion color={color} />}
              
              {/* Badge with epic spring entrance */}
              <motion.div
                initial={{ scale: 0, rotate: -540, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 12,
                  delay: 0.3,
                }}
                className="relative z-10"
              >
                <motion.div
                  animate={tier === 'diamond' ? {
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ 
                    duration: 2, 
                    repeat: tier === 'diamond' ? Infinity : 0,
                    ease: 'easeInOut'
                  }}
                >
                  <AchievementBadge 
                    achievementId={current.id} 
                    points={current.points} 
                    size={140}
                    className="drop-shadow-2xl" 
                  />
                </motion.div>
              </motion.div>
            </div>
            
            {/* Achievement details with improved typography */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-center mb-6"
            >
              <motion.h2
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight"
              >
                {current.name}
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-300 text-base md:text-lg leading-relaxed max-w-sm mx-auto"
              >
                {current.description}
              </motion.p>
            </motion.div>
            
            {/* Epic points counter */}
            <EpicPointsCounter points={current.points} tier={tier} />
            
            {/* Enhanced queue indicator */}
            {achievements.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-8 flex items-center space-x-3"
              >
                {achievements.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 + (i * 0.1) }}
                    className={`relative ${
                      i === currentIndex 
                        ? 'w-4 h-4 bg-white rounded-full shadow-lg' 
                        : i < currentIndex 
                        ? 'w-3 h-3 bg-white/60 rounded-full' 
                        : 'w-3 h-3 bg-white/20 rounded-full'
                    }`}
                  >
                    {i === currentIndex && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-white/30 rounded-full"
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* Tap to continue with subtle animation */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.7, 1] }}
              transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
              className="text-gray-400 text-sm mt-8 tracking-wide"
            >
              Tap anywhere to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
