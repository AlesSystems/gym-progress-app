# Workout History & Review

## Overview
The Workout History & Review feature allows users to view, manage, and analyze past workout sessions through multiple viewing modes and intuitive interfaces.

---

## Purpose

**Primary Goal:** Provide easy access to historical workout data for review, editing, comparison, and analysis.

**Key Requirements:**
- Quick access to recent workouts
- Multiple view modes (list, calendar)
- Search and filter capabilities
- Edit/delete functionality
- Exercise-centric history views

---

## Responsibilities

### Core Functions

1. **View Past Workouts**
   - Display chronological list of completed workouts
   - Show workout summaries (date, duration, volume, exercises)
   - Highlight workouts with PRs
   - Support infinite scroll/pagination

2. **Edit or Delete Workouts**
   - Modify past workout data (sets, reps, weights, notes)
   - Delete entire workouts or individual exercises/sets
   - Undo accidental deletions (5-second window)
   - Maintain data integrity on edits

3. **Compare Sessions**
   - Side-by-side workout comparison
   - Highlight differences (weight, reps, volume)
   - Track frequency (days since last session)
   - Show "what changed since last time?"

4. **Search and Filter**
   - Search by exercise name
   - Filter by date range
   - Filter by workout containing specific exercise
   - Quick access to favorites/recent

---

## Views

### 1. List View (Default)

**Layout:** Chronological list of workout cards, newest first

**Workout Card Content:**
```
┌────────────────────────────────────┐
│ May 15, 2026 · Wednesday      [⋮] │ Date + Menu
│ Duration: 1h 23m                   │ Summary
│                                    │
│ 💪 4 exercises · 16 sets           │ Stats
│ 📊 Total Volume: 8,420 kg          │
│ 🏆 2 PRs                           │ PR badge
└────────────────────────────────────┘
```

**Features:**
- Pull to refresh
- Swipe left → Delete (with undo)
- Swipe right → Duplicate workout
- Long press → Context menu (Edit | Delete | Share)
- Tap card → Navigate to Workout Detail screen

**Performance:**
- Virtualized FlatList (only render visible cards)
- Pagination: Load 20 workouts per page
- Lazy load older workouts on scroll

---

### 2. Calendar View

**Layout:** Month calendar with workout indicators

**Visual Design:**
```
        May 2026
  Su Mo Tu We Th Fr Sa
              1  2  3  4
   5  6  7  8● 9 10●11
  12●13 14 15●16 17 18
  19 20 21 22●23 24●25●
  26 27 28 29 30 31
  
● = Workout on this day
```

**Features:**
- Dots/badges on workout days
- Color-coded by PR achievement (gold dot if PR)
- Tap date → Show workout(s) from that day
- Swipe months horizontally
- Today indicator (outline)

**Multi-Workout Days:**
If multiple workouts on same day:
- Show number badge (e.g., "2")
- Tap → Bottom sheet list of workouts

**Implementation:**
```typescript
interface CalendarDay {
  date: Date;
  workouts: Workout[];
  hasPR: boolean;
  isToday: boolean;
}
```

---

### 3. Exercise-Centric History (Future)

**Purpose:** View all instances of a specific exercise across time

**Layout:**
```
Bench Press - All Sessions

┌────────────────────────────────────┐
│ May 15, 2026                       │
│ 3 sets: 100kg × 10, 10, 9         │
│ Volume: 2,900 kg                   │
│ 🏆 New max weight PR               │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ May 8, 2026  (7 days ago)          │
│ 3 sets: 97.5kg × 10, 10, 9        │
│ Volume: 2,827.5 kg                 │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ May 1, 2026  (14 days ago)         │
│ 3 sets: 95kg × 10, 10, 10         │
│ Volume: 2,850 kg                   │
└────────────────────────────────────┘
```

**Features:**
- Show progression trend
- Highlight PRs
- Show frequency (workouts per week)
- Export as CSV

---

## Workout Detail Screen

**Navigation:** History List → Tap workout card

