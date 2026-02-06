# Workout Logging System

## Overview
The Workout Logging System is the core feature of the app, enabling users to create workouts, add exercises, and log sets with reps and weight during gym sessions.

---

## Purpose

**Primary Goal:** Make logging workout data as fast and effortless as possible during gym sessions.

**Key Requirements:**
- Log a complete set in under 10 seconds
- One-handed operation
- Minimal taps (2-3 max for common actions)
- Work offline always
- Auto-save to prevent data loss

---

## Responsibilities

### Core Functions

1. **Create Workouts**
   - Generate new workout session with timestamp
   - Track workout start/end times
   - Mark workouts as in-progress or completed
   - Optional session notes and bodyweight

2. **Add Exercises**
   - Select from recent exercises
   - Search exercise library (future: templates)
   - Create custom exercises
   - Reorder exercises within workout

3. **Log Sets**
   - Enter reps and weight
   - Mark warmup vs working sets
   - Optional RPE (Rate of Perceived Exertion)
   - Optional set-level notes
   - Auto-detect and highlight PRs

4. **Manage Session**
   - Pause/resume workout
   - Edit sets in real-time
   - Delete sets/exercises
   - Finish and save workout
   - Crash recovery for incomplete sessions

---

## Concepts & Data Model

### Workout
```typescript
interface Workout {
  id: string;                    // UUID
  date: string;                  // ISO 8601
  startTime?: string;            // When started
  endTime?: string;              // When completed
  exercises: Exercise[];         // Ordered list
  notes?: string;                // Session notes
  bodyweight?: number;           // Optional
  isCompleted: boolean;          // Status flag
  createdAt: string;
  updatedAt: string;
}
```

**Relationship:** Workout = date + list of exercises

---

### Exercise
```typescript
interface Exercise {
  id: string;                    // UUID
  workoutId: string;             // Parent reference
  name: string;                  // "Bench Press"
  sets: Set[];                   // Ordered sets
  notes?: string;                // Exercise notes
  order: number;                 // Position in workout
  createdAt: string;
  updatedAt: string;
}
```

**Relationship:** Exercise = name + sets

---

### Set
```typescript
interface Set {
  id: string;                    // UUID
  exerciseId: string;            // Parent reference
  reps: number;                  // Repetitions
  weight: number;                // Weight in kg/lbs
  isWarmup: boolean;             // Warmup flag
  rpe?: number;                  // 1-10 scale
  notes?: string;                // Set notes
  order: number;                 // Position in exercise
  createdAt: string;
}
```

**Relationship:** Set = reps + weight

---

## User Flows

### Primary Flow: Complete Workout Session

```
1. User opens app → 2. Tap "Start Workout" on Dashboard
3. Workout created (date = now, isCompleted = false)
4. Navigate to Active Workout screen → 5. Tap "Add Exercise"
6. Exercise Picker Modal opens → 7. Select exercise (e.g., "Bench Press")
8. Exercise added to workout → 9. Tap "Add Set" button
10. Set Input Bottom Sheet opens → 11. Enter weight (auto-filled from last time)
12. Enter reps → 13. Tap "Save" → 14. Set logged, PR check runs
15. If PR: Show badge + haptic feedback
16. Repeat steps 9-15 for more sets
17. Repeat steps 5-16 for more exercises
18. Tap "Finish Workout" → 19. Confirmation dialog
20. Workout saved (isCompleted = true)
21. Navigate to Dashboard (shows summary)
```

---

### Quick Copy Flow: Repeat Last Workout

```
1. User opens app → 2. Dashboard shows "Last Workout: Push Day"
3. Tap "Start Similar Workout"
4. New workout created with same exercises
5. Sets pre-filled with last session's values
6. User adjusts weights/reps as needed
7. Log and finish as normal
```

**Time Saved:** 3-5 minutes per session

---

### Error Recovery Flow: App Crash During Workout

```
1. App crashes mid-workout → 2. User reopens app
3. App detects incomplete workout (isCompleted = false)
4. Show modal: "Resume unfinished workout from [time]?"
5a. User taps "Resume" → Load workout into Active Workout screen → Continue logging
5b. User taps "Discard" → Delete incomplete workout → Return to Dashboard
```

**Data Protection:** Zero data loss

---

## UX Considerations

### 1. One-Handed Usage

**Design Principles:**
- All primary actions in bottom 2/3 of screen
- Bottom sheet modals (not full-screen)
- Large touch targets (min 44x44 points)
- Thumb-reachable buttons

**Critical Actions (One-Handed):**
- ✅ Start workout
- ✅ Add exercise
- ✅ Add set
- ✅ Log weight/reps
- ✅ Save set
- ✅ Finish workout

---

### 2. Minimal Taps

**Tap Budget Per Action:**

