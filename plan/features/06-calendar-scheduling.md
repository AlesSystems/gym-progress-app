# Feature 6: Calendar & Scheduling

## Overview
A monthly/weekly calendar that gives users a bird's-eye view of their training schedule — both planned future sessions and logged past sessions. Users can schedule a workout for a future date by associating a template with a calendar slot, with no push-notification requirement in MVP.

---

## Feature Breakdown

### 6.1 Calendar View
**User Stories:**
- As a user, I want to see a monthly calendar with visual indicators on days where I trained or have a planned session so I can gauge training frequency at a glance.
- As a user, I want to switch between month view and week view for different levels of detail.
- As a user, I want to tap on any day to see the sessions or scheduled workouts for that day.

**Technical Requirements:**
- Month view: grid of 5–6 weeks, each cell shows dot indicators (completed = solid, planned = outline).
- Week view: 7 columns with session cards inside each day cell.
- Data fetched per visible range via `GET /api/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- Past `workout_sessions` (status `completed`) and future `scheduled_workouts` are returned together in the same response.
- Timezone handling: dates stored as UTC timestamps; all date comparisons done in the user's local timezone on the client. The API accepts and returns ISO 8601 dates.
- Navigation: prev / next month (or week) loads new date range; data pre-fetched one range ahead.

### 6.2 Scheduling a Workout
**User Stories:**
- As a user, I want to schedule a workout for a specific future date by picking a date and optionally choosing a template so I have a plan laid out in advance.
- As a user, I want to add a title and optional note to a scheduled slot so I can annotate the plan.
- As a user, I want to edit or remove a scheduled workout if my plans change.
- As a user, I want a scheduled workout to automatically link to the session I log on that day, so the calendar shows it as completed.

**Technical Requirements:**
- `scheduled_workouts` table stores planned entries with a `scheduled_date` (DATE type, not TIMESTAMP — date only, no time).
- `template_id` is optional: a user can schedule a "rest day note" or a generic "Gym" block without selecting a template.
- `completed_session_id` FK is set when the user starts a session from a scheduled entry; the calendar then renders it as completed.
- Auto-link logic: when a user starts a session from the calendar day view → the scheduled entry's `completed_session_id` is updated.
- Multiple scheduled workouts allowed on the same day (e.g., morning lift + evening run).
- Past scheduled entries without a `completed_session_id` are rendered as "missed" (distinct visual state).

### 6.3 Day Detail View
**User Stories:**
- As a user, I want to tap a calendar day and see all sessions and plans for that day in a list.
- As a user, I want a "Start Workout" button on a planned entry to immediately begin that session from the linked template.

**Technical Requirements:**
- Day detail shows: completed sessions (with name, duration, volume), planned entries (template name, user note).
- "Start Workout" button on a planned entry calls `POST /api/sessions` with `{ templateId, scheduledWorkoutId }` and marks the schedule as linked.
- "Add Plan" button on any day opens the scheduling form.

---

## Data Models

### ScheduledWorkout Entity
```
ScheduledWorkout {
  id:                  UUID      (primary key)
  userId:              UUID      -> User.id
  templateId:          UUID NULL -> WorkoutTemplate.id
  scheduledDate:       DATE      (not TIMESTAMP — date only)
  title:               string    NULL (max 100 chars; auto-filled from template name if NULL)
  notes:               text      NULL
  completedSessionId:  UUID NULL -> WorkoutSession.id (linked when session is started)
  createdAt:           timestamp
  updatedAt:           timestamp
}
```

**Derived status (computed in API, not stored):**
- `planned` — `scheduledDate >= today` AND `completedSessionId IS NULL`
- `completed` — `completedSessionId IS NOT NULL`
- `missed` — `scheduledDate < today` AND `completedSessionId IS NULL`

---

## API Endpoints

### Calendar
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/calendar` | Required | Fetch calendar data for a date range |

**Query params for `GET /api/calendar`:**
| Param | Type | Required | Description |
|---|---|---|---|
| `from` | `YYYY-MM-DD` | Yes | Start of range (inclusive) |
| `to` | `YYYY-MM-DD` | Yes | End of range (inclusive) |

**Response:**
```json
{
  "from": "2026-02-01",
  "to": "2026-02-28",
  "days": {
    "2026-02-10": {
      "completedSessions": [
        {
          "id": "uuid",
          "name": "Push Day A",
          "durationMinutes": 62,
          "totalVolume": 8200,
          "volumeUnit": "kg"
        }
      ],
      "scheduledWorkouts": []
    },
    "2026-02-15": {
      "completedSessions": [],
      "scheduledWorkouts": [
        {
          "id": "uuid",
          "title": "Pull Day",
          "templateId": "uuid",
          "status": "planned",
          "notes": null
        }
      ]
    }
  }
}
```

