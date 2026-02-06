# Vision & Scope

## App Vision

A **personal iOS gym progress app** built with React Native that empowers users to track their strength training journey with simplicity, speed, and clarity.

---

## Purpose

This app exists to solve a core problem: **making workout tracking effortless during gym sessions while providing meaningful long-term insights.**

Most fitness apps are either:
- Too complex (social features, meal tracking, paid tiers)
- Too slow (network-dependent, heavy animations)
- Too limited (no proper progress visualization)

This app takes a different approach:

### Core Principles

1. **Offline-First** - Works fully offline, no internet required
2. **Speed** - Fast to use during workouts, minimal friction
3. **Focus** - Long-term progress visualization over vanity metrics
4. **Expandability** - Foundation for future AI, gamification, and cloud features

---

## What This App Is

### ✅ A Personal Training Companion

- **Workout Logger** - Quick entry for sets, reps, and weight
- **Progress Tracker** - Visualize strength gains over time
- **PR Detector** - Automatically highlight personal records
- **History Manager** - Review and compare past sessions

### ✅ Built for Real Gym Use

- **One-Handed Operation** - Log sets while holding phone
- **Minimal Taps** - Common actions require 2-3 taps max
- **Smart Defaults** - Auto-fill from last workout
- **Dark Mode First** - Optimized for gym lighting conditions
- **Big Touch Targets** - Easy to tap when tired/sweaty

### ✅ Data You Own

- **Local Storage** - All data stored on device
- **No Lock-In** - Export to JSON anytime
- **Privacy-First** - Zero data collection or tracking
- **Offline Forever** - Never depends on servers

---

## What This App Is NOT (For Now)

### ❌ Non-Goals

These are explicitly **out of scope** for the MVP to maintain focus:

1. **Social Features**
   - No sharing workouts
   - No following friends
   - No leaderboards or competitions
   
2. **Accounts / Authentication**
   - No sign-up or login
   - No cloud sync (initially)
   - No email/password management

3. **Monetization**
   - No ads
   - No in-app purchases
   - No premium tiers

4. **Android Support**
   - iOS only initially
   - React Native allows future Android port
   - Focus on quality over platform coverage

5. **Nutrition Tracking**
   - No meal logging
   - No calorie counting
   - Pure strength training focus

6. **Workout Plans**
   - No pre-built programs
   - No AI coaching (yet)
   - User creates own routines

---

## Target User

### Primary Persona: "The Consistent Lifter"

**Demographics:**
- Ages 20-45
- Lifts 2-5 times per week
- Has been training for 6+ months
- Owns an iPhone

**Goals:**
- Track progress to ensure linear progression
- Beat personal records consistently
- Review what worked in past cycles
- Minimize time spent on app during workout

**Pain Points with Existing Apps:**
- Too slow to log sets mid-workout
- Requires internet connection
- Cluttered with features they don't use
- Unclear if they're actually progressing

**Why They'll Love This App:**
- Logs sets in 5 seconds or less
- Works in basement gyms with no signal
- Clean, focused interface
- Clear graphs showing strength trends

---

## Success Metrics

### User Success

A user is successful if they:
1. Log workouts consistently (2+ times per week)
2. Can identify PRs immediately after achieving them
3. Review progress graphs at least once per month
4. Experience zero data loss over 6 months

### Product Success

The app succeeds if:
1. **Startup time** < 1 second on average device
2. **Set logging** completes in < 10 seconds (input to save)
3. **Zero crashes** during active workout
4. **Scroll performance** stays at 60 FPS with 500+ workouts

---

## Core Value Propositions

### 1. Speed
> "The fastest way to log a set during your workout"

- Pre-filled defaults from last session
- Large touch targets for quick tapping
- Optimistic UI updates (instant feedback)
- No network delays

### 2. Clarity
> "See your progress at a glance"

- Clean line charts per exercise
- PR highlights on timeline
- Trend indicators (improving/plateauing/declining)
- Simple volume calculations

### 3. Reliability
> "Your data is safe, always"

- Auto-save every 30 seconds
- Crash recovery for incomplete workouts
- Export backups anytime
- Immutable workout history

### 4. Simplicity
> "No bloat, just what matters"

- Four main tabs (Dashboard, Workout, History, Stats)
- No account setup required
- No paywalls or ads
- Offline by default

---

## Scope Definition

### In Scope (MVP)

