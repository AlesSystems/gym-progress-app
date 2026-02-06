# Progress Tracking & Analytics

## Overview
The Progress Tracking & Analytics feature provides users with visual insights into their strength progression over time, automatically detects personal records, and highlights trends.

---

## Purpose

**Primary Goal:** Help users see their strength progress clearly and stay motivated through objective data visualization.

**Key Requirements:**
- Automatic PR detection (no manual tracking)
- Clear visual charts showing trends
- Multiple time ranges (week/month/year/all-time)
- Exercise-specific analytics
- Minimal cognitive load (insights at a glance)

---

## Responsibilities

### Core Functions

1. **Track Performance Per Exercise**
   - Aggregate all historical data for each exercise
   - Calculate key metrics (max weight, volume, frequency)
   - Identify patterns and trends
   - Compare current performance to historical baseline

2. **Detect Personal Records (PRs)**
   - Automatically identify new PRs during workout
   - Track multiple PR types (weight, volume, reps)
   - Maintain PR history timeline
   - Celebrate achievements with visual feedback

3. **Show Trends Over Time**
   - Visualize progress with line charts
   - Highlight PR points on timeline
   - Calculate linear regression for trend lines
   - Detect plateaus and declines

4. **Generate Insights**
   - Progress summary (improving/plateau/declining)
   - Volume tracking per muscle group
   - Frequency analysis (workouts per week)
   - Strength-to-bodyweight ratios (future)

---

## Metrics

### Primary Metrics

#### 1. Max Weight
**Definition:** Highest weight lifted for any rep count

**Calculation:**
```typescript
function getMaxWeight(exerciseName: string, workouts: Workout[]): number {
  const allSets = getAllSetsForExercise(exerciseName, workouts);
  const workingSets = allSets.filter(s => !s.isWarmup);
  return Math.max(...workingSets.map(s => s.weight));
}
```

**Display:**
- Large number with unit (e.g., "120 kg")
- Date of achievement
- Comparison to previous best

---

#### 2. Total Volume
**Definition:** Sum of (reps × weight) across all sets

**Calculation:**
```typescript
function getTotalVolume(exerciseName: string, workouts: Workout[], timeRange: TimeRange): number {
  const filteredWorkouts = filterByTimeRange(workouts, timeRange);
  const allSets = getAllSetsForExercise(exerciseName, filteredWorkouts);
  const workingSets = allSets.filter(s => !s.isWarmup);
  
  return workingSets.reduce((total, set) => {
    return total + (set.reps * set.weight);
  }, 0);
}
```

**Display:**
- Total volume for selected time period
- Volume per session average
- Weekly volume chart

---

#### 3. Strength Progression
**Definition:** Rate of improvement over time

**Calculation:**
```typescript
function getStrengthProgression(exerciseName: string, workouts: Workout[]): ProgressionMetrics {
  const dataPoints = getMaxWeightPerSession(exerciseName, workouts);
  const regression = calculateLinearRegression(dataPoints);
  
  return {
    slope: regression.slope,                    // kg per session
    rSquared: regression.rSquared,              // How linear is progress
    trend: regression.slope > 0 ? 'improving' : 
           regression.slope < 0 ? 'declining' : 'plateauing',
    projectedNextPR: regression.predict(dataPoints.length + 1)
  };
}
```

**Display:**
- Trend indicator (↑ improving, → plateau, ↓ declining)
- Projected next PR weight
- Progress rate (e.g., "+2.5 kg per month")

---

#### 4. Strength-to-Bodyweight Ratio (Future)
**Definition:** Max weight divided by bodyweight

**Calculation:**
```typescript
function getStrengthRatio(exerciseName: string, bodyweight: number): number {
  const maxWeight = getMaxWeight(exerciseName, workouts);
  return maxWeight / bodyweight;
}
```

**Display:**
- Ratio (e.g., "1.5x bodyweight")
- Classification (novice/intermediate/advanced)
- Comparison to standards

---

## Visualizations

### 1. Line Graph Per Exercise

**Purpose:** Show progression over time for a specific exercise

