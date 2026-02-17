# Leaderboard Feature - Developer Guide

## Architecture Overview

The leaderboard feature follows a clean architecture pattern with clear separation between layers:

```
UI Layer (screens, hooks)
    ↓
Domain Layer (business logic, calculations)
    ↓
Data Layer (models, storage)
```

## Directory Structure

```
src/
├── data/
│   ├── models/
│   │   └── Leaderboard.ts          # Type definitions
│   └── storage/
│       └── LeaderboardStorage.ts    # AsyncStorage wrapper
├── domain/
│   └── leaderboard/
│       ├── LeaderboardStatsCalculator.ts  # Stat calculations
│       ├── LeaderboardService.ts          # Business logic
│       └── index.ts
└── ui/
    ├── hooks/
    │   └── useLeaderboard.ts        # React hook
    └── screens/
        └── LeaderboardScreen.tsx     # UI component
```

## Key Components

### 1. LeaderboardStorage (Data Layer)

**Purpose**: Manage persistence of leaderboard data

**Key Methods**:
```typescript
static async getUserId(): Promise<string>
static async getDisplayName(): Promise<string | null>
static async setDisplayName(name: string): Promise<void>
static async saveUserData(user: LeaderboardUser): Promise<void>
static async getAllLeaderboardData(): Promise<LeaderboardUser[]>
```

**Storage Keys**:
- `@leaderboard_user_id`: Anonymous user identifier
- `@leaderboard_display_name`: User's chosen display name
- `@leaderboard_data`: Array of all leaderboard entries

### 2. LeaderboardStatsCalculator (Domain Layer)

**Purpose**: Calculate statistics from workout data

**Key Methods**:
```typescript
static calculateScore(stats: UserLeaderboardStats): number
static calculateTotalWeightLifted(workouts: Workout[]): number
static calculateTotalWorkoutTime(workouts: Workout[]): number
static calculateCurrentStreak(workouts: Workout[]): number
static calculateLongestStreak(workouts: Workout[]): number
static countPersonalRecords(workouts: Workout[]): number
static calculateUserStats(workouts: Workout[]): UserLeaderboardStats
static filterWorkoutsByTimeframe(workouts: Workout[], timeframe): Workout[]
```

**Scoring Formula**:
```typescript
score = (workouts * 10) + 
        (totalWeight / 1000) + 
        (streak * 50) + 
        (totalTime / 3600000) + 
        (PRs * 5)
```

### 3. LeaderboardService (Domain Layer)

**Purpose**: High-level business logic and orchestration

**Key Methods**:
```typescript
static async updateUserStats(workouts: Workout[]): Promise<void>
static async getLeaderboard(timeframe, workouts): Promise<LeaderboardResponse>
static async setDisplayName(name: string): Promise<void>
static async getDisplayName(): Promise<string | null>
static async hasDisplayName(): Promise<boolean>
static async generateSampleData(): Promise<void>
```

### 4. useLeaderboard Hook (UI Layer)

**Purpose**: React hook for leaderboard state management

**Returns**:
```typescript
{
  leaderboard: LeaderboardResponse | null
  timeframe: LeaderboardTimeframe
  displayName: string | null
  isLoading: boolean
  error: string | null
  updateDisplayName: (name: string) => Promise<void>
  changeTimeframe: (timeframe: LeaderboardTimeframe) => void
  refresh: () => Promise<void>
  generateSampleData: () => Promise<void>
}
```

## Data Models

### LeaderboardUser
```typescript
interface LeaderboardUser {
  userId: string;              // Anonymous ID
  displayName: string;         // User-chosen name
  stats: UserLeaderboardStats; // Calculated stats
  score: number;              // Composite score
  createdAt: number;          // Timestamp
  lastUpdated: number;        // Timestamp
}
```

### UserLeaderboardStats
```typescript
interface UserLeaderboardStats {
  totalWorkouts: number;
  totalWeightLifted: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkoutTime: number;    // milliseconds
  personalRecords: number;
}
```

### LeaderboardEntry
```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  stats: UserLeaderboardStats;
  isCurrentUser: boolean;
}
```

## Integration Points

