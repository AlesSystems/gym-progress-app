# Feature 7: Data Export & Backup

## Overview
Gives users full ownership of their data by allowing them to download their session history, custom exercises, and workout templates as a CSV or JSON file. A complementary import/restore flow lets users reload a JSON backup into a fresh account. No new database tables are required — this is a pure API + service-layer feature.

---

## Feature Breakdown

### 7.1 CSV Export
**User Stories:**
- As a user, I want to export my session history as a CSV so I can analyse my training data in Excel or Google Sheets.
- As a user, I want each row of the CSV to represent one logged set, with columns for date, exercise name, weight, reps, RPE, warm-up flag, and session name.

**Technical Requirements:**
- Endpoint streams the CSV response with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="gym-history-{YYYY-MM-DD}.csv"`.
- CSV is generated server-side (no temp file written to disk — streamed directly).
- Optional date range filter: `?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- Optional exercise filter: `?exerciseId=uuid`.
- Columns (in order):

| Column | Source |
|---|---|
| `date` | `workout_sessions.started_at` (date part) |
| `session_name` | `workout_sessions.name` |
| `exercise_name` | `workout_session_exercises.exercise_name` (snapshot) |
| `set_number` | `workout_sets.set_number` |
| `is_warmup` | `workout_sets.is_warmup` |
| `weight` | `workout_sets.weight` |
| `weight_unit` | `workout_sets.weight_unit` |
| `reps` | `workout_sets.reps` |
| `rpe` | `workout_sets.rpe` |
| `notes` | `workout_sets.notes` |
| `session_duration_min` | `completed_at - started_at` in minutes |

### 7.2 JSON Full Backup
**User Stories:**
- As a user, I want to download a complete backup of all my data as a JSON file so I can keep a personal archive or migrate to another account.

**Technical Requirements:**
- Endpoint returns a single JSON object containing all user-owned data:
  - User profile (no password hash, no auth tokens)
  - Custom exercises
  - Workout templates (including template exercises)
  - Scheduled workouts
  - Session history (including all session exercises + sets)
- Response includes a `exportedAt` timestamp and a `schemaVersion` string for future compatibility.
- File delivered as `Content-Disposition: attachment; filename="gym-backup-{YYYY-MM-DD}.json"`.
- For large datasets (>1,000 sessions), the endpoint uses streaming JSON serialization to avoid memory spikes.
- Rate-limited to 5 exports per user per day (Redis counter) to prevent abuse.

### 7.3 JSON Import / Restore
**User Stories:**
- As a user, I want to upload a backup JSON file to restore my data into my current account.
- As a user, I want a clear warning before import that explains what will happen (merge vs replace).

**Technical Requirements:**
- Upload via `multipart/form-data` with a single `file` field (max 10 MB).
- Import strategy: **merge** (default) — existing data is not deleted; imported records are inserted with new UUIDs to avoid collisions.
- Schema version check: if `schemaVersion` in the file is not supported, return a 422 with a human-friendly error.
- Idempotency: sessions identified by `(startedAt, exerciseName, setNumber)` composite; duplicates within same `startedAt` window are skipped.
- Import runs inside a DB transaction; any failure rolls back entirely.
- Returns a summary: `{ imported: { sessions: N, exercises: N, templates: N }, skipped: N, errors: [] }`.
- Import is async for large files: endpoint accepts the file, returns a job ID, status polled via `GET /api/import/:jobId`.

---

## Data Models

No new tables. Optional table for async import jobs:

### ImportJob Entity (optional — for async large imports)
```
ImportJob {
  id:        UUID   (primary key)
  userId:    UUID   -> User.id
  status:    enum   ('pending', 'processing', 'completed', 'failed')
  summary:   JSON   NULL  (populated on completion)
  error:     text   NULL  (populated on failure)
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## API Endpoints

### Export
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/export/csv` | Required | Export session history as CSV |
| `GET` | `/api/export/json` | Required | Export full backup as JSON |

**Query params for CSV export:**
| Param | Type | Description |
|---|---|---|
| `from` | `YYYY-MM-DD` | Filter: sessions on or after this date |
| `to` | `YYYY-MM-DD` | Filter: sessions on or before this date |
| `exerciseId` | UUID | Filter: only sets for this exercise |
| `unit` | `kg\|lb` | Override unit for weight values |

