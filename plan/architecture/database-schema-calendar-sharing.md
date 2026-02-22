# Database Schema — Calendar, Scheduling & Sharing

> This document covers Features 6, 7, and 8. It introduces one new table (`scheduled_workouts`),
> one optional table (`import_jobs`), and two ALTER statements on existing tables.
> Features 5 (History & Progress) requires no schema changes — all data is read from tables
> defined in `database-schema-exercises-workouts.md`.

---

## Schema Changes Summary

| Change | Type | Feature |
|---|---|---|
| `scheduled_workouts` | New table | Feature 6 — Calendar |
| `import_jobs` | New table (optional) | Feature 7 — Async import |
| `workout_templates.visibility` | New column | Feature 8 — Sharing |

---

## Entity Relationship Diagram

```
┌───────────────────────────────────────┐
│               USER                    │
│  id · display_name · invited_by · …  │
└──────────┬────────────────────────────┘
           │
           │ 1:N (user_id)
           │
┌──────────▼────────────────────────────────────────────────────┐
│                   SCHEDULED_WORKOUT                           │
├───────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                  │
│ FK  user_id: UUID NOT NULL -> User.id                         │
│ FK  template_id: UUID NULL -> WorkoutTemplate.id              │
│     scheduled_date: DATE NOT NULL                             │
│     title: VARCHAR(100) NULL                                  │
│     notes: TEXT NULL                                          │
│ FK  completed_session_id: UUID NULL -> WorkoutSession.id      │
│     created_at: TIMESTAMP                                     │
│     updated_at: TIMESTAMP                                     │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                     IMPORT_JOB (optional)                     │
├───────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                  │
│ FK  user_id: UUID NOT NULL -> User.id                         │
│     status: ENUM ('pending','processing','completed','failed') │
│     summary: JSON NULL                                        │
│     error: TEXT NULL                                          │
│     created_at: TIMESTAMP                                     │
│     updated_at: TIMESTAMP                                     │
└───────────────────────────────────────────────────────────────┘

ALTERED TABLE workout_templates:
  + visibility: VARCHAR(20) DEFAULT 'private' CHECK IN ('private','friends')
```

---

## Detailed Schema Definitions

### ScheduledWorkout Table

```sql
CREATE TABLE scheduled_workouts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id          UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  scheduled_date       DATE NOT NULL,
  title                VARCHAR(100),
  notes                TEXT,
  completed_session_id UUID REFERENCES workout_sessions(id) ON DELETE SET NULL,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_scheduled_user_id        ON scheduled_workouts(user_id);
CREATE INDEX idx_scheduled_date           ON scheduled_workouts(scheduled_date);
CREATE INDEX idx_scheduled_template_id    ON scheduled_workouts(template_id);
CREATE INDEX idx_scheduled_session_id     ON scheduled_workouts(completed_session_id);

-- Compound index for the primary calendar query
CREATE INDEX idx_scheduled_user_date      ON scheduled_workouts(user_id, scheduled_date);
```

**Constraint Notes:**
- `scheduled_date` is `DATE` (no time component). Time zones are handled client-side.
- `template_id` is nullable — users can create a "rest day note" or a generic block without linking a template.
- `completed_session_id` is `NULL` until the user starts a session from this entry.
- `title` falls back to the template name in the API response if `NULL`.
- Multiple rows per `(user_id, scheduled_date)` are allowed (e.g., two workouts in one day).
- `ON DELETE SET NULL` on both FKs ensures scheduled entries survive template deletion or session deletion.

### Derived Status (computed in API layer, not stored)

| Condition | Status |
|---|---|
| `scheduled_date >= CURRENT_DATE` AND `completed_session_id IS NULL` | `planned` |
| `completed_session_id IS NOT NULL` | `completed` |
| `scheduled_date < CURRENT_DATE` AND `completed_session_id IS NULL` | `missed` |

---

### ImportJob Table (optional — for async large-file imports)

```sql
CREATE TABLE import_jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  summary    JSON,
  error      TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_import_jobs_user_id   ON import_jobs(user_id);
CREATE INDEX idx_import_jobs_status    ON import_jobs(status);
CREATE INDEX idx_import_jobs_created   ON import_jobs(created_at DESC);
```

**Notes:**
- For files < 1 MB, the import runs synchronously and no row is inserted (the API returns the summary directly).
- For files ≥ 1 MB, a row is inserted with `status = 'pending'`, a background worker picks it up and updates `status` and `summary`.
- Old completed/failed jobs can be archived after 7 days via a cron job.

