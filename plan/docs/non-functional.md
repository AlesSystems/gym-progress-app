# Non-Functional Requirements

## Overview
This document defines the performance, reliability, usability, and security requirements for the Workout Planner app.

---

## Performance Requirements

### App Startup Time

**Requirement:** App must be interactive within 1 second on average devices.

**Target Devices:**
- iPhone 12 and newer (primary)
- iPhone X to 11 (supported)
- iOS 14.0+ minimum

**Measurement:**
- Time from tap to usable Dashboard screen
- Measured on cold start (not in memory)

**Implementation Strategies:**
- Lazy load non-critical components
- Pre-cache last 30 days of workout data
- Minimize JavaScript bundle size
- Use React Native's performance optimizations

**Acceptance Criteria:**
- ✅ Cold start < 1.5 seconds on iPhone 12
- ✅ Warm start < 0.5 seconds
- ✅ No blank white screens during load

---

### Set Logging Speed

**Requirement:** User can log a complete set in under 10 seconds.

**User Flow:**
1. Tap "Add Set" button
2. Enter weight and reps
3. Tap "Save"

**Target:** 5-7 seconds average (from tap to save)

**Implementation Strategies:**
- Pre-fill weight from last set
- Large touch targets for number inputs
- Auto-focus on weight input when modal opens
- Debounced save (don't wait for storage confirmation)
- Optimistic UI updates

**Acceptance Criteria:**
- ✅ Bottom sheet opens in < 200ms
- ✅ Input fields respond immediately
- ✅ Save completes with visual feedback < 100ms
- ✅ No network delays (offline-first)

---

### Scroll Performance

**Requirement:** Smooth 60 FPS scrolling in all lists, even with large datasets.

**Target Scenarios:**
- History list with 500+ workouts
- Exercise list with 20+ exercises per workout
- Stats chart with 1 year of data

**Implementation Strategies:**
- Use FlatList with proper optimization props
- Implement virtualization (only render visible items)
- Memoize list item components with React.memo
- Avoid inline functions in renderItem
- Use getItemLayout for fixed-height items

**Acceptance Criteria:**
- ✅ No dropped frames during scroll
- ✅ Scroll feels native and responsive
- ✅ No lag when swiping to delete
- ✅ Calendar month swipe is smooth

---

### Chart Rendering

**Requirement:** Progress charts render in under 1 second.

**Target Scenarios:**
- 52 weeks of data points (1 year view)
- 12 months of data (year view)
- Switching between time ranges

**Implementation Strategies:**
- Pre-calculate data points in background
- Use optimized charting library (Victory Native or react-native-chart-kit)
- Implement data downsampling for large datasets
- Cache rendered charts

**Acceptance Criteria:**
- ✅ Initial chart render < 1 second
- ✅ Time range switch < 500ms
- ✅ Metric switch (weight/volume) < 500ms
- ✅ No janky animations

---

## Reliability Requirements

### Data Integrity

**Requirement:** Zero data loss under any circumstances.

**Critical Scenarios:**
1. App crash during workout
2. Phone battery dies mid-set
3. Force quit by user
4. iOS update/restart
5. Storage corruption

**Implementation Strategies:**
- Auto-save workout every 30 seconds
- Write to disk immediately on set add
- Use atomic writes (temp file + rename)
- Validate data before and after read/write
- Maintain backup of last valid state

**Acceptance Criteria:**
- ✅ Incomplete workouts recoverable on restart
- ✅ No corrupt JSON files
- ✅ Graceful handling of storage errors
- ✅ User prompted to resume or discard on crash

---

### Crash Recovery

**Requirement:** App gracefully recovers from crashes without data loss.

**Recovery Flow:**
1. App detects incomplete workout on launch
2. Show modal: "Resume unfinished workout?"
3. If yes: Load workout into active state
4. If no: Save as draft or delete

**Implementation Strategies:**
- Flag active workouts with `isCompleted: false`
- Store incomplete state in separate key
- Validate incomplete workout before resume
- Log crash context for debugging

**Acceptance Criteria:**
- ✅ No data loss from crashes
- ✅ Clear user communication about recovery
- ✅ Option to discard if workout was accidental
- ✅ Crash doesn't corrupt other workouts

---

### Offline Resilience

**Requirement:** App functions fully without internet connection.

**Scenarios:**
- Basement gym with no signal
- Airplane mode enabled
- WiFi/cellular disabled
- No network access for weeks

**Implementation Strategies:**
- All data stored locally (AsyncStorage/SQLite)
- No API calls for core features
- No CDN dependencies for assets
- Bundle all fonts/icons in app

**Acceptance Criteria:**
- ✅ All features work offline
- ✅ No error messages about network
- ✅ No loading spinners waiting for network
- ✅ Export works without internet

---

## Usability Requirements

### Gym Lighting Optimization

**Requirement:** App must be readable in all gym lighting conditions.

**Scenarios:**
- Bright fluorescent lights
- Dim basement gym
- Outdoor sunlight
- Dark evening home gym

**Implementation Strategies:**
- **Dark mode by default** (easier on eyes in most gyms)
- High contrast UI elements
- Large, clear fonts (min 16pt for body text)
- Bright accent colors for important actions
- Optional light mode for outdoor use

**Acceptance Criteria:**
- ✅ Text readable in all conditions
- ✅ Buttons clearly visible
- ✅ No glare issues with dark mode
- ✅ PR badges stand out

---

### One-Handed Operation

**Requirement:** All critical actions accessible with one hand.

**Rationale:** Users often hold phone in one hand while using equipment.

**Design Rules:**
- Primary actions in bottom 2/3 of screen
- Tab bar at bottom (iOS standard)
- Floating action buttons in thumb reach
- Swipe gestures for common actions
- Large touch targets (min 44x44 points)

**Critical Actions (Must be one-handed):**
1. Start workout
2. Add exercise
3. Log set
4. Finish workout
5. Navigate between tabs

**Acceptance Criteria:**
- ✅ No top-right buttons for critical actions
- ✅ Bottom sheet modals (not full screen)
- ✅ Reachable with right or left thumb
- ✅ Tested on iPhone 12 Pro Max (largest)

---

### Minimal Tap Requirement

**Requirement:** Common actions require maximum 3 taps.

**Tap Budget:**

| Action | Max Taps | Current Flow |
|--------|----------|--------------|
| Start workout | 1 | Tap "Start Workout" button |
| Add exercise | 2 | Tap "Add Exercise" → Select from list |
| Log set | 2 | Tap "Add Set" → Enter data → Save |
| Finish workout | 2 | Tap "Finish" → Confirm |
| View history | 1 | Tap History tab |
| View stats | 2 | Tap Stats tab → Select exercise |

**Acceptance Criteria:**
- ✅ No action requires > 4 taps
- ✅ Most common actions (log set) = 2 taps
- ✅ No unnecessary confirmation dialogs
- ✅ Smart defaults reduce manual input

---

### Input Efficiency

**Requirement:** Minimize typing and manual data entry.

**Smart Defaults:**
- Weight auto-fills from last set
- Reps auto-fill from last set
- Exercise picker shows recent exercises first
- "Copy previous set" button
- Quick weight increment buttons (+2.5, +5, +10)

**Input Methods:**
- Number pad for weight/reps (not full keyboard)
- Slider for optional RPE
- Toggle for warmup sets
- Voice input for notes (future)

**Acceptance Criteria:**
- ✅ Most sets logged with 2 number changes
- ✅ No need to re-type exercise names
- ✅ Keyboard doesn't cover inputs
- ✅ Tab between inputs works

---

### Visual Feedback

**Requirement:** Immediate feedback for all user actions.

**Feedback Mechanisms:**
- **Visual:** Button state changes, animations, toasts
- **Haptic:** Light tap on button press, heavy on success
- **Audio:** Optional success sound (future)

**Critical Feedback Moments:**
1. Set saved → Haptic + visual confirmation
2. PR achieved → Animated badge + haptic
3. Workout finished → Success screen
4. Error occurred → Red banner + explanation

**Implementation:**
- Optimistic UI updates (assume success)
- Rollback if operation fails
- Never block UI waiting for confirmation
- Clear error messages (no technical jargon)

**Acceptance Criteria:**
- ✅ Every tap triggers visual response
- ✅ Haptic feedback on important actions
- ✅ PR achievement is celebratory
- ✅ Errors are clear and actionable

---

## Accessibility Requirements

### VoiceOver Support

**Requirement:** App fully navigable with VoiceOver enabled.

**Implementation:**
- All buttons have accessibility labels
- Images have alt text
- Forms have proper labels
- Focus order is logical
- State changes announced

**Critical Flows (VoiceOver-tested):**
- Start and log workout
- Navigate history
- View stats
- Edit past workout

**Acceptance Criteria:**
- ✅ All screens navigable with VoiceOver
- ✅ Meaningful labels (not just "Button")
- ✅ Charts have text alternatives
- ✅ No VoiceOver traps

---

### Text Sizing

**Requirement:** Support iOS Dynamic Type (text scaling).

**Implementation:**
- Use scaled font sizes (not hardcoded)
- Layout adapts to larger text
- No text truncation at 200% scale
- Maintain readability at all sizes

**Acceptance Criteria:**
- ✅ Text readable at smallest setting
- ✅ Layout doesn't break at largest setting
- ✅ No overlapping text
- ✅ Critical info always visible

---

### Color Contrast

**Requirement:** Meet WCAG 2.1 AA standards for color contrast.

**Contrast Ratios:**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Testing:**
- Use contrast checker tools
- Test in grayscale
- Verify in sunlight/dark environments

**Acceptance Criteria:**
- ✅ All text meets contrast requirements
- ✅ Buttons distinguishable
- ✅ Chart colors accessible
- ✅ Color not sole indicator (use icons too)

---

## Security & Privacy Requirements

### Data Privacy

**Requirement:** User data never leaves device without explicit permission.

**Principles:**
- No analytics tracking (initially)
- No crash reporting without opt-in
- No cloud sync without user consent
- No third-party SDKs with data collection

**User Control:**
- Export data anytime (JSON format)
- Delete all data option
- Clear explanation of what's stored
- No hidden data collection

**Acceptance Criteria:**
- ✅ Zero network calls in MVP
- ✅ No analytics packages installed
- ✅ No tracking identifiers
- ✅ Export includes all user data

---

### Data Storage Security

**Requirement:** Data stored securely on device.

**Implementation:**
- Use iOS app sandbox (automatic)
- No sensitive data in plain text logs
- Validate all data before read/write
- Prevent injection attacks in notes fields

**Threat Model:**
- Physical device access (rely on iOS security)
- App vulnerabilities (input validation)
- Data corruption (checksums, validation)

**Acceptance Criteria:**
- ✅ Data in iOS-protected directory
- ✅ No SQL injection vectors
- ✅ Input sanitization on notes
- ✅ No sensitive data in logs

---

## Compatibility Requirements

### Device Support

**Minimum:**
- iPhone X (2017) and newer
- iOS 14.0+
- 2GB RAM minimum

**Optimized For:**
- iPhone 12/13/14/15
- iOS 15/16/17
- 4GB+ RAM

**Acceptance Criteria:**
- ✅ Runs on iPhone X without crashes
- ✅ Smooth on iPhone 15 Pro
- ✅ Memory usage < 150MB typical
- ✅ No legacy API warnings

---

### Screen Sizes

**Support Range:**
- iPhone SE (4.7") - smallest
- iPhone 15 Pro Max (6.7") - largest
- Future iPad support (later phase)

**Layout Strategy:**
- Responsive design (not fixed)
- Relative sizing, not absolute pixels
- Safe area insets for notches
- Landscape mode for charts (optional)

**Acceptance Criteria:**
- ✅ Readable on iPhone SE
- ✅ Utilizes space on Pro Max
- ✅ No content cut off by notch
- ✅ Buttons reachable on all sizes

---

### iOS Version Compatibility

**Minimum iOS:** 14.0 (September 2020)

**Rationale:**
- Covers 95%+ of active iPhones
- Allows modern React Native features
- Balance between reach and maintenance

**Testing Strategy:**
- Develop on latest iOS
- Test on iOS 14 simulator
- Beta test on variety of devices

**Acceptance Criteria:**
- ✅ No crashes on iOS 14
- ✅ All features work on iOS 14
- ✅ UI degradation is graceful
- ✅ No deprecated API usage

---

## Maintainability Requirements

### Code Quality

**Requirements:**
- TypeScript strict mode enabled
- ESLint with no warnings
- Prettier for consistent formatting
- 80%+ test coverage on domain layer

**Code Standards:**
- No `any` types
- Explicit return types on functions
- JSDoc comments for complex logic
- Max function length: 50 lines

**Acceptance Criteria:**
- ✅ `npm run lint` passes
- ✅ `npm run typecheck` passes
- ✅ All tests pass
- ✅ No console warnings in production

---

### Documentation

**Requirements:**
- README with setup instructions
- Architecture documentation (this repo)
- Inline comments for complex logic
- Change log for releases

**Acceptance Criteria:**
- ✅ New developer can run app in < 30 min
- ✅ All features documented
- ✅ API reference for modules
- ✅ Migration guides for breaking changes

---

### Build & Deploy

**Requirements:**
- Automated builds via CI/CD
- Version numbering (semantic versioning)
- Release notes for each version
- Rollback capability

**Build Targets:**
- Development (debug)
- Beta (TestFlight)
- Production (App Store)

**Acceptance Criteria:**
- ✅ One-command builds
- ✅ Automated testing before deploy
- ✅ Clear version tracking
- ✅ Easy rollback process

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| App startup | < 1s | Time to interactive |
| Set logging | < 10s | User flow completion |
| History scroll | 60 FPS | Frame rate monitor |
| Chart render | < 1s | Component mount time |
| Memory usage | < 150MB | Xcode profiler |
| Battery impact | < 1%/hour | iOS battery stats |
| Storage usage | < 10MB/year | File size tracking |

### Monitoring

**Development:**
- React DevTools Profiler
- Xcode Instruments
- Flipper performance monitor

**Production:**
- User-reported performance issues
- Crash analytics (opt-in only)
- App Store reviews monitoring

---

## Summary

### Critical Non-Functional Requirements

**Performance:**
- ⚡ Startup < 1 second
- ⚡ 60 FPS scrolling always
- ⚡ Set logging < 10 seconds

**Reliability:**
- 🛡️ Zero data loss
- 🛡️ Crash recovery
- 🛡️ Fully offline

**Usability:**
- 👆 One-handed operation
- 👆 Dark mode optimized
- 👆 Minimal taps

**Privacy:**
- 🔒 No data collection
- 🔒 Local storage only
- 🔒 User owns data

### Quality Gates

Before any release:
1. ✅ All performance targets met
2. ✅ Zero data loss in testing
3. ✅ Accessible via VoiceOver
4. ✅ Works fully offline
5. ✅ No crashes in test suite

These requirements are **non-negotiable** for MVP release.
