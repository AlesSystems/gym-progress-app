# Issue #2: Rest Timer Stops When Phone Enters Sleep Mode

## Problem Description
When the user's phone enters sleep mode after a few minutes of inactivity, the rest timer stops counting. This breaks the rest period tracking functionality, which is critical for proper workout rest intervals.

## Current Behavior
- Rest timer runs correctly when phone is active
- Timer stops/pauses when phone enters sleep mode
- Timer does not resume or catch up when phone wakes up
- Users lose track of rest periods

## Expected Behavior
- Rest timer should continue running even when phone is in sleep mode
- Timer should show accurate elapsed time when user wakes the phone
- Audio/vibration notification should trigger at rest timer completion (even from sleep)

## Technical Challenge
Mobile browsers suspend JavaScript execution when the device enters sleep mode to conserve battery. This is a known limitation of web applications.

## Investigation Points
1. Current timer implementation (setInterval vs setTimeout vs requestAnimationFrame)
2. Page Visibility API usage
3. Background execution limitations in PWA
4. Wake Lock API availability and support
5. Service Worker capabilities for background timers

## Possible Solutions

### Option 1: Wake Lock API
- Use Screen Wake Lock API to prevent screen from sleeping during rest
- Pros: Simple, keeps timer running
- Cons: Drains battery, may not be desired behavior

### Option 2: Page Visibility API + Timestamp Tracking
- Store start timestamp when timer begins
- Calculate elapsed time based on current time vs start time
- Adjust for time passed during sleep when page becomes visible again
- Pros: Accurate, battery-friendly
- Cons: Requires careful state management

### Option 3: Web Notifications
- Schedule notification at expected rest completion time
- Show notification when rest period is complete
- Pros: Native mobile experience
- Cons: Requires permission, may not work reliably

### Option 4: Service Worker + Background Sync
- Use Service Worker for background timer tracking
- Sync state when app regains focus
- Pros: More reliable background operation
- Cons: Complex implementation, limited API support

## Recommended Approach
Implement **Option 2** with **Option 3** as enhancement:
1. Track rest start timestamp instead of counting seconds
2. Calculate remaining time based on elapsed time since start
3. Use Page Visibility API to detect when app regains focus
4. Recalculate timer state based on actual elapsed time
5. Add Web Notifications for rest completion alerts

## Implementation Steps
1. Modify rest timer to use timestamp-based tracking
2. Implement Page Visibility API listeners
3. Add logic to recalculate timer on visibility change
4. Request notification permission
5. Schedule notifications for rest completion
6. Add visual/audio alert when rest period ends
7. Test across iOS and Android devices

## Testing Requirements
- [ ] Test timer accuracy after phone sleeps for various durations
- [ ] Test notification delivery when rest period completes during sleep
- [ ] Test timer resume when app regains focus
- [ ] Test on iOS Safari (strict PWA limitations)
- [ ] Test on Android Chrome
- [ ] Test battery impact
- [ ] Test with/without notification permission

## Priority
**HIGH** - Critical functionality for workout rest periods

## Dependencies
- Notification API support in target browsers
- Page Visibility API (widely supported)
- Possible Service Worker modifications

## Related Issues
Issue #1 (Timer bugs may share root cause)