| Action | Target Taps | Flow |
|--------|-------------|------|
| Start workout | 1 | Dashboard → Start button |
| Add first exercise | 2 | Add Exercise → Select from list |
| Log first set | 3 | Add Set → Enter weight → Enter reps → Save |
| Log next set | 2 | Add Set → Save (auto-filled) |
| Finish workout | 2 | Finish → Confirm |

**Optimization Strategies:**
- Auto-fill from previous set
- Quick increment buttons (+2.5, +5, +10)
- Recent exercises at top of picker

---

### 3. Defaults Based on Last Workout

**Smart Auto-Fill Logic:**

When adding a set, the system:
1. Checks if there's a previous set in current exercise
2. If yes: auto-fill with same weight/reps
3. If no: check last workout for this exercise
4. Auto-fill with that exercise's first set values

**User Impact:**
- 80% of sets require only 1-2 number changes
- Familiar starting point reduces cognitive load
- Easy to increment progressively

---

### 4. Visual Feedback

**Immediate Feedback For:**

1. **Set Logged**
   - Haptic: Light tap
   - Visual: Set appears in list instantly
   - Animation: Slide in from bottom

2. **PR Achieved**
   - Haptic: Heavy success pattern
   - Visual: Gold badge next to set
   - Animation: Badge pulse + confetti (subtle)
   - Sound: Optional chime

3. **Workout Saved**
   - Haptic: Success pattern
   - Visual: Checkmark animation
   - Toast: "Workout saved!"

---

## Technical Implementation

### PR Detection Algorithm

```typescript
function detectPRs(
  exerciseName: string,
  newSet: Set,
  workoutHistory: Workout[]
): PersonalRecord[] {
  const prs: PersonalRecord[] = [];
  const previousSets = getAllSetsForExercise(exerciseName, workoutHistory);
  
  // Check max weight PR
  const maxWeight = Math.max(...previousSets.map(s => s.weight));
  if (newSet.weight > maxWeight) {
    prs.push({ type: 'max_weight', value: newSet.weight, exerciseName });
  }
  
  // Check max volume PR (reps × weight)
  const maxVolume = Math.max(...previousSets.map(s => s.reps * s.weight));
  const newVolume = newSet.reps * newSet.weight;
  if (newVolume > maxVolume) {
    prs.push({ type: 'max_volume', value: newVolume, exerciseName });
  }
  
  return prs;
}
```

---

### Auto-Save Strategy

```typescript
// Debounced auto-save every 30 seconds
useEffect(() => {
  if (activeWorkout && !activeWorkout.isCompleted) {
    const timer = setInterval(() => {
      saveWorkoutToStorage(activeWorkout);
    }, 30000);
    return () => clearInterval(timer);
  }
}, [activeWorkout]);

// Also save on app background
useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'background' && activeWorkout) {
      saveWorkoutToStorage(activeWorkout);
    }
  });
  return () => subscription.remove();
}, [activeWorkout]);
```

---

## Success Metrics

### Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to log set | < 10 seconds | User flow timer |
| Set save time | < 100ms | Performance API |
| PR detection time | < 50ms | Algorithm benchmark |
| UI responsiveness | 60 FPS | React DevTools |

---

### User Experience Metrics

| Metric | Target | Source |
|--------|--------|--------|
| Sets logged per session | 15-30 | Analytics |
| Workout completion rate | > 90% | Started vs finished |
| Error rate | < 1% | Error logs |
| Crash during workout | 0% | Crash reports |

---

## Testing Strategy

### Unit Tests
- PR detection algorithm
- Set validation logic
- Exercise name normalization
- Auto-fill logic

### Integration Tests
- Complete workout flow (start → log → finish)
- Crash recovery
- Auto-save functionality

### E2E Tests (Future)
- Full user journey from dashboard to workout completion
- Multi-exercise logging
- PR detection in real scenarios

---

## Future Enhancements

### Phase 2
1. **Rest Timer** - Auto-start after set, background notifications
2. **Exercise Templates** - Pre-defined exercise library
3. **Voice Input** - Speak set notes

### Phase 3
4. **Workout Templates** - Save and reuse workout structures
5. **Super Sets** - Link two exercises, alternate sets
6. **Plate Calculator** - Visual guide for loading bar

---

## Summary

The Workout Logging System is the **foundation** of the app. Everything else builds on top of this core functionality.

### Key Principles
1. **Speed First** - Every optimization serves faster logging
2. **Zero Data Loss** - Auto-save, crash recovery, validation
3. **Progressive Enhancement** - Simple by default, advanced optional
4. **Offline Always** - No network dependencies ever

### Success Definition
A user should be able to:
- Start a workout in 1 tap
- Add an exercise in 2 taps
- Log a set in 2-3 taps
- See their PR instantly
- Never lose data

**If logging sets feels effortless, we've succeeded.**
