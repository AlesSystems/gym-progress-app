import { Workout } from '../../data/models/Workout';
import { LeaderboardUser } from '../../data/models/Leaderboard';
import { LeaderboardStorage } from '../../data/storage/LeaderboardStorage';
import { LeaderboardStatsCalculator } from '../../domain/leaderboard/LeaderboardStatsCalculator';

export class LeaderboardService {
  /**
   * Calculate the current user's stats from their workout history and
   * persist them to Firestore (+ local cache) so other users can see them.
   */
  static async updateUserStats(workouts: Workout[]): Promise<void> {
    try {
      const userId = await LeaderboardStorage.getUserId();
      const displayName = (await LeaderboardStorage.getDisplayName()) || 'Anonymous';

      // Use ALL workouts for the persistent record; the UI filters by timeframe
      const stats = LeaderboardStatsCalculator.calculateUserStats(workouts);
      const score = LeaderboardStatsCalculator.calculateScore(stats);

      // Preserve the original createdAt if the user already exists
      const existing = await LeaderboardStorage.getCurrentUserData();

      const userData: LeaderboardUser = {
        userId,
        displayName,
        stats,
        score,
        createdAt: existing?.createdAt ?? Date.now(),
        lastUpdated: Date.now(),
      };

      await LeaderboardStorage.saveUserData(userData);
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  /** Validate and persist the display name, then re-push stats. */
  static async setDisplayName(name: string): Promise<void> {
    if (!name || name.length < 2 || name.length > 20) {
      throw new Error('Display name must be between 2 and 20 characters');
    }

    const validNameRegex = /^[a-zA-Z0-9_\s]+$/;
    if (!validNameRegex.test(name)) {
      throw new Error('Display name can only contain letters, numbers, spaces, and underscores');
    }

    await LeaderboardStorage.setDisplayName(name);
  }

  static async getDisplayName(): Promise<string | null> {
    return await LeaderboardStorage.getDisplayName();
  }

  static async hasDisplayName(): Promise<boolean> {
    const name = await LeaderboardStorage.getDisplayName();
    return name !== null && name.length > 0;
  }
}
