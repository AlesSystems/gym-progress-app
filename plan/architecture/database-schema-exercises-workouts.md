# Database Schema — Exercises, Workout Builder & Session Logging

> This document covers Features 2, 3, and 4. It extends the `exercises` table that was stubbed in
> `database-schema.md` (Feature 1) and introduces six new tables.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          USER                               │
│  id · email · displayName · unitPreference · …              │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           │ 1:N (created_by)         │ 1:N (user_id)
           │                          │
┌──────────▼──────────────────┐  ┌───▼──────────────────────────────────┐
│          EXERCISE            │  │          WORKOUT_TEMPLATE            │
├──────────────────────────────┤  ├──────────────────────────────────────┤
│ PK  id: UUID                 │  │ PK  id: UUID                         │
│     name: VARCHAR(100)       │  │ FK  userId: UUID -> User.id          │
│     slug: VARCHAR(120) UQ    │  │     name: VARCHAR(100)               │
│     type: ENUM               │  │     description: TEXT NULL           │
│     movementCategory: ENUM   │  │     isArchived: BOOLEAN DEFAULT false│
│     primaryMuscle: VARCHAR   │  │ FK  clonedFrom: UUID NULL -> self    │
│     secondaryMuscles: JSON   │  │     createdAt: TIMESTAMP             │
│     defaultUnit: ENUM NULL   │  │     updatedAt: TIMESTAMP             │
│     defaultReps: INT NULL     │  └──────────────┬───────────────────────┘
│     defaultWeight: DEC NULL  │                 │ 1:N
│     demoImageUrl: TEXT NULL  │                 │
│     demoVideoUrl: TEXT NULL  │  ┌──────────────▼───────────────────────┐
│     description: TEXT NULL   │  │      WORKOUT_TEMPLATE_EXERCISE       │
│     isSystemExercise: BOOL   │  ├──────────────────────────────────────┤
│     isDeleted: BOOL DEF false│  │ PK  id: UUID                         │
│ FK  createdBy: UUID NULL     │  │ FK  templateId: UUID -> Template.id  │
│     createdAt: TIMESTAMP     │◄─┤ FK  exerciseId: UUID -> Exercise.id  │
│     updatedAt: TIMESTAMP     │  │     orderIndex: INTEGER              │
└──────────────────────────────┘  │     sets: INTEGER                    │
           ▲                      │     reps: VARCHAR(10)                │
           │ FK exerciseId        │     targetWeight: DEC(6,2) NULL      │
           │                      │     targetWeightUnit: ENUM NULL      │
┌──────────┴───────────────────┐  │     restSeconds: INTEGER NULL        │
│    WORKOUT_SESSION_EXERCISE  │  │     tempoNotes: VARCHAR(20) NULL     │
│    (references Exercise too) │  │     notes: TEXT NULL                 │
└──────────────────────────────┘  │     createdAt: TIMESTAMP             │
                                  │     updatedAt: TIMESTAMP             │
                                  │ UNIQUE (templateId, orderIndex)      │
                                  └──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      WORKOUT_SESSION                        │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│ FK  userId: UUID -> User.id                                 │
