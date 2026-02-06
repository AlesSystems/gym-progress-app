import { Workout, Set, PersonalRecord } from '../../data/models/Workout';

export class PRDetector {
  static detectPRs(
    exerciseName: string,
    newSet: Set,
    workoutHistory: Workout[]
  ): PersonalRecord[] {
    const prs: PersonalRecord[] = [];
    const previousSets = this.getAllSetsForExercise(exerciseName, workoutHistory);

    if (previousSets.length === 0) {
      return prs;
    }

    const maxWeight = Math.max(...previousSets.map(s => s.weight));
    if (newSet.weight > maxWeight) {
      prs.push({
        exerciseName,
        type: 'max_weight',
        value: newSet.weight,
        date: new Date().toISOString(),
        workoutId: '',
        exerciseId: newSet.exerciseId,
        setId: newSet.id,
      });
    }

    const maxVolume = Math.max(...previousSets.map(s => s.reps * s.weight));
    const newVolume = newSet.reps * newSet.weight;
    if (newVolume > maxVolume) {
      prs.push({
        exerciseName,
        type: 'max_volume',
        value: newVolume,
        date: new Date().toISOString(),
        workoutId: '',
        exerciseId: newSet.exerciseId,
        setId: newSet.id,
      });
    }

    const maxReps = Math.max(
      ...previousSets
        .filter(s => s.weight === newSet.weight)
        .map(s => s.reps)
    );
    if (maxReps > 0 && newSet.reps > maxReps) {
      prs.push({
        exerciseName,
        type: 'max_reps',
        value: newSet.reps,
        date: new Date().toISOString(),
        workoutId: '',
        exerciseId: newSet.exerciseId,
        setId: newSet.id,
      });
    }

    return prs;
  }

  private static getAllSetsForExercise(
    exerciseName: string,
    workoutHistory: Workout[]
  ): Set[] {
    const sets: Set[] = [];
    
    for (const workout of workoutHistory) {
      if (!workout.isCompleted) continue;
      
      for (const exercise of workout.exercises) {
        if (exercise.name.toLowerCase() === exerciseName.toLowerCase()) {
          sets.push(...exercise.sets.filter(s => !s.isWarmup));
        }
      }
    }
    
    return sets;
  }
}
