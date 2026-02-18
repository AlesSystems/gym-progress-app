import { useState, useEffect, useCallback, useMemo } from 'react';
import { WeightEntry, WeightGoal, WeightStats, WeightUnit } from '../../data/models/WeightTracking';
import { WeightStorage } from '../../data/storage/WeightStorage';
import { WeightCalculator } from '../../domain/weight/WeightCalculator';
import { generateUUID } from '../../utils/uuid';

export type TimeRange = '1w' | '1m' | '3m' | 'all';

export function useWeightTracking() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const displayUnit: WeightUnit = goal?.unit || 'lbs';

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [loadedEntries, loadedGoal] = await Promise.all([
        WeightStorage.getAllEntries(),
        WeightStorage.getGoal(),
      ]);
      const sorted = loadedEntries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setEntries(sorted);
      setGoal(loadedGoal);
    } catch (error) {
      console.error('Error loading weight data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats: WeightStats | null = useMemo(
    () => WeightCalculator.calculateStats(entries, displayUnit),
    [entries, displayUnit]
  );

  const addEntry = useCallback(async (
    weight: number,
    unit: WeightUnit,
    date: string,
    time?: string,
    notes?: string
  ) => {
    const now = new Date().toISOString();
    const entry: WeightEntry = {
      id: generateUUID(),
      weight,
      unit,
      date,
      time,
      notes,
      createdAt: now,
      updatedAt: now,
    };
    await WeightStorage.saveEntry(entry);
    await loadData();
  }, [loadData]);

  const updateEntry = useCallback(async (
    id: string,
    weight: number,
    unit: WeightUnit,
    date: string,
    time?: string,
    notes?: string
  ) => {
    const existing = entries.find(e => e.id === id);
    if (!existing) return;

    const updated: WeightEntry = {
      ...existing,
      weight,
      unit,
      date,
      time,
      notes,
      updatedAt: new Date().toISOString(),
    };
    await WeightStorage.saveEntry(updated);
    await loadData();
  }, [entries, loadData]);

  const deleteEntry = useCallback(async (id: string) => {
    await WeightStorage.deleteEntry(id);
    await loadData();
  }, [loadData]);

  const saveGoal = useCallback(async (newGoal: WeightGoal) => {
    await WeightStorage.saveGoal(newGoal);
    setGoal(newGoal);
  }, []);

  const getEntriesForRange = useCallback((range: TimeRange): WeightEntry[] => {
    if (range === 'all') return entries;

    const now = new Date();
    let cutoff: Date;
    switch (range) {
      case '1w':
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3m':
        cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
    }

    return entries.filter(e => new Date(e.date) >= cutoff);
  }, [entries]);

  return {
    entries,
    goal,
    stats,
    isLoading,
    displayUnit,
    addEntry,
    updateEntry,
    deleteEntry,
    saveGoal,
    getEntriesForRange,
  };
}