│ FK  templateId: UUID NULL -> WorkoutTemplate.id             │
│     name: VARCHAR(150) NULL                                 │
│     status: ENUM ('in_progress','completed','abandoned')    │
│     notes: TEXT NULL                                        │
│     startedAt: TIMESTAMP                                    │
│     completedAt: TIMESTAMP NULL                             │
│     createdAt: TIMESTAMP                                    │
│     updatedAt: TIMESTAMP                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ 1:N
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                WORKOUT_SESSION_EXERCISE                     │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│ FK  sessionId: UUID -> WorkoutSession.id                    │
│ FK  exerciseId: UUID -> Exercise.id                         │
│     exerciseName: VARCHAR(100)  -- denormalized snapshot    │
│     orderIndex: INTEGER                                     │
│     restSeconds: INTEGER NULL                               │
│     notes: TEXT NULL                                        │
│     createdAt: TIMESTAMP                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ 1:N
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                       WORKOUT_SET                           │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│ FK  sessionExerciseId: UUID -> WorkoutSessionExercise.id    │
│     setNumber: INTEGER                                      │
│     weight: DECIMAL(6,2) NULL                               │
│     weightUnit: ENUM('kg','lb') NULL                        │
│     reps: INTEGER NULL                                      │
│     rpe: DECIMAL(3,1) NULL  (1.0 – 10.0)                   │
│     notes: TEXT NULL                                        │
│     isWarmup: BOOLEAN DEFAULT false                         │
│     completedAt: TIMESTAMP NULL                             │
│     createdAt: TIMESTAMP                                    │
│     updatedAt: TIMESTAMP                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Schema Definitions

### Exercise Table (expanded from Feature 1 stub)

The stub in `database-schema.md` covers the base columns. This migration adds all Feature 2 columns.

```sql
-- Migration: alter exercises table (add Feature 2 columns)
ALTER TABLE exercises
  ADD COLUMN slug                VARCHAR(120) UNIQUE,
  ADD COLUMN type                VARCHAR(20)  CHECK (type IN ('compound', 'isolation')),
  ADD COLUMN movement_category   VARCHAR(20)  CHECK (movement_category IN ('push', 'pull', 'legs', 'core', 'cardio', 'other')),
  ADD COLUMN primary_muscle      VARCHAR(50),
  ADD COLUMN secondary_muscles   JSON,
  ADD COLUMN default_unit        VARCHAR(10)  CHECK (default_unit IN ('kg', 'lb')),
  ADD COLUMN default_reps        INTEGER      CHECK (default_reps > 0),
  ADD COLUMN default_weight      DECIMAL(6,2) CHECK (default_weight >= 0),
  ADD COLUMN demo_image_url      TEXT,
  ADD COLUMN demo_video_url      TEXT,
  ADD COLUMN is_system_exercise  BOOLEAN      DEFAULT true,
  ADD COLUMN is_deleted          BOOLEAN      DEFAULT false,
  ADD COLUMN created_by          UUID         REFERENCES users(id) ON DELETE SET NULL;

-- Slug index
CREATE UNIQUE INDEX idx_exercises_slug ON exercises(slug);

-- Custom exercise unique name per user (system exercises have created_by = NULL)
CREATE UNIQUE INDEX idx_exercises_user_name
  ON exercises(created_by, lower(name))
  WHERE created_by IS NOT NULL;

-- Additional indexes
CREATE INDEX idx_exercises_type            ON exercises(type);
CREATE INDEX idx_exercises_movement_cat    ON exercises(movement_category);
CREATE INDEX idx_exercises_primary_muscle  ON exercises(primary_muscle);
CREATE INDEX idx_exercises_is_system       ON exercises(is_system_exercise);
CREATE INDEX idx_exercises_created_by      ON exercises(created_by);
```

**Constraint Notes:**
- `slug` auto-generated on INSERT via trigger (slugify name, append short UUID suffix on collision).
- `is_system_exercise = true` + `created_by IS NULL` → system exercise (read-only via API).
- `is_system_exercise = false` + `created_by = user_id` → custom exercise.
- Soft-delete via `is_deleted = true`; queries always include `WHERE is_deleted = false`.

---

### WorkoutTemplate Table

```sql
CREATE TABLE workout_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  is_archived  BOOLEAN DEFAULT false,
  cloned_from  UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_user_id    ON workout_templates(user_id);
CREATE INDEX idx_templates_is_archived ON workout_templates(is_archived);
CREATE INDEX idx_templates_cloned_from ON workout_templates(cloned_from);
CREATE INDEX idx_templates_updated_at  ON workout_templates(updated_at DESC);
```

---

### WorkoutTemplateExercise Table

