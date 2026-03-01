import { LeaderboardEntry, Challenge, Achievement } from './types';

const agentNames = [
  'AutoBot Prime', 'TaskMaster 3000', 'FlowGenius', 'WorkStream AI', 'DealCloser',
  'EmailWizard', 'DataCruncher', 'LeadHunter', 'CodeCompanion', 'ScheduleBot',
  'RevenueEngine', 'ProcessNinja', 'OutreachPro', 'ContentMachine', 'AnalyticsGuru',
  'PipelineBot', 'SalesForce AI', 'AutoReply Pro', 'DataMiner X', 'ClientWhisperer',
  'TaskForce One', 'WorkflowHero', 'DealMaker AI', 'InboxZero', 'GrowthHacker'
];

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
  'Riley', 'Avery', 'Quinn', 'Reese', 'Finley',
  'Skyler', 'Dakota', 'Jamie', 'Drew', 'Sage',
  'Blake', 'Charlie', 'Emery', 'Hayden', 'Kendall',
  'Lane', 'Parker', 'River', 'Shawn', 'Cameron'
];

const lastNames = [
  'Chen', 'Patel', 'Garcia', 'Kim', 'Williams',
  'Brown', 'Martinez', 'Lee', 'Johnson', 'Davis',
  'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Jackson',
  'White', 'Harris', 'Martin', 'Thompson', 'Moore',
  'Young', 'Allen', 'King', 'Wright', 'Scott'
];

function getLevel(score: number): 'Apprentice' | 'Builder' | 'Creator' | 'Architect' | 'Legend' {
  if (score >= 800) return 'Legend';
  if (score >= 600) return 'Architect';
  if (score >= 400) return 'Creator';
  if (score >= 200) return 'Builder';
  return 'Apprentice';
}

function generateScore(): number {
  // Generate scores with a realistic distribution
  // More people at lower scores, fewer at top
  const random = Math.random();
  if (random < 0.1) return Math.floor(Math.random() * 200) + 800; // 10% Legends
  if (random < 0.25) return Math.floor(Math.random() * 200) + 600; // 15% Architects
  if (random < 0.5) return Math.floor(Math.random() * 200) + 400; // 25% Creators
  if (random < 0.8) return Math.floor(Math.random() * 200) + 200; // 30% Builders
  return Math.floor(Math.random() * 200); // 20% Apprentices
}

export function generateMockLeaderboard(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < 25; i++) {
    const score = generateScore();
    const tasksCompleted = Math.floor(score * (0.3 + Math.random() * 0.2));
    const hoursSaved = Math.floor(score * (0.05 + Math.random() * 0.03));
    const revenueGenerated = Math.floor(score * (8 + Math.random() * 4));

    entries.push({
      id: `user-${i}`,
      name: `${firstNames[i]} ${lastNames[i]}`,
      agentName: agentNames[i],
      score,
      tasksCompleted,
      hoursSaved,
      revenueGenerated,
      level: getLevel(score),
      trend: ['up', 'down', 'same'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'same'
    });
  }

  // Sort by score descending
  return entries.sort((a, b) => b.score - a.score);
}

export const mockChallenge: Challenge = {
  id: 'challenge-mar-2026',
  title: 'Revenue Rush Challenge',
  description: 'Generate the most revenue with your AI agent this month. Log your wins and climb to the top!',
  prize: '$500 + Lifetime Pro Access',
  endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  topParticipants: [
    { name: 'Alex Chen', agentName: 'DealCloser', score: 4250 },
    { name: 'Jordan Patel', agentName: 'RevenueEngine', score: 3890 },
    { name: 'Taylor Garcia', agentName: 'SalesForce AI', score: 3720 }
  ]
};

