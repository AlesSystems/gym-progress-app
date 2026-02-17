# Feature #6: Leaderboard System (No Authentication Required)

## Feature Description
Implement a simple but effective leaderboard system that allows users to compete with others without requiring authentication. Users can see rankings and compare their progress in a fun, competitive environment.

## User Story
*As a gym app user, I want to see how my workout performance compares to other users on a leaderboard, so that I can stay motivated and compete with others without needing to create an account.*

## Requirements

### Functional Requirements
1. Display leaderboard with user rankings
2. Allow users to enter a display name (no auth required)
3. Track and display relevant metrics (workouts completed, total weight lifted, etc.)
4. Update leaderboard in real-time or near real-time
5. Filter/sort by different time periods (daily, weekly, monthly, all-time)
6. Highlight current user's position in the leaderboard
7. Show top performers and nearby competitors

### Non-Functional Requirements
- Simple and intuitive UI
- Fast loading times
- Prevent spam and abuse
- Privacy-friendly (no personal data required)
- Scalable to handle many users
- Fair competition mechanics

## Proposed Solution

### User Identity Management (No Auth)
Since no authentication is required, use one of these approaches:

**Option A: Device-Based Identity**
- Generate unique device ID on first use
- Store in localStorage
- Associate display name with device ID
- Pros: Simple, persistent
- Cons: Lost if localStorage cleared

**Option B: Simple Name Entry**
- User enters display name when accessing leaderboard
- Store name and stats locally
- Associate with anonymous user ID
- Pros: Very simple
- Cons: Name collisions possible

**Option C: Hybrid (Recommended)**
- Generate anonymous user ID on first launch
- Allow user to set display name
- Store both in localStorage
- Sync stats with backend using anonymous ID
- Pros: Balance of simplicity and persistence
- Cons: Can be gamed if user creates multiple IDs

## Leaderboard Metrics

### Primary Metrics
1. **Total Workouts Completed** - Count of finished workouts
2. **Total Weight Lifted** - Sum of all weight × reps
3. **Workout Streak** - Consecutive days with workouts
4. **Total Workout Time** - Total time spent working out

### Secondary Metrics
5. **Personal Records** - Count of PRs set
6. **Average Workout Duration** - Consistency indicator
7. **Exercises Variety** - Different exercises performed

### Scoring System
Create a composite score combining multiple metrics:
```javascript
score = (workouts * 10) + (totalWeight / 1000) + (streak * 50) + (totalTime / 3600)
```

## Data Structure

### User Entry
```javascript
{
  userId: "anon_abc123xyz", // Generated anonymous ID
  displayName: "GymWarrior99",
  stats: {
    totalWorkouts: 45,
    totalWeightLifted: 125000, // in lbs or kg
    currentStreak: 7,
    longestStreak: 14,
    totalWorkoutTime: 3600000, // milliseconds
    personalRecords: 12,
    lastUpdated: 1708187747000
  },
  score: 1250, // Calculated composite score
  createdAt: 1708187747000
}
```

### Leaderboard Response
```javascript
{
  timeframe: "weekly", // daily, weekly, monthly, all-time
  leaderboard: [
    {
      rank: 1,
      userId: "anon_abc123xyz",
      displayName: "GymWarrior99",
      score: 1250,
      stats: { ... },
      isCurrentUser: false
    },
    // ... more entries
  ],
  currentUserRank: 42,
  totalUsers: 1000
}
```

## UI/UX Design

### Leaderboard Screen Layout
```
┌─────────────────────────────────┐
│  🏆 Leaderboard                  │
├─────────────────────────────────┤
│  [Daily] [Weekly] [Monthly] [All]│
├─────────────────────────────────┤
│  🥇 #1  GymWarrior99    1,250 pts│
│  🥈 #2  IronLifter       1,180 pts│
│  🥉 #3  FitQueen         1,150 pts│
│  👤 #4  SwolePatrol      1,100 pts│
│  👤 #5  BeastMode         1,050 pts│
│       ...                         │
│  ⭐ #42 YOU (YourName)    680 pts │ <- Highlighted
│       ...                         │
├─────────────────────────────────┤
│  📊 Your Stats                    │
│  • 12 Workouts This Week          │
│  • 45,000 lbs Lifted              │
│  • 7 Day Streak 🔥                │
└─────────────────────────────────┘
```

### Name Entry Flow
1. First time accessing leaderboard: prompt for display name
2. Show validation (2-20 characters, no special chars)
3. Allow name change in settings
4. Show preview before saving

