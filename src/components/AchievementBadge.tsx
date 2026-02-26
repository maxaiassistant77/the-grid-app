'use client';

// Custom SVG achievement badges - no emojis, professional grade
// Each badge has a unique design matching its category and tier

interface BadgeProps {
  size?: number;
  className?: string;
}

// Color palettes per category
const CATEGORY_COLORS = {
  activity: { primary: '#00e676', secondary: '#00c853', bg: '#00e676' },
  streak: { primary: '#ff6b35', secondary: '#ff9500', bg: '#ff6b35' },
  score: { primary: '#ffd700', secondary: '#ffaa00', bg: '#ffd700' },
  special: { primary: '#6c5ce7', secondary: '#a29bfe', bg: '#6c5ce7' },
};

// Tier determines the badge frame style
function getBadgeFrame(tier: 'bronze' | 'silver' | 'gold' | 'diamond', size: number) {
  const c = size / 2;
  const r = size / 2 - 2;
  
  const gradients: Record<string, { from: string; to: string; glow: string }> = {
    bronze: { from: '#CD7F32', to: '#8B5E3C', glow: 'rgba(205,127,50,0.3)' },
    silver: { from: '#C0C0C0', to: '#808080', glow: 'rgba(192,192,192,0.3)' },
    gold: { from: '#FFD700', to: '#FF8C00', glow: 'rgba(255,215,0,0.4)' },
    diamond: { from: '#B9F2FF', to: '#6c5ce7', glow: 'rgba(108,92,231,0.4)' },
  };
  
  const g = gradients[tier];
  
  return { c, r, gradient: g };
}

function getTierFromPoints(points: number): 'bronze' | 'silver' | 'gold' | 'diamond' {
  if (points >= 200) return 'diamond';
  if (points >= 100) return 'gold';
  if (points >= 50) return 'silver';
  return 'bronze';
}

