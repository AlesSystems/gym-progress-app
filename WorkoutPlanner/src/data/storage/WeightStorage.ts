import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeightEntry, WeightGoal } from '../models/WeightTracking';

const WEIGHT_ENTRIES_KEY = '@weight_entries';
const WEIGHT_GOAL_KEY = '@weight_goal';

export class WeightStorage {
  static async saveEntry(entry: WeightEntry): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const index = entries.findIndex(e => e.id === entry.id);

      if (index >= 0) {
        entries[index] = entry;
      } else {
        entries.push(entry);
      }

      await AsyncStorage.setItem(WEIGHT_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving weight entry:', error);
      throw error;
    }
  }

  static async getAllEntries(): Promise<WeightEntry[]> {
    try {
      const data = await AsyncStorage.getItem(WEIGHT_ENTRIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting weight entries:', error);
      return [];
    }
  }

  static async getEntryByDate(date: string): Promise<WeightEntry | null> {
    try {
      const entries = await this.getAllEntries();
      return entries.find(e => e.date === date) || null;
    } catch (error) {
      console.error('Error getting weight entry by date:', error);
      return null;
    }
  }

  static async deleteEntry(id: string): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const filtered = entries.filter(e => e.id !== id);
      await AsyncStorage.setItem(WEIGHT_ENTRIES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      throw error;
    }
  }

  static async saveGoal(goal: WeightGoal): Promise<void> {
    try {
      await AsyncStorage.setItem(WEIGHT_GOAL_KEY, JSON.stringify(goal));
    } catch (error) {
      console.error('Error saving weight goal:', error);
      throw error;
    }
  }

  static async getGoal(): Promise<WeightGoal | null> {
    try {
      const data = await AsyncStorage.getItem(WEIGHT_GOAL_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting weight goal:', error);
      return null;
    }
  }
}
