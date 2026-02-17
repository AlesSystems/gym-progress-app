export interface LeaderboardUser {
  userId: string;
  displayName: string;
  stats: UserLeaderboardStats;
  score: number;
  createdAt: number;
  lastUpdated: number;
}

export interface UserLeaderboardStats {
  totalWorkouts: number;
  totalWeightLifted: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkoutTime: number;
  personalRecords: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  stats: UserLeaderboardStats;
  isCurrentUser: boolean;
}

export interface LeaderboardResponse {
  timeframe: LeaderboardTimeframe;
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
  totalUsers: number;
}

export type LeaderboardTimeframe = 'daily' | 'weekly' | 'monthly' | 'all-time';