// Individual badge icon designs
const BADGE_ICONS: Record<string, (cx: number, cy: number, s: number) => React.ReactNode> = {
  // Activity badges
  'first-task': (cx, cy, s) => (
    // Target/bullseye
    <g>
      <circle cx={cx} cy={cy} r={s*0.35} fill="none" stroke="#00e676" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={s*0.2} fill="none" stroke="#00e676" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={s*0.06} fill="#00e676" />
    </g>
  ),
  'tasks-10': (cx, cy, s) => (
    // Checkmark in circle
    <g>
      <circle cx={cx} cy={cy} r={s*0.3} fill="none" stroke="#00e676" strokeWidth="2" />
      <path d={`M${cx-s*0.15} ${cy} L${cx-s*0.05} ${cy+s*0.12} L${cx+s*0.18} ${cy-s*0.12}`} fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'tasks-50': (cx, cy, s) => (
    // Crossed swords
    <g>
      <line x1={cx-s*0.25} y1={cy-s*0.25} x2={cx+s*0.25} y2={cy+s*0.25} stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={cx+s*0.25} y1={cy-s*0.25} x2={cx-s*0.25} y2={cy+s*0.25} stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={s*0.08} fill="#00e676" />
    </g>
  ),
  'tasks-100': (cx, cy, s) => (
    // Trophy
    <g>
      <path d={`M${cx-s*0.15} ${cy-s*0.2} L${cx-s*0.15} ${cy+s*0.05} Q${cx} ${cy+s*0.2} ${cx+s*0.15} ${cy+s*0.05} L${cx+s*0.15} ${cy-s*0.2} Z`} fill="none" stroke="#ffd700" strokeWidth="2" />
      <line x1={cx} y1={cy+s*0.1} x2={cx} y2={cy+s*0.25} stroke="#ffd700" strokeWidth="2" />
      <line x1={cx-s*0.1} y1={cy+s*0.25} x2={cx+s*0.1} y2={cy+s*0.25} stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
      <path d={`M${cx-s*0.15} ${cy-s*0.12} Q${cx-s*0.3} ${cy-s*0.12} ${cx-s*0.3} ${cy+s*0.02}`} fill="none" stroke="#ffd700" strokeWidth="1.5" />
      <path d={`M${cx+s*0.15} ${cy-s*0.12} Q${cx+s*0.3} ${cy-s*0.12} ${cx+s*0.3} ${cy+s*0.02}`} fill="none" stroke="#ffd700" strokeWidth="1.5" />
    </g>
  ),
  'tasks-500': (cx, cy, s) => (
    // Robot/Machine head
    <g>
      <rect x={cx-s*0.2} y={cy-s*0.2} width={s*0.4} height={s*0.35} rx={s*0.05} fill="none" stroke="#6c5ce7" strokeWidth="2" />
      <circle cx={cx-s*0.08} cy={cy-s*0.05} r={s*0.04} fill="#00e676" />
      <circle cx={cx+s*0.08} cy={cy-s*0.05} r={s*0.04} fill="#00e676" />
      <line x1={cx-s*0.08} y1={cy+s*0.08} x2={cx+s*0.08} y2={cy+s*0.08} stroke="#6c5ce7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx} y1={cy-s*0.2} x2={cx} y2={cy-s*0.3} stroke="#6c5ce7" strokeWidth="1.5" />
      <circle cx={cx} cy={cy-s*0.32} r={s*0.03} fill="#6c5ce7" />
    </g>
  ),
  
  // Streak badges  
  'streak-3': (cx, cy, s) => (
    // Small flame
    <g>
      <path d={`M${cx} ${cy-s*0.3} Q${cx+s*0.2} ${cy-s*0.05} ${cx+s*0.12} ${cy+s*0.15} Q${cx+s*0.05} ${cy+s*0.25} ${cx} ${cy+s*0.2} Q${cx-s*0.05} ${cy+s*0.25} ${cx-s*0.12} ${cy+s*0.15} Q${cx-s*0.2} ${cy-s*0.05} ${cx} ${cy-s*0.3}`} fill="none" stroke="#ff6b35" strokeWidth="2" strokeLinejoin="round" />
    </g>
  ),
  'streak-7': (cx, cy, s) => (
    // Lightning bolt
    <g>
      <path d={`M${cx+s*0.05} ${cy-s*0.3} L${cx-s*0.1} ${cy} L${cx+s*0.05} ${cy} L${cx-s*0.05} ${cy+s*0.3}`} fill="none" stroke="#ff9500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  'streak-30': (cx, cy, s) => (
    // Sparkle/star burst
    <g>
      {[0, 45, 90, 135].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line key={angle} x1={cx + Math.cos(rad) * s * 0.1} y1={cy + Math.sin(rad) * s * 0.1} x2={cx + Math.cos(rad) * s * 0.28} y2={cy + Math.sin(rad) * s * 0.28} stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
        );
      })}
      <circle cx={cx} cy={cy} r={s*0.06} fill="#ffd700" />
    </g>
  ),
  'streak-100': (cx, cy, s) => (
    // Radiating star
    <g>
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const inner = s * 0.1;
        const outer = s * 0.3;
        return (
          <line key={angle} x1={cx + Math.cos(rad) * inner} y1={cy + Math.sin(rad) * inner} x2={cx + Math.cos(rad) * outer} y2={cy + Math.sin(rad) * outer} stroke="#B9F2FF" strokeWidth="2" strokeLinecap="round" />
        );
      })}
      <circle cx={cx} cy={cy} r={s*0.08} fill="#B9F2FF" />
    </g>
  ),

  // Score badges
  'score-100': (cx, cy, s) => (
    // Rising arrow / star
    <g>
      <path d={`M${cx} ${cy-s*0.25} L${cx+s*0.08} ${cy-s*0.1} L${cx+s*0.03} ${cy-s*0.1} L${cx+s*0.03} ${cy+s*0.2} L${cx-s*0.03} ${cy+s*0.2} L${cx-s*0.03} ${cy-s*0.1} L${cx-s*0.08} ${cy-s*0.1} Z`} fill="none" stroke="#ffd700" strokeWidth="1.5" />
      <circle cx={cx} cy={cy-s*0.32} r={s*0.04} fill="#ffd700" />
    </g>
  ),
  'score-500': (cx, cy, s) => (
    // Flexing arm / power
    <g>
      <path d={`M${cx-s*0.15} ${cy+s*0.2} L${cx-s*0.15} ${cy} Q${cx-s*0.15} ${cy-s*0.2} ${cx} ${cy-s*0.25} Q${cx+s*0.2} ${cy-s*0.3} ${cx+s*0.2} ${cy-s*0.1} L${cx+s*0.2} ${cy+s*0.05}`} fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
      <line x1={cx+s*0.12} y1={cy-s*0.35} x2={cx+s*0.15} y2={cy-s*0.42} stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx+s*0.22} y1={cy-s*0.3} x2={cx+s*0.3} y2={cy-s*0.33} stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  'score-1000': (cx, cy, s) => (
    // Medal
    <g>
      <circle cx={cx} cy={cy+s*0.05} r={s*0.2} fill="none" stroke="#ffd700" strokeWidth="2" />
      <path d={`M${cx-s*0.08} ${cy-s*0.15} L${cx-s*0.15} ${cy-s*0.35} L${cx} ${cy-s*0.25} L${cx+s*0.15} ${cy-s*0.35} L${cx+s*0.08} ${cy-s*0.15}`} fill="none" stroke="#ffd700" strokeWidth="1.5" />
      <text x={cx} y={cy+s*0.1} textAnchor="middle" dominantBaseline="middle" fill="#ffd700" fontSize={s*0.15} fontWeight="bold">1K</text>
    </g>
  ),
  'score-5000': (cx, cy, s) => (
    // Crown
    <g>
      <path d={`M${cx-s*0.25} ${cy+s*0.15} L${cx-s*0.25} ${cy-s*0.05} L${cx-s*0.12} ${cy+s*0.05} L${cx} ${cy-s*0.2} L${cx+s*0.12} ${cy+s*0.05} L${cx+s*0.25} ${cy-s*0.05} L${cx+s*0.25} ${cy+s*0.15} Z`} fill="none" stroke="#ffd700" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={cx-s*0.25} cy={cy-s*0.08} r={s*0.03} fill="#ffd700" />
      <circle cx={cx} cy={cy-s*0.23} r={s*0.03} fill="#ffd700" />
      <circle cx={cx+s*0.25} cy={cy-s*0.08} r={s*0.03} fill="#ffd700" />
    </g>
  ),

  // Special badges
  'skills-5': (cx, cy, s) => (
    // Open book
    <g>
      <path d={`M${cx} ${cy-s*0.15} L${cx} ${cy+s*0.2}`} stroke="#6c5ce7" strokeWidth="1.5" />
      <path d={`M${cx} ${cy-s*0.15} Q${cx-s*0.15} ${cy-s*0.2} ${cx-s*0.25} ${cy-s*0.15} L${cx-s*0.25} ${cy+s*0.15} Q${cx-s*0.15} ${cy+s*0.12} ${cx} ${cy+s*0.2}`} fill="none" stroke="#6c5ce7" strokeWidth="2" />
      <path d={`M${cx} ${cy-s*0.15} Q${cx+s*0.15} ${cy-s*0.2} ${cx+s*0.25} ${cy-s*0.15} L${cx+s*0.25} ${cy+s*0.15} Q${cx+s*0.15} ${cy+s*0.12} ${cx} ${cy+s*0.2}`} fill="none" stroke="#6c5ce7" strokeWidth="2" />
    </g>
  ),
  'complex-first': (cx, cy, s) => (
    // Puzzle piece
    <g>
      <rect x={cx-s*0.18} y={cy-s*0.18} width={s*0.36} height={s*0.36} rx={s*0.04} fill="none" stroke="#6c5ce7" strokeWidth="2" />
      <circle cx={cx+s*0.18} cy={cy} r={s*0.08} fill="none" stroke="#6c5ce7" strokeWidth="1.5" />
      <circle cx={cx} cy={cy-s*0.18} r={s*0.08} fill="none" stroke="#6c5ce7" strokeWidth="1.5" />
    </g>
  ),
  'epic-first': (cx, cy, s) => (
    // Rocket
    <g>
      <path d={`M${cx} ${cy-s*0.3} Q${cx+s*0.15} ${cy-s*0.15} ${cx+s*0.1} ${cy+s*0.1} L${cx-s*0.1} ${cy+s*0.1} Q${cx-s*0.15} ${cy-s*0.15} ${cx} ${cy-s*0.3}`} fill="none" stroke="#ff6b35" strokeWidth="2" />
      <line x1={cx-s*0.1} y1={cy+s*0.1} x2={cx-s*0.18} y2={cy+s*0.22} stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx+s*0.1} y1={cy+s*0.1} x2={cx+s*0.18} y2={cy+s*0.22} stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx} y1={cy+s*0.1} x2={cx} y2={cy+s*0.25} stroke="#ff6b35" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy-s*0.1} r={s*0.04} fill="#ff6b35" />
    </g>
  ),
  'integrations-3': (cx, cy, s) => (
    // Plug/Connection
    <g>
      <circle cx={cx} cy={cy} r={s*0.15} fill="none" stroke="#00e676" strokeWidth="2" />
      {[0, 120, 240].map((angle) => {
        const rad = (angle - 90) * Math.PI / 180;
        return (
          <g key={angle}>
            <line x1={cx + Math.cos(rad) * s * 0.15} y1={cy + Math.sin(rad) * s * 0.15} x2={cx + Math.cos(rad) * s * 0.28} y2={cy + Math.sin(rad) * s * 0.28} stroke="#00e676" strokeWidth="2" strokeLinecap="round" />
            <circle cx={cx + Math.cos(rad) * s * 0.3} cy={cy + Math.sin(rad) * s * 0.3} r={s*0.03} fill="#00e676" />
          </g>
        );
      })}
    </g>
  ),
};

