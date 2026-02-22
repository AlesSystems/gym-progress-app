# Feature 3: Workout Builder (Plans & Templates)

## Overview
A drag-and-drop workout template editor that lets users compose named workout plans from the exercise library, configure per-exercise sets / reps / rest / tempo, save them for reuse, and clone or modify them at any time.

---

## Feature Breakdown

### 3.1 Template Creation
**User Stories:**
- As a user, I want to create a named workout template (e.g. "Push Day A") so I can reuse it every session.
- As a user, I want to add exercises from the library to a template so I don't have to type them each time.
- As a user, I want to configure sets, reps, rest time, and tempo notes per exercise so the plan is fully specified.
- As a user, I want to reorder exercises via drag-and-drop so I can adjust the exercise sequence easily.

**Technical Requirements:**
- Template belongs to a user (`user_id`). No sharing in MVP.
- Each template has an ordered list of `template_exercises`, stored with an `order_index` integer.
- Per-exercise configuration: `sets`, `reps` (integer or range string e.g. "8-12"), `target_weight`, `target_weight_unit`, `rest_seconds`, `tempo_notes`, `notes`.
- Drag-and-drop reordering updates `order_index` for all affected rows atomically.
- Max 30 exercises per template (enforced server-side).

### 3.2 Save, Clone & Edit
**User Stories:**
- As a user, I want to save a template so it persists for future sessions.
- As a user, I want to clone an existing template so I can create variations (e.g. "Push Day B") without starting from scratch.
- As a user, I want to edit any saved template without affecting past workout sessions that used it.

**Technical Requirements:**
- Templates are versioned via `updated_at`; historical sessions store a snapshot (denormalized exercise data) so editing a template does not alter logged history.
- Clone creates a full deep copy: new `workout_templates` row + all `workout_template_exercises` rows, with `cloned_from` FK set on the new template.
- Soft-delete (archived) instead of hard-delete so session history references remain valid.

### 3.3 Quick-Add from Library
**User Stories:**
- As a user, I want to search and add exercises from the library directly inside the template editor so I don't have to leave the page.

**Technical Requirements:**
- Inline search panel (slide-out drawer or modal) connected to the Exercise Library API.
- Adding an exercise appends it at the end of the template with default values pre-filled from the exercise's `default_reps`, `default_weight`, `default_unit`.
- Supports adding the same exercise multiple times (e.g. two squat variations at different intensities).

---

## Data Models

### WorkoutTemplate Entity
```
WorkoutTemplate {
  id:          UUID   (primary key)
  userId:      UUID   -> User.id
  name:        string (max 100 chars)
  description: string NULL (max 500 chars)
  isArchived:  boolean (default false)
  clonedFrom:  UUID   NULL -> WorkoutTemplate.id
  createdAt:   timestamp
  updatedAt:   timestamp
}
```

### WorkoutTemplateExercise Entity
```
WorkoutTemplateExercise {
  id:               UUID    (primary key)
  templateId:       UUID    -> WorkoutTemplate.id
  exerciseId:       UUID    -> Exercise.id
  orderIndex:       integer (0-based, unique within template)
  sets:             integer (min 1, max 20)
  reps:             string  (e.g. "5", "8-12", "AMRAP") max 10 chars
  targetWeight:     decimal(6,2) NULL
  targetWeightUnit: enum    ('kg', 'lb') NULL
  restSeconds:      integer NULL (0 = no rest prescribed)
  tempoNotes:       string  NULL (e.g. "3-1-2-0" = eccentric-pause-concentric-top)
  notes:            text    NULL
  createdAt:        timestamp
  updatedAt:        timestamp

  UNIQUE (templateId, orderIndex)
}
```

---

## API Endpoints

### Templates
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/templates` | Required | List user's templates. Supports `?archived=true` |
| `GET` | `/api/templates/:id` | Required | Get template with all exercises |
| `POST` | `/api/templates` | Required | Create a new template |
| `PUT` | `/api/templates/:id` | Required | Update template metadata (name, description) |
| `DELETE` | `/api/templates/:id` | Required | Soft-archive a template |
| `POST` | `/api/templates/:id/clone` | Required | Clone template (deep copy) |

### Template Exercises
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/templates/:id/exercises` | Required | Add exercise to template |
| `PUT` | `/api/templates/:id/exercises/:exId` | Required | Update exercise config (sets, reps, rest, etc.) |
| `DELETE` | `/api/templates/:id/exercises/:exId` | Required | Remove exercise from template |
| `PUT` | `/api/templates/:id/exercises/reorder` | Required | Batch reorder — accepts `[{ id, orderIndex }]` array |

### Response Shape

**WorkoutTemplate (summary):**
```json
{
  "id": "uuid",
  "name": "Push Day A",
  "description": "Chest + shoulders focus",
  "exerciseCount": 5,
  "isArchived": false,
  "clonedFrom": null,
  "createdAt": "2026-02-22T10:00:00Z",
  "updatedAt": "2026-02-22T10:00:00Z"
}
```

**WorkoutTemplate (detail — includes exercises):**
```json
{
  "id": "uuid",
  "name": "Push Day A",
  "description": "Chest + shoulders focus",
  "isArchived": false,
  "clonedFrom": null,
  "exercises": [
    {
      "id": "uuid",
      "orderIndex": 0,
      "exercise": {
        "id": "uuid",
        "name": "Bench Press",
        "type": "compound",
        "movementCategory": "push",
        "primaryMuscle": "Chest"
      },
      "sets": 4,
      "reps": "6-8",
      "targetWeight": 80,
      "targetWeightUnit": "kg",
      "restSeconds": 180,
      "tempoNotes": "3-0-1-0",
      "notes": "Touch chest, full ROM"
    }
  ],
  "createdAt": "2026-02-22T10:00:00Z",
  "updatedAt": "2026-02-22T10:00:00Z"
}
```

