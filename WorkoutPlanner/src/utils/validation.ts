import {Workout, Exercise, Set} from '../data/models/Workout';

export function isWorkout(obj: any): obj is Workout {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    Array.isArray(obj.exercises) &&
    typeof obj.isCompleted === 'boolean'
  );
}

export function validateSet(set: Partial<Set>): string | null {
  if (
    typeof set.reps !== 'number' ||
    set.reps < 1 ||
    set.reps > 999 ||
    !Number.isInteger(set.reps)
  ) {
    return 'Reps must be between 1 and 999';
  }

  if (typeof set.weight !== 'number' || set.weight < 0 || set.weight > 9999) {
    return 'Weight must be between 0 and 9999';
  }

  if (set.rpe !== undefined) {
    if (
      typeof set.rpe !== 'number' ||
      set.rpe < 1 ||
      set.rpe > 10 ||
      !Number.isInteger(set.rpe)
    ) {
      return 'RPE must be between 1 and 10';
    }
  }

  return null;
}

export function validateExercise(exercise: Partial<Exercise>): string | null {
  if (!exercise.name || exercise.name.trim().length === 0) {
    return 'Exercise name cannot be empty';
  }

  if (exercise.name.length > 100) {
    return 'Exercise name too long';
  }

  return null;
}