**Layout:**
```
┌─────────────────────────────────────┐
│ ⬅ History      May 15, 2026    [⋮] │ Header
├─────────────────────────────────────┤
│                                     │
│ ⏱ Duration: 1h 23m                  │ Meta
│ 📝 Bodyweight: 80 kg                │
│ 📅 Wednesday                         │
│                                     │
│ 💪 Bench Press              [Edit]  │ Exercise 1
│    Set 1: 10 reps @ 100kg  🏆       │
│    Set 2: 10 reps @ 100kg           │
│    Set 3: 9 reps @ 100kg            │
│    Volume: 2,900 kg                 │
│                                     │
│ 💪 Overhead Press           [Edit]  │ Exercise 2
│    Set 1: 8 reps @ 60kg             │
│    Set 2: 8 reps @ 60kg             │
│    Set 3: 7 reps @ 60kg             │
│    Volume: 1,380 kg                 │
│                                     │
│ 💪 Squat                    [Edit]  │ Exercise 3
│    Set 1: 10 reps @ 120kg           │
│    Set 2: 10 reps @ 120kg           │
│    Set 3: 10 reps @ 120kg           │
│    Volume: 3,600 kg                 │
│                                     │
│ 📝 Notes:                           │
│ "Felt strong today. Bench PR!"     │
│                                     │
├─────────────────────────────────────┤
│ [Use as Template] [Share] [Delete] │ Actions
└─────────────────────────────────────┘
```

---

## User Flows

### Primary Flow: Browse History

```
1. User taps History tab
   ↓
2. List of workouts loads (newest first)
   ↓
3. User scrolls to find specific workout
   ↓
4. Tap workout card
   ↓
5. Navigate to Workout Detail screen
   ↓
6. Review exercises and sets
   ↓
7. Tap back to return to list
```

---

### Edit Flow: Modify Past Workout

```
1. User on Workout Detail screen
   ↓
2. Tap "Edit" button next to exercise
   ↓
3. Sets become editable (inline editing)
   ↓
4. User changes weight/reps
   ↓
5. Tap "Save" (or auto-save on blur)
   ↓
6. Workout updated in storage
   ↓
7. PRs recalculated if needed
   ↓
8. Visual confirmation ("Saved")
```

**Data Integrity:**
- Validate edits before saving
- Recalculate stats after edit
- Update charts if exercise was modified
- Show warning if editing removes PR

---

### Delete Flow: Remove Workout

```
1. User swipes left on workout card (or long press → Delete)
   ↓
2. Delete button appears
   ↓
3. Tap delete
   ↓
4. Workout removed from list (optimistic update)
   ↓
5. Toast appears: "Workout deleted. Undo?"
   ↓
6a. User taps "Undo" (within 5 seconds)
    → Workout restored
   ↓
6b. Timeout expires
    → Workout permanently deleted from storage
    → PRs recalculated without this workout
```

---

### Search Flow: Find Specific Exercise

```
1. User taps search icon on History screen
   ↓
2. Search bar appears at top
   ↓
3. User types "bench"
   ↓
4. List filters to show only workouts containing "Bench Press"
   ↓
5. User taps workout
   ↓
6. Workout Detail opens, auto-scrolled to Bench Press exercise
```

**Search Logic:**
```typescript
function searchWorkouts(query: string, workouts: Workout[]): Workout[] {
  const lowerQuery = query.toLowerCase();
  
  return workouts.filter(workout => {
    // Search in notes
    if (workout.notes?.toLowerCase().includes(lowerQuery)) {
      return true;
    }
    
    // Search in exercise names
    return workout.exercises.some(ex => 
      ex.name.toLowerCase().includes(lowerQuery)
    );
  });
}
```

---

## Comparison Features

### "What Changed Since Last Time?"

**Trigger:** When viewing workout detail for exercise you've done before

