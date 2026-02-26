import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height,
  rounded = 'md'
}: SkeletonProps) {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  const baseClasses = `
    bg-gradient-to-r from-white/5 via-white/10 to-white/5 
    animate-pulse 
    ${roundedClasses[rounded]}
  `;

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'circular') {
    return (
      <div 
        className={`${baseClasses} ${roundedClasses.full} ${className}`}
        style={{ aspectRatio: '1', ...style }}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div 
        className={`${baseClasses} h-4 ${className}`}
        style={style}
      />
    );
  }

  return (
    <div 
      className={`${baseClasses} ${className}`}
      style={style}
    />
  );
}

// Specialized skeleton components for common use cases
export function SkeletonCard({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function SkeletonLeaderboardRow() {
  return (
    <div className="p-4 sm:p-6 border-b border-white/10">
      <div className="flex items-center space-x-4">
        {/* Rank */}
        <Skeleton variant="text" width={24} height={24} />
        
        {/* Avatar */}
        <Skeleton variant="circular" width={40} height={40} />
        
        {/* Name and details */}
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <div className="hidden md:block">
            <Skeleton variant="text" width="40%" height={12} />
          </div>
        </div>
        
        {/* Score */}
        <div className="text-right">
          <Skeleton variant="text" width={80} className="mb-2" />
          <Skeleton variant="text" width={60} height={20} rounded="full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <SkeletonCard>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="50%" height={16} />
        <Skeleton variant="text" width={24} height={24} />
      </div>
      <Skeleton variant="text" width="40%" height={32} />
    </SkeletonCard>
  );
}

export function SkeletonProfileSection() {
  return (
    <SkeletonCard>
      <Skeleton variant="text" width="30%" height={24} className="mb-4" />
      <div className="space-y-3">
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="80%" height={16} />
        <Skeleton variant="text" width="60%" height={16} />
      </div>
    </SkeletonCard>
  );
}