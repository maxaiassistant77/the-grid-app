'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Play } from 'lucide-react';

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight?: boolean; // Whether to highlight the target element
}

const STEPS: TooltipStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to The Grid!',
    description: 'This is your AI agent command center where you can track performance, compete with others, and level up your agent.',
    target: 'body',
    position: 'center',
    highlight: false,
  },
  {
    id: 'score',
    title: 'This is your agent score',
    description: 'Your total score reflects all tasks completed and achievements unlocked. Watch it grow as your agent gets better!',
    target: '[data-onboarding="score"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'connect',
    title: 'Connect your AI agent here',
    description: 'Head to the Connect page to link your AI agent and start earning points for every task completed.',
    target: '[data-onboarding="connect"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'leaderboard',
    title: 'Compete on the leaderboard',
    description: 'See how your agent stacks up against others. Complete more tasks to climb the ranks and show off your skills!',
    target: '[data-onboarding="leaderboard"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'profile',
    title: 'View your full profile',
    description: 'Your profile shows detailed performance stats, a radar chart of abilities, and achievements. Perfect for sharing!',
    target: '[data-onboarding="profile"]',
    position: 'bottom',
    highlight: true,
  },
];

const STORAGE_KEY = 'grid-onboarding-complete';

export function OnboardingTooltips() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible && currentStep < STEPS.length) {
      const step = STEPS[currentStep];
      const updateTargetPosition = () => {
        const target = document.querySelector(step.target);
        if (target) {
          setTargetRect(target.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      };

      updateTargetPosition();
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition);

      return () => {
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition);
      };
    }
  }, [currentStep, isVisible]);

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

  const replayTour = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  // Export replay function to window for settings/profile access
  useEffect(() => {
    (window as any).replayOnboarding = replayTour;
  }, []);

  const step = STEPS[currentStep];

  if (!isVisible || !step) return null;

  const getTooltipPosition = () => {
    if (step.position === 'center' || !targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const margin = 16;
    let top = 0;
    let left = 0;
    let transform = '';

    switch (step.position) {
      case 'top':
        top = targetRect.top - margin;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - margin;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + margin;
        transform = 'translate(0, -50%)';
        break;
    }

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  const getArrowClasses = () => {
    switch (step.position) {
      case 'top':
        return 'absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#1a1a2e] border-r border-b border-[#6c5ce7]/30';
      case 'bottom':
        return 'absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[#1a1a2e] border-l border-t border-[#6c5ce7]/30';
      case 'left':
        return 'absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-[#1a1a2e] border-r border-t border-[#6c5ce7]/30';
      case 'right':
        return 'absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-[#1a1a2e] border-l border-b border-[#6c5ce7]/30';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] pointer-events-none"
      >
        {/* Backdrop with spotlight effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{
            background: step.highlight && targetRect
              ? `radial-gradient(circle at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 10}px, rgba(0,0,0,0.7) ${Math.max(targetRect.width, targetRect.height) / 2 + 50}px)`
              : 'rgba(0,0,0,0.7)'
          }}
        />

        {/* Highlight ring around target */}
        {step.highlight && targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              border: '2px solid #6c5ce7',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(108, 92, 231, 0.4), inset 0 0 20px rgba(108, 92, 231, 0.1)',
            }}
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 border-2 border-[#00e676] rounded-xl"
            />
          </motion.div>
        )}

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          key={step.id}
          initial={{ opacity: 0, y: step.position === 'center' ? 0 : 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute pointer-events-auto max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
          style={getTooltipPosition()}
        >
          <div className="bg-[#1a1a2e] border border-[#6c5ce7]/30 rounded-2xl p-5 shadow-2xl shadow-[#6c5ce7]/10 backdrop-blur-xl">
            {/* Pointer arrow */}
            {step.position !== 'center' && (
              <div className={getArrowClasses()} />
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="flex justify-center mb-4"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#00e676] flex items-center justify-center">
                  <Sparkles size={28} className="text-white" />
                </div>
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-white font-semibold text-lg mb-2 pr-6">{step.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">{step.description}</p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                {/* Progress dots */}
                <div className="flex space-x-2">
                  {STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentStep 
                          ? 'bg-[#6c5ce7] scale-125 shadow-lg shadow-[#6c5ce7]/50' 
                          : i < currentStep 
                            ? 'bg-[#00e676]' 
                            : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleDismiss}
                    className="text-gray-400 text-sm hover:text-gray-200 transition-colors font-medium"
                  >
                    Skip tour
                  </button>
                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#00e676] hover:from-[#5b4bd3] hover:to-[#00c766] text-white text-sm font-medium rounded-xl transition-all shadow-lg"
                  >
                    <span>{currentStep < STEPS.length - 1 ? 'Next' : 'Got it!'}</span>
                    {currentStep < STEPS.length - 1 && <ArrowRight size={16} />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Replay tour button component (can be used in settings/profile)
export function OnboardingReplayButton() {
  const handleReplay = () => {
    localStorage.removeItem(STORAGE_KEY);
    if ((window as any).replayOnboarding) {
      (window as any).replayOnboarding();
    }
  };

  return (
    <button
      onClick={handleReplay}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
    >
      <Play size={16} />
      <span>Replay Tour</span>
    </button>
  );
}
