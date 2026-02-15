import AsyncStorage from '@react-native-async-storage/async-storage';
import { NutritionEntry, NutritionGoal } from '../models/Nutrition';

const NUTRITION_ENTRIES_KEY = '@nutrition_entries';
const NUTRITION_GOALS_KEY = '@nutrition_goals';

export class NutritionStorage {
  static async saveEntry(entry: NutritionEntry): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const index = entries.findIndex(e => e.id === entry.id);
      
      if (index >= 0) {
        entries[index] = entry;
      } else {
        entries.push(entry);
      }
      
      await AsyncStorage.setItem(NUTRITION_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving nutrition entry:', error);
      throw error;
    }
  }

  static async getAllEntries(): Promise<NutritionEntry[]> {
    try {
      const data = await AsyncStorage.getItem(NUTRITION_ENTRIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting nutrition entries:', error);
      return [];
    }
  }

  static async getEntriesByDateRange(startDate: string, endDate: string): Promise<NutritionEntry[]> {
    try {
      const entries = await this.getAllEntries();
      return entries.filter(e => e.date >= startDate && e.date <= endDate);
    } catch (error) {
      console.error('Error getting entries by date range:', error);
      return [];
    }
  }

  static async getEntryByDate(date: string): Promise<NutritionEntry | null> {
    try {
      const entries = await this.getAllEntries();
      return entries.find(e => e.date === date) || null;
    } catch (error) {
      console.error('Error getting entry by date:', error);
      return null;
    }
  }

  static async deleteEntry(id: string): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const filtered = entries.filter(e => e.id !== id);
      await AsyncStorage.setItem(NUTRITION_ENTRIES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting nutrition entry:', error);
      throw error;
    }
  }

  static async saveGoals(goals: NutritionGoal): Promise<void> {
    try {
      await AsyncStorage.setItem(NUTRITION_GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
      throw error;
    }
  }

  static async getGoals(): Promise<NutritionGoal | null> {
    try {
      const data = await AsyncStorage.getItem(NUTRITION_GOALS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting nutrition goals:', error);
      return null;
    }
  }
}