### Scheduled Workouts
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/scheduled` | Required | List upcoming scheduled workouts |
| `POST` | `/api/scheduled` | Required | Create a scheduled workout entry |
| `PUT` | `/api/scheduled/:id` | Required | Update title, date, template, or notes |
| `DELETE` | `/api/scheduled/:id` | Required | Remove a scheduled entry |

---

## Validation Rules (Zod)

```typescript
const CreateScheduledWorkoutSchema = z.object({
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // YYYY-MM-DD
  templateId: z.string().uuid().optional(),
  title: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

const UpdateScheduledWorkoutSchema = CreateScheduledWorkoutSchema.partial();
```

---

## Frontend Pages / Components

### Pages
1. **Calendar** (`/calendar`)
   - Month / Week view toggle
   - Prev / Next navigation arrows + "Today" button
   - Day cells with dot indicators (completed = filled, planned = outlined, missed = muted)
   - Click/tap a day → opens Day Detail sheet/modal

2. **Day Detail Sheet** (bottom sheet or side drawer)
   - Date heading
   - Completed session cards (tap → session detail)
   - Planned entry cards: template name, user note, "Start Workout" button
   - "Add Plan" button at bottom

3. **Schedule Workout Form** (modal or page)
   - Date picker (pre-filled with tapped day)
   - Template picker (optional — searchable dropdown)
   - Title field (auto-filled from template, editable)
   - Notes textarea

### Components
- `CalendarGrid` — month grid with day cells
- `CalendarWeekView` — 7-column week layout
- `DayCell` — individual day cell with dot indicators + click handler
- `DayDetailSheet` — bottom sheet with sessions + plans for selected day
- `ScheduledEntryCard` — card for a planned workout (status badge: planned/missed/completed)
- `CompletedSessionCard` — compact card: name, duration, volume
- `ScheduleForm` — form to create/edit a scheduled workout
- `StatusDot` — small colored dot indicator (`filled` | `outlined` | `muted`)

### Calendar Library
- **`react-calendar`** (lightweight, headless-friendly) or build a custom grid with CSS Grid.
- Avoid heavy full-featured libraries (FullCalendar) — the app only needs date-cell rendering, not time-slot scheduling.
- Accessible keyboard navigation (arrow keys to move between days, Enter to open day detail).

---

## Calendar Data Strategy

To avoid one API call per day cell, the calendar fetches the entire visible range in a single call:

```
Month view → from = first day of month, to = last day of month
Week view  → from = Monday of week, to = Sunday of week
```

Pre-fetch the adjacent month/week in the background when the user is viewing the current range so navigation feels instant.

```typescript
// Pre-fetch on mount
useEffect(() => {
  prefetchCalendar(nextMonthRange);
  prefetchCalendar(prevMonthRange);
}, [currentRange]);
```

---

## Missed Session Detection

A scheduled workout is "missed" if:
- `scheduled_date < today` (in the user's local timezone)
- `completed_session_id IS NULL`

This is computed client-side from the API data (the API returns the raw fields; the client derives the status). No server-side job is needed.

---

## Testing Strategy

### Unit Tests
- Date range generation for month and week views
- `missed` / `planned` / `completed` status derivation from raw data
- Validation: reject `scheduledDate` in the past (optional — warn but allow)

### Integration Tests
- `GET /api/calendar?from=...&to=...` — returns correct sessions and scheduled workouts within range
- `POST /api/scheduled` — creates entry, appears in calendar response
- `DELETE /api/scheduled/:id` — entry removed from calendar
- Starting a session via calendar → `completed_session_id` linked on scheduled entry

### E2E Tests
- User navigates calendar, taps a future day, schedules a workout, sees it appear as planned
- User starts session from planned entry → calendar day shows as completed
- User navigates to past day — missed sessions appear in muted state

---

## Implementation Phases

### Phase 1: Read-Only Calendar (Week 6)
- `GET /api/calendar` endpoint (sessions only, no scheduled workouts yet)
- Calendar page with month view
- Day cell dot indicators for completed sessions

### Phase 2: Week View & Day Detail (Week 6)
- Week view toggle
- Day detail sheet with session cards
- Prev / Next navigation + pre-fetch

### Phase 3: Scheduling (Week 7)
- `scheduled_workouts` table migration
- `POST`, `PUT`, `DELETE` `/api/scheduled` endpoints
- Schedule form (date picker + template picker)
- Planned / Missed dot indicators in calendar
- "Start Workout" button linking scheduled → session

---

## Success Metrics
- Calendar range fetch (1 month) < 300 ms
- Month view renders within 100 ms of data arrival
- Day detail sheet opens < 100 ms (data already in memory from range fetch)
- Scheduling a workout < 20 seconds end-to-end

---

## Future Enhancements (Post-MVP)
- Push / local notifications for scheduled workouts (Web Push API or mobile native)
- Recurring workout schedules (e.g., "every Monday, Wednesday, Friday")
- Training block planner (multi-week program view)
- Rest day tagging (mark a day intentionally as rest)
- Streak tracking (consecutive training days)
- Integration with device calendar (Google Calendar, Apple Calendar via `.ics` export)
