import { useMemo } from 'react';
import { ChartDataBuilder, ChartConfig, TimeRange } from '../../domain/progress';
import { Workout, PersonalRecord } from '../../data/models/Workout';

/**
 * Hook to build chart data for weight progression
 */
export function useWeightChart(
  exerciseName: string | null,
  workouts: Workout[],
  timeRange: TimeRange = 'all',
  prs: PersonalRecord[] = []
): ChartConfig | null {
  return useMemo(() => {
    if (!exerciseName) return null;
    return ChartDataBuilder.buildWeightChart(exerciseName, workouts, timeRange, prs);
  }, [exerciseName, workouts, timeRange, prs]);
}

/**
 * Hook to build chart data for volume progression
 */
export function useVolumeChart(
  exerciseName: string | null,
  workouts: Workout[],
  timeRange: TimeRange = 'all',
  prs: PersonalRecord[] = []
): ChartConfig | null {
  return useMemo(() => {
    if (!exerciseName) return null;
    return ChartDataBuilder.buildVolumeChart(exerciseName, workouts, timeRange, prs);
  }, [exerciseName, workouts, timeRange, prs]);
}
