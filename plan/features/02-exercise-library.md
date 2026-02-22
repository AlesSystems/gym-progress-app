# Feature 2: Exercise Library

## Overview
A centralized, searchable library of exercises that ships with a curated set of pre-seeded movements and allows each user to extend it with their own custom exercises. Every exercise carries rich metadata so the rest of the app (workout builder, session logger, progress charts) can consume it consistently.

---

## Feature Breakdown

### 2.1 Pre-Seeded System Exercises
**User Stories:**
- As a user, I want a ready-made list of common exercises so I can start building workouts immediately without manual setup.
- As a user, I want each exercise to show which muscles it targets so I can make informed programming decisions.

**Technical Requirements:**
- Seed script (`prisma/seed.ts`) inserts all system exercises on first deploy.
- System exercises have `is_system_exercise = true` and `created_by = NULL`.
- System exercises are read-only for all users (cannot be edited or deleted via API).
- Minimum seed set (expandable):

| Name | Type | Movement Category | Primary Muscle |
|---|---|---|---|
| Squat | Compound | Legs | Quadriceps |
| Bench Press | Compound | Push | Chest |
| Deadlift | Compound | Pull | Back |
| Overhead Press | Compound | Push | Shoulders |
| Pull-up | Compound | Pull | Lats |
| Barbell Row | Compound | Pull | Back |
| Romanian Deadlift | Compound | Legs | Hamstrings |
| Dumbbell Curl | Isolation | Pull | Biceps |
| Tricep Pushdown | Isolation | Push | Triceps |
| Leg Press | Compound | Legs | Quadriceps |
| Lat Pulldown | Compound | Pull | Lats |
| Cable Fly | Isolation | Push | Chest |
| Face Pull | Isolation | Pull | Rear Deltoids |
| Hip Thrust | Compound | Legs | Glutes |
| Plank | Isolation | Core | Abs |

### 2.2 Custom Exercises
**User Stories:**
- As a user, I want to create a custom exercise with a name, type, and primary muscle so I can track movements not in the default library.
- As a user, I want to set default reps and a default weight for my custom exercise to speed up logging.
- As a user, I want to add a demo image or video URL to a custom exercise for technique reference.
- As a user, I want to see my custom exercises separately from system exercises so the library stays organized.

**Technical Requirements:**
- Custom exercises are scoped to the creating user (`created_by = user_id`, `is_system_exercise = false`).
- All fields except `name` and `type` are optional at creation.
- Custom exercises can be edited and soft-deleted by their owner.
- Custom exercises are only visible to the owner (private by default).
- Name uniqueness enforced per-user scope: a user cannot have two exercises with the same name; system names are also reserved.

### 2.3 Exercise Metadata
**User Stories:**
- As a user, I want each exercise to have a default unit (kg/lb) so it pre-fills correctly during logging.
- As a user, I want to see the movement category (push/pull/legs/core/cardio) for filtering.
- As a user, I want to attach an optional demo image or video link to any exercise.

