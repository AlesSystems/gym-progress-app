# Feature 5: History & Progress

## Overview
A per-exercise and per-session progress view that lets users look back at their training history, spot trends, and visualize progress over time through interactive charts. No new tables are required — all data is derived from `workout_sessions`, `workout_session_exercises`, and `workout_sets` created in Feature 4.

---

## Feature Breakdown

### 5.1 Per-Exercise History List
**User Stories:**
- As a user, I want to see every session in which I performed a specific exercise, listed in reverse chronological order, so I can review my progression.
- As a user, I want each history entry to show the date, all sets logged (weight × reps), and my RPE so I can compare efforts across sessions.
- As a user, I want to see my current personal record (max weight, max reps) at the top of the history view.

**Technical Requirements:**
- Query joins `exercises → workout_session_exercises → workout_sessions → workout_sets`.
- Only `completed` sessions are included; `in_progress` and `abandoned` are excluded.
- Warm-up sets (`is_warmup = true`) are shown with a visual indicator but excluded from PR/volume calculations.
- Results paginated: 20 sessions per page, ordered by `started_at DESC`.
- Response includes the best set per session (heaviest weight, tie-broken by reps) for quick scanning.

### 5.2 Progress Charts — Weight vs Date
**User Stories:**
- As a user, I want a line chart showing my heaviest working weight for an exercise on each session date so I can see if I'm getting stronger.
- As a user, I want to tap/hover a data point to see the full details of that session's performance.
- As a user, I want to filter the chart by time range (1 month, 3 months, 6 months, 1 year, all time).

**Technical Requirements:**
- Chart series: `{ date: startedAt, value: max(weight) }` per session, warm-ups excluded.
- Time range filter applied server-side via `started_at >= $rangeStart`.
- Data points link to the session detail page on tap/click.
- Missing dates (no session) produce gaps in the line, not interpolated values.
- Unit-aware: respect user's `unit_preference` (convert stored values if needed).

### 5.3 Progress Charts — Reps vs Date
**User Stories:**
- As a user, I want a second chart showing my total working reps (or reps at a given weight) over time so I can track volume progress independent of weight.
- As a user, I want to toggle between "max reps in a single set" and "total reps across all working sets" to see different aspects of progress.

**Technical Requirements:**
- Two derived series available (toggled in UI):
  1. `maxRepsInSet`: `max(reps)` across working sets for the session.
  2. `totalReps`: `sum(reps)` across all working sets for the session.
- Same time range filter as weight chart.
- Both charts share the same X axis (dates) so they align visually when displayed side by side.

### 5.4 Volume Chart (Bonus — same feature, no new API)
- Total volume = `sum(weight × reps)` across all working sets per session.
- Displayed as a bar chart (volume per session) beneath the line charts.
- Derived from the same API response — no additional endpoint.

---

## Data Models

No new tables. All history data is read from existing tables:

```
workout_sessions      → session date, status
workout_session_exercises → exercise linkage
workout_sets          → weight, reps, RPE, is_warmup
max_lifts             → current PR (already maintained by Feature 4)
```

---

## API Endpoints

