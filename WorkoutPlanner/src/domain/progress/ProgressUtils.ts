import { Workout, Exercise, Set } from '../../data/models/Workout';
import { TimeRange } from './types';

export class ProgressUtils {
  /**
   * Get all sets for a specific exercise from workout history
   */
  static getAllSetsForExercise(
    exerciseName: string,
    workouts: Workout[]
  ): Array<Set & { date: string; workoutId: string }> {
    const sets: Array<Set & { date: string; workoutId: string }> = [];

    for (const workout of workouts) {
      if (!workout.isCompleted) continue;

      for (const exercise of workout.exercises) {
        if (exercise.name.toLowerCase() === exerciseName.toLowerCase()) {
          const workingSets = exercise.sets
            .filter(s => !s.isWarmup)
            .map(s => ({ ...s, date: workout.date, workoutId: workout.id }));
          sets.push(...workingSets);
        }
      }
    }

    return sets.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get maximum weight lifted for an exercise
   */
  static getMaxWeight(
    exerciseName: string,
    workouts: Workout[]
  ): { weight: number; date: string } | null {
    const allSets = this.getAllSetsForExercise(exerciseName, workouts);
    
    if (allSets.length === 0) {
      return null;
    }

    const maxSet = allSets.reduce((max, set) => 
      set.weight > max.weight ? set : max
    );

    return {
      weight: maxSet.weight,
      date: maxSet.date,
    };
  }

  /**
   * Calculate total volume for an exercise in a given time range
   */
  static getTotalVolume(
    exerciseName: string,
    workouts: Workout[],
    timeRange?: TimeRange
  ): number {
    const filteredWorkouts = timeRange 
      ? this.filterByTimeRange(workouts, timeRange)
      : workouts;
    
    const allSets = this.getAllSetsForExercise(exerciseName, filteredWorkouts);
    
    return allSets.reduce((total, set) => {
      return total + (set.reps * set.weight);
    }, 0);
  }

  /**
   * Get max weight per session for progression analysis
   */
  static getMaxWeightPerSession(
    exerciseName: string,
    workouts: Workout[]
  ): Array<{ date: string; value: number; workoutId: string }> {
    const sessionMap = new Map<string, { maxWeight: number; workoutId: string }>();

    const allSets = this.getAllSetsForExercise(exerciseName, workouts);

    for (const set of allSets) {
      const existing = sessionMap.get(set.date);
      if (!existing || set.weight > existing.maxWeight) {
        sessionMap.set(set.date, { 
          maxWeight: set.weight,
          workoutId: set.workoutId 
        });
      }
    }

    return Array.from(sessionMap.entries())
      .map(([date, data]) => ({
        date,
        value: data.maxWeight,
        workoutId: data.workoutId,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Filter workouts by time range
   */
  static filterByTimeRange(workouts: Workout[], timeRange: TimeRange): Workout[] {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case '4w':
        cutoffDate.setDate(now.getDate() - 28);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return workouts;
    }

    return workouts.filter(w => new Date(w.date) >= cutoffDate);
  }

  /**
   * Get all unique exercise names from workout history
   */
  static getAllExerciseNames(workouts: Workout[]): string[] {
    const names = new globalThis.Set<string>();
    
    workouts.forEach(workout => {
      if (!workout.isCompleted) return;
      workout.exercises.forEach(exercise => {
        names.add(exercise.name);
      });
    });

    return Array.from(names).sort();
  }

  /**
   * Get sessions that contain a specific exercise
   */
  static getSessionsWithExercise(
    exerciseName: string,
    workouts: Workout[]
  ): Workout[] {
    return workouts.filter(workout => {
      if (!workout.isCompleted) return false;
      return workout.exercises.some(
        e => e.name.toLowerCase() === exerciseName.toLowerCase()
      );
    });
  }
}
