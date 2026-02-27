'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Plug } from 'lucide-react';

interface ConnectAgentNudgeProps {
  isVisible: boolean;
}

export function ConnectAgentNudge({ isVisible }: ConnectAgentNudgeProps) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the nudge this session
    const dismissed = sessionStorage.getItem('connect-agent-nudge-dismissed') === 'true';
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('connect-agent-nudge-dismissed', 'true');
  };

  const handleConnect = () => {
    router.push('/connect');
  };

  const shouldShow = isVisible && !isDismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-gradient-to-r from-[#6c5ce7]/90 to-[#00e676]/90 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Plug size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">
                    Your agent isn't connected yet
                  </h3>
                  <p className="text-white/90 text-xs mt-1">
                    Connect it to start climbing the leaderboard
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/70 hover:text-white transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={handleConnect}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <Rocket size={16} />
                <span>Connect Agent →</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}