---

### ALTER: WorkoutTemplate — Add Visibility

```sql
ALTER TABLE workout_templates
  ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'friends'));

CREATE INDEX idx_templates_visibility ON workout_templates(visibility);
```

**Notes:**
- `DEFAULT 'private'` ensures all existing templates remain private after migration with no data change.
- The index enables the shared-template query to efficiently filter `visibility = 'friends'`.

---

## Trigger: Auto-update `updated_at`

```sql
CREATE TRIGGER update_scheduled_workouts_updated_at
  BEFORE UPDATE ON scheduled_workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_jobs_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Prisma Schema (TypeScript)

```prisma
// ─── Enums ────────────────────────────────────────────────────────────────────

enum TemplateVisibility {
  private
  friends
}

enum ImportJobStatus {
  pending
  processing
  completed
  failed
}

// ─── Alter: WorkoutTemplate — add visibility ──────────────────────────────────

// (Add field to existing model in database-schema-exercises-workouts.md)
// model WorkoutTemplate {
//   ...existing fields...
//   visibility   TemplateVisibility @default(private)
//   @@index([visibility])
// }

// ─── ScheduledWorkout ─────────────────────────────────────────────────────────

model ScheduledWorkout {
  id                  String          @id @default(uuid())
  userId              String          @map("user_id")
  user                User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  templateId          String?         @map("template_id")
  template            WorkoutTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  scheduledDate       DateTime        @map("scheduled_date") @db.Date
  title               String?         @db.VarChar(100)
  notes               String?
  completedSessionId  String?         @map("completed_session_id")
  completedSession    WorkoutSession? @relation(fields: [completedSessionId], references: [id], onDelete: SetNull)
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  @@index([userId])
  @@index([scheduledDate])
  @@index([userId, scheduledDate])
  @@index([templateId])
  @@index([completedSessionId])
  @@map("scheduled_workouts")
}

// ─── ImportJob ────────────────────────────────────────────────────────────────

