import { Workout, Exercise } from '../../data/models/Workout';
import type { Set as WorkoutSet } from '../../data/models/Workout';

export interface WorkoutComparison {
  workout1: Workout;
  workout2: Workout;
  exerciseComparisons: ExerciseComparison[];
  volumeDifference: number;
  durationDifference: number;
  daysBetween: number;
}

export interface ExerciseComparison {
  exerciseName: string;
  workout1Exercise?: Exercise;
  workout2Exercise?: Exercise;
  volumeDifference: number;
  setsDifference: number;
  maxWeightDifference: number;
}

export function compareWorkouts(
  workout1: Workout,
  workout2: Workout
): WorkoutComparison {
  const exerciseComparisons = compareExercises(
    workout1.exercises,
    workout2.exercises
  );

  const volume1 = calculateWorkoutVolume(workout1);
  const volume2 = calculateWorkoutVolume(workout2);
  const volumeDifference = volume2 - volume1;

  const duration1 = calculateDuration(workout1.startTime, workout1.endTime);
  const duration2 = calculateDuration(workout2.startTime, workout2.endTime);
  const durationDifference = duration2 - duration1;

  const daysBetween = calculateDaysBetween(workout1.date, workout2.date);

  return {
    workout1,
    workout2,
    exerciseComparisons,
    volumeDifference,
    durationDifference,
    daysBetween,
  };
}

export function compareExercises(
  exercises1: Exercise[],
  exercises2: Exercise[]
): ExerciseComparison[] {
  const exerciseNames = new globalThis.Set([
    ...exercises1.map(e => e.name.toLowerCase()),
    ...exercises2.map(e => e.name.toLowerCase()),
  ]);

  return Array.from(exerciseNames).map(name => {
    const ex1 = exercises1.find(e => e.name.toLowerCase() === name);
    const ex2 = exercises2.find(e => e.name.toLowerCase() === name);

    const volume1 = ex1 ? calculateExerciseVolume(ex1) : 0;
    const volume2 = ex2 ? calculateExerciseVolume(ex2) : 0;
    const volumeDifference = volume2 - volume1;

    const sets1 = ex1?.sets.length || 0;
    const sets2 = ex2?.sets.length || 0;
    const setsDifference = sets2 - sets1;

    const maxWeight1 = ex1 ? getMaxWeight(ex1.sets) : 0;
    const maxWeight2 = ex2 ? getMaxWeight(ex2.sets) : 0;
    const maxWeightDifference = maxWeight2 - maxWeight1;

    return {
      exerciseName: name,
      workout1Exercise: ex1,
      workout2Exercise: ex2,
      volumeDifference,
      setsDifference,
      maxWeightDifference,
    };
  });
}

export function findLastWorkoutWithExercise(
  workouts: Workout[],
  exerciseName: string,
  beforeDate: Date
): Workout | null {
  const sortedWorkouts = workouts
    .filter(w => new Date(w.date) < beforeDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    sortedWorkouts.find(workout =>
      workout.exercises.some(
        e => e.name.toLowerCase() === exerciseName.toLowerCase()
      )
    ) || null
  );
}

function calculateWorkoutVolume(workout: Workout): number {
  return workout.exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise);
  }, 0);
}

function calculateExerciseVolume(exercise: Exercise): number {
  return exercise.sets
    .filter(set => !set.isWarmup)
    .reduce((sum, set) => sum + set.reps * set.weight, 0);
}

function calculateDuration(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

function calculateDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getMaxWeight(sets: WorkoutSet[]): number {
  if (sets.length === 0) return 0;
  return Math.max(...sets.filter(s => !s.isWarmup).map(s => s.weight));
}
