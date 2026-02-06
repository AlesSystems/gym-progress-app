# Navigation & App Flow

## Overview
This document defines the navigation structure, user flows, and screen transitions for the Workout Planner app.

---

## Navigation Architecture

### Pattern: Tab-Based Navigation + Modal Stack

**Primary Navigation:** Bottom Tab Navigator (4 tabs)
**Secondary Navigation:** Stack Navigator for drill-down screens
**Modal Navigation:** Bottom sheets and full-screen modals for quick actions

---

## Main Tabs

### 1. 🏠 Dashboard
**Purpose:** Quick overview and entry point for starting workouts

**Content:**
- Welcome message with current date
- "Start Workout" CTA button (primary action)
- Quick stats cards:
  - Last workout summary (date, duration, exercises)
  - Current week volume
  - Recent PRs (last 7 days)
- Suggested workout (based on workout template or last session)

**Actions:**
- Tap "Start Workout" → Navigate to Active Workout screen
- Tap stat card → Navigate to relevant Stats screen
- Pull to refresh → Update stats

**Entry Point:** App launch default screen

---

### 2. 💪 Workout (Active)
**Purpose:** Log exercises and sets during an active workout session

**State:**
- Only accessible when workout is in progress
- Tab badge shows duration timer
- If no active workout, shows "No Active Workout" state with "Start" button

**Content (Active State):**
- Header: Timer showing workout duration
- List of exercises in current workout
- Each exercise shows:
  - Exercise name
  - Sets logged (with reps/weight)
  - PR indicators if new record
  - Quick add set button
- Floating Action Button: "Add Exercise"
- Bottom buttons: "Pause" | "Finish Workout"

**Actions:**
- Tap exercise → Expand to show all sets
- Tap "Add Exercise" → Exercise picker modal
- Swipe set → Delete
- Tap set → Edit (bottom sheet with weight/reps inputs)
- Tap "Finish Workout" → Confirmation dialog → Save & return to Dashboard

**Auto-save:** Every 30 seconds or on app background

---

### 3. 📚 History
**Purpose:** View and manage past workouts

**Content:**
- Chronological list of completed workouts (newest first)
- Each workout card shows:
  - Date and day of week
  - Duration
  - Exercise count
  - Total volume
  - PR count badge (if any)
- Segmented control: "List View" | "Calendar View"

**List View:**
- Virtualized FlatList for performance
- Pull to refresh
- Infinite scroll / pagination (20 per page)

**Calendar View:**
- Month calendar with dots on workout days
- Tap date → Show workout(s) from that day
- Swipe months

**Actions:**
- Tap workout card → Workout Detail screen
- Long press workout → Context menu (Edit | Delete | Duplicate)
- Search bar (filter by exercise name or date)

---

### 4. 📊 Stats
**Purpose:** View progress and analytics

**Content:**
- Exercise selector dropdown (search + recent exercises)
- Selected exercise stats:
  - Chart showing progress over time
  - Time range selector: 4 Weeks | 3 Months | 1 Year | All Time
  - Metric selector: Max Weight | Total Volume | Rep PRs
- Stats cards:
  - All-time PR
  - Last session details
  - Average weight/volume
  - Total sessions count
- Progress trend indicator (↑ improving, → plateau, ↓ declining)

**Actions:**
- Select exercise → Update chart and stats
- Tap data point on chart → Navigate to that workout
- Change time range → Re-render chart
- Switch metric → Update visualization

---

## Secondary Screens

### Workout Detail Screen
**Navigation:** History Tab → Tap workout card

**Content:**
- Header: Date, duration, bodyweight (if logged)
- List of exercises with all sets
- Session notes (if any)
- "Compared to Last Time" section (future)

**Actions:**
- Edit button → Enable editing mode (change reps/weight/notes)
- Delete button → Confirmation → Delete workout
- "Use as Template" → Create new workout with same exercises
- Share button → Export workout as text/image (future)

**Back:** Return to History list

---

### Exercise Picker Modal
**Navigation:** Active Workout → Tap "Add Exercise"

**Content:**
- Search bar (autocomplete based on previous exercises)
- Recent exercises list (last 10 unique)
- Categorized list (if templates enabled):
  - Push
  - Pull
  - Legs
  - Core
  - Other
- "Create New Exercise" option

**Actions:**
- Tap exercise → Add to current workout → Auto-scroll to new exercise
- Type in search → Filter list in real-time
- Tap "Create New" → Text input modal → Add custom exercise

**Dismiss:** Swipe down or Cancel button

---

### Set Input Bottom Sheet
**Navigation:** Active Workout → Tap existing set or "Add Set"

**Content:**
- Large number inputs for:
  - Weight (with unit toggle: kg/lbs)
  - Reps
- Checkbox: "Warmup Set"
- Optional inputs (collapsed by default):
  - RPE slider (1-10)
  - Notes text field
- Previous set reference (e.g., "Last: 10 reps @ 100 lbs")
- Quick increment buttons: +2.5, +5, +10 for weight

**Actions:**
- Tap Save → Add/update set → Dismiss sheet
- Tap Cancel → Dismiss without saving
- Use device keyboard for number entry

**UX Optimizations:**
- Auto-focus weight input on open
- Remember last values for quick entry
- Quick copy from previous set button

---

## Navigation Flow Diagrams

### Primary User Journey: Logging a Workout

