import { useState, useEffect, useCallback } from 'react';
import { Workout } from '../../data/models/Workout';
import { WorkoutStorage } from '../../data/storage/WorkoutStorage';

export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadWorkouts = useCallback(async () => {
    try {
      const allWorkouts = await WorkoutStorage.getAllWorkouts();
      const completedWorkouts = allWorkouts
        .filter(w => w.isCompleted)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setWorkouts(completedWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const refreshHistory = useCallback(async () => {
    await loadWorkouts();
  }, [loadWorkouts]);

  const deleteWorkout = useCallback(
    async (workoutId: string) => {
      try {
        await WorkoutStorage.deleteWorkout(workoutId);
        setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      } catch (error) {
        console.error('Error deleting workout:', error);
        throw error;
      }
    },
    []
  );

  const duplicateWorkout = useCallback(
    async (workoutId: string) => {
      try {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;

        const newWorkout: Workout = {
          ...workout,
          id: generateId(),
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          endTime: undefined,
          isCompleted: false,
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
        console.error('Error duplicating workout:', error);
        throw error;
      }
    },
    [workouts]
  );

  const filteredWorkouts = searchQuery
    ? workouts.filter(
        w =>
          w.exercises.some(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          new Date(w.date)
            .toLocaleDateString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : workouts;

  return {
    workouts: filteredWorkouts,
    isLoading,
    refreshHistory,
    deleteWorkout,
    duplicateWorkout,
    searchQuery,
    setSearchQuery,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