// Fallback badge for unknown achievement IDs
const fallbackIcon = (cx: number, cy: number, s: number) => (
  <g>
    <circle cx={cx} cy={cy} r={s*0.2} fill="none" stroke="#9ca3af" strokeWidth="2" />
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#9ca3af" fontSize={s*0.2} fontWeight="bold">?</text>
  </g>
);

export function AchievementBadge({ 
  achievementId, 
  points = 25, 
  size = 64,
  locked = false,
  className = '' 
}: { 
  achievementId: string; 
  points?: number; 
  size?: number; 
  locked?: boolean;
  className?: string;
}) {
  const tier = getTierFromPoints(points);
  const { c, r, gradient } = getBadgeFrame(tier, size);
  const iconFn = BADGE_ICONS[achievementId] || fallbackIcon;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} style={locked ? { opacity: 0.3, filter: 'grayscale(1)' } : {}}>
      <defs>
        <linearGradient id={`frame-${achievementId}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradient.from} />
          <stop offset="100%" stopColor={gradient.to} />
        </linearGradient>
        <filter id={`glow-${achievementId}-${size}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer glow ring */}
      {!locked && (
        <circle cx={c} cy={c} r={r} fill="none" stroke={gradient.glow} strokeWidth="3" opacity="0.4" />
      )}
      
      {/* Badge frame */}
      <circle cx={c} cy={c} r={r - 3} fill="rgba(0,0,0,0.4)" stroke={`url(#frame-${achievementId}-${size})`} strokeWidth="2" />
      
      {/* Inner circle */}
      <circle cx={c} cy={c} r={r - 8} fill="none" stroke={gradient.from} strokeWidth="0.5" opacity="0.3" />
      
      {/* Icon */}
      <g filter={locked ? undefined : `url(#glow-${achievementId}-${size})`}>
        {iconFn(c, c, size)}
      </g>
    </svg>
  );
}

export { getTierFromPoints, BADGE_ICONS };
