# Data Model

## Overview
This document defines the core data structures, relationships, and storage patterns for the Workout Planner app.

---

## Core Entities

### 1. Workout

A workout represents a single gym session on a specific date.

```typescript
interface Workout {
  id: string;                    // UUID v4
  date: string;                  // ISO 8601 format (e.g., "2026-02-05T14:30:00.000Z")
  startTime?: string;            // ISO 8601 - when workout started
  endTime?: string;              // ISO 8601 - when workout completed
  exercises: Exercise[];         // Ordered list of exercises performed
  notes?: string;                // Optional session notes
  bodyweight?: number;           // Optional bodyweight in kg or lbs
  isCompleted: boolean;          // false = in progress, true = finished
  createdAt: string;             // ISO 8601 - creation timestamp
  updatedAt: string;             // ISO 8601 - last modification
}
```

**Validation Rules:**
- `id` must be unique
- `date` must be valid ISO 8601 string
- `exercises` can be empty array (for abandoned workouts)
- `endTime` must be after `startTime` if both present

**Indexes (for future SQLite):**
- Primary: `id`
- Secondary: `date` (for chronological queries)
- Secondary: `isCompleted` (for filtering active workouts)

---

### 2. Exercise

An exercise represents a specific movement performed during a workout (e.g., "Bench Press").

```typescript
interface Exercise {
  id: string;                    // UUID v4 (unique per exercise instance)
  workoutId: string;             // Foreign key to parent workout
  name: string;                  // Exercise name (e.g., "Bench Press")
  sets: Set[];                   // Ordered list of sets
  notes?: string;                // Optional exercise-specific notes (e.g., "felt heavy")
  order: number;                 // Position in workout (0-indexed)
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

**Validation Rules:**
- `name` cannot be empty string
- `workoutId` must reference existing workout
- `sets` minimum length = 0 (user can add exercise then delete sets)
- `order` must be non-negative integer

**Indexes (for future SQLite):**
- Primary: `id`
- Secondary: `workoutId` (for workout → exercises lookup)
- Secondary: `name` (for exercise-specific analytics)

**Note on Exercise Names:**
- Exercise names are stored as strings (not normalized to a master list initially)
- Fuzzy matching logic in domain layer for "Bench Press" vs "bench press"
- Future enhancement: Exercise template library with autocomplete

---

### 3. Set

A set represents a single execution of an exercise (e.g., "10 reps at 100 lbs").

```typescript
interface Set {
  id: string;                    // UUID v4
  exerciseId: string;            // Foreign key to parent exercise
  reps: number;                  // Number of repetitions
  weight: number;                // Weight in kg or lbs (determined by user preference)
  isWarmup: boolean;             // true = warmup set, false = working set
  rpe?: number;                  // Rate of Perceived Exertion (1-10 scale)
  notes?: string;                // Optional set notes (e.g., "failed last rep")
  order: number;                 // Position in exercise (0-indexed)
  createdAt: string;             // ISO 8601
}
```

**Validation Rules:**
- `reps` must be positive integer (1-999)
- `weight` must be non-negative number (0-9999)
- `rpe` must be between 1-10 if provided
- `exerciseId` must reference existing exercise
- `order` must be non-negative integer

**Special Cases:**
- `weight = 0` allowed (bodyweight exercises)
- `reps = 0` allowed (static holds measured in time, future enhancement)

**Indexes (for future SQLite):**
- Primary: `id`
- Secondary: `exerciseId` (for exercise → sets lookup)

---

## Derived Data (Not Stored)

These are calculated on-demand from raw workout data.

### Personal Record (PR)

```typescript
interface PersonalRecord {
  exerciseName: string;
  type: 'max_weight' | 'max_volume' | 'max_reps';
  value: number;
  date: string;                  // When PR was achieved
  workoutId: string;             // Reference to workout
  exerciseId: string;            // Reference to exercise
  setId?: string;                // Reference to specific set (for max_weight)
}
```

**Calculation Logic:**
- **max_weight:** Highest weight lifted for any rep count
- **max_volume:** Highest single-set volume (reps × weight)
- **max_reps:** Most reps at any weight

**Detection:** Run after each set is logged to highlight new PRs immediately.

---

### Exercise Statistics

```typescript
interface ExerciseStats {
  exerciseName: string;
  totalSessions: number;         // How many workouts included this exercise
  totalSets: number;             // Total sets logged
  totalReps: number;             // Sum of all reps
  totalVolume: number;           // Sum of (reps × weight) across all sets
  maxWeight: number;             // Heaviest weight ever lifted
  averageWeight: number;         // Mean weight across all sets
  lastPerformed: string;         // ISO 8601 date of most recent workout
  personalRecords: PersonalRecord[];
  progressTrend: 'improving' | 'plateauing' | 'declining' | 'insufficient_data';
}
```

**Calculation Notes:**
- Exclude warmup sets from volume/average calculations (configurable)
- Trend determined by linear regression over last 8 weeks
- Cache these stats in memory after calculation (invalidate on new workout)

---

### Workout Summary

```typescript
interface WorkoutSummary {
  workoutId: string;
  duration: number;              // Minutes (calculated from startTime/endTime)
  totalSets: number;             // Count of all sets
  totalVolume: number;           // Sum of all set volumes
  exerciseCount: number;         // Number of distinct exercises
  prsAchieved: number;           // Count of new PRs in this session
}
```

**Use Cases:**
- Dashboard cards showing recent workout highlights
- History list view (compact format)

---

## Relationships

```
Workout (1) ──── (0..n) Exercise
Exercise (1) ──── (0..n) Set
```

**Cascade Deletion:**
- Deleting a Workout deletes all child Exercises and Sets
- Deleting an Exercise deletes all child Sets
- Sets cannot exist without parent Exercise

**Orphan Prevention:**
- Foreign key constraints enforced in storage layer
- UI prevents creating sets without exercise

---

## Storage Format

### AsyncStorage (MVP Phase)

**Structure:**
```
Key: "workouts"
Value: JSON stringified array of Workout objects
```

**Example:**
```json
{
  "workouts": [
    {
      "id": "abc-123",
      "date": "2026-02-05T14:30:00.000Z",
      "exercises": [
        {
          "id": "def-456",
          "workoutId": "abc-123",
          "name": "Bench Press",
          "sets": [
            {
              "id": "ghi-789",
              "exerciseId": "def-456",
              "reps": 10,
              "weight": 100,
              "isWarmup": false,
              "order": 0,
              "createdAt": "2026-02-05T14:35:00.000Z"
            }
          ],
          "order": 0,
          "createdAt": "2026-02-05T14:32:00.000Z",
          "updatedAt": "2026-02-05T14:35:00.000Z"
        }
      ],
      "isCompleted": true,
      "createdAt": "2026-02-05T14:30:00.000Z",
      "updatedAt": "2026-02-05T14:40:00.000Z"
    }
  ]
}
```

**Limitations:**
- Entire dataset loaded into memory on read
- No query optimization
- Risk of data loss if JSON corrupted
- Suitable for ~100 workouts max

---

### SQLite (Future Phase)

**Tables:**

#### workouts
```sql
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  notes TEXT,
  bodyweight REAL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workouts_completed ON workouts(is_completed);
