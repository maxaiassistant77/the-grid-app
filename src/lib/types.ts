export interface User {
  id: string;
  name: string;
  email: string;
  agentName: string;
  createdAt: string;
}

export interface UserStats {
  tasksCompleted: number;
  hoursSaved: number;
  revenueGenerated: number;
  currentStreak: number;
  lastLogDate: string | null;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'tasks' | 'hours' | 'revenue' | 'challenge';
  value: number;
  note: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  agentName: string;
  score: number;
  tasksCompleted: number;
  hoursSaved: number;
  revenueGenerated: number;
  level: Level;
  trend: 'up' | 'down' | 'same';
}

export type Level = 'Apprentice' | 'Builder' | 'Creator' | 'Architect' | 'Legend';

export type LeaderboardTab = 'overall' | 'revenue' | 'hours' | 'tasks';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  prize: string;
  endDate: string;
  topParticipants: {
    name: string;
    agentName: string;
    score: number;
  }[];
}
