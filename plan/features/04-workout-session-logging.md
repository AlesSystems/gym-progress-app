# Feature 4: Workout Session Logging

## Overview
A live workout tracking interface that lets users start a session from a saved template or build one freestyle, log each set with weight / reps / RPE / notes, use an integrated rest timer, and auto-persist a timestamped history of every completed session.

---

## Feature Breakdown

### 4.1 Session Start
**User Stories:**
- As a user, I want to start a session from a saved template so my exercises are pre-loaded and I just need to fill in the weights.
- As a user, I want to start a freestyle session (blank canvas) when I'm training spontaneously.
- As a user, I want my session to be auto-timestamped when it begins so I don't have to track time manually.

**Technical Requirements:**
- Starting a session from a template copies the template's exercise list + configuration into a new `workout_sessions` + `workout_session_exercises` row set (snapshot pattern — editing the template later does not change this session).
- A freestyle session starts with zero exercises; the user adds from the exercise library inline.
- `started_at` is set server-side on session creation.
- Sessions have a `status`: `in_progress` | `completed` | `abandoned`.
- A user can only have one `in_progress` session at a time (enforced server-side with 409 conflict if another active session exists).

### 4.2 Set Logging
**User Stories:**
- As a user, I want to log each set with weight and reps so I have an accurate record.
- As a user, I want to optionally log RPE (Rate of Perceived Exertion, 1–10) per set to track effort.
- As a user, I want to add a free-text note to any set for form cues or reminders.
- As a user, I want previous set values to pre-fill the next set so I type less.
- As a user, I want to mark a set as a warm-up so it's visually distinct and excluded from PR calculations.

**Technical Requirements:**
- Each `workout_set` belongs to a `workout_session_exercise`.
- `weight` and `reps` are nullable (bodyweight or failure sets).
- `rpe` is a decimal between 1.0 and 10.0, stored with one decimal place (supports half-steps: 7.5).
- Previous set values auto-populated in UI from the last logged set of the same exercise in the current session.
- Warm-up sets (`is_warmup = true`) excluded from PR detection and volume calculations.
- Sets can be added, edited, and deleted freely while session is `in_progress`.
- On completion of a set, server checks if it's a new max lift and updates `max_lifts` table accordingly (via background job or inline trigger).

### 4.3 Session History
**User Stories:**
- As a user, I want all completed sessions saved automatically so I can review past workouts.
- As a user, I want to see the date, duration, and exercises of any past session.
- As a user, I want to tap into a past session to see every set logged.

**Technical Requirements:**
- `completed_at` recorded when user taps "Finish Workout".
- Duration derived as `completed_at - started_at` (computed, not stored).
- Sessions stored indefinitely; no auto-deletion.
- History list sorted by `started_at` DESC, paginated (20 per page).
- Past sessions are read-only; no editing after `completed`.

### 4.4 Rest Timer
**User Stories:**
- As a user, I want a rest timer to auto-start after I log a set so I know when to start the next set.
- As a user, I want to snooze the timer (add 30 s) if I need more rest.
- As a user, I want to stop/dismiss the timer early if I'm ready before it finishes.
- As a user, I want an audible or vibration alert when the timer reaches zero.

**Technical Requirements:**
- Timer is **client-side only** — no server persistence needed.
- Default rest duration pulled from `workout_session_exercise.rest_seconds` (inherited from template or set by user per exercise in session).
- If no rest time configured, defaults to 90 seconds.
- Timer countdown rendered in a sticky bottom bar during an active session.
- Snooze adds 30 s to remaining time.
- Stop dismisses the timer.
- Notification / vibration via Web Notifications API + `navigator.vibrate()` (with permission request).
- Timer survives tab visibility changes (use `Page Visibility API` + `Date.now()` delta to sync on focus restore).

---

## Data Models

### WorkoutSession Entity
```
WorkoutSession {
  id:          UUID      (primary key)
  userId:      UUID      -> User.id
  templateId:  UUID NULL -> WorkoutTemplate.id (NULL for freestyle)
  name:        string    NULL (auto-generated: "Push Day A — Feb 22, 2026" or "Freestyle — Feb 22, 2026")
  status:      enum      ('in_progress', 'completed', 'abandoned')
  notes:       text      NULL (session-level notes, added on completion)
  startedAt:   timestamp (set on create)
  completedAt: timestamp NULL (set when user finishes)
  createdAt:   timestamp
  updatedAt:   timestamp
}
```

### WorkoutSessionExercise Entity
```
WorkoutSessionExercise {
  id:           UUID    (primary key)
  sessionId:    UUID    -> WorkoutSession.id
  exerciseId:   UUID    -> Exercise.id
  orderIndex:   integer
  restSeconds:  integer NULL
  notes:        text    NULL
  createdAt:    timestamp

  -- Snapshot fields (copied from template at session start, for history integrity)
  exerciseName: string  (denormalized snapshot)
}
```

