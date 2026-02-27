'use client';

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
  
  const baseClasses = `rounded-2xl bg-gradient-to-br from-[#6c5ce7] to-[#00e676] flex items-center justify-center text-white font-bold flex-shrink-0 ${SIZE_CLASSES[size]} ${className}`;
  
  if (avatarEmoji) {
    // Show emoji if available
    const emojiSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : size === 'lg' ? 'text-2xl md:text-4xl' : 'text-3xl';
    return (
      <div className={`${baseClasses.replace('text-white font-bold', emojiSize)} bg-gradient-to-br from-gray-700 to-gray-800`}>
        {avatarEmoji}
      </div>
    );
  }
  
  // Fall back to initial letter with gradient background
  return (
    <div className={baseClasses}>
      {initial}
    </div>
  );
}