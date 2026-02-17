import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LeaderboardResponse,
  LeaderboardTimeframe,
  LeaderboardEntry,
  LeaderboardUser,
} from '../../data/models/Leaderboard';
import { LeaderboardService } from '../../domain/leaderboard/LeaderboardService';
import { LeaderboardStorage } from '../../data/storage/LeaderboardStorage';
import { LeaderboardStatsCalculator } from '../../domain/leaderboard/LeaderboardStatsCalculator';
import { Workout } from '../../data/models/Workout';

function buildLeaderboardResponse(
  allUsers: LeaderboardUser[],
  currentUserId: string,
  timeframe: LeaderboardTimeframe,
  filteredWorkouts: Workout[]
): LeaderboardResponse {
  // Recalculate score for the current user based on the selected timeframe
  const stats = LeaderboardStatsCalculator.calculateUserStats(filteredWorkouts);
  const score = LeaderboardStatsCalculator.calculateScore(stats);

  // Merge current user's fresh data into the list
  const merged = allUsers.map(u =>
    u.userId === currentUserId ? { ...u, stats, score } : u
  );
  // If current user isn't in the list yet, include them
  if (!merged.find(u => u.userId === currentUserId)) {
    merged.push({
      userId: currentUserId,
      displayName: 'Anonymous',
      stats,
      score,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    });
  }

  const sorted = [...merged].sort((a, b) => b.score - a.score);

  const leaderboard: LeaderboardEntry[] = sorted.map((user, index) => ({
    rank: index + 1,
    userId: user.userId,
    displayName: user.displayName,
    score: user.score,
    stats: user.stats,
    isCurrentUser: user.userId === currentUserId,
  }));

  const currentUserRank = leaderboard.findIndex(e => e.userId === currentUserId) + 1;

  return {
    timeframe,
    leaderboard,
    currentUserRank: currentUserRank > 0 ? currentUserRank : null,
    totalUsers: leaderboard.length,
  };
}

export function useLeaderboard(workouts: Workout[]) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('weekly');
  const [displayName, setDisplayNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hold the latest snapshot from Firestore (or local cache) so we can
  // re-sort/filter it instantly whenever the user switches timeframes.
  const allUsersRef = useRef<LeaderboardUser[]>([]);
  const currentUserIdRef = useRef<string>('');

  // ── Load display name ────────────────────────────────────────────────────
  const loadDisplayName = useCallback(async () => {
    try {
      const name = await LeaderboardService.getDisplayName();
      setDisplayNameState(name);
    } catch (err) {
      console.error('Error loading display name:', err);
    }
  }, []);

  // ── Recompute the response from the cached user list ─────────────────────
  const recompute = useCallback(
    (users: LeaderboardUser[], tf: LeaderboardTimeframe) => {
      if (!currentUserIdRef.current) return;
      const filtered = LeaderboardStatsCalculator.filterWorkoutsByTimeframe(workouts, tf);
      const response = buildLeaderboardResponse(
        users,
        currentUserIdRef.current,
        tf,
        filtered
      );
      setLeaderboard(response);
    },
    [workouts]
  );

  // ── Push the current user's fresh stats to storage/Firestore ─────────────
  const pushCurrentUserStats = useCallback(async () => {
    try {
      await LeaderboardService.updateUserStats(workouts);
    } catch (err) {
      console.error('[Leaderboard] Failed to push user stats:', err);
    }
  }, [workouts]);

  // ── Subscribe to the real-time leaderboard ───────────────────────────────
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ensure current user ID is resolved first
        currentUserIdRef.current = await LeaderboardStorage.getUserId();

        // Push our latest stats so other users see us
        await pushCurrentUserStats();

        // Subscribe to live updates
        unsubscribe = LeaderboardStorage.subscribeToLeaderboard(
          users => {
            allUsersRef.current = users;
            recompute(users, timeframe);
            setIsLoading(false);
          },
          err => {
            setError('Failed to load leaderboard. Showing local data.');
            setIsLoading(false);
          }
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialise leaderboard');
        setIsLoading(false);
      }
    };

    init();
    return () => unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  // ── Re-sort when timeframe changes (no network call needed) ─────────────
  useEffect(() => {
    if (allUsersRef.current.length > 0) {
      recompute(allUsersRef.current, timeframe);
    }
  }, [timeframe, recompute]);

  // ── Re-push stats when workouts change ──────────────────────────────────
  useEffect(() => {
    if (currentUserIdRef.current) {
      pushCurrentUserStats().then(() => {
        recompute(allUsersRef.current, timeframe);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workouts]);

  // ── Public API ────────────────────────────────────────────────────────────
  const updateDisplayName = useCallback(
    async (name: string) => {
      await LeaderboardService.setDisplayName(name);
      setDisplayNameState(name);
      // Re-push stats so the new name shows on the leaderboard immediately
      await pushCurrentUserStats();
    },
    [pushCurrentUserStats]
  );

  const changeTimeframe = useCallback((newTimeframe: LeaderboardTimeframe) => {
    setTimeframe(newTimeframe);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      await pushCurrentUserStats();
      const users = await LeaderboardStorage.getAllLeaderboardData();
      allUsersRef.current = users;
      recompute(users, timeframe);
    } catch (err) {
      setError('Refresh failed');
    } finally {
      setIsLoading(false);
    }
  }, [pushCurrentUserStats, recompute, timeframe]);

  useEffect(() => {
    loadDisplayName();
  }, [loadDisplayName]);

  return {
    leaderboard,
    timeframe,
    displayName,
    isLoading,
    error,
    updateDisplayName,
    changeTimeframe,
    refresh,
  };
}