### Exercise History
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/exercises/:id/history` | Required | Paginated session history for one exercise |
| `GET` | `/api/exercises/:id/chart` | Required | Aggregated chart data (weight, reps, volume per session) |

### Query Parameters

**`GET /api/exercises/:id/history`**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 50) |

**`GET /api/exercises/:id/chart`**
| Param | Type | Default | Description |
|---|---|---|---|
| `range` | `1m\|3m\|6m\|1y\|all` | `3m` | Time range filter |
| `unit` | `kg\|lb` | user preference | Override unit for chart values |

### Response Shapes

**History entry:**
```json
{
  "sessionId": "uuid",
  "sessionName": "Push Day A — Feb 22, 2026",
  "date": "2026-02-22",
  "startedAt": "2026-02-22T08:00:00Z",
  "bestSet": { "weight": 100, "weightUnit": "kg", "reps": 5, "rpe": 8.0 },
  "sets": [
    { "setNumber": 1, "weight": 80, "weightUnit": "kg", "reps": 5, "isWarmup": true, "rpe": null },
    { "setNumber": 2, "weight": 100, "weightUnit": "kg", "reps": 5, "isWarmup": false, "rpe": 8.0 },
    { "setNumber": 3, "weight": 100, "weightUnit": "kg", "reps": 4, "isWarmup": false, "rpe": 9.0 }
  ],
  "totalWorkingSets": 2,
  "totalWorkingReps": 9,
  "totalVolume": 900,
  "volumeUnit": "kg"
}
```

**Chart data:**
```json
{
  "exerciseId": "uuid",
  "exerciseName": "Bench Press",
  "unit": "kg",
  "range": "3m",
  "series": {
    "weight": [
      { "date": "2026-01-01", "value": 90, "sessionId": "uuid" },
      { "date": "2026-01-08", "value": 92.5, "sessionId": "uuid" }
    ],
    "maxRepsInSet": [
      { "date": "2026-01-01", "value": 6 },
      { "date": "2026-01-08", "value": 5 }
    ],
    "totalReps": [
      { "date": "2026-01-01", "value": 18 },
      { "date": "2026-01-08", "value": 15 }
    ],
    "volume": [
      { "date": "2026-01-01", "value": 1620 },
      { "date": "2026-01-08", "value": 1387.5 }
    ]
  },
  "pr": { "weight": 100, "weightUnit": "kg", "reps": 5, "achievedAt": "2026-02-22" }
}
```

---

## SQL Queries

### Exercise history (per session)
```sql
SELECT
  ws.id                  AS session_id,
  ws.name                AS session_name,
  ws.started_at::date    AS date,
  ws.started_at,
  MAX(wset.weight) FILTER (WHERE wset.is_warmup = false) AS best_weight,
  MAX(wset.reps)   FILTER (WHERE wset.is_warmup = false) AS max_reps,
  SUM(wset.reps)   FILTER (WHERE wset.is_warmup = false) AS total_reps,
  SUM(wset.weight * wset.reps) FILTER (WHERE wset.is_warmup = false) AS total_volume,
  COUNT(wset.id)   FILTER (WHERE wset.is_warmup = false) AS working_sets
FROM workout_sessions ws
JOIN workout_session_exercises wse ON wse.session_id = ws.id
JOIN workout_sets wset ON wset.session_exercise_id = wse.id
WHERE wse.exercise_id = $exerciseId
  AND ws.user_id = $userId
  AND ws.status = 'completed'
GROUP BY ws.id, ws.name, ws.started_at
ORDER BY ws.started_at DESC
LIMIT $limit OFFSET $offset;
```

### Chart aggregation (weight + reps + volume per session)
```sql
SELECT
  ws.started_at::date                                            AS date,
  ws.id                                                          AS session_id,
  MAX(wset.weight)       FILTER (WHERE wset.is_warmup = false)  AS max_weight,
  MAX(wset.reps)         FILTER (WHERE wset.is_warmup = false)  AS max_reps_in_set,
  SUM(wset.reps)         FILTER (WHERE wset.is_warmup = false)  AS total_reps,
  SUM(wset.weight * wset.reps) FILTER (WHERE wset.is_warmup = false) AS volume
FROM workout_sessions ws
JOIN workout_session_exercises wse ON wse.session_id = ws.id
JOIN workout_sets wset ON wset.session_exercise_id = wse.id
WHERE wse.exercise_id = $exerciseId
  AND ws.user_id = $userId
  AND ws.status = 'completed'
  AND ws.started_at >= $rangeStart
