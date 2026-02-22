export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  date: Date;
  notes?: string | null;
  duration?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  description?: string | null;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  exercise?: Exercise;
  sets?: ExerciseSet[];
}

export interface ExerciseSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight?: number | null;
  reps?: number | null;
  duration?: number | null;
  distance?: number | null;
  notes?: string | null;
}

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
};
