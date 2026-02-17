# Issue #4: Workout Progress Lost When Navigating Away

## Problem Description
When a user starts a workout and navigates to another page (e.g., viewing workout list, settings, or any other route), the active workout session is completely reset and all progress is lost. This is a critical issue preventing users from multitasking during their workout.

## Current Behavior
- User starts a workout session
- User navigates to a different page/route
- Workout progress is completely lost
- User must restart workout from beginning
- All completed sets, exercises, and time tracking are reset

## Expected Behavior
- Workout state should persist when navigating between pages
- User can freely navigate the app during an active workout
- Workout progress (completed sets, rest timers, workout time) is maintained
- User can return to active workout from any page
- Indicator showing active workout is in progress
- Option to resume or end workout session

## Root Cause Analysis
Likely causes:
1. Workout state stored in component-level state (not persisted)
2. State cleared on route change/component unmount
3. No global state management for active workout
4. Missing state persistence layer (localStorage/sessionStorage)
5. Component remounting causes initialization reset

## Investigation Points
- [ ] Review current state management architecture
- [ ] Check if React Context, Redux, or other state management is used
- [ ] Identify where workout state is stored (component vs global)
- [ ] Check for useEffect cleanup functions that clear state
- [ ] Review routing implementation and component lifecycle
- [ ] Verify if any state persistence mechanism exists

## Proposed Solution

### Option 1: Global State Management (Recommended)
Use Context API or state management library to maintain workout state globally:
- Create WorkoutContext/WorkoutProvider
- Store active workout state at app level
- Persist state across route changes
- Components subscribe to workout state

### Option 2: Local Storage Persistence
Store workout state in localStorage:
- Save workout state on every update
- Restore state on component mount
- Clear storage when workout completes
- Adds redundancy even if user closes app

### Option 3: Hybrid Approach (Best)
Combine both approaches:
- Use global state management for active session
- Persist to localStorage as backup
- Restore from localStorage on app restart
- Prompt user to resume if unfinished workout found

## Implementation Plan

### Phase 1: Global State Setup
1. Create WorkoutContext with state for:
   - Active workout session
   - Current exercise index
   - Completed sets
   - Start time
   - Rest timer state
   - Workout timer state

2. Wrap app with WorkoutProvider
3. Update workout components to use context instead of local state
4. Test navigation doesn't clear state

### Phase 2: Local Storage Persistence
1. Implement autosave to localStorage:
   - Save on exercise completion
   - Save on set completion
   - Save on timer updates (throttled)
   - Save on navigation

2. Implement state restoration:
   - Check localStorage on app load
   - Restore active workout if found
   - Show "Resume Workout" prompt

3. Implement cleanup:
   - Clear storage on workout completion
   - Clear storage on workout cancellation
   - Handle edge cases (corrupted data)

### Phase 3: UI Enhancements
1. Add persistent "Active Workout" indicator in nav/header
2. Add "Resume Workout" button when workout is active
3. Add confirmation dialog when trying to start new workout with active session
4. Add "End Workout" option to explicitly finish session
5. Show workout summary when ending early

## Data Structure Example
```javascript
{
  activeWorkout: {
    id: "workout_123",
    name: "Push Day",
    startTime: 1708187747000,
    currentExerciseIndex: 2,
    exercises: [
      {
        id: "ex1",
        name: "Bench Press",
        sets: [
          { reps: 10, weight: 185, completed: true },
          { reps: 8, weight: 205, completed: true },
          { reps: 6, weight: 225, completed: false }
        ]
      }
    ],
    workoutTimer: {
      elapsed: 1200000 // milliseconds
    },
    restTimer: {
      active: true,
      startTime: 1708187747000,
      duration: 90000
    }
  }
}
```

## Implementation Steps
1. Set up Context API or state management solution
2. Create workout state schema
3. Migrate workout component to use global state
4. Implement localStorage save/restore logic
5. Add state synchronization between components
6. Add active workout indicator in UI
7. Implement resume workout functionality
8. Add workout end/cancel confirmation
9. Test navigation flows thoroughly
10. Test with device closing/app restart

## Testing Requirements
- [ ] Start workout, navigate away, return - progress maintained
- [ ] Complete sets, navigate away, return - sets still marked complete
- [ ] Active rest timer continues after navigation
- [ ] Workout timer maintains accuracy after navigation
- [ ] App restart shows resume workout option
- [ ] Completing workout clears persisted state
- [ ] Canceling workout clears persisted state
- [ ] Starting new workout with active session shows warning
- [ ] Test with multiple workouts in sequence
- [ ] Test edge cases (corrupted localStorage data)

## Priority
**CRITICAL** - Major usability issue preventing core functionality


## Dependencies
- Decision on state management approach (Context API vs library)
- May need to refactor existing workout components
- Integration with timer fixes (Issues #1 and #2)

## Related Issues
- Issue #1: Timer bugs (state management related)
- Issue #2: Rest timer sleep mode (needs persistent state)

## Notes
- This fix will likely improve overall app stability
- Consider adding workout history/analytics while implementing
- May want to add cloud sync in future iteration
- Consider data migration if changing state structure
