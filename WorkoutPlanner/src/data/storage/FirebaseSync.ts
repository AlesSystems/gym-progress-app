import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, getCurrentUser, isFirebaseConfigured } from '../../lib/firebase';
import { Workout } from '../models/Workout';
import { WorkoutTemplate } from '../models/WorkoutTemplate';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_STATUS_KEY = '@firebase_sync_status';
const LAST_SYNC_KEY = '@last_sync_timestamp';

interface SyncStatus {
  lastSync: number;
  workoutsCount: number;
  templatesCount: number;
}

/**
 * FirebaseSync: Handles syncing user data between AsyncStorage and Firestore
 * Uses Firebase Auth user ID as the document identifier
 */
export class FirebaseSync {
  // ────────────────────────────────────────────────── Collection Paths ──
  
  private static getUserCollection(subCollection: string): string {
    const user = getCurrentUser();
    if (!user) throw new Error('No authenticated user');
    return `users/${user.uid}/${subCollection}`;
  }

  // ────────────────────────────────────────────────── Sync Status ──

  static async getSyncStatus(): Promise<SyncStatus | null> {
    try {
      const data = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[FirebaseSync] Error getting sync status:', error);
      return null;
    }
  }

  static async updateSyncStatus(status: Partial<SyncStatus>): Promise<void> {
    try {
      const current = (await this.getSyncStatus()) || {
        lastSync: 0,
        workoutsCount: 0,
        templatesCount: 0,
      };
      const updated = { ...current, ...status, lastSync: Date.now() };
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
      await AsyncStorage.setItem(LAST_SYNC_KEY, updated.lastSync.toString());
    } catch (error) {
      console.error('[FirebaseSync] Error updating sync status:', error);
    }
  }

  // ────────────────────────────────────────────────── Workouts Sync ──