### 1. Workout Completion Hook

File: `src/ui/hooks/useActiveWorkout.ts`

```typescript
const finishWorkout = useCallback(async () => {
  // ... existing code ...
  
  // Update leaderboard stats after completing workout
  try {
    await LeaderboardService.updateUserStats(updatedHistory);
  } catch (error) {
    console.error('Error updating leaderboard stats:', error);
  }
}, [activeWorkout, workoutHistory]);
```

### 2. Navigation

File: `App.tsx`

```typescript
import { LeaderboardScreen } from './src/ui/screens/LeaderboardScreen';

// In Stack.Navigator:
<Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
```

### 3. Dashboard Button

File: `src/ui/screens/DashboardScreen.tsx`

```tsx
<TouchableOpacity
  style={[styles.actionButton, styles.leaderboardButton]}
  onPress={() => navigation.navigate('Leaderboard')}
>
  <Text style={styles.actionIcon}>🏆</Text>
  <Text style={styles.actionButtonText}>Leaderboard</Text>
</TouchableOpacity>
```

## Extending the Feature

### Adding a New Stat

1. **Update UserLeaderboardStats**:
```typescript
interface UserLeaderboardStats {
  // ... existing stats
  averageIntensity: number;  // NEW
}
```

2. **Add Calculation Method**:
```typescript
// In LeaderboardStatsCalculator
static calculateAverageIntensity(workouts: Workout[]): number {
  // Your calculation logic
  return intensity;
}
```

3. **Update calculateUserStats**:
```typescript
static calculateUserStats(workouts: Workout[]): UserLeaderboardStats {
  return {
    // ... existing stats
    averageIntensity: this.calculateAverageIntensity(workouts),
  };
}
```

4. **Update Scoring Formula** (optional):
```typescript
static calculateScore(stats: UserLeaderboardStats): number {
  const intensityScore = stats.averageIntensity * 2;
  return workoutScore + weightScore + ... + intensityScore;
}
```

5. **Display in UI**:
```tsx
<Text>Intensity: {stats.averageIntensity.toFixed(1)}</Text>
```

### Adding Backend Integration

#### Step 1: Create API Service

