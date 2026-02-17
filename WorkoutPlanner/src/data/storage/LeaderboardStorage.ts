import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { LeaderboardUser } from '../models/Leaderboard';

const USER_ID_KEY = '@leaderboard_user_id';
const DISPLAY_NAME_KEY = '@leaderboard_display_name';
const LEADERBOARD_COLLECTION = 'leaderboard';

export class LeaderboardStorage {
  // ───────────────────────────────────────────────────────── user identity ──

  static async getUserId(): Promise<string> {
    try {
      let userId = await AsyncStorage.getItem(USER_ID_KEY);
      if (!userId) {
        userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        await AsyncStorage.setItem(USER_ID_KEY, userId);
      }
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw error;
    }
  }

  static async getDisplayName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(DISPLAY_NAME_KEY);
    } catch (error) {
      console.error('Error getting display name:', error);
      return null;
    }
  }

  static async setDisplayName(name: string): Promise<void> {
    try {
      await AsyncStorage.setItem(DISPLAY_NAME_KEY, name);
    } catch (error) {
      console.error('Error setting display name:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────── user data sync ──

  /**
   * Save (upsert) a user's leaderboard entry.
   * Writes to Firestore when configured, always writes to local cache.
   */
  static async saveUserData(user: LeaderboardUser): Promise<void> {
    // Always keep a local cache so the app works offline too
    await this._saveLocalCache(user);

    if (!isFirebaseConfigured()) {
      console.warn('[Leaderboard] Firebase not configured – saving locally only');
      return;
    }

    try {
      const ref = doc(db, LEADERBOARD_COLLECTION, user.userId);
      await setDoc(ref, { ...user }, { merge: true });
    } catch (error) {
      console.error('[Leaderboard] Firestore write failed:', error);
      // Don't re-throw – local cache already has the data
    }
  }

  // ─────────────────────────────────────────────────── bulk read (one-off) ──

  /**
   * Fetch the full leaderboard once (used for initial load / manual refresh).
   * Falls back to local cache if Firestore is unavailable.
   */
  static async getAllLeaderboardData(): Promise<LeaderboardUser[]> {
    if (!isFirebaseConfigured()) {
      return this._getLocalCache();
    }

    try {
      const q = query(
        collection(db, LEADERBOARD_COLLECTION),
        orderBy('score', 'desc')
      );
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(d => d.data() as LeaderboardUser);

      // Refresh local cache with the latest cloud data
      await this._setLocalCache(users);
      return users;
    } catch (error) {
      console.error('[Leaderboard] Firestore read failed, using local cache:', error);
      return this._getLocalCache();
    }
  }

  // ──────────────────────────────────────────── real-time listener (live) ──

  /**
   * Subscribe to real-time leaderboard updates from Firestore.
   * Returns an unsubscribe function; call it when the component unmounts.
   * Falls back to a single local-cache call when Firebase is not configured.
   */
  static subscribeToLeaderboard(
    onUpdate: (users: LeaderboardUser[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!isFirebaseConfigured()) {
      // Return a no-op unsubscribe and immediately emit the local cache
      this._getLocalCache().then(onUpdate).catch(err => onError?.(err));
      return () => {};
    }

    const q = query(
      collection(db, LEADERBOARD_COLLECTION),
      orderBy('score', 'desc')
    );

    return onSnapshot(
      q,
      snapshot => {
        const users = snapshot.docs.map(d => d.data() as LeaderboardUser);
        onUpdate(users);
      },
      err => {
        console.error('[Leaderboard] Firestore snapshot error:', err);
        onError?.(err);
      }
    );
  }

  // ────────────────────────────────────────────────────── current user ──

  static async getCurrentUserData(): Promise<LeaderboardUser | null> {
    try {
      const userId = await this.getUserId();
      const allData = await this.getAllLeaderboardData();
      return allData.find(u => u.userId === userId) || null;
    } catch (error) {
      console.error('Error getting current user data:', error);
      return null;
    }
  }

  // ──────────────────────────────────────────────────── local cache helpers ──

  private static readonly _CACHE_KEY = '@leaderboard_data';

  private static async _getLocalCache(): Promise<LeaderboardUser[]> {
    try {
      const raw = await AsyncStorage.getItem(this._CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static async _setLocalCache(users: LeaderboardUser[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this._CACHE_KEY, JSON.stringify(users));
    } catch {}
  }

  private static async _saveLocalCache(user: LeaderboardUser): Promise<void> {
    const all = await this._getLocalCache();
    const idx = all.findIndex(u => u.userId === user.userId);
    if (idx >= 0) {
      all[idx] = user;
    } else {
      all.push(user);
    }
    await this._setLocalCache(all);
  }
}