```sql
CREATE TABLE workout_template_exercises (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id         UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id         UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  order_index         INTEGER NOT NULL CHECK (order_index >= 0),
  sets                INTEGER NOT NULL DEFAULT 3 CHECK (sets BETWEEN 1 AND 20),
  reps                VARCHAR(10) NOT NULL DEFAULT '8',    -- "5", "8-12", "AMRAP"
  target_weight       DECIMAL(6,2) CHECK (target_weight >= 0),
  target_weight_unit  VARCHAR(10) CHECK (target_weight_unit IN ('kg', 'lb')),
  rest_seconds        INTEGER CHECK (rest_seconds BETWEEN 0 AND 600),
  tempo_notes         VARCHAR(20),                          -- "3-1-2-0"
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (template_id, order_index)
);

CREATE INDEX idx_tmpl_ex_template_id  ON workout_template_exercises(template_id);
CREATE INDEX idx_tmpl_ex_exercise_id  ON workout_template_exercises(exercise_id);
```

**Constraint Notes:**
- `UNIQUE(template_id, order_index)` enforces no duplicate positions; must be maintained atomically when reordering.
- Max 30 exercises per template enforced in application layer (not DB constraint for flexibility).
- `exercise_id` uses `ON DELETE RESTRICT` to prevent deleting an exercise that is referenced by a template.

---

### WorkoutSession Table

```sql
CREATE TABLE workout_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id   UUID REFERENCES workout_templates(id) ON DELETE SET NULL,
  name          VARCHAR(150),
  status        VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  notes         TEXT,
  started_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Only one active session per user
  CONSTRAINT unique_active_session EXCLUDE USING btree (user_id WITH =)
    WHERE (status = 'in_progress')
);

CREATE INDEX idx_sessions_user_id      ON workout_sessions(user_id);
CREATE INDEX idx_sessions_status       ON workout_sessions(status);
CREATE INDEX idx_sessions_started_at   ON workout_sessions(started_at DESC);
CREATE INDEX idx_sessions_template_id  ON workout_sessions(template_id);
```

**Notes:**
- `EXCLUDE` constraint (PostgreSQL exclusion constraint) enforces only one `in_progress` session per user at DB level.
- `name` auto-generated in application if NULL: `"{templateName} — {date}"` or `"Freestyle — {date}"`.
- `completed_at - started_at` gives session duration (computed at query time, not stored).

---

### WorkoutSessionExercise Table

```sql
CREATE TABLE workout_session_exercises (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id    UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  exercise_name  VARCHAR(100) NOT NULL,   -- denormalized snapshot for history
  order_index    INTEGER NOT NULL CHECK (order_index >= 0),
  rest_seconds   INTEGER CHECK (rest_seconds BETWEEN 0 AND 600),
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (session_id, order_index)
);

CREATE INDEX idx_sess_ex_session_id   ON workout_session_exercises(session_id);
CREATE INDEX idx_sess_ex_exercise_id  ON workout_session_exercises(exercise_id);
```

**Notes:**
- `exercise_name` is copied from `exercises.name` at session start. If the exercise is later renamed or deleted, history remains accurate.
- Past sessions are immutable after `status = 'completed'`; enforced at API layer.

---

### WorkoutSet Table

```sql
CREATE TABLE workout_sets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id  UUID NOT NULL REFERENCES workout_session_exercises(id) ON DELETE CASCADE,
  set_number           INTEGER NOT NULL CHECK (set_number > 0),
  weight               DECIMAL(6,2) CHECK (weight >= 0),
  weight_unit          VARCHAR(10) CHECK (weight_unit IN ('kg', 'lb')),
  reps                 INTEGER CHECK (reps BETWEEN 0 AND 999),
  rpe                  DECIMAL(3,1) CHECK (rpe BETWEEN 1.0 AND 10.0),
  notes                TEXT,
  is_warmup            BOOLEAN DEFAULT false,
  completed_at         TIMESTAMP,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sets_session_exercise_id  ON workout_sets(session_exercise_id);
CREATE INDEX idx_sets_is_warmup            ON workout_sets(is_warmup);
CREATE INDEX idx_sets_completed_at         ON workout_sets(completed_at DESC);
```

