'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AgentAvatarPickerProps {
  currentEmoji?: string;
  onSelect: (emoji: string) => void;
  agentName: string;
}

const AGENT_EMOJIS = [
  '🤖', '🧠', '⚡', '🔥', '💎', '🚀', '👾', '🎯', 
  '🛸', '💫', '🌊', '🏆', '⭐', '🦾', '🔮', '🎮', 
  '💡', '🧬', '🌐', '🦁', '🐉', '👁️', '⚔️', '🛡️', 
  '🎲', '🌌', '💥', '🏅', '🧿', '🤯'
];

export function AgentAvatarPicker({ currentEmoji, onSelect, agentName }: AgentAvatarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-300">Agent Avatar</label>
      
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#00e676] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {currentEmoji || agentName.charAt(0).toUpperCase()}
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          {currentEmoji ? 'Change Avatar' : 'Select Emoji Avatar'}
        </button>
        
        {currentEmoji && (
          <button
            onClick={() => handleEmojiSelect('')}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            Reset to Initial
          </button>
        )}
      </div>

      {/* Emoji Picker */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4"
        >
          <div className="mb-3">
            <h4 className="text-white font-medium mb-1">Choose Your Agent Avatar</h4>
            <p className="text-gray-400 text-xs">Select an emoji that represents your AI agent</p>
          </div>
          
          <div className="grid grid-cols-8 gap-2">
            {AGENT_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all hover:bg-white/20 ${
                  currentEmoji === emoji ? 'bg-[#6c5ce7]/30 ring-2 ring-[#6c5ce7]' : ''
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}