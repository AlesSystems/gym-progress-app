# Feature #7: Weight Tracking System

## Feature Description
Implement a comprehensive weight tracking feature that allows users to monitor their body weight over time, visualize trends, and correlate weight changes with their workout progress.

## User Story
*As a gym app user, I want to track my body weight over time and see visual progress, so that I can monitor my fitness goals (weight loss, muscle gain, or maintenance) alongside my workout data.*

## Requirements

### Functional Requirements
1. Allow users to log their body weight with date/time
2. Display weight history in list and chart format
3. Show weight trends (gaining, losing, maintaining)
4. Calculate statistics (average, change over time, etc.)
5. Set weight goals (target weight)
6. Show progress toward weight goals
7. Allow editing/deleting past weight entries
8. Support multiple weight units (lbs, kg)
9. Remind users to log weight regularly
10. Export weight data

### Non-Functional Requirements
- Simple, quick weight entry
- Fast loading of historical data
- Smooth, interactive charts
- Works offline, syncs when online
- Privacy-focused (data stored locally or encrypted)

## User Interface Design

### Weight Dashboard
```
┌─────────────────────────────────┐
│  ⚖️ Weight Tracker                │
├─────────────────────────────────┤
│  Current Weight: 185 lbs         │
│  Goal: 175 lbs                   │
│  Progress: -5 lbs (▼2.7%)        │
│                                  │
│  ┌─────────────────────────┐    │
│  │     [Weight Chart]      │    │
│  │    /\    /\             │    │
│  │   /  \  /  \__          │    │
│  │  /    \/      \__       │    │
│  └─────────────────────────┘    │
│                                  │
│  🎯 On track to reach goal!      │
│                                  │
│  [+ Log Weight]                  │
├─────────────────────────────────┤
│  Recent Entries                  │
│  • Today        185 lbs          │
│  • 2 days ago   186 lbs  ▼1     │
│  • 5 days ago   187 lbs  ▼1     │
│  • 1 week ago   188 lbs  ▼1     │
└─────────────────────────────────┘
```

### Weight Entry Screen
```
┌─────────────────────────────────┐
│  ← Log Weight                    │
├─────────────────────────────────┤
│                                  │
│     [ 185 ] [lbs ▼]              │
│                                  │
│  Date: Today, Feb 17, 2026       │
│  Time: 8:30 AM                   │
│                                  │
│  Notes (optional):               │
│  ┌─────────────────────────┐    │
│  │ Morning weight after... │    │
│  └─────────────────────────┘    │
│                                  │
│  [Cancel]  [Save Entry]          │
└─────────────────────────────────┘
```

### Goal Setting Screen
```
┌─────────────────────────────────┐
│  ← Set Weight Goal               │
├─────────────────────────────────┤
│  Current: 185 lbs                │
│                                  │
│  Target Weight:                  │
│     [ 175 ] lbs                  │
│                                  │
│  Goal Type:                      │
│  ○ Lose Weight                   │
│  ● Gain Muscle                   │
│  ○ Maintain                      │
│                                  │
│  Target Date (optional):         │
│     [June 1, 2026]               │
│                                  │
│  Weekly Goal: -1 lb/week         │
│                                  │
│  [Save Goal]                     │
└─────────────────────────────────┘
```

## Data Structure

### Weight Entry
```javascript
{
  id: "weight_123abc",
  userId: "user_456def", // Or anonymous ID
  weight: 185,
  unit: "lbs", // or "kg"
  date: 1708187747000, // timestamp
  time: "08:30", // optional time of day
  notes: "Morning weight after breakfast",
  createdAt: 1708187747000,
  updatedAt: 1708187747000
}
```

### Weight Goal
```javascript
{
  id: "goal_789xyz",
  userId: "user_456def",
  startWeight: 190,
  targetWeight: 175,
  currentWeight: 185,
  goalType: "lose", // "lose", "gain", "maintain"
  startDate: 1708187747000,
  targetDate: 1715000000000, // optional
  weeklyGoal: -1, // lbs/kg per week
  isActive: true,
  createdAt: 1708187747000,
  updatedAt: 1708187747000
}
```

### Weight Statistics
```javascript
{
  currentWeight: 185,
  startingWeight: 190,
  lowestWeight: 183,
  highestWeight: 192,
  averageWeight: 186.5,
  totalChange: -5,
  percentChange: -2.7,
  trend: "decreasing", // "increasing", "stable", "decreasing"
  lastUpdated: 1708187747000,
  entriesCount: 45
}
```

## Features Breakdown

### 1. Weight Entry
- Quick add button from dashboard
- Date/time picker (defaults to now)
- Number input with increment/decrement buttons
- Unit selector (lbs/kg)
- Optional notes field
- Save and cancel actions

### 2. Weight History
- List view with date and weight
- Show change from previous entry (▲▼)
- Edit and delete options
- Search/filter by date range
- Sort by date (newest/oldest)

### 3. Weight Chart
**Chart Types:**
- Line chart (primary) - shows trend over time
- Bar chart (optional) - weekly/monthly averages
- Area chart (optional) - filled trend visualization

**Chart Features:**
- Interactive (tap to see details)
- Zoom and pan
- Time range selection (week, month, 3 months, year, all)
- Goal line overlay
- Trend line
- Responsive and smooth

**Recommended Library:**
- Chart.js
- Recharts
- Victory Native (React Native)
- D3.js (advanced)

### 4. Statistics & Analytics
- Current weight
- Starting weight (first entry)
- Weight change (total, %)
- Average weight
- Highest/lowest weight
- Trend direction
- Days tracked
- Average weekly change
- Projected goal date