## Backend Implementation

### Option 1: Firebase Realtime Database (Recommended)
- Easy setup, no auth required
- Real-time updates
- Built-in security rules
- Scalable
- Free tier available

### Option 2: Simple REST API
- Custom backend (Node.js/Express)
- PostgreSQL/MongoDB for storage
- More control over data
- Requires hosting

### Option 3: Supabase
- PostgreSQL with REST API
- Real-time subscriptions
- Anonymous auth support
- Generous free tier

## Anti-Abuse Measures

### Preventing Cheating
1. **Rate Limiting**: Limit stat updates frequency
2. **Validation**: Backend validates workout data (reasonable limits)
3. **Anomaly Detection**: Flag suspicious score jumps
4. **Device Limits**: Track device IDs, limit multiple accounts
5. **Manual Review**: Flag top performers for review
6. **Honest System Notice**: Remind users it's for fun

### Data Validation Rules
```javascript
// Example validation
if (workout.duration < 60000) reject(); // Min 1 minute
if (workout.duration > 14400000) reject(); // Max 4 hours
if (set.weight > 1000) reject(); // Max 1000 lbs/kg per set
if (set.reps > 100) reject(); // Max 100 reps per set
```

## Implementation Steps

### Phase 1: Core Infrastructure (4-6 hours)
1. Set up backend service (Firebase/Supabase)
2. Create database schema for leaderboard
3. Implement anonymous user ID generation
4. Store user ID in localStorage
5. Create API endpoints for leaderboard data

### Phase 2: Data Collection (3-4 hours)
1. Modify workout completion flow to submit stats
2. Calculate metrics from workout data
3. Compute composite score
4. Send stats to backend on workout completion
5. Handle offline scenarios

### Phase 3: Leaderboard UI (4-6 hours)
1. Create leaderboard screen/component
2. Implement timeframe filters (daily, weekly, etc.)
3. Display ranked list with visual indicators
4. Highlight current user's position
5. Add "jump to my position" functionality
6. Show loading and error states

### Phase 4: Name Management (2-3 hours)
1. Create name entry screen
2. Add name validation
3. Allow name changes in settings
4. Update backend with name changes
5. Handle duplicate names

### Phase 5: Polish & Testing (3-4 hours)
1. Add animations and visual feedback
2. Implement pull-to-refresh
3. Add share functionality
4. Test with multiple users
5. Performance optimization
6. Deploy and monitor

## Testing Requirements
- [ ] Anonymous user ID generated and persisted
- [ ] Display name can be set and updated
- [ ] Workout stats correctly submitted to leaderboard
- [ ] Leaderboard displays correct rankings
- [ ] Timeframe filters work correctly
- [ ] Current user's position highlighted
- [ ] Real-time updates work (if implemented)
- [ ] Validation prevents unrealistic stats
- [ ] Works offline and syncs when online
- [ ] Performance good with 1000+ users
- [ ] UI responsive on all devices
- [ ] No personal data leaked

## Privacy Considerations
- No email, phone, or personal info collected
- Anonymous user IDs cannot be traced to individuals
- Display names are public
- Users can change display names anytime
- No IP tracking or analytics beyond aggregate stats
- GDPR/CCPA compliant (anonymous data)

## Future Enhancements (V2)
- Friends/following system (still no auth)
- Challenges and achievements
- Custom leaderboards (by gym, age group, etc.)
- Weekly/monthly competition events
- Badges and rewards
- Social sharing features
- Historical ranking graphs
- Multiple leaderboard categories

## Priority
**MEDIUM-HIGH** - Requested feature that improves engagement

## Estimated Effort
16-23 hours total

## Dependencies
- Backend service setup (Firebase/Supabase account)
- Workout completion flow (must track stats)
- localStorage for client-side persistence
- Internet connection for leaderboard sync

## Technical Stack Recommendation
- **Frontend**: Existing React/Vue/etc. framework
- **Backend**: Firebase Realtime Database or Supabase
- **Storage**: localStorage for user ID and name
- **API**: REST or WebSocket for real-time updates

## Success Metrics
- % of users who set a display name
- Daily active users viewing leaderboard
- User retention after leaderboard launch
- Average session time increase
- Workout completion rate increase

## Notes
- Keep it simple and fun, not too competitive
- Focus on personal progress, not just beating others
- Consider different leaderboards for different goals
- Make it feel inclusive, not intimidating
- Allow users to opt-out or be invisible
