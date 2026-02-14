import { Workout, Exercise } from '../../data/models/Workout';

export interface WorkoutSummary {
  workoutId: string;
  duration: number;
  totalSets: number;
  totalVolume: number;
  exerciseCount: number;
  prsAchieved: number;
}

export function calculateWorkoutSummary(workout: Workout): WorkoutSummary {
  const duration = calculateDuration(workout.startTime, workout.endTime);
  const totalSets = calculateTotalSets(workout.exercises);
  const totalVolume = calculateTotalVolume(workout.exercises);
  const exerciseCount = workout.exercises.length;

  return {
    workoutId: workout.id,
    duration,
    totalSets,
    totalVolume,
    exerciseCount,
    prsAchieved: 0, // Will be calculated by PR detection logic
  };
}

export function calculateDuration(
  startTime?: string,
  endTime?: string
): number {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  
  return Math.floor(durationMs / 60000); // Return duration in minutes
}

export function calculateTotalSets(exercises: Exercise[]): number {
  return exercises.reduce((total, exercise) => {
    return total + exercise.sets.length;
  }, 0);
}

export function calculateTotalVolume(exercises: Exercise[]): number {
  return exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets
      .filter(set => !set.isWarmup)
      .reduce((sum, set) => {
        return sum + (set.reps * set.weight);
      }, 0);
    return total + exerciseVolume;
  }, 0);
}

export function calculateExerciseVolume(exercise: Exercise): number {
  return exercise.sets
    .filter(set => !set.isWarmup)
    .reduce((sum, set) => {
      return sum + (set.reps * set.weight);
    }, 0);
}

export function getWorkoutsByDateRange(
  workouts: Workout[],
  startDate: Date,
  endDate: Date
): Workout[] {
  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= startDate && workoutDate <= endDate;
  });
}

export function getWorkoutsByExercise(
  workouts: Workout[],
  exerciseName: string
): Workout[] {
  return workouts.filter(workout => {
    return workout.exercises.some(
      exercise => exercise.name.toLowerCase() === exerciseName.toLowerCase()
    );
  });
}

export function sortWorkoutsByDate(
  workouts: Workout[],
  ascending: boolean = false
): Workout[] {
  return [...workouts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