**Chart Configuration:**
```typescript
interface ChartConfig {
  xAxis: 'date';                     // Time on X-axis
  yAxis: 'weight' | 'volume' | 'reps'; // Metric on Y-axis
  dataPoints: DataPoint[];           // Historical data
  prMarkers: DataPoint[];            // Highlight PRs
  trendLine?: TrendLine;             // Linear regression line
  timeRange: '4w' | '3m' | '1y' | 'all';
}

interface DataPoint {
  date: string;                      // ISO 8601
  value: number;                     // Weight/volume/reps
  isPR: boolean;                     // Highlight marker
  workoutId: string;                 // For drill-down
}
```

**Visual Elements:**
- Blue line connecting data points
- Gold stars/badges on PR points
- Dotted trend line (if regression is meaningful)
- Grid lines for readability
- Interactive: tap point to see workout details

**Example:**
```
Weight (kg)
120 │                              ★ PR
    │                           ●
100 │                     ●   ●
    │                ●
 80 │           ●  ●
    │       ●
 60 │    ●
    │  ★ PR
    └────────────────────────────────
      Jan    Feb    Mar    Apr    May
```

---

### 2. Highlight PR Points

**Visual Treatment:**
- Gold star icon (★)
- Larger dot on chart
- Label with value
- Animation on achievement (subtle pulse)

**PR Types Highlighted:**
- 🏆 Max Weight PR (gold)
- 💪 Max Volume PR (blue)
- 🔥 Max Reps PR (red)

**Interaction:**
- Tap PR point → Navigate to that workout
- See PR details (date, exact set, previous record)

---

### 3. Time Range Selector

**Options:**
- **4 Weeks** - Recent short-term progress
- **3 Months** - Medium-term trends
- **1 Year** - Long-term progression
- **All Time** - Complete history

**Implementation:**
```typescript
function filterByTimeRange(workouts: Workout[], range: TimeRange): Workout[] {
  const now = new Date();
  const cutoff = (() => {
    switch (range) {
      case '4w': return subWeeks(now, 4);
      case '3m': return subMonths(now, 3);
      case '1y': return subYears(now, 1);
      case 'all': return new Date(0);
    }
  })();
  
  return workouts.filter(w => new Date(w.date) >= cutoff);
}
```

**UI Component:**
```
┌──────────────────────────────────────┐
│ [4 Weeks] [3 Months] [1 Year] [All] │
└──────────────────────────────────────┘
```

Segmented control, tapping switches chart data instantly.

---

## Stats Screen Layout