```
App Launch
    ↓
Dashboard Tab
    ↓
[Tap "Start Workout"]
    ↓
Active Workout Screen (empty)
    ↓
[Tap "Add Exercise"]
    ↓
Exercise Picker Modal
    ↓
[Select "Bench Press"]
    ↓
Active Workout Screen (with Bench Press)
    ↓
[Tap "Add Set"]
    ↓
Set Input Bottom Sheet
    ↓
[Enter: 10 reps, 100 lbs]
    ↓
[Tap Save]
    ↓
Active Workout Screen (set logged)
    ↓
[Repeat for more sets/exercises]
    ↓
[Tap "Finish Workout"]
    ↓
Confirmation Dialog
    ↓
[Confirm]
    ↓
Dashboard Tab (with updated stats)
```

---

### Secondary Journey: Reviewing Progress

```
Dashboard Tab
    ↓
[Tap Stats Tab]
    ↓
Stats Screen
    ↓
[Select "Bench Press" from dropdown]
    ↓
Chart renders with progress
    ↓
[Tap data point on chart]
    ↓
Navigate to Workout Detail Screen
    ↓
Review that specific workout
    ↓
[Back button]
    ↓
Return to Stats Screen
```

---

## Gesture-Based Navigation

### Swipe Gestures
- **Swipe down on modal** → Dismiss modal
- **Swipe left on workout card** → Show Delete button
- **Swipe right on workout card** → Show Duplicate button
- **Swipe between calendar months** → Navigate months in Calendar View

### Long Press
- **Long press workout card** → Context menu (Edit | Delete | Duplicate)
- **Long press exercise name** → Show exercise stats preview

### Pull to Refresh
- Available on:
  - Dashboard
  - History List
  - Stats screen

---

## Navigation Stack Configuration

### React Navigation Setup

```typescript
// Main App Navigator
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}

// Root Navigator (with modals)
const Stack = createStackNavigator();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="WorkoutDetail" 
        component={WorkoutDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen 
        name="ExercisePicker" 
        component={ExercisePickerModal}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="SetInput" 
        component={SetInputSheet}
        options={{ presentation: 'transparentModal' }}
      />
    </Stack.Navigator>
  );
}
```

---

## Transition Animations

### Screen Transitions
- **Tab change:** Instant (no animation) for speed
- **Push to detail:** Slide from right (iOS native feel)
- **Modal present:** Slide up from bottom
- **Bottom sheet:** Spring animation with gesture follow

### Loading States
- **Skeleton screens** for data-heavy views
- **Spinner** only for operations > 500ms
- **Optimistic updates** for set logging (instant visual feedback)

---

## Deep Linking (Future)

### URL Scheme: `workoutplanner://`

**Examples:**
- `workoutplanner://workout/start` → Start new workout
- `workoutplanner://workout/{id}` → View specific workout
- `workoutplanner://stats/bench-press` → View stats for exercise
- `workoutplanner://history?date=2026-02-05` → History filtered by date

**Use Cases:**
- Siri Shortcuts integration
- Widget taps
- Notification actions

---

## Navigation State Persistence

### Save on App Background
- Current tab index
- Scroll position in History
- Selected exercise in Stats
- Active workout state (auto-saved separately)

### Restore on Reopen
- Return user to last viewed tab
- Restore scroll position
- If workout was in progress, show resume prompt

**Implementation:** Use React Navigation's state persistence

---

## Error State Navigation

### Network Errors (Future)
- Show banner at top
- Allow offline usage
- Retry button

### Data Load Failures
- Show error screen with:
  - Error message
  - "Retry" button
  - "Go to Dashboard" fallback

### Workout Recovery
- If app crashes during workout:
  - On relaunch, detect incomplete workout
  - Show modal: "You have an unfinished workout. Resume or discard?"
  - Resume → Load workout into Active Workout screen
  - Discard → Delete draft, go to Dashboard

---

## Accessibility Navigation

### VoiceOver Support
- All tabs labeled clearly
- Logical focus order
- Announce state changes (e.g., "Set logged", "PR achieved!")

### Tab Bar
- Large touch targets (min 44x44 points)
- Clear active state (color + icon change)
- Haptic feedback on tab change

### Keyboard Navigation (iPad support)
- Tab key to move between inputs
- Enter to confirm actions
- Escape to dismiss modals

---

## Performance Optimizations

### Lazy Loading
- Load tab content only when first accessed
- Cache rendered screens in memory

### Prefetching
- Prefetch next month's data in Calendar view on scroll
- Preload recent exercises for Exercise Picker

### Minimize Re-renders
- Use React.memo for list items
- Split state into smaller contexts
- Optimize FlatList with proper keys and callbacks

---

## Navigation Analytics (Future)

**Track:**
- Most visited screens
- Average time on each screen
- Navigation paths (funnel analysis)
- Abandoned workout rate

**Purpose:** Identify UX friction points and optimize flow

---

## Summary

### Key Principles
1. **Fast Path First** - Critical actions (logging sets) require minimal taps
2. **No Dead Ends** - Always clear path back or forward
3. **Context Preservation** - Return users to where they were
4. **Predictable Patterns** - Consistent navigation across app
5. **One-Handed Friendly** - Bottom tabs, reachable buttons
6. **Offline Ready** - All navigation works without network

### Navigation Priorities
- Speed > Fancy transitions
- Gesture support for power users
- Clear visual hierarchy
- Recovery from errors/crashes
- Future-proof for deep linking and widgets
