import { useState, useEffect, useCallback } from 'react';
import { NutritionEntry, NutritionGoal } from '../../data/models/Nutrition';
import { NutritionStorage } from '../../data/storage/NutritionStorage';

export function useNutrition() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [goals, setGoals] = useState<NutritionGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [loadedEntries, loadedGoals] = await Promise.all([
        NutritionStorage.getAllEntries(),
        NutritionStorage.getGoals(),
      ]);
      setEntries(loadedEntries);
      setGoals(loadedGoals);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveEntry = useCallback(async (
    date: string,
    calories: number,
    protein: number,
    notes?: string
  ) => {
    try {
      const existingEntry = await NutritionStorage.getEntryByDate(date);
      
      const entry: NutritionEntry = {
        id: existingEntry?.id || `nutrition_${Date.now()}`,
        date,
        calories,
        protein,
        notes,
        createdAt: existingEntry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await NutritionStorage.saveEntry(entry);
      await loadData();
    } catch (error) {
      console.error('Error saving nutrition entry:', error);
      throw error;
    }
  }, [loadData]);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      await NutritionStorage.deleteEntry(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting nutrition entry:', error);
      throw error;
    }
  }, [loadData]);

  const saveGoals = useCallback(async (dailyCalories: number, dailyProtein: number) => {
    try {
      const newGoals: NutritionGoal = {
        dailyCalories,
        dailyProtein,
      };
      await NutritionStorage.saveGoals(newGoals);
      setGoals(newGoals);
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
      throw error;
    }
  }, []);

  const getEntryByDate = useCallback((date: string): NutritionEntry | undefined => {
    return entries.find(e => e.date === date);
  }, [entries]);

  return {
    entries,
    goals,
    isLoading,
    saveEntry,
    deleteEntry,
    saveGoals,
    getEntryByDate,
  };
}
