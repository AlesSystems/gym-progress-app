# Feature 2: Exercise Library — Implementation Guide

## Overview

Feature 2 introduces a full exercise library to the Gym Progress App. It ships with **68 pre-seeded system exercises** spanning all major muscle groups and allows authenticated users to create, edit, and delete their own custom exercises.

---

## What Was Built

### Database

| Change | Detail |
|---|---|
| Migration | `20260222174500_expand_exercise_model` |
| New columns on `Exercise` | `slug`, `type`, `movementCategory`, `primaryMuscle`, `secondaryMuscles`, `defaultUnit`, `defaultReps`, `defaultWeight`, `demoImageUrl`, `demoVideoUrl`, `isSystemExercise`, `isDeleted`, `updatedAt`, `createdBy` |
| Removed columns | `category`, `muscleGroups`, `isCustom`, `createdById` |
| New relation | `Exercise.creator → User` (named `ExerciseCreator`) |
| New relation on User | `User.exercises` |

### Seed Script

File: `prisma/seed.ts`

Run with:
```bash
npx prisma db seed
```

Seeds **68 system exercises** across:
- Chest (8 exercises)
- Back (11 exercises)
- Shoulders (8 exercises)
- Biceps (6 exercises)
- Triceps (5 exercises)
- Legs (11 exercises)
- Core (7 exercises)
- Compound/Functional (3 exercises)
- Calisthenics/Cardio (6 exercises + 3 shared)

System exercises have `isSystemExercise = true` and `createdBy = NULL`. They cannot be edited or deleted through the API.

---

## API Endpoints

### `GET /api/exercises`

Returns all system exercises + the authenticated user's own custom exercises.

**Query parameters:**

| Param | Type | Example |
|---|---|---|
| `search` | string | `?search=bench` |
| `type` | `compound` \| `isolation` | `?type=compound` |
| `category` | `push\|pull\|legs\|core\|cardio\|other` | `?category=legs` |
| `muscle` | string | `?muscle=Quadriceps` |
| `source` | `system` \| `custom` | `?source=custom` |
| `page` | integer | `?page=1` |
| `limit` | integer (max 100) | `?limit=20` |

**Response:**
```json
{
  "success": true,
  "data": {
    "exercises": [ ...ExerciseObject[] ],
    "pagination": { "page": 1, "limit": 20, "total": 68, "totalPages": 4 }
  }
}
```

### `GET /api/exercises/:id`

Accepts either a cuid `id` or a `slug`. Returns 403 if requesting another user's custom exercise.

### `POST /api/exercises`

Create a custom exercise.

**Required fields:** `name`, `type`, `movementCategory`, `primaryMuscle`, `secondaryMuscles`

**Optional fields:** `defaultUnit`, `defaultReps`, `defaultWeight`, `demoImageUrl`, `demoVideoUrl`, `description`

Returns 409 if name conflicts with a system exercise or another exercise owned by the user.

### `PUT /api/exercises/:id`

Update a custom exercise. Returns 403 for system exercises or exercises owned by someone else.

### `DELETE /api/exercises/:id`

Soft-deletes a custom exercise (`isDeleted = true`). Returns 403 for system exercises.

---

## Frontend Pages

| Route | Description |
|---|---|
| `/exercises` | Browsable library with search, type/category/source filters, pagination |
| `/exercises/:slug` | Detail page — name, badges, muscles, defaults, description, media |
| `/exercises/new` | Create custom exercise form |
| `/exercises/:slug/edit` | Edit custom exercise (owner only) |

---

## Components

All components live in `src/components/exercise/`.

| Component | Purpose |
|---|---|
| `ExerciseCard` | Grid card with name, type/category badges, muscle tags |
| `ExerciseBadge` | Type + movement category pill badges with colour coding |
| `MuscleTagList` | Primary muscle (indigo pill) + secondary muscles (outlined pills) |
| `ExerciseFilters` | Search input + Type/Category/Source dropdowns (updates URL params) |
| `ExerciseForm` | Shared create/edit form with all fields and validation |
| `DemoMediaPreview` | Image preview + YouTube embed or external link |
| `DeleteButton` | Confirm-before-delete button for custom exercises |

---

## Validation

File: `src/lib/validations/exercise.ts`

```typescript
createExerciseSchema  // used for POST
updateExerciseSchema  // partial of create, used for PUT
```

Enums exported: `EXERCISE_TYPES`, `MOVEMENT_CATEGORIES`, `WEIGHT_UNITS`

---

## Security Rules

| Action | Rule |
|---|---|
| List exercises | Authenticated — sees system + own custom |
| View exercise detail | Authenticated — system or own custom |
| Create custom exercise | Any authenticated user |
| Edit custom exercise | Owner only (403 otherwise) |
| Delete custom exercise | Owner only — soft delete (403 for system) |
| Edit/Delete system exercise | Always 403 |

---

## Profile Page: Logout Button

A **Sign Out** section was added at the bottom of `/profile`. It uses the `LogoutButton` client component (`src/components/profile/LogoutButton.tsx`) which calls `signOut({ callbackUrl: "/login" })` from NextAuth.

---

## Breaking Changes from Feature 1

The `Exercise` model columns were renamed/replaced:

| Old column | New column |
|---|---|
| `category` | `movementCategory` |
| `muscleGroups` (String[]) | `primaryMuscle` (String) + `secondaryMuscles` (Json) |
| `isCustom` | `isSystemExercise` (inverted logic) |
| `createdById` | `createdBy` (with Prisma relation) |

All internal references to `category` were updated in:
- `src/app/profile/page.tsx`
- `src/app/api/profile/max-lifts/route.ts`
- `src/app/api/profile/max-lifts/[exerciseId]/route.ts`
- `src/components/profile/MaxLiftsList.tsx`
- `src/types/index.ts`

---

## Re-seeding

The seed script is idempotent — re-running it skips exercises that already exist (matched by `slug + isSystemExercise`).

To reset and re-seed:
```bash
# reset exercises table (dev only)
npx prisma migrate reset

# or just re-seed
npx prisma db seed
```