### WorkoutSet Entity
```
WorkoutSet {
  id:                  UUID         (primary key)
  sessionExerciseId:   UUID         -> WorkoutSessionExercise.id
  setNumber:           integer      (1-based display order)
  weight:              decimal(6,2) NULL
  weightUnit:          enum         ('kg', 'lb') NULL
  reps:                integer      NULL
  rpe:                 decimal(3,1) NULL  (1.0 – 10.0)
  notes:               text         NULL
  isWarmup:            boolean      (default false)
  completedAt:         timestamp    NULL  (NULL = set logged but not yet marked complete)
  createdAt:           timestamp
  updatedAt:           timestamp
}
```

---

## API Endpoints

### Sessions
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/sessions` | Required | Paginated history. `?status=completed&page=1&limit=20` |
| `GET` | `/api/sessions/active` | Required | Get current in-progress session (or 404) |
| `GET` | `/api/sessions/:id` | Required | Get session detail with all exercises + sets |
| `POST` | `/api/sessions` | Required | Start a new session (`{ templateId? }`) |
| `PATCH` | `/api/sessions/:id` | Required | Update status (complete / abandon) or session notes |

### Session Exercises
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions/:id/exercises` | Required | Add an exercise to in-progress session |
| `PUT` | `/api/sessions/:id/exercises/:exId` | Required | Update exercise rest time or notes |
| `DELETE` | `/api/sessions/:id/exercises/:exId` | Required | Remove exercise (and all its sets) |

### Sets
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions/:id/exercises/:exId/sets` | Required | Log a new set |
| `PUT` | `/api/sessions/:id/exercises/:exId/sets/:setId` | Required | Edit a logged set |
| `DELETE` | `/api/sessions/:id/exercises/:exId/sets/:setId` | Required | Delete a logged set |

### Response Shapes

**Session (summary for history list):**
```json
{
  "id": "uuid",
  "name": "Push Day A — Feb 22, 2026",
  "status": "completed",
  "templateId": "uuid",
  "startedAt": "2026-02-22T08:00:00Z",
  "completedAt": "2026-02-22T09:05:00Z",
  "durationMinutes": 65,
  "exerciseCount": 5,
  "totalSets": 20,
  "totalVolume": 8500,
  "totalVolumeUnit": "kg"
}
```

**Set:**
```json
{
  "id": "uuid",
  "setNumber": 1,
  "weight": 100,
  "weightUnit": "kg",
  "reps": 5,
  "rpe": 8.0,
  "notes": "Felt strong",
  "isWarmup": false,
  "completedAt": "2026-02-22T08:15:30Z"
}
```

---

## Frontend Pages / Components

### Pages
1. **Session Start Screen** (`/sessions/start`)
   - Two CTAs: "From Template" and "Freestyle"
   - Template picker (searchable list)
   - Active session banner if one already exists

2. **Active Session** (`/sessions/active`)
   - Session name + elapsed timer (counting up)
   - Ordered list of exercises (accordion-style)
   - Per exercise: exercise name, previous best set hint, set rows
   - Per set row: warm-up toggle, weight input, reps input, RPE input, notes, delete
   - "Add Set" button per exercise
   - "Add Exercise" FAB → inline exercise search drawer
   - Sticky bottom rest timer bar
   - "Finish Workout" button → summary modal → POST status=completed

3. **Session Summary Modal** (on finish)
   - Duration, total sets, total volume
   - Any new PRs achieved (highlighted)
   - Session notes textarea
   - "Save & Exit" and "Keep Training" buttons

4. **Session History List** (`/sessions`)
   - Chronological list (newest first)
   - Each item: date, session name, duration, exercise count, volume
   - Infinite scroll / pagination

5. **Session Detail** (`/sessions/:id`)
   - Full breakdown: all exercises + all sets logged
   - PR badges on sets that were records at the time
   - Session notes
   - "Repeat Session" button (starts new session from same template)

### Components
- `SessionCard` — history list item card
- `ActiveSessionHeader` — elapsed timer + session name
- `ExerciseAccordion` — collapsible exercise block with set list
- `SetRow` — individual set: inputs for weight, reps, RPE + warmup toggle + delete
- `PreviousBestHint` — small text: "Last time: 100 kg × 5 @ RPE 8"
- `RestTimerBar` — sticky bottom countdown bar with snooze/stop
- `SessionSummaryModal` — post-workout summary with PR highlights
- `PRBadge` — "NEW PR!" badge overlaid on a set row
- `ExerciseSearchDrawer` — reused from workout builder

---

## Rest Timer — State Machine

```
IDLE
  │ [Set logged]
  ▼
RUNNING (countdown from restSeconds)
  │ [Timer reaches 0] ──► ALERT (buzz + notification)
  │ [Snooze]          ──► RUNNING (add 30 s)
  │ [Stop]            ──► IDLE
  ▼
ALERT
  │ [Dismiss]         ──► IDLE
  │ [Snooze]          ──► RUNNING (30 s)
