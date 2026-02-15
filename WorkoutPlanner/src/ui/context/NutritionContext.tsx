import React, { createContext, useContext, ReactNode } from 'react';
import { useNutrition } from '../hooks/useNutrition';
import { NutritionEntry, NutritionGoal } from '../../data/models/Nutrition';

interface NutritionContextValue {
  entries: NutritionEntry[];
  goals: NutritionGoal | null;
  isLoading: boolean;
  saveEntry: (date: string, calories: number, protein: number, notes?: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  saveGoals: (dailyCalories: number, dailyProtein: number) => Promise<void>;
  getEntryByDate: (date: string) => NutritionEntry | undefined;
}

const NutritionContext = createContext<NutritionContextValue | null>(null);

export function NutritionProvider({ children }: { children: ReactNode }) {
  const nutritionState = useNutrition();

  return (
    <NutritionContext.Provider value={nutritionState}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutritionContext() {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutritionContext must be used within NutritionProvider');
  }
  return context;
}
