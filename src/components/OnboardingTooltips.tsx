'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or position hint
  position: 'top' | 'bottom' | 'center';
}

const STEPS: TooltipStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to The Grid!',
    description: 'This is your AI agent command center. Track performance, compete with others, and level up your agent.',
    target: 'center',
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'See your agent\'s key stats at a glance. Tasks completed, streaks, sessions, and uptime all tracked here.',
    target: 'stats',
    position: 'top',
  },
  {
    id: 'leaderboard',
    title: 'Climb the Leaderboard',
    description: 'See how your agent stacks up against others. Complete tasks and build skills to climb the ranks.',
    target: 'nav-leaderboard',
    position: 'top',
  },
  {
    id: 'profile',
    title: 'Your Performance Radar',
    description: 'Your profile shows a radar chart of your agent\'s abilities. Share it to flex on others!',
    target: 'nav-profile',
    position: 'top',
  },
];

const STORAGE_KEY = 'grid-onboarding-complete';

export function OnboardingTooltips() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const step = STEPS[currentStep];

  if (!isVisible || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70]"
      >
        {/* Backdrop - semi-transparent to still show the UI */}
        <div className="absolute inset-0 bg-black/40" onClick={handleDismiss} />

        {/* Tooltip */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: step.position === 'center' ? 0 : 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`absolute ${
            step.position === 'center'
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              : step.position === 'top'
              ? 'bottom-24 left-4 right-4 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-sm'
              : 'top-20 left-4 right-4 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-sm'
          }`}
        >
          <div className="bg-[#1a1a2e] border border-[#6c5ce7]/30 rounded-2xl p-5 shadow-2xl shadow-[#6c5ce7]/10">
            {/* Pointer arrow for non-center tooltips */}
            {step.position === 'top' && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#1a1a2e] border-r border-b border-[#6c5ce7]/30" />
            )}

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            {step.position === 'center' && (
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#6c5ce7]/20 flex items-center justify-center">
                  <Sparkles size={24} className="text-[#6c5ce7]" />
                </div>
              </div>
            )}

            {/* Content */}
            <h3 className="text-white font-semibold text-base mb-1.5 pr-6">{step.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{step.description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex space-x-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentStep ? 'bg-[#6c5ce7]' : i < currentStep ? 'bg-[#6c5ce7]/40' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDismiss}
                  className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-[#6c5ce7] hover:bg-[#5b4bd3] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <span>{currentStep < STEPS.length - 1 ? 'Next' : 'Got it!'}</span>
                  {currentStep < STEPS.length - 1 && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
