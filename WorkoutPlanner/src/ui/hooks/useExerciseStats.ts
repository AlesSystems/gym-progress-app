import { useMemo } from 'react';
import { StatsCalculator, ExerciseStats } from '../../domain/progress';
import { Workout } from '../../data/models/Workout';

/**
 * Hook to calculate and memoize exercise statistics
 */
export function useExerciseStats(
  exerciseName: string | null,
  workouts: Workout[]
): ExerciseStats | null {
  return useMemo(() => {
    if (!exerciseName) return null;
    return StatsCalculator.calculateExerciseStats(exerciseName, workouts);
  }, [exerciseName, workouts]);
}

/**
 * Hook to calculate stats for all exercises
 */
export function useAllExerciseStats(workouts: Workout[]): ExerciseStats[] {
  return useMemo(() => {
    return StatsCalculator.calculateAllExerciseStats(workouts);
  }, [workouts]);
}