```

#### exercises
```sql
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  exercise_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

CREATE INDEX idx_exercises_workout ON exercises(workout_id);
CREATE INDEX idx_exercises_name ON exercises(name);
```

#### sets
```sql
CREATE TABLE sets (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL,
  reps INTEGER NOT NULL,
  weight REAL NOT NULL,
  is_warmup INTEGER NOT NULL DEFAULT 0,
  rpe INTEGER,
  notes TEXT,
  set_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE INDEX idx_sets_exercise ON sets(exercise_id);
```

**Benefits:**
- Query optimization for large datasets
- Transactional integrity
- Indexing for fast lookups
- Lower memory footprint

---

## Data Serialization

### TypeScript to JSON
- Use built-in `JSON.stringify()` with proper TypeScript types
- Ensure all Date objects converted to ISO 8601 strings
- Validate schema before saving

### JSON to TypeScript
- Use `JSON.parse()` with type guards
- Validate all required fields present
- Handle migration for schema changes

**Example Type Guard:**
```typescript
function isWorkout(obj: any): obj is Workout {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    Array.isArray(obj.exercises) &&
    typeof obj.isCompleted === 'boolean'
  );
}
```

---

## Data Migrations

### Version 1 → Version 2 Example

**Scenario:** Adding `bodyweight` field to Workout

```typescript
function migrateV1toV2(workouts: any[]): Workout[] {
  return workouts.map(workout => ({
    ...workout,
    bodyweight: undefined, // Add new optional field
    version: 2
  }));
}
```

**Migration Strategy:**
- Store schema version in separate key (`"schema_version"`)
- Run migrations on app startup if version mismatch
- Keep migrations backward compatible
- Always create backup before migration

---

## Data Integrity Rules

### Immutability (After Completion)
- Once `workout.isCompleted = true`, data should not change
- Edit feature creates a "revision" rather than modifying original
- Preserve historical accuracy for progress tracking

### Consistency
- All foreign keys must reference valid parent records
- Timestamps must be in chronological order (createdAt ≤ updatedAt)
- Order fields must be sequential with no gaps

### Validation on Write
- Enforce validation rules before persisting
- Return error messages to UI for user correction
- Never save partial/corrupt data

---

## Backup & Export

### JSON Export Format
```json
{
  "version": "1.0",
  "exportDate": "2026-02-05T16:00:00.000Z",
  "workouts": [ /* array of workouts */ ],
  "preferences": { /* user settings */ }
}
```

### Import Validation
- Check version compatibility
- Validate all workout data
- Merge or replace existing data (user choice)
- Show preview before confirming import

---

## Performance Considerations

### Memory Usage
- Load only recent workouts on app start (last 30 days)
- Lazy load historical data when user navigates to history
- Clear cache when app backgrounded

### Query Optimization (SQLite)
- Use prepared statements
- Batch inserts for multi-set operations
- LIMIT clauses for paginated results

### Caching Strategy
- Cache exercise names for autocomplete
- Cache recent workout for "copy last workout" feature
- Invalidate cache on write operations

---

## Future Enhancements

### Exercise Templates
```typescript
interface ExerciseTemplate {
  id: string;
  name: string;
  category: 'push' | 'pull' | 'legs' | 'core';
  muscleGroups: string[];
  defaultSets: number;
  defaultReps: number;
}
```

### Workout Templates
```typescript
interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: {
    exerciseTemplateId: string;
    targetSets: number;
    targetReps: number;
  }[];
}
```

### User Preferences
```typescript
interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  defaultRest: number;           // Rest timer default (seconds)
  showWarmupSets: boolean;
  theme: 'dark' | 'light';
}
```

---

## Summary

This data model prioritizes:
1. **Simplicity** - Start with flat JSON, migrate to SQLite when needed
2. **Immutability** - Historical data preserved for accurate tracking
3. **Flexibility** - Optional fields allow future feature additions
4. **Performance** - Derived stats calculated on-demand, not stored
5. **Type Safety** - Strong TypeScript types prevent runtime errors