### Import
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/import` | Required | Upload JSON backup file |
| `GET` | `/api/import/:jobId` | Required | Poll async import job status |

---

## JSON Backup Schema

```json
{
  "schemaVersion": "1.0",
  "exportedAt": "2026-02-22T12:00:00Z",
  "profile": {
    "displayName": "Alex",
    "unitPreference": "kg",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  "customExercises": [
    {
      "name": "Bradford Press",
      "type": "compound",
      "movementCategory": "push",
      "primaryMuscle": "Shoulders",
      "secondaryMuscles": ["Triceps"],
      "defaultUnit": "kg",
      "defaultReps": 8,
      "demoVideoUrl": null,
      "description": null
    }
  ],
  "workoutTemplates": [
    {
      "name": "Push Day A",
      "description": null,
      "exercises": [
        {
          "exerciseName": "Bench Press",
          "orderIndex": 0,
          "sets": 4,
          "reps": "6-8",
          "targetWeight": 80,
          "targetWeightUnit": "kg",
          "restSeconds": 180,
          "tempoNotes": "3-0-1-0"
        }
      ]
    }
  ],
  "scheduledWorkouts": [
    {
      "scheduledDate": "2026-03-01",
      "title": "Push Day A",
      "notes": null
    }
  ],
  "sessions": [
    {
      "name": "Push Day A — Feb 22, 2026",
      "startedAt": "2026-02-22T08:00:00Z",
      "completedAt": "2026-02-22T09:05:00Z",
      "notes": null,
      "exercises": [
        {
          "exerciseName": "Bench Press",
          "orderIndex": 0,
          "restSeconds": 180,
          "sets": [
            {
              "setNumber": 1,
              "weight": 60,
              "weightUnit": "kg",
              "reps": 10,
              "rpe": null,
              "isWarmup": true,
              "completedAt": "2026-02-22T08:10:00Z"
            },
            {
              "setNumber": 2,
              "weight": 80,
              "weightUnit": "kg",
              "reps": 6,
              "rpe": 8.0,
              "isWarmup": false,
              "completedAt": "2026-02-22T08:18:00Z"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## CSV Export Implementation

### Server-Side Streaming (Node.js)

```typescript
import { stringify } from 'csv-stringify';
import { pipeline } from 'stream/promises';

export async function exportCsv(userId: string, filters: ExportFilters, res: Response) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="gym-history-${today()}.csv"`);

  const csvStream = stringify({
    header: true,
    columns: ['date','session_name','exercise_name','set_number',
               'is_warmup','weight','weight_unit','reps','rpe',
               'notes','session_duration_min'],
  });

  // Cursor-based DB read to avoid loading all rows into memory
  const cursor = db.streamSets(userId, filters);
  await pipeline(cursor, csvStream, res);
}
```

- Use `csv-stringify` (Node.js streaming CSV serializer).
- `db.streamSets()` uses a PostgreSQL cursor (`DECLARE ... FETCH 500`) to page through rows without loading all data into memory.

---

## Import Merge Logic

```
For each session in backup:
  1. Check if a session with same startedAt ± 1 min AND same exercise list already exists
     → if yes: skip (treat as duplicate)
     → if no: insert new session with new UUIDs

For each custom exercise in backup:
  1. Check if user already has an exercise with same name (case-insensitive)
     → if yes: skip
     → if no: insert

For each template in backup:
  1. Check if user already has a template with same name
     → if yes: skip
     → if no: insert with all exercise rows
```

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Exporting another user's data | `userId` always taken from authenticated session, never from query params |
| Large export causing memory pressure | Streaming response; cursor-based DB reads |
| Malicious JSON import | File size limit (10 MB), schema validation via Zod, DB transaction rollback on error |
| Import overwriting existing data | Merge-only strategy in MVP; no replace option |
| Rate limiting exports | Redis counter: `export:{userId}` with 24h TTL, max 5 increments |

---

## Frontend Pages / Components

### Pages
1. **Data & Privacy Settings** (`/settings/data`)
   - Export section:
     - "Export as CSV" button + date range picker (optional)
     - "Download Full Backup (JSON)" button
   - Import section:
     - File drag-and-drop zone (`application/json`)
     - Import mode note: "Your existing data will not be deleted. Imported data will be merged."
     - "Import" button → shows progress + summary on completion
   - Warning copy for import action

### Components
- `ExportCard` — card with format description and download button
- `DateRangeFilter` — optional from/to date pickers
- `ImportDropzone` — drag-and-drop file zone with file-type validation
- `ImportProgressBanner` — shows "Importing…" spinner, then summary (`N sessions imported, N skipped`)
- `ImportSummaryModal` — detailed breakdown of import result

---

## Testing Strategy

### Unit Tests
- CSV row builder: correct column mapping, NULL values render as empty strings
- JSON schema validator: rejects files missing required fields or with wrong `schemaVersion`
- Duplicate detection logic (session within ±1 min window)
- Rate limit counter increment / reset

### Integration Tests
- `GET /api/export/csv` — returns valid CSV with correct headers and rows
- `GET /api/export/json` — returns valid JSON matching schema, no password hash present
- `POST /api/import` — inserts new sessions, skips duplicates, returns correct summary
- `POST /api/import` with invalid JSON — returns 422 with schema error message
- `POST /api/import` exceeding rate limit — returns 429

### E2E Tests
- User clicks "Export CSV" → file downloads, open in spreadsheet shows correct rows
- User downloads backup, creates new account, imports backup → session history matches
- User imports same backup twice → second import reports all records skipped

---

## Implementation Phases

### Phase 1: CSV Export (Week 7)
- CSV streaming endpoint
- Settings page with export card + optional date range filter
- Download trigger

### Phase 2: JSON Export (Week 7)
- Full JSON backup endpoint
- Rate limiting
- Download trigger on settings page

### Phase 3: JSON Import (Week 8)
- Import endpoint (sync for < 1 MB, async job for larger files)
- Schema validation
- Merge logic + duplicate detection
- Import dropzone + progress UI

---

## Success Metrics
- CSV export for 500 sessions < 3 seconds
- JSON export for 1,000 sessions < 5 seconds (streaming)
- Import of 200 sessions < 10 seconds
- 0 instances of another user's data included in an export
- Import rollback on error: 100% (no partial imports left in DB)

---

## Future Enhancements (Post-MVP)
- Scheduled automatic weekly/monthly backup emailed as attachment
- Import from third-party apps (Strong, Hevy — map their CSV/JSON format)
- Selective export (choose specific exercises or date ranges with preview)
- Encrypted backup option (AES-256 passphrase on JSON file)
- GDPR "right to erasure" endpoint: wipe all user data and return confirmation