export const defaultAchievements: Achievement[] = [
  {
    id: 'first-log',
    name: 'First Log',
    description: 'Log your first activity',
    icon: '🎯',
    unlockedAt: null
  },
  {
    id: 'streak-3',
    name: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    unlockedAt: null
  },
  {
    id: 'streak-7',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: '⚡',
    unlockedAt: null
  },
  {
    id: 'revenue-100',
    name: 'Money Maker',
    description: 'Generate $100 in revenue',
    icon: '💵',
    unlockedAt: null
  },
  {
    id: 'revenue-1000',
    name: 'Revenue Machine',
    description: 'Generate $1,000 in revenue',
    icon: '💰',
    unlockedAt: null
  },
  {
    id: 'tasks-10',
    name: 'Task Beginner',
    description: 'Complete 10 tasks',
    icon: '✅',
    unlockedAt: null
  },
  {
    id: 'tasks-100',
    name: 'Task Crusher',
    description: 'Complete 100 tasks',
    icon: '🏆',
    unlockedAt: null
  },
  {
    id: 'hours-10',
    name: 'Time Saver',
    description: 'Save 10 hours',
    icon: '⏱️',
    unlockedAt: null
  },
  {
    id: 'hours-50',
    name: 'Productivity Pro',
    description: 'Save 50 hours',
    icon: '🚀',
    unlockedAt: null
  },
  {
    id: 'level-builder',
    name: 'Rising Builder',
    description: 'Reach Builder level (200+ score)',
    icon: '🔨',
    unlockedAt: null
  },
  {
    id: 'level-creator',
    name: 'Creative Mind',
    description: 'Reach Creator level (400+ score)',
    icon: '🎨',
    unlockedAt: null
  },
  {
    id: 'level-architect',
    name: 'Master Architect',
    description: 'Reach Architect level (600+ score)',
    icon: '🏛️',
    unlockedAt: null
  },
  {
    id: 'level-legend',
    name: 'Legendary Status',
    description: 'Reach Legend level (800+ score)',
    icon: '👑',
    unlockedAt: null
  },
  {
    id: 'challenge-entry',
    name: 'Community Star',
    description: 'Enter your first challenge',
    icon: '⭐',
    unlockedAt: null
  }
];

