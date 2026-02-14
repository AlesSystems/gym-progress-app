import { Workout, PersonalRecord } from '../../data/models/Workout';
import { ProgressUtils } from './ProgressUtils';
import { DataPoint, ChartConfig, TimeRange } from './types';
import { LinearRegression } from './LinearRegression';

export class ChartDataBuilder {
  /**
   * Build chart configuration for weight progression
   */
  static buildWeightChart(
    exerciseName: string,
    workouts: Workout[],
    timeRange: TimeRange = 'all',
    prs: PersonalRecord[] = []
  ): ChartConfig {
    const filteredWorkouts = ProgressUtils.filterByTimeRange(workouts, timeRange);
    const sessionData = ProgressUtils.getMaxWeightPerSession(exerciseName, filteredWorkouts);

    const dataPoints: DataPoint[] = sessionData.map(session => ({
      date: session.date,
      value: session.value,
      isPR: this.isPR(session.date, session.value, prs, 'max_weight'),
      workoutId: session.workoutId,
    }));

    const prMarkers = dataPoints.filter(p => p.isPR);

    // Calculate trend line
    const indexedPoints = dataPoints.map((point, index) => ({
      x: index,
      y: point.value,
    }));

    const trendLine = dataPoints.length >= 3 
      ? LinearRegression.calculate(indexedPoints)
      : undefined;

    return {
      xAxis: 'date',
      yAxis: 'weight',
      dataPoints,
      prMarkers,
      trendLine: trendLine && LinearRegression.isMeaningful(trendLine) ? trendLine : undefined,
      timeRange,
    };
  }

  /**
   * Build chart configuration for volume progression
   */
  static buildVolumeChart(
    exerciseName: string,
    workouts: Workout[],
    timeRange: TimeRange = 'all',
    prs: PersonalRecord[] = []
  ): ChartConfig {
    const filteredWorkouts = ProgressUtils.filterByTimeRange(workouts, timeRange);
    const volumeData = this.getVolumePerSession(exerciseName, filteredWorkouts);

    const dataPoints: DataPoint[] = volumeData.map(session => ({
      date: session.date,
      value: session.volume,
      isPR: this.isPR(session.date, session.volume, prs, 'max_volume'),
      workoutId: session.workoutId,
    }));

    const prMarkers = dataPoints.filter(p => p.isPR);

    const indexedPoints = dataPoints.map((point, index) => ({
      x: index,
      y: point.value,
    }));

    const trendLine = dataPoints.length >= 3
      ? LinearRegression.calculate(indexedPoints)
      : undefined;

    return {
      xAxis: 'date',
      yAxis: 'volume',
      dataPoints,
      prMarkers,
      trendLine: trendLine && LinearRegression.isMeaningful(trendLine) ? trendLine : undefined,
      timeRange,
    };
  }

  /**
   * Get total volume per session for an exercise
   */
  private static getVolumePerSession(
    exerciseName: string,
    workouts: Workout[]
  ): Array<{ date: string; volume: number; workoutId: string }> {
    const sessionMap = new Map<string, { volume: number; workoutId: string }>();

    const allSets = ProgressUtils.getAllSetsForExercise(exerciseName, workouts);

    for (const set of allSets) {
      const volume = set.reps * set.weight;
      const existing = sessionMap.get(set.date);
      
      if (existing) {
        existing.volume += volume;
      } else {
        sessionMap.set(set.date, { 
          volume,
          workoutId: set.workoutId 
        });
      }
    }

    return Array.from(sessionMap.entries())
      .map(([date, data]) => ({
        date,
        volume: data.volume,
        workoutId: data.workoutId,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Check if a data point is a PR
   */
  private static isPR(
    date: string,
    value: number,
    prs: PersonalRecord[],
    type: PersonalRecord['type']
  ): boolean {
    return prs.some(
      pr =>
        pr.type === type &&
        pr.date === date &&
        Math.abs(pr.value - value) < 0.01
    );
  }
}