**Display:**
```
Bench Press

Last Time (7 days ago):
  Set 1: 100kg × 10
  Set 2: 100kg × 9
  Set 3: 100kg × 8
  
Today:
  Set 1: 100kg × 10  ✅ Matched
  Set 2: 100kg × 10  🎉 +1 rep
  Set 3: 100kg × 9   🎉 +1 rep
  
Changes:
  ↑ +2 total reps
  ↑ +200 kg volume
```

**Implementation:**
```typescript
function getLastPerformance(exerciseName: string, currentWorkout: Workout): Exercise | null {
  const workouts = getAllWorkouts().filter(w => 
    w.id !== currentWorkout.id && 
    w.date < currentWorkout.date
  );
  
  // Find most recent workout with this exercise
  for (const workout of workouts.sort((a, b) => b.date - a.date)) {
    const exercise = workout.exercises.find(ex => ex.name === exerciseName);
    if (exercise) return exercise;
  }
  
  return null;
}
```

---

## Context Menu Actions

**Long Press on Workout Card:**

```
┌────────────────────────┐
│ View Details           │
│ Edit Workout           │
│ Duplicate Workout      │
│ Use as Template        │
│ ──────────────────     │
│ Share Workout          │
│ ──────────────────     │
│ Delete                 │
└────────────────────────┘
```

### Action Definitions

1. **View Details** - Navigate to Workout Detail screen
2. **Edit Workout** - Open in edit mode
3. **Duplicate Workout** - Create new workout with same exercises/sets
4. **Use as Template** - Create new workout with same exercises (empty sets)
5. **Share Workout** - Export as text/image (future)
6. **Delete** - Remove workout with undo option

---

## Filtering & Sorting

### Filter Options

**Date Range Filter:**
```
┌────────────────────────┐
│ Last 7 Days            │
│ Last 30 Days           │
│ Last 3 Months          │
│ Last Year              │
│ Custom Range...        │
│ All Time               │
└────────────────────────┘
```

**Exercise Filter:**
```
┌────────────────────────┐
│ Contains Bench Press   │
│ Contains Squat         │
│ Contains Deadlift      │
│ All Exercises          │
└────────────────────────┘
```

**Combined Filter:**
- Filters stack (AND logic)
- Active filters shown as chips
- Tap chip to remove filter

---

### Sort Options

**Sort By:**
- Date (newest first) - Default
- Date (oldest first)
- Duration (longest first)
- Total Volume (highest first)
- PR Count (most PRs first)

**UI:**
```
┌────────────────────────────────────┐
│ Sort: [Newest ▼]    Filter: [All] │
└────────────────────────────────────┘
```

---

## Edit Mode Implementation

### Inline Editing

**Before Edit:**
```
Set 1: 10 reps @ 100kg
```

**After Tapping "Edit":**
```
Set 1: [10 ▼] reps @ [100 ▼] kg  [✓] [✗]
```

- Number inputs appear inline
- Checkmark to save
- X to cancel
- Auto-save on blur (future)

### Constraints
- Can't edit workout if it would break data integrity
- Can't set reps/weight to invalid values
- Warning if edit removes a PR
- Confirmation for destructive changes

---

## Duplicate vs Template

### Duplicate Workout
**Purpose:** Repeat exact same workout

**Behavior:**
1. Create new workout with today's date
2. Copy all exercises
3. Copy all sets (including weights/reps)
4. User can modify before starting

**Use Case:** "Same workout as last week, same weights"

---

### Use as Template
**Purpose:** Reuse exercise structure, not exact sets

**Behavior:**
1. Create new workout with today's date
2. Copy exercises (names only)
3. Sets are empty (user fills during workout)
4. Smart defaults still apply

**Use Case:** "Same exercises, but progressive overload"

---

## Data Management

### Storage Considerations

**Read Patterns:**
- Most recent workouts accessed frequently
- Older workouts rarely accessed

**Optimization:**
```typescript
// Load last 30 days on startup
const recentWorkouts = loadWorkouts({ 
  limit: 30, 
  orderBy: 'date', 
  desc: true 
});

// Lazy load older workouts
const olderWorkouts = loadWorkouts({ 
  offset: 30, 
  limit: 20,
  orderBy: 'date',
  desc: true
});
```