---

## Frontend Pages / Components

### Pages
1. **Template List** (`/templates`)
   - Cards for each template: name, exercise count, last updated
   - Toggle: Active / Archived
   - Button: "New Template"
   - Context menu on card: Edit, Clone, Archive

2. **Template Editor** (`/templates/new`, `/templates/:id/edit`)
   - Template name + description fields at top
   - Ordered exercise list (drag handles on left)
   - Each exercise row: name, sets × reps, weight, rest, tempo, notes — inline editable
   - "Add Exercise" button → opens exercise search drawer
   - Save / Discard buttons
   - "Start Session" shortcut button (navigates to session logger pre-loaded with this template)

3. **Exercise Search Drawer** (slide-out panel within editor)
   - Debounced search input
   - Filter by type / category
   - Click or "+" to add to current template

### Components
- `TemplateCard` — summary card with metadata
- `TemplateEditor` — full page form container
- `ExerciseRow` — single draggable row in editor (inline editable fields)
- `DragHandle` — grip icon for reorder affordance
- `ExerciseSearchDrawer` — slide-out panel with library search
- `RepSchemeInput` — text input that accepts "5", "8-12", "AMRAP" patterns
- `TempoInput` — 4-segment input for tempo notation
- `RestTimePicker` — select or stepper for rest seconds (pre-sets: 60, 90, 120, 180, 240 s)
- `CloneConfirmModal` — confirm clone action with name suggestion

---

## Drag-and-Drop Implementation Notes

- Use `@dnd-kit/core` + `@dnd-kit/sortable` (accessible, touch-friendly).
- Optimistic UI update on drop: reorder local state immediately, then `PUT /reorder` in background.
- On API error, rollback local state and show toast notification.
- Persist `order_index` as sequential integers (0, 1, 2 …); re-number all rows on each reorder to avoid gaps.

---

## Validation Rules (Zod)

```typescript
const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const AddTemplateExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.number().int().min(1).max(20),
  reps: z.string().max(10),                      // "5", "8-12", "AMRAP"
  targetWeight: z.number().min(0).max(9999).optional(),
  targetWeightUnit: z.enum(['kg', 'lb']).optional(),
  restSeconds: z.number().int().min(0).max(600).optional(),
  tempoNotes: z.string().max(20).optional(),       // "3-1-2-0"
  notes: z.string().max(500).optional(),
});

const ReorderExercisesSchema = z.array(
  z.object({ id: z.string().uuid(), orderIndex: z.number().int().min(0) })
).max(30);
```

---

## Security & Authorization

| Action | Rule |
|---|---|
| List / read templates | Owner only |
| Create template | Any authenticated user |
| Edit / delete template | Owner only — enforced server-side |
| Clone any template | Owner clones their own only (MVP) |
| Add / reorder / remove exercises | Owner of template only |

---

## Testing Strategy

### Unit Tests
- Reorder algorithm: given a moved item, produces correct sequential indices for all siblings
- Rep scheme parser / validator (accept "5", "8-12", "AMRAP"; reject "abc")
- Clone deep-copy: new IDs generated, `cloned_from` set, all exercises duplicated

### Integration Tests
- `POST /api/templates` — creates template, returns correct shape
- `POST /api/templates/:id/exercises` — appends at correct `order_index`
- `PUT /api/templates/:id/exercises/reorder` — all rows updated atomically
- `DELETE /api/templates/:id` — soft-archive, still retrievable with `?archived=true`
- `POST /api/templates/:id/clone` — produces independent copy, edit does not affect original

### E2E Tests
- User creates template, adds 3 exercises, reorders via drag-and-drop, saves
- User clones template, renames clone, verifies original unchanged
- User archives template, confirms it disappears from active list

---

## Implementation Phases

### Phase 1: Template CRUD (Week 2)
- Database migrations: `workout_templates`, `workout_template_exercises`
- `GET`, `POST`, `PUT`, `DELETE` `/api/templates`
- Template list page

### Phase 2: Exercise Management (Week 2–3)
- Add / remove / update exercise endpoints
- Template editor page with static list (no drag yet)
- Exercise search drawer wired to exercise library API

### Phase 3: Drag-and-Drop & Reorder (Week 3)
- Integrate `@dnd-kit/sortable`
- Reorder endpoint + optimistic UI
- Inline editing for sets / reps / rest / tempo

### Phase 4: Clone & Polish (Week 3)
- Clone endpoint + confirm modal
- Archive / restore flow
- "Start Session" button linking to session logger

---

## Success Metrics
- Template creation (5 exercises) completed in < 2 minutes
- Drag-and-drop reorder feels instant (optimistic UI, < 50 ms visual feedback)
- Clone operation completes in < 500 ms
- Template editor page load < 400 ms

---

## Future Enhancements (Post-MVP)
- Public / shareable template links
- Template categories / tags (e.g. "PPL", "5/3/1", "Hypertrophy")
- Progressive overload suggestions (auto-increment target weight)
- Template scheduling (assign to days of the week)
- Volume / tonnage summary per template (total sets, estimated time)
- Super-set and circuit grouping
- Coach-assigned templates (team feature)