### 5. Goal Tracking
- Set target weight
- Choose goal type (lose/gain/maintain)
- Set target date (optional)
- Show progress percentage
- Show remaining weight to goal
- Show estimated completion date
- Motivational messages

### 6. Reminders (Optional)
- Daily/weekly weight logging reminders
- Customizable reminder time
- Push notifications or in-app
- Can be enabled/disabled

## Implementation Plan

### Phase 1: Core Data Layer (3-4 hours)
1. Create weight entry data model
2. Set up localStorage/database for weight data
3. Implement CRUD operations (Create, Read, Update, Delete)
4. Add data validation
5. Handle unit conversions (lbs ↔ kg)

### Phase 2: Weight Entry UI (3-4 hours)
1. Create weight entry form/modal
2. Add number input with validation
3. Implement date/time picker
4. Add unit selector
5. Save entry to storage
6. Show success feedback

### Phase 3: Weight History (2-3 hours)
1. Create weight history list component
2. Display entries with dates
3. Show change indicators (▲▼)
4. Add edit/delete functionality
5. Implement date filtering
6. Add empty state

### Phase 4: Statistics Dashboard (2-3 hours)
1. Calculate weight statistics
2. Create dashboard summary cards
3. Show current vs goal progress
4. Display trend indicators
5. Add motivational messages

### Phase 5: Chart Visualization (4-6 hours)
1. Choose and integrate chart library
2. Create line chart for weight over time
3. Add interactive features (tooltips)
4. Implement time range filters
5. Add goal line overlay
6. Optimize performance
7. Make responsive for mobile

### Phase 6: Goal Setting (3-4 hours)
1. Create goal setting form
2. Calculate and display progress
3. Show projected completion date
4. Update goal tracking on new entries
5. Handle goal completion

### Phase 7: Polish & Features (3-4 hours)
1. Add data export functionality
2. Implement reminder system (optional)
3. Add onboarding flow
4. Create help/info tooltips
5. Add animations and transitions
6. Implement offline support
7. Add data backup/restore

## Technical Implementation

### Storage Options

**Option 1: localStorage (Simple)**
```javascript
// Store weight entries
const entries = JSON.parse(localStorage.getItem('weightEntries') || '[]');
entries.push(newEntry);
localStorage.setItem('weightEntries', JSON.stringify(entries));
```

**Option 2: IndexedDB (Better)**
- More storage capacity
- Better performance for large datasets
- Structured querying
- Use with Dexie.js for easier API

**Option 3: Backend Sync (Best)**
- Store locally + sync to backend
- Cross-device synchronization
- Data backup
- Use Firebase, Supabase, or custom API

### Unit Conversion
```javascript
const lbsToKg = (lbs) => lbs * 0.453592;
const kgToLbs = (kg) => kg * 2.20462;

// Store in preferred unit, convert for display
function convertWeight(weight, fromUnit, toUnit) {
  if (fromUnit === toUnit) return weight;
  if (fromUnit === 'lbs' && toUnit === 'kg') return lbsToKg(weight);
  if (fromUnit === 'kg' && toUnit === 'lbs') return kgToLbs(weight);
}
```

### Statistics Calculation
```javascript
function calculateStatistics(entries) {
  const weights = entries.map(e => e.weight);
  const current = weights[weights.length - 1];
  const starting = weights[0];
  
  return {
    currentWeight: current,
    startingWeight: starting,
    averageWeight: weights.reduce((a, b) => a + b) / weights.length,
    lowestWeight: Math.min(...weights),
    highestWeight: Math.max(...weights),
    totalChange: current - starting,
    percentChange: ((current - starting) / starting) * 100,
    trend: calculateTrend(weights)
  };
}
```

## Testing Requirements
- [ ] Add weight entry successfully
- [ ] Edit existing weight entry
- [ ] Delete weight entry
- [ ] View weight history list
- [ ] Chart displays correctly with data
- [ ] Chart interactive features work
- [ ] Unit conversion accurate (lbs ↔ kg)
- [ ] Statistics calculate correctly
- [ ] Goal progress updates on new entry
- [ ] Data persists after app restart
- [ ] Offline functionality works
- [ ] Export data functionality
- [ ] Reminders trigger correctly (if implemented)
- [ ] Responsive on mobile and desktop
- [ ] Works with zero entries (empty state)
- [ ] Works with one entry
- [ ] Works with many entries (performance)

## Integration Points
- Link with workout data (show weight on workout days)
- Show weight milestones on leaderboard (optional)
- Include weight in exported workout data
- Show correlation between workouts and weight change

## Privacy & Data Security
- Weight data stored locally by default
- If backend sync: encrypt sensitive data
- No sharing without explicit permission
- Allow data export for user control
- Implement data deletion (right to be forgotten)

## Priority
**MEDIUM** - Valuable feature for fitness tracking

## Dependencies
- Chart library (Chart.js, Recharts, etc.)
- Storage solution (localStorage, IndexedDB, backend)
- Date/time picker library (optional)
- Push notification setup (if reminders implemented)

## Success Metrics
- % of users who log weight at least once
- Average weight entries per user
- Retention of users who track weight
- Goal completion rate
- Feature usage frequency

## Future Enhancements (V2)
- Body measurements (waist, chest, arms, etc.)
- Body composition tracking (body fat %, muscle mass)
- Progress photos
- Multiple weight measurements per day
- Correlation analysis (weight vs workouts)
- Meal tracking integration
- Smart predictions and insights
- Social features (share progress)
- Integration with smart scales (Bluetooth)
- Apple Health / Google Fit sync

## Notes
- Keep entry process simple (under 10 seconds)
- Focus on visualization - chart is key
- Be encouraging, not judgmental
- Support all fitness goals (gain, lose, maintain)
- Consider health warnings for extreme goals
- Make it easy to skip days without guilt
