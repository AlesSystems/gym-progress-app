# Leaderboard Feature - User Guide

## Overview
The Leaderboard feature allows you to compete with other gym app users without needing to create an account. Track your progress, compare your stats, and stay motivated!

## Getting Started

### 1. Access the Leaderboard
- Open the app and go to the Dashboard
- Tap the **🏆 Leaderboard** button

### 2. Set Your Display Name
- On your first visit, you'll be prompted to set a display name
- Choose a name between 2-20 characters (letters, numbers, spaces, and underscores only)
- Tap **Set Display Name** to save
- You can change your name anytime by tapping **Change Name**

### 3. Complete Workouts
- Start and complete workouts as usual
- Your leaderboard stats automatically update after each completed workout
- No extra steps needed!

## Understanding the Leaderboard

### Timeframes
Choose which timeframe to view:
- **Daily**: Rankings reset each day
- **Weekly**: Rankings for the past 7 days
- **Monthly**: Rankings for the past 30 days
- **All Time**: Overall rankings since you started

### Your Stats
View your personal performance:
- **Rank**: Your position on the leaderboard
- **Score**: Your composite performance score
- **Workouts**: Total workouts completed in timeframe
- **Streak**: Consecutive days with workouts

### Rankings Display
- 🥇 **#1**: Gold medal for first place
- 🥈 **#2**: Silver medal for second place
- 🥉 **#3**: Bronze medal for third place
- **Your position** is highlighted with a special color

## How Scoring Works

Your score is calculated from multiple factors:

### Score Formula
```
Score = (Workouts × 10) + (Weight / 1000) + (Streak × 50) + (Time / 3600) + (PRs × 5)
```

### What Counts
1. **Completed Workouts** (10 points each)
   - Only finished workouts count
   - More workouts = higher score

2. **Total Weight Lifted** (1 point per 1000 lbs)
   - Sum of weight × reps for all non-warmup sets
   - Heavier workouts contribute more

3. **Current Streak** (50 points per day)
   - Consecutive days with at least one workout
   - Big bonus for consistency!

4. **Total Workout Time** (1 point per hour)
   - Time from start to finish
   - Rewards time investment

5. **Personal Records** (5 points each)
   - New weight milestones for each exercise
   - Encourages progression

### Tips to Improve Your Rank
- **Be Consistent**: Work out every day to build your streak (50 pts/day!)
- **Complete More Workouts**: Each workout adds 10 points
- **Push Your Limits**: Set new PRs to earn bonus points
- **Lift Heavy**: Total weight contributes to your score
- **Stay Active**: Longer workout sessions add up

## Privacy & Safety

### What We Track
- Anonymous user ID (no personal info)
- Display name (your choice)
- Workout statistics (from your completed workouts)

### What We DON'T Track
- ❌ Real name or email
- ❌ Location or IP address
- ❌ Personal information
- ❌ Workout content details

### Your Privacy
- Your identity is anonymous
- Only your display name is visible to others
- You can change your name anytime
- All data is calculated from your workouts

## Troubleshooting

### My stats aren't updating
- Make sure you **finish** workouts (not just discard them)
- Pull down to refresh the leaderboard
- Check that you've completed at least one workout

### I want to change my name
- Tap **Change Name** in the "Your Stats" section
- Enter a new name and tap **Save**

### Why is my streak 0?
- Streaks reset if you miss a day
- Today or yesterday must have a workout to maintain streak
- Make sure workouts are marked as completed

### Leaderboard is empty
- For testing: Use the debug button (dev mode only) to generate sample data
- In production: More users = more competition!

## Tips for Competition

### Beginner Strategy
1. Focus on building a workout habit
2. Complete workouts regularly (consistency matters!)
3. Don't compare yourself to top performers yet
4. Celebrate small wins and PRs

### Intermediate Strategy
1. Build and maintain long streaks
2. Increase workout frequency
3. Focus on progressive overload (more weight = PRs)
4. Track your score improvement over time

### Advanced Strategy
1. Optimize workout completion rate
2. Maximize streak days (50 pts each!)
3. Set multiple PRs per workout
4. Balance volume and intensity
5. Use different timeframes to compete

## Features

### Included
✅ Multiple timeframes (daily/weekly/monthly/all-time)
✅ Automatic stat tracking
✅ Real-time score calculation
✅ Top 3 medals
✅ Personal stat dashboard
✅ Pull-to-refresh
✅ Anonymous competition

### Coming Soon
- Friends/following system
- Custom challenges
- Achievement badges
- Historical ranking graphs
- Multiple leaderboard categories
- Social sharing

## FAQs

**Q: Do I need an account?**
A: No! The leaderboard uses anonymous IDs. Just set a display name.

**Q: Can others see my workouts?**
A: No, only your display name, rank, and aggregate stats are visible.

**Q: What if two users have the same score?**
A: Rankings are determined by the order scores are calculated.

**Q: Can I opt out?**
A: Simply don't set a display name, and your stats won't appear on the leaderboard.

**Q: Is my data shared across devices?**
A: Currently, no. Each device has its own anonymous ID.

**Q: How do I climb the rankings?**
A: Work out consistently, push for PRs, and build long streaks!

---

## Need Help?

If you encounter issues or have suggestions:
- Check the troubleshooting section above
- Review your completed workout history
- Ensure workouts have start and end times recorded
- Pull down to refresh if data seems stale

Happy competing! 💪🏆
