# Workout State Persistence Fix - Testing Guide

## Quick Test Scenarios

### Scenario 1: Basic Navigation Test
1. Start a new workout from Dashboard
2. Add an exercise (e.g., "Bench Press")
3. Add a set (e.g., 100kg x 10 reps)
4. Navigate to History screen
5. **Expected**: Active workout banner appears at bottom
6. Navigate to Stats screen
7. **Expected**: Banner still visible
8. Tap the banner
9. **Expected**: Returns to active workout with all data intact

### Scenario 2: Multi-Screen Navigation
1. With an active workout in progress
2. Navigate through: Dashboard → Settings → Nutrition → Stats → History
3. **Expected**: Banner visible on all screens
4. **Expected**: Workout data persists throughout
5. Return to active workout
6. **Expected**: All exercises and sets are preserved

### Scenario 3: App Restart Test
1. Start a workout and add some exercises/sets
2. Note the workout time
3. Close the app completely (force quit)
4. Reopen the app
5. **Expected**: Resume workout dialog appears on Dashboard
6. Choose "Resume"
7. **Expected**: Workout continues with all data intact
8. **Expected**: Timer continues from where it left off

### Scenario 4: Discard Workout Test
1. Start a workout with some exercises
2. Navigate to Dashboard
3. **Expected**: Resume workout dialog appears
4. Choose "Discard"
5. **Expected**: Workout is discarded
6. **Expected**: Banner disappears
7. Start a new workout
8. **Expected**: Fresh workout session starts

### Scenario 5: Complete Workout Test
1. Start a workout
2. Add exercises and sets
3. Navigate away to another screen
4. **Expected**: Banner visible
5. Return to active workout via banner
6. Tap "Finish" button
7. Complete the finish workflow
8. **Expected**: Banner disappears
9. **Expected**: No resume dialog on Dashboard

### Scenario 6: Loading State Test
1. Start the app fresh
2. **Expected**: Brief loading state if there's an active workout
3. **Expected**: No premature redirects during loading
4. **Expected**: Smooth transition to active workout or Dashboard

### Scenario 7: Real-Time Updates Test
1. Start a workout
2. Navigate to another screen (banner visible)
3. Wait and watch the timer on the banner
4. **Expected**: Timer updates every second
5. **Expected**: Exercise count accurate
6. Return to active workout
7. Add another exercise
8. Navigate away again
9. **Expected**: Banner shows updated exercise count

## Visual Verification

### Banner Appearance
- [ ] Banner appears at bottom of screen
- [ ] Banner has primary color background
- [ ] Green indicator dot visible
- [ ] Text is clear and readable
- [ ] Shows format: "Workout in Progress" | "Xm • Y exercises"
- [ ] Arrow icon on the right side
- [ ] Smooth fade in/out animation

### Banner Behavior
- [ ] Banner hidden on ActiveWorkoutScreen
- [ ] Banner visible on all other screens when workout active
- [ ] Banner disappears when workout finished
- [ ] Banner disappears when workout discarded
- [ ] Tapping banner navigates to active workout
- [ ] Shadow/elevation visible (makes it "float")

### Resume Dialog
- [ ] Appears when returning to Dashboard with active workout
- [ ] Shows time since workout started
- [ ] Has "Discard" and "Resume" buttons
- [ ] "Discard" removes active workout and banner
- [ ] "Resume" navigates to ActiveWorkoutScreen

## Data Integrity Checks

### After Navigation
- [ ] Exercise names preserved
- [ ] Set details preserved (weight, reps, warmup status)
- [ ] Exercise order maintained
- [ ] Set order maintained
- [ ] Workout start time accurate
- [ ] Notes preserved (if added)

### After App Restart
- [ ] All exercises present
- [ ] All sets present
- [ ] Workout timer continues from correct point
- [ ] No data corruption
- [ ] No duplicate entries

## Performance Checks

- [ ] Navigation is smooth (no lag)
- [ ] Banner animation is smooth
- [ ] No stuttering when updating timer
- [ ] App responsive during state updates
- [ ] No memory leaks during extended sessions

## Error Handling

### Edge Cases to Test
- [ ] Navigate very rapidly between screens
- [ ] Start workout → immediately navigate away
- [ ] Add many exercises rapidly
- [ ] Long workout sessions (1+ hour)
- [ ] Multiple workout start/discard cycles

## Device Compatibility

Test on:
- [ ] iOS device (if applicable)
- [ ] Android device
- [ ] Different screen sizes
- [ ] Dark mode enabled
- [ ] Light mode enabled

## Known Limitations

- Banner requires sufficient screen space (may need adjustment for very small screens)
- Resume dialog shows once per Dashboard visit (by design)
- Immediate persistence may increase storage writes (acceptable trade-off)

## Reporting Issues

If you find any issues during testing, please note:
1. Exact steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screen where issue occurred
5. Device and OS version
6. App mode (light/dark)

## Success Criteria

All tests should pass with:
- ✅ Zero data loss during navigation
- ✅ Smooth user experience
- ✅ Clear visual feedback (banner)
- ✅ Reliable state persistence
- ✅ Proper cleanup on workout completion

---

**Testing Priority**: HIGH
**Estimated Testing Time**: 15-20 minutes for full test suite
**Critical Tests**: Scenario 1, 2, and 3