---

### Delete Cascade

**When deleting workout:**
1. Remove from workouts list
2. Update PR records (recalculate without this workout)
3. Invalidate stats cache
4. Remove from calendar markers

**Undo Implementation:**
```typescript
const deletedWorkout = workout;
const restoreDeadline = Date.now() + 5000; // 5 seconds

setTimeout(() => {
  if (Date.now() >= restoreDeadline && !undoCalled) {
    permanentlyDelete(deletedWorkout.id);
  }
}, 5000);
```

---

## Performance Optimization

### List Rendering

**FlatList Configuration:**
```typescript
<FlatList
  data={workouts}
  renderItem={({ item }) => <WorkoutCard workout={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: CARD_HEIGHT,
    offset: CARD_HEIGHT * index,
    index,
  })}
/>
```

---

### Calendar Rendering

**Month Memoization:**
```typescript
const MonthView = React.memo(({ month, workouts }) => {
  const days = useMemo(() => 
    generateCalendarDays(month, workouts), 
    [month, workouts]
  );
  
  return <Calendar days={days} />;
});
```

**Prefetch Adjacent Months:**
```typescript
// When showing May, prefetch April and June
useEffect(() => {
  prefetchMonth(addMonths(currentMonth, -1));
  prefetchMonth(addMonths(currentMonth, 1));
}, [currentMonth]);
```

---

## Accessibility

### VoiceOver Labels

**Workout Card:**
```
"Workout from May 15, 2026. Duration 1 hour 23 minutes. 
4 exercises, 16 sets. Total volume 8,420 kilograms. 
2 personal records achieved. Double tap to view details."
```

**Calendar Day:**
```
"May 15. Has workout. Tap to view."
```

**Action Buttons:**
```
"Edit workout" (not just "Edit")
"Delete workout" (not just "Delete")
```

---

## Error Handling

### Scenario: Edit Conflict

**Problem:** User edits workout that would invalidate current PR

**Solution:**
1. Show warning dialog
2. Explain impact ("This will remove your bench press PR")
3. Confirm intention
4. Proceed or cancel

---

### Scenario: Failed Delete

**Problem:** Storage error prevents deletion

**Solution:**
1. Rollback UI change
2. Show error toast
3. Keep workout in list
4. Log error for debugging

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| History screen load | < 500ms | Time to first render |
| Workout card render | < 100ms | Per card |
| Calendar month render | < 300ms | Month switch |
| Search response | < 200ms | Keystroke to filter |
| Edit save time | < 100ms | Tap save to confirmation |

---

## Testing Strategy

### Unit Tests
- Search/filter logic
- Sort algorithms
- Date range calculations
- Duplicate/template creation

### Integration Tests
- Load workouts from storage
- Edit and save workflow
- Delete with undo
- Calendar generation

### E2E Tests
- Browse history and view details
- Search for specific exercise
- Delete workout and undo
- Switch between list and calendar views

---

## Future Enhancements

### Phase 2
1. **Export to CSV** - Download workout history
2. **Workout Tags** - Categorize workouts (Push Day, Leg Day)
3. **Favorites** - Mark favorite workouts for quick access

### Phase 3
4. **Workout Streaks** - Track consecutive weeks
5. **Heatmap View** - Annual activity calendar (GitHub-style)
6. **Advanced Search** - Multi-criteria search

### Phase 4
7. **Social Sharing** - Share workout summary as image
8. **Workout Comparison** - Compare any two workouts
9. **Training Log** - Printable workout journal

---

## Summary

### Key Principles
1. **Quick Access** - Recent workouts always visible
2. **Multiple Views** - List, calendar, exercise-centric
3. **Safe Editing** - Undo for destructive actions
4. **Fast Search** - Find any workout in seconds

### Success Definition
A user should:
- Find any workout in < 5 seconds
- Review past sessions effortlessly
- Safely edit/delete without fear of data loss
- Compare workouts to track progress

**If users can confidently manage their history, we've succeeded.**
