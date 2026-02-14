import { useState, useEffect, useCallback } from 'react';
import { Workout } from '../../data/models/Workout';
import { WorkoutStorage } from '../../data/storage/WorkoutStorage';

export function useWorkoutDetail(workoutId: string) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkout = useCallback(async () => {
    try {
      const w = await WorkoutStorage.getWorkoutById(workoutId);
      setWorkout(w);
    } catch (error) {
      console.error('Error loading workout:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const deleteWorkout = useCallback(async () => {
    try {
      await WorkoutStorage.deleteWorkout(workoutId);
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }, [workoutId]);

  const updateWorkout = useCallback(
    async (updates: Partial<Workout>) => {
      try {
        if (!workout) return;

        const updatedWorkout: Workout = {
          ...workout,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await WorkoutStorage.saveWorkout(updatedWorkout);
        setWorkout(updatedWorkout);
      } catch (error) {
        console.error('Error updating workout:', error);
        throw error;
      }
    },
    [workout]
  );

  const duplicateAsTemplate = useCallback(async () => {
    try {
      if (!workout) return;

      const newWorkout: Workout = {
        ...workout,
        id: generateId(),
        date: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: undefined,
        isCompleted: false,
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        exercises: workout.exercises.map(exercise => ({
          ...exercise,
          id: generateId(),
          workoutId: '',
          sets: exercise.sets.map(set => ({
            ...set,
            id: generateId(),
            exerciseId: '',
            createdAt: new Date().toISOString(),
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      };

      newWorkout.exercises.forEach(exercise => {
        exercise.workoutId = newWorkout.id;
        exercise.sets.forEach(set => {
          set.exerciseId = exercise.id;
        });
      });

      await WorkoutStorage.saveActiveWorkout(newWorkout);
    } catch (error) {
      console.error('Error duplicating as template:', error);
      throw error;
    }
  }, [workout]);

  return {
    workout,
    isLoading,
    deleteWorkout,
    updateWorkout,
    duplicateAsTemplate,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
