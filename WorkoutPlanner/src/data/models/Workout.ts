export interface Workout {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  exercises: Exercise[];
  notes?: string;
  bodyweight?: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  sets: Set[];
  notes?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Set {
  id: string;
  exerciseId: string;
  reps: number;
  weight: number;
  isWarmup: boolean;
  rpe?: number;
  notes?: string;
  order: number;
  createdAt: string;
}

export interface PersonalRecord {
  exerciseName: string;
  type: 'max_weight' | 'max_volume' | 'max_reps';
  value: number;
  date: string;
  workoutId: string;
  exerciseId: string;
  setId?: string;
}
