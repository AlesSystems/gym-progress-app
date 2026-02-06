import React, { createContext, useContext, ReactNode } from 'react';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { Workout, PersonalRecord } from '../../data/models/Workout';

interface WorkoutContextValue {
  activeWorkout: Workout | null;
  workoutHistory: Workout[];
  isLoading: boolean;
  startWorkout: () => Promise<void>;
  addExercise: (name: string) => Promise<void>;
  addSet: (
    exerciseId: string,
    reps: number,
    weight: number,
    isWarmup?: boolean,
    rpe?: number,
    notes?: string
  ) => Promise<{ prs: PersonalRecord[] } | undefined>;
  deleteSet: (exerciseId: string, setId: string) => Promise<void>;
  deleteExercise: (exerciseId: string) => Promise<void>;
  finishWorkout: () => Promise<void>;
  discardWorkout: () => Promise<void>;
  updateWorkoutNotes: (notes: string) => Promise<void>;
  updateWorkoutBodyweight: (bodyweight: number) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const workoutState = useActiveWorkout();

  return (
    <WorkoutContext.Provider value={workoutState}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutContext() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkoutContext must be used within WorkoutProvider');
  }
  return context;
}