  /**
   * Push all local workouts to Firestore
   */
  static async pushWorkouts(workouts: Workout[]): Promise<void> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      console.warn('[FirebaseSync] Cannot push workouts - not configured or authenticated');
      return;
    }

    try {
      const collectionPath = this.getUserCollection('workouts');
      const batch = writeBatch(db);

      workouts.forEach((workout) => {
        const docRef = doc(db, collectionPath, workout.id);
        batch.set(docRef, workout);
      });

      await batch.commit();
      console.log(`[FirebaseSync] Pushed ${workouts.length} workouts to Firestore`);
      
      await this.updateSyncStatus({ workoutsCount: workouts.length });
    } catch (error) {
      console.error('[FirebaseSync] Error pushing workouts:', error);
      throw error;
    }
  }

  /**
   * Pull all workouts from Firestore and merge with local data
   */
  static async pullWorkouts(): Promise<Workout[]> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      console.warn('[FirebaseSync] Cannot pull workouts - not configured or authenticated');
      return [];
    }

    try {
      const collectionPath = this.getUserCollection('workouts');
      const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const workouts = snapshot.docs.map(doc => doc.data() as Workout);
      console.log(`[FirebaseSync] Pulled ${workouts.length} workouts from Firestore`);
      
      return workouts;
    } catch (error) {
      console.error('[FirebaseSync] Error pulling workouts:', error);
      throw error;
    }
  }

  /**
   * Sync workouts: merge local and remote data
   */
  static async syncWorkouts(localWorkouts: Workout[]): Promise<Workout[]> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      return localWorkouts;
    }

    try {
      // Pull remote workouts
      const remoteWorkouts = await this.pullWorkouts();
      
      // Merge: use a Map to deduplicate by ID, preferring newer updatedAt
      const workoutMap = new Map<string, Workout>();
      
      [...remoteWorkouts, ...localWorkouts].forEach(workout => {
        const existing = workoutMap.get(workout.id);
        if (!existing || new Date(workout.updatedAt) > new Date(existing.updatedAt)) {
          workoutMap.set(workout.id, workout);
        }
      });

      const mergedWorkouts = Array.from(workoutMap.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Push merged data back to Firestore
      await this.pushWorkouts(mergedWorkouts);

      return mergedWorkouts;
    } catch (error) {
      console.error('[FirebaseSync] Error syncing workouts:', error);
      return localWorkouts;
    }
  }

  /**
   * Delete a workout from Firestore
   */
  static async deleteWorkout(workoutId: string): Promise<void> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      return;
    }

    try {
      const collectionPath = this.getUserCollection('workouts');
      await deleteDoc(doc(db, collectionPath, workoutId));
      console.log(`[FirebaseSync] Deleted workout ${workoutId} from Firestore`);
    } catch (error) {
      console.error('[FirebaseSync] Error deleting workout:', error);
    }
  }

  // ────────────────────────────────────────────────── Templates Sync ──

  /**
   * Push all local templates to Firestore
   */
  static async pushTemplates(templates: WorkoutTemplate[]): Promise<void> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      console.warn('[FirebaseSync] Cannot push templates - not configured or authenticated');
      return;
    }

    try {
      const collectionPath = this.getUserCollection('templates');
      const batch = writeBatch(db);

      templates.forEach((template) => {
        const docRef = doc(db, collectionPath, template.id);
        batch.set(docRef, template);
      });

      await batch.commit();
      console.log(`[FirebaseSync] Pushed ${templates.length} templates to Firestore`);
      
      await this.updateSyncStatus({ templatesCount: templates.length });
    } catch (error) {
      console.error('[FirebaseSync] Error pushing templates:', error);
      throw error;
    }
  }

  /**
   * Pull all templates from Firestore
   */
  static async pullTemplates(): Promise<WorkoutTemplate[]> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      console.warn('[FirebaseSync] Cannot pull templates - not configured or authenticated');
      return [];
    }

    try {
      const collectionPath = this.getUserCollection('templates');
      const snapshot = await getDocs(collection(db, collectionPath));
      
      const templates = snapshot.docs.map(doc => doc.data() as WorkoutTemplate);
      console.log(`[FirebaseSync] Pulled ${templates.length} templates from Firestore`);
      
      return templates;
    } catch (error) {
      console.error('[FirebaseSync] Error pulling templates:', error);
      throw error;
    }
  }

  /**
   * Sync templates: merge local and remote data
   */
  static async syncTemplates(localTemplates: WorkoutTemplate[]): Promise<WorkoutTemplate[]> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      return localTemplates;
    }

    try {
      // Pull remote templates
      const remoteTemplates = await this.pullTemplates();
      
      // Merge: use a Map to deduplicate by ID, preferring newer updatedAt
      const templateMap = new Map<string, WorkoutTemplate>();
      
      [...remoteTemplates, ...localTemplates].forEach(template => {
        const existing = templateMap.get(template.id);
        if (!existing || new Date(template.updatedAt) > new Date(existing.updatedAt)) {
          templateMap.set(template.id, template);
        }
      });

      const mergedTemplates = Array.from(templateMap.values());

      // Push merged data back to Firestore
      await this.pushTemplates(mergedTemplates);

      return mergedTemplates;
    } catch (error) {
      console.error('[FirebaseSync] Error syncing templates:', error);
      return localTemplates;
    }
  }

  /**
   * Delete a template from Firestore
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      return;
    }

    try {
      const collectionPath = this.getUserCollection('templates');
      await deleteDoc(doc(db, collectionPath, templateId));
      console.log(`[FirebaseSync] Deleted template ${templateId} from Firestore`);
    } catch (error) {
      console.error('[FirebaseSync] Error deleting template:', error);
    }
  }

  // ────────────────────────────────────────────────── Other Data Sync ──

  /**
   * Sync other AsyncStorage data (nutrition, weight, settings, etc.)
   */
  static async syncOtherData(): Promise<void> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      return;
    }

    try {
      const user = getCurrentUser()!;
      const userDocRef = doc(db, 'users', user.uid);

      // Get all relevant AsyncStorage keys
      const keys = [
        '@nutrition_entries',
        '@weight_entries', 
        '@settings',
        '@leaderboard_display_name',
      ];

      const dataToSync: Record<string, any> = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          dataToSync[key] = value;
        }
      }

      // Store all additional data in user document
      await setDoc(userDocRef, {
        additionalData: dataToSync,
        lastSync: Date.now(),
      }, { merge: true });

      console.log('[FirebaseSync] Synced additional data to Firestore');
    } catch (error) {
      console.error('[FirebaseSync] Error syncing other data:', error);
    }
  }

  /**
   * Pull other data from Firestore
   */
  static async pullOtherData(): Promise<void> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      return;
    }

    try {
      const user = getCurrentUser()!;
      const userDocRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userDocRef);

      if (!snapshot.exists()) {
        console.log('[FirebaseSync] No user document found in Firestore');
        return;
      }

      const data = snapshot.data();
      const additionalData = data?.additionalData as Record<string, string> | undefined;

      if (!additionalData) {
        return;
      }

      // Restore data to AsyncStorage (only if not already present locally)
      for (const [key, value] of Object.entries(additionalData)) {
        const localValue = await AsyncStorage.getItem(key);
        if (!localValue) {
          await AsyncStorage.setItem(key, value);
          console.log(`[FirebaseSync] Restored ${key} from Firestore`);
        }
      }
    } catch (error) {
      console.error('[FirebaseSync] Error pulling other data:', error);
    }
  }

  // ────────────────────────────────────────────────── Full Sync ──

  /**
   * Perform a full sync of all data
   */
  static async performFullSync(
    localWorkouts: Workout[],
    localTemplates: WorkoutTemplate[]
  ): Promise<{ workouts: Workout[]; templates: WorkoutTemplate[] }> {
    if (!isFirebaseConfigured() || !getCurrentUser()) {
      console.warn('[FirebaseSync] Skipping full sync - Firebase not configured');
      return { workouts: localWorkouts, templates: localTemplates };
    }

    console.log('[FirebaseSync] Starting full sync...');

    try {
      // Sync workouts and templates in parallel
      const [workouts, templates] = await Promise.all([
        this.syncWorkouts(localWorkouts),
        this.syncTemplates(localTemplates),
      ]);

      // Sync other data
      await this.syncOtherData();
      await this.pullOtherData();

      console.log('[FirebaseSync] Full sync completed successfully');
      
      return { workouts, templates };
    } catch (error) {
      console.error('[FirebaseSync] Error during full sync:', error);
      return { workouts: localWorkouts, templates: localTemplates };
    }
  }
}
