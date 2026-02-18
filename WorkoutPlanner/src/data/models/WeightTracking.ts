export type WeightUnit = 'lbs' | 'kg';
export type GoalType = 'lose' | 'gain' | 'maintain';
export type WeightTrend = 'decreasing' | 'increasing' | 'stable';

export interface WeightEntry {
  id: string;
  weight: number;
  unit: WeightUnit;
  date: string;
  time?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeightGoal {
  targetWeight: number;
  unit: WeightUnit;
  goalType: GoalType;
  startWeight: number;
  startDate: string;
  targetDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeightStats {
  currentWeight: number;
  startingWeight: number;
  lowestWeight: number;
  highestWeight: number;
  averageWeight: number;
  totalChange: number;
  percentChange: number;
  trend: WeightTrend;
  entriesCount: number;
}
