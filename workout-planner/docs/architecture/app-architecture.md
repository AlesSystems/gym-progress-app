# App Architecture

## Overview
This document defines the architectural pattern and layering strategy for the Workout Planner app, built with React Native for iOS.

## Architectural Pattern
**Feature-based structure** with clear layer separation to ensure maintainability, testability, and scalability.

---

## Layer Architecture

### 1. UI Layer
**Responsibility:** Presentation logic and user interaction

**Components:**
- **Screens** - Top-level views (WorkoutScreen, HistoryScreen, StatsScreen, DashboardScreen)
- **Components** - Reusable UI elements (ExerciseCard, SetInput, PRBadge, ChartView)
- **Hooks** - Custom React hooks for state management and side effects

**Principles:**
- Components should be dumb/presentational when possible
- Business logic delegated to domain layer
- State management via React Context or Zustand (lightweight)
- One-handed usability optimized touch targets (min 44x44 points)

**Key UI Patterns:**
- Bottom sheet modals for quick actions
- Swipe gestures for delete/edit
- Optimistic UI updates for perceived speed
- Dark mode first design

---

### 2. Domain Layer
**Responsibility:** Business logic and data transformations

**Modules:**

#### **Workout Logic**
- Creating new workouts
- Adding/removing exercises and sets
- Auto-filling defaults from last session
- Workout validation rules

#### **Progress Calculation**
- PR (Personal Record) detection algorithms
- Volume calculation (sets × reps × weight)
- Strength progression metrics
- Trend analysis (linear regression for progress lines)

#### **Analytics**
- Exercise-specific stats aggregation
- Time-range filtering (week/month/all-time)
- Comparison logic between workout sessions

**Principles:**
- Pure functions wherever possible
- No direct storage/UI dependencies
- Well-tested with unit tests
- Immutable data patterns

---

### 3. Data Layer
**Responsibility:** Data persistence, retrieval, and serialization

**Components:**

#### **Storage Adapter**
- Abstraction over storage implementation (currently AsyncStorage or SQLite)
- CRUD operations for workouts
- Batch operations for performance
- Transaction support for data integrity

#### **Data Models**
- TypeScript interfaces for Workout, Exercise, Set
- Serialization/deserialization helpers
- Migration utilities for schema changes

#### **Cache Layer** (Future)
- In-memory cache for frequently accessed data
- Invalidation strategies

**Storage Strategy:**
- **Offline-first** - No network required
- **Append-only** - Workouts are immutable once completed
- **Derived stats** - Calculated on-demand, not stored
- **JSON-based** - Easy to backup/export

**Backup Strategy (Future):**
- Local JSON export
- iCloud sync integration

---

## Folder Structure

```
src/
├── ui/
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── WorkoutScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── StatsScreen.tsx
│   ├── components/
│   │   ├── ExerciseCard.tsx
│   │   ├── SetInputRow.tsx
│   │   ├── PRBadge.tsx
│   │   └── ProgressChart.tsx
│   └── hooks/
│       ├── useWorkout.ts
│       └── useProgress.ts
├── domain/
│   ├── workout/
│   │   ├── createWorkout.ts
│   │   ├── addExercise.ts
│   │   └── validateWorkout.ts
│   ├── progress/
│   │   ├── detectPRs.ts
│   │   ├── calculateVolume.ts
│   │   └── getTrends.ts
│   └── analytics/
│       ├── aggregateStats.ts
│       └── compareWorkouts.ts
├── data/
│   ├── storage/
│   │   ├── StorageAdapter.ts
│   │   ├── workoutRepository.ts
│   │   └── migrations.ts
│   ├── models/
│   │   ├── Workout.ts
│   │   ├── Exercise.ts
│   │   └── Set.ts
│   └── cache/ (future)
└── utils/
    ├── date.ts
    ├── validation.ts
    └── formatting.ts
```

---

## Data Flow

