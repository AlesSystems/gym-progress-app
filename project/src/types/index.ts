export interface User {
  id: string;
  name: string;
  displayName?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  unitPreference?: string;
  invitedBy?: string | null;
  inviteCode?: string;
  lastLoginAt?: Date | null;
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
  slug: string;
  type: string;
  movementCategory: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  defaultUnit?: string | null;
  defaultReps?: number | null;
  defaultWeight?: number | null;
  demoImageUrl?: string | null;
  demoVideoUrl?: string | null;
  description?: string | null;
  isSystemExercise: boolean;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface Invite {
  id: string;
  code: string;
  createdBy: string;
  usedBy?: string | null;
  expiresAt?: Date | null;
  usedAt?: Date | null;
  maxUses?: number | null;
  currentUses: number;
  createdAt: Date;
}

export interface MagicLink {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export interface MaxLift {
  id: string;
  userId: string;
  exerciseId: string;
  weight: number;
  unit: string;
  achievedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  exercise?: Exercise;
}

