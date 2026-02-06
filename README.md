# Workout Planner (Gym Progress App)

A **personal iOS gym progress app** built with React Native. Offline-first, fast to use during workouts, with long-term progress visualization. Planning and architecture are maintained in AlesDocs.

**Full planning & architecture:** [AlesSystems/AlesDocs – projects-created/workout-planner](https://github.com/AlesSystems/AlesDocs/tree/main/projects-created/workout-planner)

---

## Vision & Purpose

- **Offline-first** – Works fully without internet.
- **Speed** – Minimal taps; set logging in seconds.
- **Focus** – Progress and PRs over social/vanity features.
- **Expandability** – Foundation for future AI, gamification, cloud.

**Non-goals (MVP):** Social features, accounts/auth, monetization, Android, nutrition, pre-built workout plans.

---

## Tech Stack

| Layer      | Technologies                                      |
|-----------|----------------------------------------------------|
| UI        | React Native, TypeScript, React Navigation        |
| State     | Zustand / React Context                           |
| Storage   | AsyncStorage (MVP) → SQLite when scaling           |
| Charts    | react-native-chart-kit or Victory Native           |
| Testing   | Jest, React Native Testing Library                |
| Quality   | ESLint, Prettier, TypeScript strict mode          |

---

## Architecture

**Pattern:** Feature-based structure with clear layer separation.

- **UI layer** – Screens, components, hooks. Dark mode first, one-handed UX, 44pt+ touch targets.
- **Domain layer** – Workout logic, PR detection, volume/trend calculations, analytics. Pure functions, immutable data.
- **Data layer** – Storage adapter (AsyncStorage/SQLite), models (Workout, Exercise, Set), serialization. Append-only workouts; stats derived on read.

**Source layout (target):**

```
src/
├── ui/          # screens/, components/, hooks/
├── domain/      # workout/, progress/, analytics/
├── data/        # storage/, models/
└── utils/
```

---

## Core Data Model

- **Workout** – `id`, `date`, `exercises[]`, `notes`, `isCompleted`, timestamps.
- **Exercise** – `id`, `workoutId`, `name`, `sets[]`, `order`.
- **Set** – `id`, `exerciseId`, `reps`, `weight`, `isWarmup`, optional `rpe`, `notes`, `order`.

PRs and stats (e.g. volume, trends) are **derived on demand**, not stored. JSON export/backup supported.

---

## Navigation & Main Flow

- **Tabs:** Dashboard → Start Workout | Workout (active) | History | Stats.
- **Dashboard:** Start Workout CTA, last workout summary, quick stats, recent PRs.
- **Workout:** Log exercises/sets, timer, add set (bottom sheet), finish workout. Auto-save ~30s.
- **History:** List + calendar; tap workout → detail; edit/delete/duplicate.
- **Stats:** Exercise selector, progress chart, time ranges (4w / 3mo / 1y / all), PRs and trends.

Fast path: Start → Add exercise → Log sets → Finish (minimal taps, no dead ends).

---

## MVP Features

- Create and log workouts; add exercises and sets (reps, weight).
- Auto-detect personal records; optional RPE and notes.
- Workout history (list + calendar); edit/delete past workouts.
- Exercise-specific progress charts; time-range filtering.
- Dark mode; JSON export; optional notes at workout/exercise/set level.

---

## Non-Functional Highlights

- **Performance:** Startup &lt; 1s, set logging &lt; 10s, 60 FPS scrolling (e.g. virtualized lists).
- **Reliability:** No data loss; auto-save; crash recovery (resume or discard incomplete workout).
- **Usability:** One-handed use, minimal taps, smart defaults (e.g. last weight/reps), dark mode for gym.
- **Privacy:** Local-only storage, no tracking, user-owned data.

---

## Documentation in AlesDocs

| Doc | Description |
|-----|-------------|
| [vision.md](https://github.com/AlesSystems/AlesDocs/blob/main/projects-created/workout-planner/docs/vision.md) | Vision, scope, personas, success metrics, design philosophy |
| [information.md](https://github.com/AlesSystems/AlesDocs/blob/main/projects-created/workout-planner/information.md) | High-level planning summary |
| [folder-structure.md](https://github.com/AlesSystems/AlesDocs/blob/main/projects-created/workout-planner/folder-structure.md) | Docs folder layout |
| [architecture/app-architecture.md](https://github.com/AlesSystems/AlesDocs/blob/main/projects-created/workout-planner/docs/architecture/app-architecture.md) | Layers, data flow, state, testing, tech stack |
| [architecture/data-model.md](https://github.com/AlesSystems/AlesDocs/blob/main/projects-created/workout-planner/docs/architecture/data-model.md) | Entities, validation, storage, migrations |
| [architecture/navigation.md](https://github.com/AlesSystems/AlesDocs/blob/main/projects-created/workout-planner/docs/architecture/navigation.md) | Tabs, screens, flows, gestures |
| [non-functional.md](https://github.com/AlesSystems/AlesDocs/blob/main/projects-created/workout-planner/docs/non-functional.md) | Performance, reliability, accessibility, privacy |
| [docs/features/](https://github.com/AlesSystems/AlesDocs/tree/main/projects-created/workout-planner/docs/features) | Workout logging, progress tracking, history |
| [docs/future.md](https://github.com/AlesSystems/AlesDocs/blob/main/projects-created/workout-planner/docs/future.md) | Post-MVP ideas |

---

## Getting Started

*(Add setup steps here once the repo has package.json and run instructions, e.g. `npm install`, `npx react-native run-ios`.)*
