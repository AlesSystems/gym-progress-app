import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Workout, Exercise, Set } from '../../data/models/Workout';
import { WorkoutTemplate, TemplateExercise } from '../../data/models/WorkoutTemplate';
import { WorkoutStorage } from '../../data/storage/WorkoutStorage';
import { TemplateStorage } from '../../data/storage/TemplateStorage';
import { PRDetector } from '../../domain/workout/PRDetector';

export function useActiveWorkout() {
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeWorkout && !activeWorkout.isCompleted) {
      const timer = setInterval(() => {
        WorkoutStorage.saveActiveWorkout(activeWorkout);
      }, 30000);
      return () => clearInterval(timer);
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
      const [active, history, templateList] = await Promise.all([
        WorkoutStorage.getActiveWorkout(),
        WorkoutStorage.getAllWorkouts(),
        TemplateStorage.getAllTemplates(),
      ]);
      setActiveWorkout(active);
      setWorkoutHistory(history);
      setTemplates(templateList);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startWorkout = useCallback(async (templateId?: string) => {
    const now = new Date().toISOString();
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

    const now = new Date().toISOString();
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

    const now = new Date().toISOString();
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

    const now = new Date().toISOString();
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

    const now = new Date().toISOString();
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

    const now = new Date().toISOString();
    const completed: Workout = {
      ...activeWorkout,
      endTime: now,
      isCompleted: true,
      updatedAt: now,
    };

    await WorkoutStorage.saveWorkout(completed);
    await WorkoutStorage.clearActiveWorkout();
    
    setActiveWorkout(null);
    setWorkoutHistory(prev => [...prev, completed]);
  }, [activeWorkout]);

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

    await TemplateStorage.saveTemplate(template);
    const updatedTemplates = await TemplateStorage.getAllTemplates();
    setTemplates(updatedTemplates);
  }, [activeWorkout]);

  const deleteTemplate = useCallback(async (id: string) => {
    await TemplateStorage.deleteTemplate(id);
    const updatedTemplates = await TemplateStorage.getAllTemplates();
    setTemplates(updatedTemplates);
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
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
