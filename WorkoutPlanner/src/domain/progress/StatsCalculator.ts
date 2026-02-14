import { Workout } from '../../data/models/Workout';
import { ProgressUtils } from './ProgressUtils';
import { LinearRegression } from './LinearRegression';
import { ExerciseStats, ProgressionMetrics } from './types';

export class StatsCalculator {
  /**
   * Calculate comprehensive stats for a specific exercise
   */
  static calculateExerciseStats(
    exerciseName: string,
    workouts: Workout[]
  ): ExerciseStats | null {
    const sessions = ProgressUtils.getSessionsWithExercise(exerciseName, workouts);
    
    if (sessions.length === 0) {
      return null;
    }

    const maxWeightData = ProgressUtils.getMaxWeight(exerciseName, workouts);
    const totalVolume = ProgressUtils.getTotalVolume(exerciseName, workouts);
    const dataPoints = ProgressUtils.getMaxWeightPerSession(exerciseName, workouts);
    
    const progression = this.calculateProgression(dataPoints);
    
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstSession = sortedSessions[0];
    const lastSession = sortedSessions[sortedSessions.length - 1];
    
    const frequencyPerWeek = this.calculateFrequency(sessions);

    return {
      exerciseName,
      maxWeight: maxWeightData?.weight || 0,
      maxWeightDate: maxWeightData?.date || '',
      totalVolume,
      averageVolumePerSession: sessions.length > 0 ? totalVolume / sessions.length : 0,
      sessionCount: sessions.length,
      firstSessionDate: firstSession.date,
      lastSessionDate: lastSession.date,
      progression,
      frequencyPerWeek,
    };
  }

  /**
   * Calculate strength progression metrics
   */
  private static calculateProgression(
    dataPoints: Array<{ date: string; value: number; workoutId: string }>
  ): ProgressionMetrics {
    if (dataPoints.length === 0) {
      return {
        slope: 0,
        rSquared: 0,
        trend: 'plateauing',
        projectedNextPR: 0,
      };
    }

    // Convert to indexed data points for regression
    const indexedPoints = dataPoints.map((point, index) => ({
      x: index,
      y: point.value,
    }));

    const regression = LinearRegression.calculate(indexedPoints);
    
    const trend = this.classifyTrend(regression.slope, regression.rSquared);
    const projectedNextPR = LinearRegression.predict(regression, dataPoints.length);

    return {
      slope: regression.slope,
      rSquared: regression.rSquared,
      trend,
      projectedNextPR: Math.max(0, projectedNextPR),
    };
  }

  /**
   * Classify trend based on slope and r-squared
   */
  private static classifyTrend(
    slope: number,
    rSquared: number
  ): 'improving' | 'declining' | 'plateauing' {
    // If r-squared is too low, data is too scattered to determine trend
    if (rSquared < 0.3) {
      return 'plateauing';
    }

    const threshold = 0.1; // Minimum slope to consider as improvement/decline
    
    if (slope > threshold) {
      return 'improving';
    } else if (slope < -threshold) {
      return 'declining';
    } else {
      return 'plateauing';
    }
  }

  /**
   * Calculate workout frequency (sessions per week)
   */
  private static calculateFrequency(sessions: Workout[]): number {
    if (sessions.length === 0) {
      return 0;
    }

    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstDate = new Date(sortedSessions[0].date);
    const lastDate = new Date(sortedSessions[sortedSessions.length - 1].date);

    const daysDifference = Math.max(
      1,
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const weeks = daysDifference / 7;
    
    return sessions.length / weeks;
  }

  /**
   * Calculate stats for all exercises
   */
  static calculateAllExerciseStats(workouts: Workout[]): ExerciseStats[] {
    const exerciseNames = ProgressUtils.getAllExerciseNames(workouts);
    
    return exerciseNames
      .map(name => this.calculateExerciseStats(name, workouts))
      .filter((stats): stats is ExerciseStats => stats !== null)
      .sort((a, b) => b.sessionCount - a.sessionCount);
  }
}