### Creating a Workout
1. **UI Layer:** User taps "Start Workout" button
2. **Domain Layer:** `createWorkout()` generates workout with timestamp
3. **Data Layer:** `workoutRepository.save()` persists to storage
4. **UI Layer:** Navigate to workout logging screen

### Logging Sets
1. **UI Layer:** User inputs reps/weight in SetInputRow
2. **Domain Layer:** `addSet()` validates and appends to exercise
3. **Domain Layer:** `detectPRs()` checks if new PR achieved
4. **UI Layer:** Show PR badge if detected
5. **Data Layer:** Auto-save workout state (debounced)

### Viewing Progress
1. **UI Layer:** User navigates to Stats screen, selects exercise
2. **Data Layer:** `workoutRepository.getByExercise()` fetches relevant workouts
3. **Domain Layer:** `calculateVolume()` and `getTrends()` process data
4. **UI Layer:** Render chart with processed data

---

## State Management Strategy

### Global State (Zustand or Context)
- Current active workout (if in progress)
- User preferences (units, dark mode)
- Cache of recent workouts

### Local State (useState)
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary selections

### Server State (Future - React Query)
- When cloud sync added
- Optimistic updates with rollback

---

## Performance Considerations

### App Startup
- **Target:** < 1 second to interactive
- Lazy load heavy components
- Pre-cache recent workout data on launch

### Large Datasets
- **Virtualized lists** for workout history (FlatList with optimizations)
- **Pagination** for exercise history beyond 100 entries
- **Memoization** for expensive calculations (useMemo, React.memo)

### Smooth Animations
- **60 FPS target** for all transitions
- Use React Native Reanimated for complex gestures
- Avoid inline styles/functions in render

---

## Error Handling

### Storage Failures
- Catch and retry with exponential backoff
- Fallback to in-memory state
- Alert user if persistent failure

### Data Corruption
- Validate on read
- Attempt recovery from backup
- Last resort: skip corrupted records, log to analytics

### Crash Recovery
- Auto-save workout every 30 seconds
- On app restart, check for incomplete workout
- Prompt user to resume or discard

---

## Testing Strategy

### Unit Tests
- Domain layer logic (pure functions)
- Utility functions
- PR detection algorithms

### Integration Tests
- Storage adapter CRUD operations
- Data flow between layers

### E2E Tests (Future)
- Critical user flows (create workout, log sets, view stats)
- Detox or similar framework

---

## Future Architecture Enhancements

### Cloud Sync
- Add sync layer between data and domain
- Conflict resolution strategy (last-write-wins initially)
- Queue for offline operations

### AI Features
- Separate AI service module
- Model loading and inference isolated from main thread
- Fallback to non-AI features if model unavailable

### Gamification
- Plugin architecture for achievements
- Event-driven system for progress milestones

### Multi-platform
- Extract business logic to shared package
- Platform-specific UI layer (iOS/Android)

---

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| UI | React Native, TypeScript, React Navigation |
| State | Zustand / React Context |
| Storage | AsyncStorage → SQLite (when scaling needed) |
| Charts | react-native-chart-kit or Victory Native |
| Testing | Jest, React Native Testing Library |
| Linting | ESLint, Prettier, TypeScript strict mode |

---

## Architectural Principles

1. **Separation of Concerns** - Each layer has single responsibility
2. **Dependency Inversion** - Domain doesn't depend on UI or Data
3. **Immutability** - Data modifications create new objects
4. **Offline-First** - Network is optional, not required
5. **Fast by Default** - Performance is a feature, not an afterthought
6. **Type Safety** - TypeScript strict mode, no `any` types
7. **Testability** - Pure functions, dependency injection where needed

---

## Migration Path

### Phase 1: MVP
- AsyncStorage for simple data
- Context for state
- Manual calculations

### Phase 2: Scaling
- Migrate to SQLite for query performance
- Add indexing for faster lookups
- Implement caching layer

### Phase 3: Advanced
- Cloud sync layer
- AI model integration
- Advanced analytics engine
