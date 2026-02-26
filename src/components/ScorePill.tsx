'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

interface ScorePillProps {
  score: number;
  level: string;
}

const LEVEL_COLORS: Record<string, { from: string; to: string }> = {
  Legend: { from: '#FFD700', to: '#FF8C00' },
  Architect: { from: '#6c5ce7', to: '#a29bfe' },
  Creator: { from: '#00b4d8', to: '#0077b6' },
  Builder: { from: '#00e676', to: '#00c853' },
  Apprentice: { from: '#6b7280', to: '#9ca3af' },
};

export function ScorePill({ score, level }: ScorePillProps) {
  const router = useRouter();
  const [displayScore, setDisplayScore] = useState(score);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevScore = useRef(score);
  
  useEffect(() => {
    if (score !== prevScore.current) {
      setIsPulsing(true);
      
      // Animate the score counting up
      const diff = score - prevScore.current;
      const steps = 15;
      const increment = diff / steps;
      let step = 0;
      
      const timer = setInterval(() => {
        step++;
        setDisplayScore(Math.round(prevScore.current + increment * step));
        if (step >= steps) {
          clearInterval(timer);
          setDisplayScore(score);
          prevScore.current = score;
        }
      }, 30);
      
      // Stop pulse after animation
      setTimeout(() => setIsPulsing(false), 1000);
      
      return () => clearInterval(timer);
    }
  }, [score]);
  
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.Apprentice;
  
  return (
    <motion.button
      onClick={() => router.push('/profile')}
      className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all"
      style={{
        background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}20)`,
        border: `1px solid ${colors.from}40`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence>
        {isPulsing && (
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full"
            style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
          />
        )}
      </AnimatePresence>
      
      <Zap size={14} style={{ color: colors.from }} fill={colors.from} />
      <span style={{ color: colors.from }}>{displayScore.toLocaleString()}</span>
    </motion.button>
  );
}