```typescript
// src/domain/leaderboard/LeaderboardAPI.ts
export class LeaderboardAPI {
  private static BASE_URL = 'https://api.yourapp.com';

  static async syncUserData(user: LeaderboardUser): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/leaderboard/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    
    if (!response.ok) throw new Error('Failed to sync user data');
  }

  static async getLeaderboard(
    timeframe: LeaderboardTimeframe
  ): Promise<LeaderboardResponse> {
    const response = await fetch(
      `${this.BASE_URL}/leaderboard?timeframe=${timeframe}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  }
}
```

#### Step 2: Update LeaderboardService

```typescript
static async updateUserStats(workouts: Workout[]): Promise<void> {
  const userId = await LeaderboardStorage.getUserId();
  const displayName = (await LeaderboardStorage.getDisplayName()) || 'Anonymous';
  
  const stats = LeaderboardStatsCalculator.calculateUserStats(workouts);
  const score = LeaderboardStatsCalculator.calculateScore(stats);
  
  const userData: LeaderboardUser = {
    userId,
    displayName,
    stats,
    score,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
  
  // Save locally first
  await LeaderboardStorage.saveUserData(userData);
  
  // NEW: Sync with backend
  try {
    await LeaderboardAPI.syncUserData(userData);
  } catch (error) {
    console.error('Failed to sync with backend:', error);
    // Continue with local data
  }
}

static async getLeaderboard(
  timeframe: LeaderboardTimeframe,
  workouts: Workout[]
): Promise<LeaderboardResponse> {
  try {
    // NEW: Fetch from backend
    return await LeaderboardAPI.getLeaderboard(timeframe);
  } catch (error) {
    console.error('Failed to fetch from backend, using local:', error);
    // Fallback to local data
    return this.getLocalLeaderboard(timeframe, workouts);
  }
}

private static async getLocalLeaderboard(
  timeframe: LeaderboardTimeframe,
  workouts: Workout[]
): Promise<LeaderboardResponse> {
  // Existing implementation
}
```

#### Step 3: Add Real-time Updates

```typescript
// src/domain/leaderboard/LeaderboardRealtime.ts
import { io, Socket } from 'socket.io-client';

export class LeaderboardRealtime {
  private static socket: Socket | null = null;

  static connect(userId: string): void {
    this.socket = io('https://api.yourapp.com', {
      query: { userId },
    });

    this.socket.on('leaderboard-update', (data: LeaderboardResponse) => {
      // Emit event or update state
      console.log('Leaderboard updated:', data);
    });
  }

  static disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  static subscribe(timeframe: LeaderboardTimeframe): void {
    this.socket?.emit('subscribe', { timeframe });
  }
}
```

### Adding Firebase/Supabase

#### Firebase Setup

```typescript
// src/domain/leaderboard/LeaderboardFirebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, query, orderByChild } from 'firebase/database';

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export class LeaderboardFirebase {
  static async saveUser(user: LeaderboardUser): Promise<void> {
    const userRef = ref(db, `leaderboard/users/${user.userId}`);
    await set(userRef, user);
  }

  static async getLeaderboard(
    timeframe: LeaderboardTimeframe
  ): Promise<LeaderboardUser[]> {
    const usersRef = ref(db, `leaderboard/users`);
    const usersQuery = query(usersRef, orderByChild('score'));
    const snapshot = await get(usersQuery);
    
    const users: LeaderboardUser[] = [];
    snapshot.forEach((child) => {
      users.push(child.val());
    });
    
    return users.reverse(); // Highest score first
  }
}
```

#### Supabase Setup

```typescript
// src/domain/leaderboard/LeaderboardSupabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

export class LeaderboardSupabase {
  static async saveUser(user: LeaderboardUser): Promise<void> {
    const { error } = await supabase
      .from('leaderboard')
      .upsert(user, { onConflict: 'userId' });
    
    if (error) throw error;
  }

  static async getLeaderboard(
    timeframe: LeaderboardTimeframe
  ): Promise<LeaderboardUser[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data;
  }
}
```

## Testing

### Unit Tests

```typescript
// LeaderboardStatsCalculator.test.ts
describe('LeaderboardStatsCalculator', () => {
  describe('calculateScore', () => {
    it('should calculate score correctly', () => {
      const stats: UserLeaderboardStats = {
        totalWorkouts: 10,
        totalWeightLifted: 50000,
        currentStreak: 5,
        longestStreak: 10,
        totalWorkoutTime: 3600000,
        personalRecords: 8,
      };
      
      const expected = (10 * 10) + (50000 / 1000) + (5 * 50) + (3600000 / 3600000) + (8 * 5);
      expect(LeaderboardStatsCalculator.calculateScore(stats)).toBe(expected);
    });
  });

  describe('calculateCurrentStreak', () => {
    it('should return 0 if no workouts', () => {
      expect(LeaderboardStatsCalculator.calculateCurrentStreak([])).toBe(0);
    });

    it('should calculate consecutive days correctly', () => {
      const workouts = [
        { date: '2026-02-17', isCompleted: true },
        { date: '2026-02-16', isCompleted: true },
        { date: '2026-02-15', isCompleted: true },
      ];
      
      // Assuming today is 2026-02-17
      expect(LeaderboardStatsCalculator.calculateCurrentStreak(workouts)).toBe(3);
    });
  });
});
```

### Integration Tests

```typescript
// LeaderboardService.test.ts
describe('LeaderboardService', () => {
  beforeEach(async () => {
    await LeaderboardStorage.clearAllData();
  });

  it('should update user stats after workout completion', async () => {
    const workouts: Workout[] = [
      // Mock workout data
    ];
    
    await LeaderboardService.updateUserStats(workouts);
    
    const userData = await LeaderboardStorage.getCurrentUserData();
    expect(userData).toBeDefined();
    expect(userData?.stats.totalWorkouts).toBe(workouts.length);
  });

  it('should generate leaderboard with correct rankings', async () => {
    const workouts: Workout[] = [];
    await LeaderboardService.generateSampleData();
    
    const leaderboard = await LeaderboardService.getLeaderboard('all-time', workouts);
    
    expect(leaderboard.leaderboard.length).toBeGreaterThan(0);
    expect(leaderboard.leaderboard[0].rank).toBe(1);
    expect(leaderboard.leaderboard[0].score).toBeGreaterThanOrEqual(
      leaderboard.leaderboard[1].score
    );
  });
});
```

## Performance Optimization

### 1. Memoization

```typescript
// Cache calculated stats
const memoizedStats = useMemo(
  () => LeaderboardStatsCalculator.calculateUserStats(workouts),
  [workouts]
);
```

### 2. Debouncing

```typescript
// Debounce leaderboard refresh
const debouncedRefresh = useMemo(
  () => debounce(refresh, 1000),
  [refresh]
);
```

### 3. Pagination

```typescript
static async getLeaderboard(
  timeframe: LeaderboardTimeframe,
  workouts: Workout[],
  page: number = 1,
  pageSize: number = 20
): Promise<LeaderboardResponse> {
  const allUsers = await this.getAllLeaderboardData();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    leaderboard: allUsers.slice(start, end),
    // ... other fields
  };
}
```

## Security Considerations

### Input Validation

```typescript
static async setDisplayName(name: string): Promise<void> {
  // Length check
  if (!name || name.length < 2 || name.length > 20) {
    throw new Error('Display name must be between 2 and 20 characters');
  }

  // Character validation
  const validNameRegex = /^[a-zA-Z0-9_\s]+$/;
  if (!validNameRegex.test(name)) {
    throw new Error('Display name can only contain letters, numbers, spaces, and underscores');
  }

  // Profanity filter (if needed)
  if (containsProfanity(name)) {
    throw new Error('Display name contains inappropriate content');
  }

  await LeaderboardStorage.setDisplayName(name);
}
```

### Rate Limiting

```typescript
// Client-side rate limiting
class RateLimiter {
  private lastUpdate: number = 0;
  private readonly cooldown: number = 5000; // 5 seconds

