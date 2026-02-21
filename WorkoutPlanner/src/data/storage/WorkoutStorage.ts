import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout } from '../models/Workout';
import { FirebaseSync } from './FirebaseSync';

const WORKOUTS_KEY = '@workouts';
const ACTIVE_WORKOUT_KEY = '@active_workout';

export class WorkoutStorage {
  static async saveWorkout(workout: Workout): Promise<void> {
    try {
      const workouts = await this.getAllWorkouts();
      const index = workouts.findIndex(w => w.id === workout.id);
      
      if (index >= 0) {
        workouts[index] = workout;
      } else {
        workouts.push(workout);
      }
      
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
      
      // Sync to Firebase in background
      FirebaseSync.pushWorkouts(workouts).catch(err => 
        console.error('[WorkoutStorage] Background sync failed:', err)
      );
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  }

  static async getAllWorkouts(): Promise<Workout[]> {
    try {
      const data = await AsyncStorage.getItem(WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting workouts:', error);
      return [];
    }
  }

  static async getWorkoutById(id: string): Promise<Workout | null> {
    try {
      const workouts = await this.getAllWorkouts();
      return workouts.find(w => w.id === id) || null;
    } catch (error) {
      console.error('Error getting workout by id:', error);
      return null;
    }
  }

  static async deleteWorkout(id: string): Promise<void> {
    try {
      const workouts = await this.getAllWorkouts();
      const filtered = workouts.filter(w => w.id !== id);
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
      
      // Delete from Firebase
      FirebaseSync.deleteWorkout(id).catch(err =>
        console.error('[WorkoutStorage] Firebase delete failed:', err)
      );
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }

  static async saveActiveWorkout(workout: Workout | null): Promise<void> {
    try {
      if (workout) {
        await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(workout));
      } else {
        await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
      }
    } catch (error) {
      console.error('Error saving active workout:', error);
      throw error;
    }
  }

  static async getActiveWorkout(): Promise<Workout | null> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting active workout:', error);
      return null;
    }
  }

  static async clearActiveWorkout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
    } catch (error) {
      console.error('Error clearing active workout:', error);
      throw error;
    }
  }
}
