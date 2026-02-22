# Gym Progress App (Workout Planner)

A full-stack web app for tracking gym workouts, building templates, logging sessions, and visualizing progress. Users can create accounts (email/password or magic link), join via invite codes, manage an exercise library, build and share workout templates, log live sessions with rest timers, and view history and progress charts.

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| **1** | **User Accounts & Onboarding** | Email/password and magic-link auth, invite codes, user profiles, unit preference (kg/lb), auto-calculated max lifts. |
| **2** | **Exercise Library** | Pre-seeded system exercises + custom exercises per user; search/filter by type, category, muscle; demo image/video URLs. |
| **3** | **Workout Builder** | Drag-and-drop template editor; add exercises from library; configure sets/reps/rest/tempo; save, clone, and edit templates. |
| **4** | **Workout Session Logging** | Start from template or freestyle; log sets (weight, reps, RPE, notes); rest timer; auto-save completed sessions; PR detection. |
| **5** | **History & Progress** | Per-exercise history list; weight/reps/volume charts over time; time-range filters; link to session details. |
| **6** | **Calendar & Scheduling** | Monthly/weekly calendar; planned vs completed sessions; schedule future workouts; day detail with “Start Workout”. |
| **7** | **Data Export & Backup** | CSV export of session history; full JSON backup; JSON import/restore (merge strategy). |
| **8** | **Privacy & Sharing** | Private by default; share templates with “friends” (invite graph); clone shared templates; read-only friends list. |

Detailed specs, API endpoints, and data models for each feature are in the **[`plan/`](plan/)** folder.

---

## Tech Stack

- **Frontend:** React 19, Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Hook Form + Zod, Zustand, Recharts
- **Backend:** Next.js API Routes, NextAuth.js, Prisma ORM
- **Database:** PostgreSQL 15+
- **Email:** Resend
- **Deployment:** Vercel-ready (see [architecture](plan/architecture/architecture-overview.md) for alternatives)

---

## Project Structure

```
gym-progress-app/
├── project/                 # Next.js app (run commands here)
│   ├── src/app/             # App Router, (auth), (dashboard), api
│   ├── src/components/      # ui, auth, profile, workout, shared
│   ├── src/lib/             # db, auth, email, utils, validations
│   ├── prisma/              # schema, migrations, seed
│   └── package.json
├── plan/                    # Specs and architecture
│   ├── architecture/        # Overview, database schemas
│   └── features/            # 01–08 feature docs
├── guide/                   # Setup and migration guides
└── README.md
```

---

## Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+** (local or cloud: [Supabase](https://supabase.com), [Neon](https://neon.tech))
- **npm**

---

## Quick Start

1. **Clone and enter the app**
   ```bash
   git clone <repo-url>
   cd gym-progress-app/project
   ```

2. **Environment**
   - Copy `project/.env.example` to `project/.env`
   - Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and optionally `RESEND_API_KEY` / `EMAIL_FROM` for emails  
   - Generate secrets: `openssl rand -base64 32` (or PowerShell equivalent)

3. **Install and database**
   ```bash
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   ```
   Optional: `npx prisma db seed` to seed system exercises (when seed is configured).

4. **Run**
   ```bash
   npm run dev
   ```
   App: **http://localhost:3000**

Full setup (PostgreSQL options, Resend, troubleshooting): **[guide/01-setup-and-migration.md](guide/01-setup-and-migration.md)**.

---

## Key Routes

| Path | Description |
|------|-------------|
| `/signup` | Create account (email/password or magic link) |
| `/login` | Sign in |
| `/auth/verify` | Magic link verification |
| `/profile` | User profile (protected) |
| `/join/:code` | Invite landing |
| `/exercises` | Exercise library |
| `/workouts` | Templates & sessions (per plan) |

API routes for auth, invites, profile, exercises, workouts, calendar, export, etc. are defined in the [plan](plan/) feature docs and in the [setup guide](guide/01-setup-and-migration.md).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma Studio (DB UI) |

---

## Plan & Documentation

- **[plan/architecture/architecture-overview.md](plan/architecture/architecture-overview.md)** — System architecture, API design, security, scaling, CI/CD
- **[plan/architecture/database-schema.md](plan/architecture/database-schema.md)** — User, auth, invites schema
- **[plan/architecture/database-schema-exercises-workouts.md](plan/architecture/database-schema-exercises-workouts.md)** — Exercises, templates, sessions
- **[plan/architecture/database-schema-calendar-sharing.md](plan/architecture/database-schema-calendar-sharing.md)** — Calendar and sharing
- **Features:** [plan/features/](plan/features/) — `01-user-accounts-onboarding.md` through `08-privacy-sharing.md`
- **Setup:** [guide/01-setup-and-migration.md](guide/01-setup-and-migration.md)

---

## License

Private / internal use unless otherwise specified.