```
┌─────────────────────────────────────┐
│ ⬅ Stats                             │ Header
├─────────────────────────────────────┤
│                                     │
│ 🔍 Search exercises...              │ Exercise Selector
│ ┌───────────────────────────────┐   │
│ │ Bench Press                ▼ │   │ Dropdown
│ └───────────────────────────────┘   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Chart: Max Weight Over Time     │ │
│ │                                 │ │
│ │      [Line chart visualization] │ │
│ │                                 │ │
│ │  [4W] [3M] [1Y] [All]           │ │ Time range
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ All-Time PR                     │ │
│ │ 120 kg                          │ │ Metric Card
│ │ Achieved on May 15, 2026        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Last Session                    │ │
│ │ 3 sets × 10 reps @ 110 kg       │ │
│ │ May 10, 2026                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Total Sessions: 42              │ │
│ │ Total Volume: 45,200 kg         │ │
│ │ Avg Weight: 95 kg               │ │
│ │ Trend: ↑ Improving              │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## PR Detection Details

### Detection Algorithm

**When to Check:**
- After every set is logged
- During workout (real-time)
- On workout completion (batch check)

**PR Types:**

#### 1. Max Weight PR
```typescript
function isMaxWeightPR(newSet: Set, history: Set[]): boolean {
  const maxPrevious = Math.max(...history.map(s => s.weight), 0);
  return newSet.weight > maxPrevious;
}
```

**Trigger:** New weight exceeds all previous weights for this exercise

---

#### 2. Max Volume PR
```typescript
function isMaxVolumePR(newSet: Set, history: Set[]): boolean {
  const maxPreviousVolume = Math.max(...history.map(s => s.reps * s.weight), 0);
  const newVolume = newSet.reps * newSet.weight;
  return newVolume > maxPreviousVolume;
}
```

**Trigger:** (reps × weight) exceeds all previous single-set volumes

---

#### 3. Max Reps PR
```typescript
function isMaxRepsPR(newSet: Set, history: Set[]): boolean {
  // Only compare sets at equal or greater weight
  const setsAtWeight = history.filter(s => s.weight >= newSet.weight);
  const maxPreviousReps = Math.max(...setsAtWeight.map(s => s.reps), 0);
  return newSet.reps > maxPreviousReps;
}
```

**Trigger:** More reps than ever at this weight or heavier

---

### PR Celebration

**Immediate Feedback (During Workout):**
1. Haptic: Heavy success pattern
2. Visual: Gold badge appears next to set
3. Animation: Confetti burst (subtle, 1 second)
4. Sound: Optional success chime

**Post-Workout Summary:**
- Show all PRs achieved in session
- "You set 3 new PRs today! 🎉"
- List each PR with details

**Stats Screen:**
- PR points highlighted on charts
- PR history timeline
- Days since last PR counter

---

## Analytics Calculations

### Trend Analysis

**Linear Regression:**
```typescript
function calculateLinearRegression(dataPoints: DataPoint[]): TrendLine {
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, p, i) => sum + i, 0);
  const sumY = dataPoints.reduce((sum, p) => sum + p.value, 0);
  const sumXY = dataPoints.reduce((sum, p, i) => sum + (i * p.value), 0);
  const sumX2 = dataPoints.reduce((sum, p, i) => sum + (i * i), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R² (goodness of fit)
  const yMean = sumY / n;
  const ssTotal = dataPoints.reduce((sum, p) => sum + Math.pow(p.value - yMean, 2), 0);
  const ssResidual = dataPoints.reduce((sum, p, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(p.value - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssResidual / ssTotal);
  
  return {
    slope,
    intercept,
    rSquared,
    predict: (x: number) => slope * x + intercept
  };
}
```

---

### Progress Classification

```typescript
function classifyProgress(slope: number, rSquared: number): ProgressTrend {
  // Not enough data
  if (rSquared < 0.5) {
    return 'insufficient_data';
  }
  
  // Thresholds (kg per session)
  const IMPROVING_THRESHOLD = 0.5;
  const DECLINING_THRESHOLD = -0.5;
  
  if (slope > IMPROVING_THRESHOLD) {
    return 'improving';      // ↑
  } else if (slope < DECLINING_THRESHOLD) {
    return 'declining';      // ↓
  } else {
    return 'plateauing';     // →
  }
}
```

---

### Volume Per Muscle Group (Future)

```typescript
function getVolumePerMuscleGroup(workouts: Workout[], timeRange: TimeRange): Map<string, number> {
  const volumeMap = new Map();
  
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const muscleGroup = getMuscleGroupForExercise(exercise.name);
      const volume = exercise.sets
        .filter(s => !s.isWarmup)
        .reduce((sum, s) => sum + (s.reps * s.weight), 0);
      
      volumeMap.set(
        muscleGroup,
        (volumeMap.get(muscleGroup) || 0) + volume
      );
    });
  });
  
  return volumeMap;
}
```

**Display:**
```
Push:  15,400 kg
Pull:  12,800 kg
Legs:  18,200 kg
Core:   3,500 kg
```

---

## Data Aggregation

### Exercise Statistics Object

```typescript
interface ExerciseStats {
  exerciseName: string;
  totalSessions: number;         // How many workouts included this
  totalSets: number;             // Total sets logged
  totalReps: number;             // Sum of all reps
  totalVolume: number;           // Sum of (reps × weight)
  maxWeight: number;             // Heaviest weight
  averageWeight: number;         // Mean across all sets
  lastPerformed: string;         // ISO 8601 date
  personalRecords: PersonalRecord[];
  progressTrend: ProgressTrend;  // improving/plateau/declining
  frequencyPerWeek: number;      // Sessions per week average
}
```

---

### Computation Strategy

**On-Demand Calculation:**
- Stats calculated when Stats screen opened
- Results cached in memory
- Cache invalidated on new workout

**Why Not Store:**
- Keeps data model simple
- Always accurate (no sync issues)
- Calculations are fast (<100ms for 1 year of data)

**Optimization:**
```typescript
// Memoize stats calculation
const useExerciseStats = (exerciseName: string) => {
  const workouts = useWorkouts();
  
  return useMemo(() => {
    return calculateExerciseStats(exerciseName, workouts);
  }, [exerciseName, workouts]);
};
```

---

## Comparison Features (Future)

### Workout-to-Workout Comparison

**Feature:** Compare current session to last session

**Display:**
```
Bench Press - Last vs Today

