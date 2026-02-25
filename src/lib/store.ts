import { User, UserStats, ActivityLog, Achievement, LeaderboardEntry, LeaderboardTab } from './types';
import { MOCK_LEADERBOARD, defaultAchievements } from './mock-data';

const STORAGE_KEYS = {
  USER: 'the-grid-user',
  STATS: 'the-grid-stats',
  ACTIVITIES: 'the-grid-activities',
  ACHIEVEMENTS: 'the-grid-achievements'
};

// Helper to check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Generate a simple UUID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get level based on score
export function getLevel(score: number): 'Apprentice' | 'Builder' | 'Creator' | 'Architect' | 'Legend' {
  if (score >= 800) return 'Legend';
  if (score >= 600) return 'Architect';
  if (score >= 400) return 'Creator';
  if (score >= 200) return 'Builder';
  return 'Apprentice';
}

// Get level color
export function getLevelColor(level: string): string {
  switch (level) {
    case 'Legend': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    case 'Architect': return 'bg-gradient-to-r from-purple-500 to-indigo-600';
    case 'Creator': return 'bg-gradient-to-r from-cyan-400 to-blue-500';
    case 'Builder': return 'bg-gradient-to-r from-green-400 to-emerald-500';
    default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
  }
}

// Calculate score from stats
export function calculateScore(stats: UserStats, achievements: Achievement[]): number {
  const taskPoints = stats.tasksCompleted * 1;
  const hoursPoints = stats.hoursSaved * 5;
  const revenuePoints = Math.floor(stats.revenueGenerated / 10);
  const streakBonus = stats.currentStreak * 2;
  const achievementBonus = achievements.filter(a => a.unlockedAt !== null).length * 25;

  return taskPoints + hoursPoints + revenuePoints + streakBonus + achievementBonus;
}

// User functions
export function getCurrentUser(): User | null {
  if (!isBrowser) return null;
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
}

export function createUser(name: string, email: string, agentName: string): User {
  const user: User = {
    id: generateId(),
    name,
    email,
    agentName,
    createdAt: new Date().toISOString()
  };

  if (isBrowser) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Initialize stats
    const initialStats: UserStats = {
      tasksCompleted: 0,
      hoursSaved: 0,
      revenueGenerated: 0,
      currentStreak: 0,
      lastLogDate: null
    };
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initialStats));
    // Initialize activities
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    // Initialize achievements
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(defaultAchievements));
  }

  return user;
}

export function updateUser(updates: Partial<User>): User | null {
  const user = getCurrentUser();
  if (!user) return null;

  const updatedUser = { ...user, ...updates };
  if (isBrowser) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  }
  return updatedUser;
}

export function logOut(): void {
  if (isBrowser) {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
  }
}

// Stats functions
export function getStats(): UserStats {
  if (!isBrowser) {
    return {
      tasksCompleted: 0,
      hoursSaved: 0,
      revenueGenerated: 0,
      currentStreak: 0,
      lastLogDate: null
    };
  }

  const stored = localStorage.getItem(STORAGE_KEYS.STATS);
  return stored ? JSON.parse(stored) : {
    tasksCompleted: 0,
    hoursSaved: 0,
    revenueGenerated: 0,
    currentStreak: 0,
    lastLogDate: null
  };
}

function updateStreak(stats: UserStats): UserStats {
  const today = new Date().toISOString().split('T')[0];
  const lastLog = stats.lastLogDate;

  if (!lastLog) {
    return { ...stats, currentStreak: 1, lastLogDate: today };
  }

  const lastDate = new Date(lastLog);
  const todayDate = new Date(today);
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, no change
    return stats;
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    return { ...stats, currentStreak: stats.currentStreak + 1, lastLogDate: today };
  } else {
    // Streak broken, reset to 1
    return { ...stats, currentStreak: 1, lastLogDate: today };
  }
}

export function updateStats(type: 'tasks' | 'hours' | 'revenue', value: number): UserStats {
  const stats = getStats();

  let updatedStats: UserStats;
  switch (type) {
    case 'tasks':
      updatedStats = { ...stats, tasksCompleted: stats.tasksCompleted + value };
      break;
    case 'hours':
      updatedStats = { ...stats, hoursSaved: stats.hoursSaved + value };
      break;
    case 'revenue':
      updatedStats = { ...stats, revenueGenerated: stats.revenueGenerated + value };
      break;
    default:
      updatedStats = stats;
  }

  // Update streak
  updatedStats = updateStreak(updatedStats);

  if (isBrowser) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
  }

  return updatedStats;
}

