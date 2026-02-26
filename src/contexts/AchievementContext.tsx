'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AchievementUnlock } from '@/components/AchievementUnlock';
import { AchievementToast } from '@/components/AchievementToast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

interface AchievementContextType {
  showFullScreenUnlock: (achievements: Achievement[]) => void;
  showToastNotification: (achievements: Achievement[]) => void;
  isUnlockActive: boolean;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}

interface AchievementProviderProps {
  children: React.ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const [unlockQueue, setUnlockQueue] = useState<Achievement[]>([]);
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [isUnlockActive, setIsUnlockActive] = useState(false);

  const showFullScreenUnlock = useCallback((achievements: Achievement[]) => {
    setUnlockQueue(prev => [...prev, ...achievements]);
    if (!isUnlockActive) {
      setIsUnlockActive(true);
    }
  }, [isUnlockActive]);

  const showToastNotification = useCallback((achievements: Achievement[]) => {
    setToastQueue(prev => [...prev, ...achievements]);
  }, []);

  const handleUnlockComplete = useCallback(() => {
    setIsUnlockActive(false);
    setUnlockQueue([]);
  }, []);

  const handleToastComplete = useCallback(() => {
    setToastQueue([]);
  }, []);

  const handleToastExpand = useCallback((achievement: Achievement) => {
    // When toast is clicked, show full screen unlock for that achievement
    showFullScreenUnlock([achievement]);
  }, [showFullScreenUnlock]);

  return (
    <AchievementContext.Provider 
      value={{ 
        showFullScreenUnlock, 
        showToastNotification, 
        isUnlockActive 
      }}
    >
      {children}
      
      {/* Full-screen achievement unlock overlay */}
      {unlockQueue.length > 0 && isUnlockActive && (
        <AchievementUnlock
          achievements={unlockQueue}
          onComplete={handleUnlockComplete}
        />
      )}
      
      {/* Toast notifications for background unlocks */}
      {toastQueue.length > 0 && !isUnlockActive && (
        <AchievementToast
          achievements={toastQueue}
          onExpand={handleToastExpand}
          onComplete={handleToastComplete}
        />
      )}
    </AchievementContext.Provider>
  );
}