**Notes:**
- `weight` and `reps` are both nullable to support bodyweight exercises and failure sets.
- RPE stored as `DECIMAL(3,1)`: supports half-steps (6.5, 7.5 …); validated in app layer to be multiples of 0.5.
- `is_warmup = true` sets are excluded from PR detection queries and volume aggregations.

---

## Database Triggers

### Auto-update `updated_at`

```sql
-- Reuse the update_updated_at_column() function from database-schema.md

CREATE TRIGGER update_workout_templates_updated_at
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tmpl_exercises_updated_at
  BEFORE UPDATE ON workout_template_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sets_updated_at
  BEFORE UPDATE ON workout_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-generate Exercise Slug

```sql
CREATE OR REPLACE FUNCTION generate_exercise_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM exercises WHERE slug = final_slug AND id != COALESCE(NEW.id, gen_random_uuid())
    );
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_exercise_slug_trigger
  BEFORE INSERT OR UPDATE OF name ON exercises
  FOR EACH ROW EXECUTE FUNCTION generate_exercise_slug();
```

---

## Prisma Schema (TypeScript)

```prisma
// ─── Enums ────────────────────────────────────────────────────────────────────

enum ExerciseType {
  compound
  isolation
}

enum MovementCategory {
  push
  pull
  legs
  core
  cardio
  other
}

enum SessionStatus {
  in_progress
  completed
  abandoned
}

// ─── Exercise (extended) ──────────────────────────────────────────────────────

