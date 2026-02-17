import { Workout, PersonalRecord } from '../../data/models/Workout';
import { UserLeaderboardStats } from '../../data/models/Leaderboard';
import { ProgressUtils } from '../progress/ProgressUtils';

export class LeaderboardStatsCalculator {
  /**
   * Calculate composite score from user stats
   * Formula: (workouts * 10) + (totalWeight / 1000) + (streak * 50) + (totalTime / 3600)
   */
  static calculateScore(stats: UserLeaderboardStats): number {
    const workoutScore = stats.totalWorkouts * 10;
    const weightScore = stats.totalWeightLifted / 1000;
    const streakScore = stats.currentStreak * 50;
    const timeScore = stats.totalWorkoutTime / 3600000; // Convert ms to hours
    const prScore = stats.personalRecords * 5;

    return Math.round(workoutScore + weightScore + streakScore + timeScore + prScore);
  }

  /**
   * Calculate total weight lifted across all workouts
   */
  static calculateTotalWeightLifted(workouts: Workout[]): number {
    let total = 0;
    for (const workout of workouts) {
      for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
          if (!set.isWarmup) {
            total += set.weight * set.reps;
          }
        }
      }
    }
    return total;
  }

  /**
   * Calculate total workout time in milliseconds
   */
  static calculateTotalWorkoutTime(workouts: Workout[]): number {
    let total = 0;
    for (const workout of workouts) {
      if (workout.startTime && workout.endTime) {
        const start = new Date(workout.startTime).getTime();
        const end = new Date(workout.endTime).getTime();
        total += end - start;
      }
    }
    return total;
  }

  /**
   * Calculate current workout streak
   */
  static calculateCurrentStreak(workouts: Workout[]): number {
    if (workouts.length === 0) return 0;

    const completedWorkouts = workouts
      .filter(w => w.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (completedWorkouts.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentDate = new Date(today);

    // Check if last workout was today or yesterday
    const lastWorkoutDate = new Date(completedWorkouts[0].date);
    lastWorkoutDate.setHours(0, 0, 0, 0);
    const daysSinceLastWorkout = Math.floor(
      (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastWorkout > 1) {
      return 0; // Streak broken
    }

    // Count consecutive days
    const workoutDates = new Set(
      completedWorkouts.map(w => {
        const d = new Date(w.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    while (workoutDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Calculate longest workout streak
   */
  static calculateLongestStreak(workouts: Workout[]): number {
    if (workouts.length === 0) return 0;

    const completedWorkouts = workouts
      .filter(w => w.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (completedWorkouts.length === 0) return 0;

    const workoutDates = Array.from(
      new Set(
        completedWorkouts.map(w => {
          const d = new Date(w.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      )
    ).sort((a, b) => a - b);

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < workoutDates.length; i++) {
      const daysDiff = Math.floor(
        (workoutDates[i] - workoutDates[i - 1]) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  /**
   * Count total personal records
   */
  static countPersonalRecords(workouts: Workout[]): number {
    const exerciseNames = ProgressUtils.getAllExerciseNames(workouts);
    let totalPRs = 0;

    for (const exerciseName of exerciseNames) {
      // Count sessions as PRs where max weight increased
      const sessions = ProgressUtils.getMaxWeightPerSession(exerciseName, workouts);
      let maxWeightSoFar = 0;
      
      for (const session of sessions) {
        if (session.value > maxWeightSoFar) {
          totalPRs++;
          maxWeightSoFar = session.value;
        }
      }
    }

    return totalPRs;
  }

  /**
   * Calculate all leaderboard stats for user
   */
  static calculateUserStats(workouts: Workout[]): UserLeaderboardStats {
    const completedWorkouts = workouts.filter(w => w.isCompleted);

    return {
      totalWorkouts: completedWorkouts.length,
      totalWeightLifted: this.calculateTotalWeightLifted(completedWorkouts),
      currentStreak: this.calculateCurrentStreak(completedWorkouts),
      longestStreak: this.calculateLongestStreak(completedWorkouts),
      totalWorkoutTime: this.calculateTotalWorkoutTime(completedWorkouts),
      personalRecords: this.countPersonalRecords(completedWorkouts),
    };
  }

  /**
   * Filter workouts by timeframe
   */
  static filterWorkoutsByTimeframe(
    workouts: Workout[],
    timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time'
  ): Workout[] {
    if (timeframe === 'all-time') {
      return workouts;
    }

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeframe) {
      case 'daily':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        cutoffDate.setDate(now.getDate() - 30);
        break;
    }

    return workouts.filter(w => new Date(w.date).getTime() >= cutoffDate.getTime());
  }
}
