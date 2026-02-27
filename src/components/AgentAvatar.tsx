'use client';

import { 
  Bot, Brain, Zap, Flame, Gem, Rocket, Star, Target, 
  Shield, Sword, Crown, Trophy, Cpu, CircuitBoard, 
  Network, Layers, Code2, Terminal, Wand2, Sparkles, 
  Eye, Infinity, Atom, LucideIcon
} from 'lucide-react';

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

interface AgentAvatarProps {
  agentName?: string;
  userName?: string;
  avatarEmoji?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl md:w-20 md:h-20 md:text-3xl',
  xl: 'w-16 h-16 text-2xl'
};

const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 32,
  xl: 36
};

export function AgentAvatar({ 
  agentName, 
  userName, 
  avatarEmoji, 
  size = 'md', 
  className = '' 
}: AgentAvatarProps) {
  // Use agent name first, then fall back to user name
  const displayName = agentName || userName || 'A';
  const initial = displayName.charAt(0).toUpperCase();
  
  const baseClasses = `rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 ${SIZE_CLASSES[size]} ${className}`;
  
  if (avatarEmoji) {
    // Check if it's an icon format
    if (avatarEmoji.startsWith('icon:')) {
      const iconName = avatarEmoji.replace('icon:', '');
      const iconData = AGENT_ICONS.find(i => i.name === iconName);
      
      if (iconData) {
        const Icon = iconData.icon;
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-[#6c5ce7] to-[#00e676]`}>
            <Icon size={ICON_SIZES[size]} />
          </div>
        );
      }
    } else {
      // Show emoji if available
      const emojiSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-2xl md:text-4xl' : 'text-3xl';
      return (
        <div className={`${baseClasses.replace('font-bold', emojiSize)} bg-gradient-to-br from-gray-700 to-gray-800`}>
          {avatarEmoji}
        </div>
      );
    }
  }
  
  // Fall back to initial letter with gradient background
  return (
    <div className={`${baseClasses} bg-gradient-to-br from-[#6c5ce7] to-[#00e676]`}>
      {initial}
    </div>
  );
}