**Technical Requirements:**
- `movement_category`: ENUM — `push`, `pull`, `legs`, `core`, `cardio`, `other`.
- `type`: ENUM — `compound`, `isolation`.
- `default_unit`: ENUM — `kg`, `lb` (falls back to user's `unit_preference` if NULL).
- `default_reps`: optional integer for pre-filling reps field in session logger.
- `default_weight`: optional decimal for pre-filling weight field in session logger.
- `demo_image_url`: TEXT NULL — external URL or uploaded path.
- `demo_video_url`: TEXT NULL — YouTube / external URL.
- `primary_muscle`: VARCHAR(50) — single primary muscle group.
- `secondary_muscles`: JSON — array of secondary muscle strings.
- `description`: TEXT NULL — freeform coaching notes.

---

## Data Models

### Exercise Entity (expanded from v1 stub)
```
Exercise {
  id:                UUID   (primary key)
  name:              string (unique within user scope)
  slug:              string (unique, auto-generated from name)
  type:              enum   ('compound', 'isolation')
  movementCategory:  enum   ('push', 'pull', 'legs', 'core', 'cardio', 'other')
  primaryMuscle:     string
  secondaryMuscles:  JSON   (string[])
  defaultUnit:       enum   ('kg', 'lb') NULL
  defaultReps:       int    NULL
  defaultWeight:     decimal(6,2) NULL
  demoImageUrl:      text   NULL
  demoVideoUrl:      text   NULL
  description:       text   NULL
  isSystemExercise:  boolean (default true)
  isDeleted:         boolean (default false, soft-delete for custom exercises)
  createdBy:         UUID   NULL -> User.id
  createdAt:         timestamp
  updatedAt:         timestamp
}
```

---

## API Endpoints

### Exercise Library
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/exercises` | Required | List all visible exercises (system + own custom). Supports `?search=`, `?type=`, `?category=`, `?muscle=` |
| `GET` | `/api/exercises/:id` | Required | Get single exercise detail |
| `POST` | `/api/exercises` | Required | Create a custom exercise |
| `PUT` | `/api/exercises/:id` | Required | Update a custom exercise (own only) |
| `DELETE` | `/api/exercises/:id` | Required | Soft-delete a custom exercise (own only) |

### Query Parameters for `GET /api/exercises`
| Param | Type | Example |
|---|---|---|
| `search` | string | `?search=bench` |
| `type` | `compound` \| `isolation` | `?type=compound` |
| `category` | `push\|pull\|legs\|core\|cardio\|other` | `?category=legs` |
| `muscle` | string | `?muscle=Quadriceps` |
| `source` | `system` \| `custom` | `?source=custom` |
| `page` | integer | `?page=1` |
| `limit` | integer (max 100) | `?limit=20` |

### Response Shape

**Exercise object:**
```json
{
  "id": "uuid",
  "name": "Squat",
  "slug": "squat",
  "type": "compound",
  "movementCategory": "legs",
  "primaryMuscle": "Quadriceps",
  "secondaryMuscles": ["Glutes", "Hamstrings", "Core"],
  "defaultUnit": "kg",
  "defaultReps": 5,
  "defaultWeight": null,
  "demoImageUrl": null,
  "demoVideoUrl": "https://youtube.com/...",
  "description": "The king of lower-body exercises.",
  "isSystemExercise": true,
  "createdAt": "2026-02-22T00:00:00Z",
  "updatedAt": "2026-02-22T00:00:00Z"
}
```

---

## Frontend Pages / Components

### Pages
1. **Exercise Library** (`/exercises`)
   - Search bar with debounced input
   - Filter pills: Type, Category, Muscle, Source (System / Custom)
   - Grid or list of exercise cards
   - FAB / button: "Add Custom Exercise"

2. **Exercise Detail** (`/exercises/:slug`)
   - Name, type badge, category badge
   - Primary + secondary muscle diagram or tag list
   - Demo image (if set)
   - Embedded or linked demo video (if set)
   - Default reps / weight / unit
   - Description / coaching notes
   - Edit / Delete buttons (own custom exercises only)

3. **Create / Edit Custom Exercise** (`/exercises/new`, `/exercises/:id/edit`)
   - Name (required)
   - Type radio: Compound / Isolation
   - Movement Category select
   - Primary Muscle input (autocomplete from known muscles)
   - Secondary Muscles multi-select
   - Default Unit toggle (kg / lb)
   - Default Reps number input
   - Default Weight number input
   - Demo Image URL text field
   - Demo Video URL text field
   - Description textarea

### Components
- `ExerciseCard` — thumbnail card with name, type badge, muscle tag
- `ExerciseFilters` — filter bar (search + dropdowns)
- `ExerciseList` / `ExerciseGrid` — responsive layout wrapper
- `ExerciseBadge` — small compound/isolation + category pill
- `MuscleTagList` — primary + secondary muscle chips
- `ExerciseForm` — create/edit form with validation
- `DemoMediaPreview` — image or embedded video preview

---

## Validation Rules (Zod)

```typescript
const CreateExerciseSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['compound', 'isolation']),
  movementCategory: z.enum(['push', 'pull', 'legs', 'core', 'cardio', 'other']),
  primaryMuscle: z.string().min(2).max(50),
  secondaryMuscles: z.array(z.string().max(50)).max(10).optional(),
  defaultUnit: z.enum(['kg', 'lb']).optional(),
  defaultReps: z.number().int().min(1).max(100).optional(),
  defaultWeight: z.number().min(0).max(9999).optional(),
  demoImageUrl: z.string().url().optional().or(z.literal('')),
  demoVideoUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
});
```

---

## Security & Authorization

| Action | Rule |
|---|---|
| Read system exercises | Any authenticated user |
| Read own custom exercises | Owner only |
| Create custom exercise | Any authenticated user |
| Edit custom exercise | Owner only — enforced server-side |
| Delete custom exercise | Owner only — soft-delete, not hard-delete |
| Edit/delete system exercise | Blocked at API layer (403) |

---

## Testing Strategy

### Unit Tests
- Slug generation from exercise name (handles special chars, duplicates)
- Validation schema — required fields, URL format, numeric bounds
- Ownership check helper

### Integration Tests
- `GET /api/exercises` — returns system + own custom, excludes other users' custom
- `POST /api/exercises` — creates exercise, confirms ownership
- `PUT /api/exercises/:id` — rejects update on system or other-user exercise
- `DELETE /api/exercises/:id` — soft-deletes, exercise no longer appears in list

### E2E Tests
- User creates custom exercise, finds it in library, uses it in workout builder
- Search and filter reduce exercise list correctly
- System exercise detail page renders without edit controls

---

## Implementation Phases

### Phase 1: Seed & Read (Week 1)
- Expand `exercises` table schema (add new columns)
- Write and run seed script with all pre-seeded exercises
- `GET /api/exercises` with search + filter query params
- `GET /api/exercises/:id` endpoint
- Exercise library page (list + search)

### Phase 2: Custom Exercises (Week 1–2)
- `POST /api/exercises` — create custom exercise
- `PUT` / `DELETE` endpoints with ownership guard
- Create / Edit exercise form page
- Ownership-aware UI (hide edit controls on system exercises)

### Phase 3: Media & Polish (Week 2)
- Demo image / video URL fields + preview component
- Muscle diagram or tag list on detail page
- Filter pills for category / muscle group
- Paginated infinite scroll or pagination on library list

---

## Success Metrics
- Exercise library page load < 500 ms (with 200+ exercises)
- Custom exercise creation < 30 seconds end-to-end
- Search returns results within 200 ms (debounced 300 ms input delay)
- 0% unauthorized access to other users' custom exercises

---

## Future Enhancements (Post-MVP)
- Admin-curated exercise database with approval queue for user submissions
- Muscle diagram SVG with highlighted groups
- Video hosting (upload rather than external URL)
- Exercise ratings / community notes
- Equipment tags (barbell, dumbbell, machine, bodyweight, cable)
- Favourite / bookmark system
- Exercise history shortcut ("last time you did Squat: 100 kg × 5")

---

## List of gym exercises

🏋️‍♂️ Exercise Library (Organized by Muscle Group)
Chest / Pecs

Bench Press (Flat, Incline, Decline — Barbell)

Dumbbell Chest Press (Flat, Incline, Decline)

Machine Chest Press (Seated/Incline/Decline)

Dumbbell Flyes

Cable Crossovers

Push-Ups (Standard, Wide, Diamond)

Chest Dips

Back

Pull-Ups & Chin-Ups

Lat Pulldown (Wide, Close, Neutral grip)

Barbell Bent-Over Row

Dumbbell Row (One-arm)

Seated Cable Row

T-Bar Row

Inverted Row

Machine Row

Deadlift (Conventional, Romanian, Sumo)

Shoulders / Delts

Overhead Press (Barbell / Dumbbell)

Arnold Press

Dumbbell Lateral Raises

Front Raises

Upright Row

Rear Delt Fly

Face Pulls

Arms
Biceps

Barbell Curl

Dumbbell Curl (Standing, Incline)

Hammer Curl

Cable Curl

Preacher Curl

Concentration Curl

Triceps

Tricep Dips

Close-Grip Bench Press

Skull Crushers

Tricep Pushdowns (Cable)

Overhead Tricep Extensions

Legs / Lower Body

Squats (Back, Front, Goblet)

Lunges (Walking, Reverse, Bulgarian Split)

Leg Press

Romanian Deadlift

Hamstring Leg Curl

Leg Extension

Calf Raise (Standing, Seated, Machine)

Hip Thrust / Glute Bridge

Step-Ups

Core / Abs

Crunches (Standard / Weighted)

Planks (Front, Side)

Leg Raises (Hanging / Lying)

Cable Woodchoppers

Russian Twists

Ab Wheel Rollout

Compound / Functional

These involve multiple muscle groups and often use kettlebells, barbells, or bodyweight:

Deadlift (all variations)

Squat (all variations)

Clean & Press

Turkish Get-Up

Kettlebell Swing

Calisthenics (Bodyweight)

Pull-Ups / Chin-Ups

Push-Ups (many variations)

Dips

Air Squats

Burpees

Box Jumps

Jumping Jacks

Rope Skipping