**Core Features:**
- ✅ Create and log workouts
- ✅ Add exercises and sets (reps, weight)
- ✅ Auto-detect personal records
- ✅ View workout history (list + calendar)
- ✅ Exercise-specific progress charts
- ✅ Time-range filtering (week/month/year/all)
- ✅ Edit/delete past workouts
- ✅ Optional notes (workout/exercise/set level)
- ✅ Optional RPE tracking
- ✅ Dark mode

**Technical Requirements:**
- ✅ React Native (iOS initially)
- ✅ TypeScript for type safety
- ✅ AsyncStorage for data persistence
- ✅ Offline-first architecture
- ✅ JSON export feature

---

### Out of Scope (Post-MVP)

**Phase 2 Features:**
- 🔮 Cloud sync (iCloud)
- 🔮 Exercise templates library
- 🔮 Workout templates (e.g., "Push Day")
- 🔮 Rest timer between sets
- 🔮 Bodyweight tracking over time
- 🔮 Plate calculator (what weights to load)

**Phase 3 Features:**
- 🔮 AI workout suggestions
- 🔮 Volume/intensity periodization insights
- 🔮 Gamification (streaks, achievements)
- 🔮 Share workout screenshots
- 🔮 Android version

**Phase 4+ Features:**
- 🔮 Wearable integration (Apple Watch)
- 🔮 Video form checks
- 🔮 Social features (optional)
- 🔮 Multi-user accounts

---

## Design Philosophy

### Minimalism
- Every feature must justify its existence
- If it's not used 80% of the time, it's optional or removed
- Clean UI with generous whitespace

### Performance First
- 60 FPS animations or none at all
- Optimistic UI updates for perceived speed
- Lazy loading for heavy components

### Mobile-Native
- Follow iOS Human Interface Guidelines
- Use platform conventions (swipe, long-press)
- Haptic feedback for important actions

### Data Integrity
- Never lose user data
- Validate before saving
- Graceful error handling

---

## Competitive Landscape

### Why Not Use Existing Apps?

| App | Why Not? |
|-----|----------|
| **Strong** | Great but requires internet, has social features, complex UI |
| **FitNotes** | Android-only, dated UI |
| **Hevy** | Cloud-dependent, slow to log sets |
| **Notebook + Pen** | No analytics, hard to track trends |

### Our Differentiator

**This app combines:**
- Speed of pen & paper
- Analytics of digital apps
- Reliability of offline-first design
- Simplicity of single-purpose tools

---

## Long-Term Vision (3-5 Years)

### The Ultimate Personal Training Assistant

1. **Intelligent Insights**
   - AI suggests deload weeks based on volume
   - Predicts when you'll hit next PR
   - Identifies weak points in training

2. **Seamless Ecosystem**
   - Apple Watch for hands-free logging
   - iPad for detailed analytics
   - Mac for workout planning

3. **Community (Optional)**
   - Share templates with friends
   - Compare progress anonymously
   - Challenge yourself, not others

4. **Holistic Health**
   - Optional nutrition integration
   - Sleep quality correlation
   - Injury prevention insights

### Always Maintaining Core Values

Even with these additions:
- ✅ Offline-first remains
- ✅ No forced social features
- ✅ Privacy is paramount
- ✅ Speed never compromised

---

## Why This Matters

### Personal Motivation

Strength training is a long game. Progress happens over months and years, not days.

Most people quit because they can't see progress clearly. They wonder:
- "Am I getting stronger?"
- "Is this program working?"
- "Should I change something?"

**This app answers those questions** with clear, objective data.

### Impact Goal

Help 10,000 lifters stay consistent by making progress tracking effortless and motivating.

---

## Development Philosophy

### Build for Yourself First

This is a **personal project** built to solve a real problem. If it's useful to the creator, it will be useful to others with similar goals.

### Iterate Publicly

- Start with MVP
- Get feedback from real users
- Add features that solve actual pain points
- Avoid feature bloat

### Quality Over Speed

- Ship when ready, not by deadline
- Comprehensive testing before release
- User data integrity is non-negotiable

---

## Summary

### What We're Building

A **fast, offline-first iOS app** for tracking strength training workouts and visualizing long-term progress.

### Why It Matters

Existing apps are too complex, too slow, or too dependent on connectivity. This app strips away everything non-essential and does one thing exceptionally well: **help you get stronger by tracking what matters.**

### How We'll Succeed

By obsessing over:
1. **Speed** - Fastest set logging in the market
2. **Reliability** - Zero data loss, always works
3. **Clarity** - Progress trends at a glance
4. **Simplicity** - No learning curve, just works

### The Promise

> "Open the app, log your sets, see your progress. That's it."

No distractions. No friction. Just you, the barbell, and your numbers going up.
