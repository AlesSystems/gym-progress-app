export interface DataPoint {
  date: string;
  value: number;
  isPR: boolean;
  workoutId: string;
}

export interface TrendLine {
  slope: number;
  intercept: number;
  rSquared: number;
}

export interface ProgressionMetrics {
  slope: number;
  rSquared: number;
  trend: 'improving' | 'declining' | 'plateauing';
  projectedNextPR: number;
}

export interface ExerciseStats {
  exerciseName: string;
  maxWeight: number;
  maxWeightDate: string;
  totalVolume: number;
  averageVolumePerSession: number;
  sessionCount: number;
  firstSessionDate: string;
  lastSessionDate: string;
  progression: ProgressionMetrics;
  frequencyPerWeek: number;
}

export type TimeRange = '4w' | '3m' | '1y' | 'all';

export interface ChartConfig {
  xAxis: 'date';
  yAxis: 'weight' | 'volume' | 'reps';
  dataPoints: DataPoint[];
  prMarkers: DataPoint[];
  trendLine?: TrendLine;
  timeRange: TimeRange;
}
