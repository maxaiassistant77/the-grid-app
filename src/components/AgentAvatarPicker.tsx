'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Brain, Zap, Flame, Gem, Rocket, Star, Target, 
  Shield, Sword, Crown, Trophy, Cpu, CircuitBoard, 
  Network, Layers, Code2, Terminal, Wand2, Sparkles, 
  Eye, Infinity, Atom, LucideIcon
} from 'lucide-react';

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

const AGENT_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Bot', icon: Bot },
  { name: 'Brain', icon: Brain },
  { name: 'Zap', icon: Zap },
  { name: 'Flame', icon: Flame },
  { name: 'Gem', icon: Gem },
  { name: 'Rocket', icon: Rocket },
  { name: 'Star', icon: Star },
  { name: 'Target', icon: Target },
  { name: 'Shield', icon: Shield },
  { name: 'Sword', icon: Sword },
  { name: 'Crown', icon: Crown },
  { name: 'Trophy', icon: Trophy },
  { name: 'Cpu', icon: Cpu },
  { name: 'CircuitBoard', icon: CircuitBoard },
  { name: 'Network', icon: Network },
  { name: 'Layers', icon: Layers },
  { name: 'Code2', icon: Code2 },
  { name: 'Terminal', icon: Terminal },
  { name: 'Wand2', icon: Wand2 },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Eye', icon: Eye },
  { name: 'Infinity', icon: Infinity },
  { name: 'Atom', icon: Atom },
];

export function AgentAvatarPicker({ currentEmoji, onSelect, agentName }: AgentAvatarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'emojis' | 'icons'>('emojis');

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  const handleIconSelect = (iconName: string) => {
    onSelect(`icon:${iconName}`);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-300">Agent Avatar</label>
      
      {/* Current Avatar Display */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#00e676] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {(() => {
            if (!currentEmoji) {
              return agentName.charAt(0).toUpperCase();
            }
            if (currentEmoji.startsWith('icon:')) {
              const iconName = currentEmoji.replace('icon:', '');
              const iconData = AGENT_ICONS.find(i => i.name === iconName);
              if (iconData) {
                const Icon = iconData.icon;
                return <Icon size={32} />;
              }
              return agentName.charAt(0).toUpperCase();
            }
            return currentEmoji;
          })()}
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

      {/* Avatar Picker */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4"
        >
          <div className="mb-3">
            <h4 className="text-white font-medium mb-1">Choose Your Agent Avatar</h4>
            <p className="text-gray-400 text-xs">Select an emoji or icon that represents your AI agent</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('emojis')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'emojis'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Emojis
            </button>
            <button
              onClick={() => setActiveTab('icons')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'icons'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Icons
            </button>
          </div>
          
          {/* Emoji Grid */}
          {activeTab === 'emojis' && (
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
          )}

          {/* Icon Grid */}
          {activeTab === 'icons' && (
            <div className="grid grid-cols-6 gap-2">
              {AGENT_ICONS.map(({ name, icon: Icon }) => (
                <motion.button
                  key={name}
                  onClick={() => handleIconSelect(name)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:bg-white/20 group ${
                    currentEmoji === `icon:${name}` ? 'bg-[#6c5ce7]/30 ring-2 ring-[#6c5ce7]' : ''
                  }`}
                >
                  <Icon size={20} className="text-white/80 group-hover:text-white" />
                </motion.button>
              ))}
            </div>
          )}
          
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