// Pre-generated consistent leaderboard data for persistence
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'u1', name: 'Alex Chen', agentName: 'DealCloser', score: 945, tasksCompleted: 312, hoursSaved: 48, revenueGenerated: 8420, level: 'Legend', trend: 'up' },
  { id: 'u2', name: 'Jordan Patel', agentName: 'RevenueEngine', score: 892, tasksCompleted: 285, hoursSaved: 42, revenueGenerated: 7890, level: 'Legend', trend: 'up' },
  { id: 'u3', name: 'Taylor Garcia', agentName: 'SalesForce AI', score: 856, tasksCompleted: 268, hoursSaved: 39, revenueGenerated: 7230, level: 'Legend', trend: 'same' },
  { id: 'u4', name: 'Morgan Kim', agentName: 'TaskMaster 3000', score: 812, tasksCompleted: 254, hoursSaved: 36, revenueGenerated: 6890, level: 'Legend', trend: 'down' },
  { id: 'u5', name: 'Casey Williams', agentName: 'FlowGenius', score: 789, tasksCompleted: 241, hoursSaved: 34, revenueGenerated: 6540, level: 'Architect', trend: 'up' },
  { id: 'u6', name: 'Riley Brown', agentName: 'WorkStream AI', score: 756, tasksCompleted: 228, hoursSaved: 32, revenueGenerated: 6120, level: 'Architect', trend: 'same' },
  { id: 'u7', name: 'Avery Martinez', agentName: 'AutoBot Prime', score: 723, tasksCompleted: 215, hoursSaved: 30, revenueGenerated: 5780, level: 'Architect', trend: 'up' },
  { id: 'u8', name: 'Quinn Lee', agentName: 'EmailWizard', score: 698, tasksCompleted: 204, hoursSaved: 28, revenueGenerated: 5430, level: 'Architect', trend: 'down' },
  { id: 'u9', name: 'Reese Johnson', agentName: 'DataCruncher', score: 672, tasksCompleted: 195, hoursSaved: 27, revenueGenerated: 5120, level: 'Architect', trend: 'same' },
  { id: 'u10', name: 'Finley Davis', agentName: 'LeadHunter', score: 645, tasksCompleted: 186, hoursSaved: 25, revenueGenerated: 4850, level: 'Architect', trend: 'up' },
  { id: 'u11', name: 'Skyler Wilson', agentName: 'CodeCompanion', score: 612, tasksCompleted: 175, hoursSaved: 24, revenueGenerated: 4520, level: 'Architect', trend: 'down' },
  { id: 'u12', name: 'Dakota Anderson', agentName: 'ScheduleBot', score: 578, tasksCompleted: 164, hoursSaved: 22, revenueGenerated: 4180, level: 'Creator', trend: 'same' },
  { id: 'u13', name: 'Jamie Taylor', agentName: 'ProcessNinja', score: 545, tasksCompleted: 154, hoursSaved: 21, revenueGenerated: 3890, level: 'Creator', trend: 'up' },
  { id: 'u14', name: 'Drew Thomas', agentName: 'OutreachPro', score: 512, tasksCompleted: 145, hoursSaved: 19, revenueGenerated: 3560, level: 'Creator', trend: 'down' },
  { id: 'u15', name: 'Sage Jackson', agentName: 'ContentMachine', score: 478, tasksCompleted: 135, hoursSaved: 18, revenueGenerated: 3230, level: 'Creator', trend: 'same' },
  { id: 'u16', name: 'Blake White', agentName: 'AnalyticsGuru', score: 445, tasksCompleted: 126, hoursSaved: 16, revenueGenerated: 2920, level: 'Creator', trend: 'up' },
  { id: 'u17', name: 'Charlie Harris', agentName: 'PipelineBot', score: 412, tasksCompleted: 117, hoursSaved: 15, revenueGenerated: 2650, level: 'Creator', trend: 'down' },
  { id: 'u18', name: 'Emery Martin', agentName: 'AutoReply Pro', score: 378, tasksCompleted: 108, hoursSaved: 14, revenueGenerated: 2380, level: 'Builder', trend: 'same' },
  { id: 'u19', name: 'Hayden Thompson', agentName: 'DataMiner X', score: 345, tasksCompleted: 99, hoursSaved: 12, revenueGenerated: 2120, level: 'Builder', trend: 'up' },
  { id: 'u20', name: 'Kendall Moore', agentName: 'ClientWhisperer', score: 312, tasksCompleted: 90, hoursSaved: 11, revenueGenerated: 1890, level: 'Builder', trend: 'down' },
  { id: 'u21', name: 'Lane Young', agentName: 'TaskForce One', score: 278, tasksCompleted: 82, hoursSaved: 10, revenueGenerated: 1620, level: 'Builder', trend: 'same' },
  { id: 'u22', name: 'Parker Allen', agentName: 'WorkflowHero', score: 245, tasksCompleted: 74, hoursSaved: 9, revenueGenerated: 1380, level: 'Builder', trend: 'up' },
  { id: 'u23', name: 'River King', agentName: 'DealMaker AI', score: 198, tasksCompleted: 62, hoursSaved: 7, revenueGenerated: 1120, level: 'Apprentice', trend: 'down' },
  { id: 'u24', name: 'Shawn Wright', agentName: 'InboxZero', score: 156, tasksCompleted: 52, hoursSaved: 6, revenueGenerated: 890, level: 'Apprentice', trend: 'same' },
  { id: 'u25', name: 'Cameron Scott', agentName: 'GrowthHacker', score: 112, tasksCompleted: 42, hoursSaved: 4, revenueGenerated: 650, level: 'Apprentice', trend: 'up' }
];