Last Time (7 days ago):
  Set 1: 100kg × 10
  Set 2: 100kg × 9
  Set 3: 100kg × 8
  Total Volume: 2,700 kg

Today:
  Set 1: 100kg × 10  ✅ Matched
  Set 2: 100kg × 10  🎉 +1 rep!
  Set 3: 100kg × 9   🎉 +1 rep!
  Total Volume: 2,900 kg  ↑ +200 kg
```

**Implementation:**
```typescript
function compareWorkouts(current: Exercise, previous: Exercise): Comparison {
  return {
    volumeDifference: calculateVolume(current) - calculateVolume(previous),
    setComparisons: current.sets.map((set, i) => ({
      current: set,
      previous: previous.sets[i],
      repDiff: set.reps - (previous.sets[i]?.reps || 0),
      weightDiff: set.weight - (previous.sets[i]?.weight || 0)
    }))
  };
}
```

---

## Performance Considerations

### Large Dataset Handling

**Scenario:** User has 2+ years of data (500+ workouts)

**Optimizations:**
1. **Lazy Load Historical Data**
   - Load only selected time range
   - Fetch more on scroll/zoom

2. **Chart Downsampling**
   - If >100 data points, show every Nth point
   - Keep PR points always visible

3. **Memoization**
   - Cache calculations
   - Invalidate only on new workout

4. **Virtualized Lists**
   - Exercise picker with virtualization
   - History list with FlatList optimization

---

## Success Metrics

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Stats screen load | < 500ms | Time to render chart |
| Chart render | < 1s | Initial paint |
| Time range switch | < 300ms | Re-render time |
| PR detection | < 50ms | Algorithm execution |

---

### User Engagement

| Metric | Target | Source |
|--------|--------|--------|
| Stats screen visits | 1+ per week | Analytics |
| PRs achieved | 2+ per month | Data |
| Time on stats screen | 2-3 minutes | Session tracking |
| Chart interactions | 5+ taps/session | Event tracking |

---

## Testing Strategy

### Unit Tests
- PR detection algorithms
- Linear regression calculation
- Volume aggregation
- Trend classification

### Integration Tests
- Stats calculation with real workout data
- Chart data transformation
- Time range filtering

### Visual Regression Tests
- Chart rendering consistency
- PR marker placement
- Responsive layout

---

## Future Enhancements

### Phase 2
1. **Export Charts** - Save chart as image
2. **Goal Setting** - Set target PR, track progress
3. **Muscle Group Analytics** - Volume per muscle group

### Phase 3
4. **Periodization Insights** - Volume/intensity wave detection
5. **Injury Prevention** - Volume spike warnings
6. **Plateau Detection** - Suggest deload weeks

### Phase 4
7. **AI Predictions** - Predict next PR date/weight
8. **Form Analysis** - Video + AI (very future)

---

## Summary

### Key Principles
1. **Automatic** - PRs detected without user input
2. **Visual** - Charts over tables, clarity over detail
3. **Motivating** - Celebrate achievements, show progress
4. **Fast** - All calculations < 1 second

### Success Definition
A user should:
- See PRs highlighted immediately after achieving
- Understand their progress trend at a glance
- Feel motivated by visual progress
- Never wait for analytics to load

**If users check their stats weekly and feel motivated, we've succeeded.**