model Exercise {
  id                 String           @id @default(uuid())
  name               String
  slug               String           @unique
  type               ExerciseType?
  movementCategory   MovementCategory? @map("movement_category")
  primaryMuscle      String?          @map("primary_muscle")
  secondaryMuscles   Json?            @map("secondary_muscles")
  defaultUnit        UnitPreference?  @map("default_unit")
  defaultReps        Int?             @map("default_reps")
  defaultWeight      Decimal?         @db.Decimal(6, 2) @map("default_weight")
  demoImageUrl       String?          @map("demo_image_url")
  demoVideoUrl       String?          @map("demo_video_url")
  description        String?
  isSystemExercise   Boolean          @default(true) @map("is_system_exercise")
  isDeleted          Boolean          @default(false) @map("is_deleted")
  createdBy          String?          @map("created_by")
  creator            User?            @relation("ExerciseCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  createdAt          DateTime         @default(now()) @map("created_at")
  updatedAt          DateTime         @updatedAt @map("updated_at")

  // Relations
  maxLifts           MaxLift[]
  templateExercises  WorkoutTemplateExercise[]
  sessionExercises   WorkoutSessionExercise[]

  @@index([name])
  @@index([slug])
  @@index([type])
  @@index([movementCategory])
  @@index([primaryMuscle])
  @@index([isSystemExercise])
  @@index([createdBy])
  @@map("exercises")
}

// ─── Workout Template ─────────────────────────────────────────────────────────

model WorkoutTemplate {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  isArchived  Boolean   @default(false) @map("is_archived")
  clonedFrom  String?   @map("cloned_from")
  original    WorkoutTemplate?  @relation("TemplateClones", fields: [clonedFrom], references: [id], onDelete: SetNull)
  clones      WorkoutTemplate[] @relation("TemplateClones")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  exercises   WorkoutTemplateExercise[]
  sessions    WorkoutSession[]

  @@index([userId])
  @@index([isArchived])
  @@index([clonedFrom])
  @@map("workout_templates")
}

model WorkoutTemplateExercise {
  id               String          @id @default(uuid())
  templateId       String          @map("template_id")
  template         WorkoutTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  exerciseId       String          @map("exercise_id")
  exercise         Exercise        @relation(fields: [exerciseId], references: [id])
  orderIndex       Int             @map("order_index")
  sets             Int             @default(3)
  reps             String          @default("8")
  targetWeight     Decimal?        @db.Decimal(6, 2) @map("target_weight")
  targetWeightUnit UnitPreference? @map("target_weight_unit")
  restSeconds      Int?            @map("rest_seconds")
  tempoNotes       String?         @map("tempo_notes")
  notes            String?
  createdAt        DateTime        @default(now()) @map("created_at")
  updatedAt        DateTime        @updatedAt @map("updated_at")

  @@unique([templateId, orderIndex])
  @@index([templateId])
  @@index([exerciseId])
  @@map("workout_template_exercises")
}

// ─── Workout Session ──────────────────────────────────────────────────────────

model WorkoutSession {
  id           String        @id @default(uuid())
  userId       String        @map("user_id")
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  templateId   String?       @map("template_id")
  template     WorkoutTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  name         String?
  status       SessionStatus @default(in_progress)
  notes        String?
  startedAt    DateTime      @default(now()) @map("started_at")
  completedAt  DateTime?     @map("completed_at")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  exercises    WorkoutSessionExercise[]

  @@index([userId])
  @@index([status])
  @@index([startedAt(sort: Desc)])
  @@index([templateId])
  @@map("workout_sessions")
}

model WorkoutSessionExercise {
  id           String         @id @default(uuid())
  sessionId    String         @map("session_id")
  session      WorkoutSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  exerciseId   String         @map("exercise_id")
  exercise     Exercise       @relation(fields: [exerciseId], references: [id])
  exerciseName String         @map("exercise_name")
  orderIndex   Int            @map("order_index")
  restSeconds  Int?           @map("rest_seconds")
  notes        String?
  createdAt    DateTime       @default(now()) @map("created_at")

  sets         WorkoutSet[]

  @@unique([sessionId, orderIndex])
  @@index([sessionId])
  @@index([exerciseId])
  @@map("workout_session_exercises")
}

model WorkoutSet {
  id                UUID           @id @default(uuid())
  sessionExerciseId String         @map("session_exercise_id")
  sessionExercise   WorkoutSessionExercise @relation(fields: [sessionExerciseId], references: [id], onDelete: Cascade)
  setNumber         Int            @map("set_number")
  weight            Decimal?       @db.Decimal(6, 2)
  weightUnit        UnitPreference? @map("weight_unit")
  reps              Int?
  rpe               Decimal?       @db.Decimal(3, 1)
  notes             String?
  isWarmup          Boolean        @default(false) @map("is_warmup")
  completedAt       DateTime?      @map("completed_at")
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")

  @@index([sessionExerciseId])
  @@index([isWarmup])
  @@map("workout_sets")
}
```

---

## Key Queries

### Active session for a user
```sql
SELECT * FROM workout_sessions
WHERE user_id = $userId AND status = 'in_progress'
LIMIT 1;
```

### Full session detail (exercises + sets)
```sql
SELECT
  ws.*,
  wse.id            AS ex_id,
  wse.exercise_name,
  wse.order_index   AS ex_order,
  wse.rest_seconds,
  wset.id           AS set_id,
  wset.set_number,
  wset.weight,
  wset.weight_unit,
  wset.reps,
  wset.rpe,
  wset.is_warmup,
  wset.completed_at
FROM workout_sessions ws
JOIN workout_session_exercises wse ON wse.session_id = ws.id
JOIN workout_sets wset ON wset.session_exercise_id = wse.id
WHERE ws.id = $sessionId AND ws.user_id = $userId
ORDER BY wse.order_index, wset.set_number;
```

### PR detection on set save
```sql
SELECT ml.weight
FROM max_lifts ml
JOIN workout_session_exercises wse ON wse.id = $sessionExerciseId
WHERE ml.user_id = $userId
  AND ml.exercise_id = wse.exercise_id;
-- If new set.weight > ml.weight (or ml doesn't exist) → UPSERT max_lifts
```

### Session history with volume
```sql
SELECT
  ws.id,
  ws.name,
  ws.status,
  ws.started_at,
  ws.completed_at,
  EXTRACT(EPOCH FROM (ws.completed_at - ws.started_at)) / 60 AS duration_minutes,
  COUNT(DISTINCT wse.id)  AS exercise_count,
  COUNT(wset.id)          AS total_sets,
  SUM(wset.weight * wset.reps) FILTER (WHERE wset.is_warmup = false) AS total_volume
FROM workout_sessions ws
LEFT JOIN workout_session_exercises wse ON wse.session_id = ws.id
LEFT JOIN workout_sets wset ON wset.session_exercise_id = wse.id
WHERE ws.user_id = $userId AND ws.status = 'completed'
GROUP BY ws.id
ORDER BY ws.started_at DESC
LIMIT 20 OFFSET $offset;
```

### Exercise library (system + own custom, not deleted)
```sql
SELECT * FROM exercises
WHERE is_deleted = false
  AND (is_system_exercise = true OR created_by = $userId)
  AND ($search IS NULL OR name ILIKE '%' || $search || '%')
  AND ($type IS NULL OR type = $type)
  AND ($category IS NULL OR movement_category = $category)
ORDER BY is_system_exercise DESC, name ASC
LIMIT 20 OFFSET $offset;
```

---

## Migration Order

```
001_create_users.sql                  ← from Feature 1
002_create_auth_tables.sql            ← from Feature 1
003_create_exercises_base.sql         ← from Feature 1 (stub)
004_extend_exercises_feature2.sql     ← adds slug, type, category, muscle, media…
005_create_workout_templates.sql
006_create_workout_template_exercises.sql
007_create_workout_sessions.sql
008_create_workout_session_exercises.sql
009_create_workout_sets.sql
010_seed_exercises.sql                ← inserts system exercises
```

---

## Performance Considerations

### Indexes Summary
| Table | Indexed Columns |
|---|---|
| `exercises` | `slug`, `name`, `type`, `movement_category`, `primary_muscle`, `is_system_exercise`, `created_by` |
| `workout_templates` | `user_id`, `is_archived`, `cloned_from`, `updated_at DESC` |
| `workout_template_exercises` | `template_id`, `exercise_id` |
| `workout_sessions` | `user_id`, `status`, `started_at DESC`, `template_id` |
| `workout_session_exercises` | `session_id`, `exercise_id` |
| `workout_sets` | `session_exercise_id`, `is_warmup` |

### Caching Strategy (Redis)
| Data | TTL | Invalidation |
|---|---|---|
| Exercise library (system exercises) | 1 hour | On admin seed refresh |
| User's custom exercise list | 5 min | On create/update/delete |
| Active session | 30 sec | On any set log or status change |
| Session history list | 2 min | On session completion |

### Query Optimization Notes
- Session detail query: use a single JOIN rather than N+1 per exercise.
- Volume aggregation: run as a background job and cache result on session completion; do not recompute on every list load.
- Template clone: execute inside a DB transaction — insert template row then bulk-insert all exercise rows.
- Reorder: batch `UPDATE` all affected `order_index` values in one statement using `CASE WHEN` or `unnest`.

---

## Data Integrity Notes

| Scenario | Handling |
|---|---|
| Exercise deleted while used in active template | `ON DELETE RESTRICT` — prevents deletion; user must remove from template first |
| Template archived while session is in-progress | Session continues; `template_id` is kept for reference |
| User deleted | `ON DELETE CASCADE` on sessions, templates, custom exercises |
| Template exercise reorder collision | `UNIQUE(template_id, order_index)` + atomic batch UPDATE in transaction |
| Two tabs start a session simultaneously | `EXCLUDE` constraint on `workout_sessions` raises conflict; API returns 409 |