// Activity functions
export function getActivities(): ActivityLog[] {
  if (!isBrowser) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  return stored ? JSON.parse(stored) : [];
}

export function logActivity(type: 'tasks' | 'hours' | 'revenue' | 'challenge', value: number, note: string): ActivityLog {
  const user = getCurrentUser();
  const activity: ActivityLog = {
    id: generateId(),
    userId: user?.id || 'unknown',
    type,
    value,
    note,
    timestamp: new Date().toISOString()
  };

  const activities = getActivities();
  activities.unshift(activity); // Add to beginning

  // Keep only last 100 activities
  const trimmed = activities.slice(0, 100);

  if (isBrowser) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(trimmed));
  }

  return activity;
}

// Achievement functions
export function getAchievements(): Achievement[] {
  if (!isBrowser) return defaultAchievements;
  const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  return stored ? JSON.parse(stored) : defaultAchievements;
}

export function checkAndUnlockAchievements(stats: UserStats, score: number): Achievement[] {
  const achievements = getAchievements();
  const activities = getActivities();
  const newlyUnlocked: Achievement[] = [];

  const checkAndUnlock = (id: string, condition: boolean) => {
    const achievement = achievements.find(a => a.id === id);
    if (achievement && !achievement.unlockedAt && condition) {
      achievement.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(achievement);
    }
  };

  // Check each achievement
  checkAndUnlock('first-log', activities.length > 0);
  checkAndUnlock('streak-3', stats.currentStreak >= 3);
  checkAndUnlock('streak-7', stats.currentStreak >= 7);
  checkAndUnlock('revenue-100', stats.revenueGenerated >= 100);
  checkAndUnlock('revenue-1000', stats.revenueGenerated >= 1000);
  checkAndUnlock('tasks-10', stats.tasksCompleted >= 10);
  checkAndUnlock('tasks-100', stats.tasksCompleted >= 100);
  checkAndUnlock('hours-10', stats.hoursSaved >= 10);
  checkAndUnlock('hours-50', stats.hoursSaved >= 50);
  checkAndUnlock('level-builder', score >= 200);
  checkAndUnlock('level-creator', score >= 400);
  checkAndUnlock('level-architect', score >= 600);
  checkAndUnlock('level-legend', score >= 800);
  checkAndUnlock('challenge-entry', activities.some(a => a.type === 'challenge'));

  if (newlyUnlocked.length > 0 && isBrowser) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  return newlyUnlocked;
}

// Leaderboard functions
export function getLeaderboard(tab: LeaderboardTab = 'overall'): LeaderboardEntry[] {
  const user = getCurrentUser();
  const stats = getStats();
  const achievements = getAchievements();

  // Clone the mock leaderboard
  let leaderboard = [...MOCK_LEADERBOARD];

  // If we have a user, inject them into the leaderboard
  if (user) {
    const userScore = calculateScore(stats, achievements);
    const userEntry: LeaderboardEntry = {
      id: user.id,
      name: user.name,
      agentName: user.agentName,
      score: userScore,
      tasksCompleted: stats.tasksCompleted,
      hoursSaved: stats.hoursSaved,
      revenueGenerated: stats.revenueGenerated,
      level: getLevel(userScore),
      trend: 'up'
    };

    // Remove any existing user entry and add the new one
    leaderboard = leaderboard.filter(e => e.id !== user.id);
    leaderboard.push(userEntry);
  }

  // Sort based on tab
  switch (tab) {
    case 'revenue':
      leaderboard.sort((a, b) => b.revenueGenerated - a.revenueGenerated);
      break;
    case 'hours':
      leaderboard.sort((a, b) => b.hoursSaved - a.hoursSaved);
      break;
    case 'tasks':
      leaderboard.sort((a, b) => b.tasksCompleted - a.tasksCompleted);
      break;
    default:
      leaderboard.sort((a, b) => b.score - a.score);
  }

  return leaderboard;
}

export function getUserRank(tab: LeaderboardTab = 'overall'): number {
  const user = getCurrentUser();
  if (!user) return 0;

  const leaderboard = getLeaderboard(tab);
  const index = leaderboard.findIndex(e => e.id === user.id);
  return index >= 0 ? index + 1 : leaderboard.length + 1;
}