model ImportJob {
  id        String          @id @default(uuid())
  userId    String          @map("user_id")
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  status    ImportJobStatus @default(pending)
  summary   Json?
  error     String?
  createdAt DateTime        @default(now()) @map("created_at")
  updatedAt DateTime        @updatedAt @map("updated_at")

  @@index([userId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@map("import_jobs")
}
```

---

## Key Queries

### Calendar range fetch (sessions + scheduled workouts)

```sql
-- Completed sessions in range
SELECT
  ws.id,
  ws.name,
  ws.started_at::date                                              AS date,
  ws.started_at,
  ws.completed_at,
  EXTRACT(EPOCH FROM (ws.completed_at - ws.started_at)) / 60      AS duration_minutes,
  COUNT(DISTINCT wse.id)                                           AS exercise_count,
  SUM(wset.weight * wset.reps) FILTER (WHERE NOT wset.is_warmup)  AS total_volume
FROM workout_sessions ws
LEFT JOIN workout_session_exercises wse ON wse.session_id = ws.id
LEFT JOIN workout_sets wset ON wset.session_exercise_id = wse.id
WHERE ws.user_id = $userId
  AND ws.status = 'completed'
  AND ws.started_at::date BETWEEN $from AND $to
GROUP BY ws.id, ws.name, ws.started_at, ws.completed_at;

-- Scheduled workouts in range
SELECT
  sw.*,
  wt.name AS template_name
FROM scheduled_workouts sw
LEFT JOIN workout_templates wt ON wt.id = sw.template_id
WHERE sw.user_id = $userId
  AND sw.scheduled_date BETWEEN $from AND $to
ORDER BY sw.scheduled_date ASC;
```

### Shared templates (friends' `friends`-visibility templates)

```sql
-- Step 1: resolve friend IDs
WITH friends AS (
  -- The person who invited current user
  SELECT invited_by AS friend_id FROM users WHERE id = $currentUserId AND invited_by IS NOT NULL
  UNION ALL
  -- People the current user invited
  SELECT id AS friend_id FROM users WHERE invited_by = $currentUserId
)
-- Step 2: fetch their shared templates
SELECT
  wt.id,
  wt.name,
  wt.description,
  wt.updated_at,
  u.display_name AS owner_name,
  (
    SELECT COUNT(*) FROM workout_template_exercises wte WHERE wte.template_id = wt.id
  ) AS exercise_count
FROM workout_templates wt
JOIN users u ON u.id = wt.user_id
WHERE wt.user_id IN (SELECT friend_id FROM friends)
  AND wt.visibility = 'friends'
  AND wt.is_archived = false
ORDER BY wt.updated_at DESC;
```

### Link scheduled workout to completed session

```sql
UPDATE scheduled_workouts
SET completed_session_id = $sessionId, updated_at = CURRENT_TIMESTAMP
WHERE id = $scheduledWorkoutId
  AND user_id = $userId
  AND completed_session_id IS NULL;
```

### Export: full session history (streaming cursor)

```sql
DECLARE export_cursor CURSOR FOR
SELECT
  ws.started_at::date                          AS date,
  ws.name                                      AS session_name,
  wse.exercise_name,
  wset.set_number,
  wset.is_warmup,
  wset.weight,
  wset.weight_unit,
  wset.reps,
  wset.rpe,
  wset.notes,
  EXTRACT(EPOCH FROM (ws.completed_at - ws.started_at)) / 60 AS session_duration_min
FROM workout_sessions ws
JOIN workout_session_exercises wse ON wse.session_id = ws.id
JOIN workout_sets wset ON wset.session_exercise_id = wse.id
WHERE ws.user_id = $userId
  AND ws.status = 'completed'
  AND ($from IS NULL OR ws.started_at::date >= $from)
  AND ($to   IS NULL OR ws.started_at::date <= $to)
ORDER BY ws.started_at ASC, wse.order_index ASC, wset.set_number ASC;

FETCH 500 FROM export_cursor;
-- Repeat until no rows returned, then CLOSE export_cursor
```

---

## Migration Order

Append to the migration sequence from previous schema documents:

```
001–010  ← Features 1–4 (see previous schema files)
011_create_scheduled_workouts.sql
012_alter_workout_templates_add_visibility.sql
013_create_import_jobs.sql                    ← optional, deploy with Feature 7
```

---

## Performance Considerations

### Calendar Query Optimization
- The compound index `(user_id, scheduled_date)` on `scheduled_workouts` covers the primary calendar fetch.
- The index `idx_sessions_started_at DESC` on `workout_sessions` covers the date-range filter.
- For large date ranges (e.g., full-year calendar), limit the response to metadata only (no set-level detail) — detail is fetched on day tap.

### Shared Templates
- The `WITH friends AS (...)` CTE uses existing `idx_users_invited_by` index.
- Results cached in Redis: `shared-templates:{userId}` with 5-minute TTL; invalidated when any friend changes template visibility.

### Export Streaming
- Use PostgreSQL cursors (`DECLARE / FETCH`) to avoid loading all session rows into memory.
- `FETCH 500` rows per iteration, pipe directly into `csv-stringify` stream.
- Set `statement_timeout = 30s` on the export connection to prevent runaway queries.

### Import Transaction Budget
- Large imports wrapped in a single transaction.
- Batch INSERT using `INSERT INTO ... SELECT ... FROM unnest(...)` to avoid N individual round-trips.
- Target: ≤ 10 DB round-trips regardless of import size.

---

## Data Integrity Notes

| Scenario | Handling |
|---|---|
| Template deleted while scheduled | `template_id` → NULL via `ON DELETE SET NULL`; entry remains in calendar as "untitled" |
| Session deleted while linked to schedule | `completed_session_id` → NULL; entry reverts to `planned` or `missed` status |
| User deletes account | `ON DELETE CASCADE` removes all scheduled workouts and import jobs |
| Concurrent start of session from same scheduled entry | Application-layer check with `SELECT FOR UPDATE` on the scheduled row before linking |
| Import file references non-existent exercise (system exercise name changed) | Fuzzy match on `lower(name)`; if no match, create as custom exercise |
| Two friends share templates to each other simultaneously | No collision — each owns their own templates independently |

---

## Complete Migration File List (All Features)

For reference, the full ordered migration sequence across all schema documents:

```
001_create_users.sql
002_create_auth_tables.sql                         -- magic_links, password_resets, sessions, invites
003_create_exercises_base.sql                      -- stub exercises table
004_extend_exercises_feature2.sql                  -- slug, type, category, muscle, media columns
005_create_workout_templates.sql
006_create_workout_template_exercises.sql
007_create_workout_sessions.sql
008_create_workout_session_exercises.sql
009_create_workout_sets.sql
010_seed_exercises.sql                             -- 15 system exercises
011_create_scheduled_workouts.sql
012_alter_workout_templates_add_visibility.sql
013_create_import_jobs.sql
```