```

- Timer stored in Zustand store (not persisted to server).
- `startTime` + `duration` stored as `Date` objects; countdown derived via `requestAnimationFrame` or `setInterval(1000)`.
- On `visibilitychange` to visible: recompute remaining = `duration - (Date.now() - startTime)`.

---

## Max Lift Auto-Update Logic

On every set save (`POST .../sets`), server runs:
```
IF set.is_warmup = false
  AND set.weight IS NOT NULL
  AND set.reps IS NOT NULL:
    existingMax = MAX_LIFTS where userId = session.userId AND exerciseId = exercise.id
    IF existingMax IS NULL OR set.weight > existingMax.weight:
      UPSERT max_lifts SET weight = set.weight, unit = set.weightUnit,
             reps = set.reps, achievedAt = set.completedAt, workoutId = session.id
```
- Returns a `isNewPR: boolean` flag in the set response so the UI can show the PR badge immediately.

---

## Validation Rules (Zod)

```typescript
const StartSessionSchema = z.object({
  templateId: z.string().uuid().optional(),
  name: z.string().max(100).optional(),
});

const LogSetSchema = z.object({
  weight: z.number().min(0).max(9999).optional(),
  weightUnit: z.enum(['kg', 'lb']).optional(),
  reps: z.number().int().min(0).max(999).optional(),
  rpe: z.number().min(1).max(10).multipleOf(0.5).optional(),
  notes: z.string().max(500).optional(),
  isWarmup: z.boolean().default(false),
  completedAt: z.string().datetime().optional(),
});

const CompleteSessionSchema = z.object({
  status: z.enum(['completed', 'abandoned']),
  notes: z.string().max(1000).optional(),
});
```

---

## Security & Authorization

| Action | Rule |
|---|---|
| Read session list / detail | Owner only |
| Start session | Any authenticated user |
| Log / edit / delete sets | Owner of session, session must be `in_progress` |
| Complete / abandon session | Owner only |
| Read historical sessions | Owner only |
| Edit completed session | Blocked (409 or 403) |

---

## Offline Considerations (PWA)

- Active session state persisted in `localStorage` / `IndexedDB` as a backup.
- If network drops mid-session, sets are queued locally and synced when connection restores.
- Conflict resolution: `completedAt` timestamp used as tiebreaker.
- "You have unsynced sets" warning banner when offline.

---

## Testing Strategy

### Unit Tests
- Max lift comparison logic (new PR detection)
- Rest timer state machine transitions
- Set pre-fill logic (last set values copied to next set input)
- Duration calculation (completedAt − startedAt in minutes)

### Integration Tests
- `POST /api/sessions` with template — session contains correct exercises + config
- `POST /api/sessions` with no template — empty exercise list
- `POST .../sets` with new PR weight — `max_lifts` row upserted, `isNewPR: true` returned
- `PATCH /api/sessions/:id` with `status: completed` — `completedAt` stamped
- Attempt to start second session while one is active — 409 returned
- Edit set on completed session — 403 returned

### E2E Tests
- Full session flow: start from template → log 3 sets per exercise → finish → verify in history
- Freestyle session: start blank → add 2 exercises → log sets → complete
- PR detection: log a set heavier than previous max → PR badge appears → `max_lifts` updated
- Rest timer: log set → timer appears → snooze → stop → timer dismissed

---

## Implementation Phases

### Phase 1: Session CRUD (Week 3)
- Database migrations: `workout_sessions`, `workout_session_exercises`, `workout_sets`
- `POST /api/sessions` (template + freestyle)
- `GET /api/sessions/active`
- `PATCH /api/sessions/:id` (complete / abandon)
- Basic active session page (static layout)

### Phase 2: Set Logging (Week 3–4)
- Set add / edit / delete endpoints
- `SetRow` component with weight / reps / RPE inputs
- Previous-best hint
- Warm-up toggle
- PR detection + `isNewPR` response flag
- PR badge in UI

### Phase 3: Rest Timer (Week 4)
- Zustand timer store
- `RestTimerBar` component
- Auto-start on set log
- Snooze / stop controls
- Web Notifications + vibrate permission flow

### Phase 4: History & Polish (Week 4)
- Session history list + detail pages
- Session summary modal (post-workout)
- Volume / duration stats
- "Repeat Session" button
- Offline queue (localStorage backup)

---

## Success Metrics
- Time to log a single set < 10 seconds (including weight + reps input)
- Session history page loads (20 items) < 400 ms
- Rest timer accuracy ± 1 second after tab restore
- PR detection fires on 100% of qualifying sets
- Zero data loss during network interruption (offline queue)

---

## Future Enhancements (Post-MVP)
- Barcode / plate calculator assistant
- Voice logging ("log 100 kg times 5")
- Superset grouping within a session
- Real-time session sharing (coach watches live)
- Session comparison (this week vs last week)
- Automated deload suggestions based on RPE trend
- Video form check (record + attach to set)
- Wearable integration (Apple Watch, Garmin)
