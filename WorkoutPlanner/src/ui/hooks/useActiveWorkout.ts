import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Workout, Exercise, Set } from '../../data/models/Workout';
import { WorkoutTemplate, TemplateExercise } from '../../data/models/WorkoutTemplate';
import { WorkoutStorage } from '../../data/storage/WorkoutStorage';
import { TemplateStorage } from '../../data/storage/TemplateStorage';
import { FirebaseSync } from '../../data/storage/FirebaseSync';
import { PRDetector } from '../../domain/workout/PRDetector';
import { LeaderboardService } from '../../domain/leaderboard/LeaderboardService';
import { getLocalDateTimeISO } from '../../utils/dateUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useActiveWorkout() {
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Save immediately whenever activeWorkout changes
    if (activeWorkout && !activeWorkout.isCompleted) {
      WorkoutStorage.saveActiveWorkout(activeWorkout);
    }
  }, [activeWorkout]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [activeWorkout]);

  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'background' && activeWorkout && !activeWorkout.isCompleted) {
      WorkoutStorage.saveActiveWorkout(activeWorkout);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load local data first for fast startup
      const [active, history, templateList] = await Promise.all([
        WorkoutStorage.getActiveWorkout(),
        WorkoutStorage.getAllWorkouts(),
        TemplateStorage.getAllTemplates(),
      ]);
      
      setActiveWorkout(active);
      setWorkoutHistory(history);
      setTemplates(templateList);
      setIsLoading(false);

      // Perform Firebase sync in background
      performBackgroundSync(history, templateList);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setIsLoading(false);
    }
  };

  const performBackgroundSync = async (
    localWorkouts: Workout[],
    localTemplates: WorkoutTemplate[]
  ) => {
    try {
      setIsSyncing(true);
      console.log('[useActiveWorkout] Starting background sync...');

      const { workouts, templates } = await FirebaseSync.performFullSync(
        localWorkouts,
        localTemplates
      );

      // Update local storage with synced data
      await AsyncStorage.setItem('@workouts', JSON.stringify(workouts));
      await AsyncStorage.setItem('@workout_templates', JSON.stringify(templates));

      // Update state if data changed
      if (workouts.length !== localWorkouts.length) {
        setWorkoutHistory(workouts);
        console.log(`[useActiveWorkout] Synced ${workouts.length} workouts`);
      }
      
      if (templates.length !== localTemplates.length) {
        setTemplates(templates);
        console.log(`[useActiveWorkout] Synced ${templates.length} templates`);
      }

      console.log('[useActiveWorkout] Background sync completed');
    } catch (error) {
      console.error('[useActiveWorkout] Background sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const startWorkout = useCallback(async (templateId?: string) => {
    const now = getLocalDateTimeISO();
    let exercises: Exercise[] = [];

    if (templateId) {
      const template = await TemplateStorage.getTemplateById(templateId);
      if (template) {
        exercises = template.exercises.map((templateEx: TemplateExercise, index: number) => ({
          id: generateId(),
          workoutId: '', // Will be set below
          name: templateEx.name,
          sets: templateEx.sets.map((templateSet, setIndex) => ({
            id: generateId(),
            exerciseId: '', // Will be set in the map
            reps: templateSet.reps,
            weight: templateSet.weight,
            isWarmup: templateSet.isWarmup,
            order: setIndex,
            createdAt: now,
          })),
          notes: templateEx.notes,
          order: index,
          createdAt: now,
          updatedAt: now,
        }));
      }
    }

    const newWorkout: Workout = {
      id: generateId(),
      date: now,
      startTime: now,
      exercises: exercises.map(ex => ({
        ...ex,
        workoutId: generateId(),
        sets: ex.sets.map(s => ({ ...s, exerciseId: ex.id })),
      })),
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
    
    setActiveWorkout(newWorkout);
    await WorkoutStorage.saveActiveWorkout(newWorkout);
  }, []);

  const addExercise = useCallback(async (name: string) => {
    if (!activeWorkout) return;

    const now = getLocalDateTimeISO();
    const newExercise: Exercise = {
      id: generateId(),
      workoutId: activeWorkout.id,
      name,
      sets: [],
      order: activeWorkout.exercises.length,
      createdAt: now,
      updatedAt: now,
    };

    const updated = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise],
      updatedAt: now,
    };

    setActiveWorkout(updated);
    await WorkoutStorage.saveActiveWorkout(updated);
  }, [activeWorkout]);

  const addSet = useCallback(async (
    exerciseId: string,
    reps: number,
    weight: number,
    isWarmup: boolean = false,
    rpe?: number,
    notes?: string
  ) => {
    if (!activeWorkout) return;

    const exercise = activeWorkout.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const now = getLocalDateTimeISO();
    const newSet: Set = {
      id: generateId(),
      exerciseId,
      reps,
      weight,
      isWarmup,
      rpe,
      notes,
      order: exercise.sets.length,
      createdAt: now,
    };

    const prs = PRDetector.detectPRs(exercise.name, newSet, workoutHistory);

    const updatedExercises = activeWorkout.exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: [...ex.sets, newSet], updatedAt: now }
        : ex
    );

    const updated = {
      ...activeWorkout,
      exercises: updatedExercises,
      updatedAt: now,
    };

    setActiveWorkout(updated);
    await WorkoutStorage.saveActiveWorkout(updated);

    return { prs };
  }, [activeWorkout, workoutHistory]);

  const deleteSet = useCallback(async (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;

    const now = getLocalDateTimeISO();
    const updatedExercises = activeWorkout.exercises.map(ex =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: ex.sets
              .filter(s => s.id !== setId)
              .map((s, i) => ({ ...s, order: i })),
            updatedAt: now,
          }
        : ex
    );

    const updated = {
      ...activeWorkout,
      exercises: updatedExercises,
      updatedAt: now,
    };

    setActiveWorkout(updated);
    await WorkoutStorage.saveActiveWorkout(updated);
  }, [activeWorkout]);

  const deleteExercise = useCallback(async (exerciseId: string) => {
    if (!activeWorkout) return;

    const now = getLocalDateTimeISO();
    const updated = {
      ...activeWorkout,
      exercises: activeWorkout.exercises
        .filter(e => e.id !== exerciseId)
        .map((e, i) => ({ ...e, order: i })),
      updatedAt: now,
    };

    setActiveWorkout(updated);
    await WorkoutStorage.saveActiveWorkout(updated);
  }, [activeWorkout]);

  const finishWorkout = useCallback(async () => {
    if (!activeWorkout) return;

    const now = getLocalDateTimeISO();
    const completed: Workout = {
      ...activeWorkout,
      endTime: now,
      isCompleted: true,
      updatedAt: now,
    };

    await WorkoutStorage.saveWorkout(completed);
    await WorkoutStorage.clearActiveWorkout();
    
    setActiveWorkout(null);
    const updatedHistory = [...workoutHistory, completed];
    setWorkoutHistory(updatedHistory);

    // Update leaderboard stats after completing workout
    try {
      await LeaderboardService.updateUserStats(updatedHistory);
    } catch (error) {
      console.error('Error updating leaderboard stats:', error);
    }
  }, [activeWorkout, workoutHistory]);

  const discardWorkout = useCallback(async () => {
    await WorkoutStorage.clearActiveWorkout();
    setActiveWorkout(null);
  }, []);

  const updateWorkoutNotes = useCallback(async (notes: string) => {
    if (!activeWorkout) return;

    const updated = {
      ...activeWorkout,
      notes,
      updatedAt: new Date().toISOString(),
    };

    setActiveWorkout(updated);
    await WorkoutStorage.saveActiveWorkout(updated);
  }, [activeWorkout]);

  const updateWorkoutBodyweight = useCallback(async (bodyweight: number) => {
    if (!activeWorkout) return;

    const updated = {
      ...activeWorkout,
      bodyweight,
      updatedAt: new Date().toISOString(),
    };

    setActiveWorkout(updated);
    await WorkoutStorage.saveActiveWorkout(updated);
  }, [activeWorkout]);

  const saveAsTemplate = useCallback(async (name: string) => {
    if (!activeWorkout) return;

    const now = new Date().toISOString();
    const template: WorkoutTemplate = {
      id: generateId(),
      name,
      exercises: activeWorkout.exercises.map((ex, index) => ({
        id: generateId(),
        name: ex.name,
        sets: ex.sets
          .filter(s => !s.isWarmup)
          .map((s, setIndex) => ({
            id: generateId(),
            reps: s.reps,
            weight: s.weight,
            isWarmup: false,
            order: setIndex,
          })),
        notes: ex.notes,
        order: index,
      })),
      createdAt: now,
      updatedAt: now,
    };

    console.log('Saving template:', template);
    await TemplateStorage.saveTemplate(template);
    const updatedTemplates = await TemplateStorage.getAllTemplates();
    console.log('Templates after save:', updatedTemplates.length);
    setTemplates(updatedTemplates);
  }, [activeWorkout]);

  const deleteTemplate = useCallback(async (id: string) => {
    await TemplateStorage.deleteTemplate(id);
    const updatedTemplates = await TemplateStorage.getAllTemplates();
    setTemplates(updatedTemplates);
  }, []);

  const deleteWorkout = useCallback(async (id: string) => {
    try {
      await WorkoutStorage.deleteWorkout(id);
      setWorkoutHistory(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }, []);

  const refreshWorkouts = useCallback(async () => {
    try {
      const history = await WorkoutStorage.getAllWorkouts();
      setWorkoutHistory(history);
    } catch (error) {
      console.error('Error refreshing workouts:', error);
    }
  }, []);

  return {
    activeWorkout,
    workoutHistory,
    templates,
    isLoading,
    startWorkout,
    addExercise,
    addSet,
    deleteSet,
    deleteExercise,
    finishWorkout,
    discardWorkout,
    updateWorkoutNotes,
    updateWorkoutBodyweight,
    saveAsTemplate,
    deleteTemplate,
    deleteWorkout,
    refreshWorkouts,
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