  canUpdate(): boolean {
    const now = Date.now();
    if (now - this.lastUpdate < this.cooldown) {
      return false;
    }
    this.lastUpdate = now;
    return true;
  }
}

const rateLimiter = new RateLimiter();

static async updateUserStats(workouts: Workout[]): Promise<void> {
  if (!rateLimiter.canUpdate()) {
    console.log('Rate limit exceeded, skipping update');
    return;
  }
  
  // Continue with update
}
```

## Troubleshooting

### Common Issues

1. **Stats not updating**: Check that `finishWorkout()` is calling `LeaderboardService.updateUserStats()`
2. **Scores seem wrong**: Verify scoring formula and unit calculations
3. **Streaks incorrect**: Check date parsing and timezone handling
4. **Display name validation failing**: Review regex pattern

### Debug Mode

```typescript
// Enable debug logging
const DEBUG = __DEV__;

static async updateUserStats(workouts: Workout[]): Promise<void> {
  if (DEBUG) console.log('Updating stats for', workouts.length, 'workouts');
  
  const stats = LeaderboardStatsCalculator.calculateUserStats(workouts);
  if (DEBUG) console.log('Calculated stats:', stats);
  
  const score = LeaderboardStatsCalculator.calculateScore(stats);
  if (DEBUG) console.log('Calculated score:', score);
  
  // ... continue
}
```

## Best Practices

1. **Always validate user input** (display names, etc.)
2. **Handle errors gracefully** (network failures, storage errors)
3. **Cache calculated values** when possible
4. **Use TypeScript strictly** for type safety
5. **Test edge cases** (empty data, single workout, etc.)
6. **Document scoring changes** in git commits
7. **Consider backwards compatibility** when modifying data structures
8. **Log errors** for debugging but don't expose sensitive data

## Conclusion

The leaderboard feature is designed to be:
- **Modular**: Easy to modify individual components
- **Testable**: Clear separation enables unit testing
- **Extensible**: Add new stats or features easily
- **Maintainable**: Well-documented and type-safe
- **Scalable**: Ready for backend integration

For questions or contributions, refer to the implementation summary and type definitions.