GROUP BY ws.started_at::date, ws.id
ORDER BY ws.started_at::date ASC;
```

---

## Frontend Pages / Components

### Pages
1. **Exercise Detail / History** (`/exercises/:slug/history`)
   - PR card at top (current max weight × reps)
   - Interactive weight-vs-date line chart
   - Toggle: Max Reps / Total Reps chart
   - Volume bar chart
   - History list (accordion or card per session)
   - Time range selector: 1M | 3M | 6M | 1Y | All

2. **Session Detail** (`/sessions/:id`) ← already planned in Feature 4
   - "View exercise history" link per exercise row

### Components
- `ProgressChart` — Recharts `LineChart` wrapper; receives `series` data + unit label
- `VolumeChart` — Recharts `BarChart` wrapper for volume series
- `ChartTooltip` — custom tooltip showing weight × reps on hover/tap
- `TimeRangeSelector` — pill buttons: 1M | 3M | 6M | 1Y | All
- `PRCard` — highlight card showing current PR weight, reps, date
- `HistorySessionCard` — collapsible card with session date + set breakdown
- `WarmupBadge` — small "W" badge on warm-up set rows
- `RepsModeToggle` — toggle between Max / Total reps series

### Chart Library
- **Recharts** (already in architecture overview as a candidate).
- Use `ResponsiveContainer` for mobile-first sizing.
- `activeDot` on `Line` for tap-to-inspect on mobile.
- `CartesianGrid` with subtle stroke for readability.

---

## Unit Conversion Logic

```typescript
function convertWeight(value: number, from: 'kg' | 'lb', to: 'kg' | 'lb'): number {
  if (from === to) return value;
  return from === 'kg' ? value * 2.20462 : value / 2.20462;
}
```

- Conversion applied in the API response layer (not in the DB) based on the `unit` query param.
- All weights stored in the unit the user logged them; the API converts on read.
- Chart Y-axis label updates to match the active unit.

---

## Caching Strategy

| Data | Cache Key | TTL | Invalidation trigger |
|---|---|---|---|
| Chart data (3m) | `chart:{userId}:{exerciseId}:3m` | 5 min | New session completed for that exercise |
| History list page 1 | `history:{userId}:{exerciseId}:p1` | 5 min | Same |
| PR data | Reused from `max_lifts` cache (Feature 1) | 1 min | PR update |

---

## Testing Strategy

### Unit Tests
- Weight conversion function (kg → lb, lb → kg, same unit no-op)
- Chart series builder: correct date aggregation, warm-up exclusion
- Range filter: correct start date for each range string

### Integration Tests
- `GET /api/exercises/:id/history` — returns only completed sessions, correct pagination
- `GET /api/exercises/:id/chart?range=3m` — returns data within 3 months only
- Warm-up sets excluded from `max_weight`, `total_volume` in both endpoints
- Exercise with no sessions returns empty series arrays, not 404

### E2E Tests
- Navigate to exercise detail → chart renders with correct data points
- Tap a chart point → navigates to session detail
- Change time range → chart updates without page reload

---

## Implementation Phases

### Phase 1: History List (Week 5)
- `GET /api/exercises/:id/history` endpoint
- Exercise history page (list only, no charts yet)
- PR card component

### Phase 2: Charts (Week 5)
- `GET /api/exercises/:id/chart` endpoint
- Weight vs date line chart
- Time range selector
- Tap-to-session navigation

### Phase 3: Reps & Volume (Week 5–6)
- Reps toggle (max / total)
- Volume bar chart
- Unit conversion in API + chart Y-axis label

---

## Success Metrics
- Chart endpoint response < 300 ms for 1-year range (with caching)
- History page renders first 20 sessions in < 500 ms
- Charts render within 200 ms of data arrival (client-side)
- Unit conversion accuracy: ± 0.01 kg/lb

---

## Future Enhancements (Post-MVP)
- Estimated 1-Rep Max (e1RM) chart: Epley formula `weight × (1 + reps/30)`
- Multi-exercise overlay chart (compare squat vs deadlift progression)
- Body-weight normalization (strength-to-weight ratio)
- Plateau detection alert ("no new PR in 4 weeks")
- Training frequency heatmap (days per week trained)
- RPE trend line (effort over time for same weight)
