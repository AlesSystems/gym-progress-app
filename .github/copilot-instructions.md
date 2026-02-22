# Copilot Instructions — Gym Progress App

## Repository Layout

This is a monorepo. The runnable Next.js app lives in `project/`. All `npm` commands must be run from inside `project/`.

```
gym-progress-app/
├── project/        ← Next.js app (run commands here)
├── plan/           ← Feature specs and architecture docs (reference only)
├── guide/          ← Setup and migration guides
└── logs/           ← Error log / known bugs
```

## Commands (run from `project/`)

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run seed         # Seed system exercises via ts-node
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma studio    # Open DB browser UI
```

There is no test runner configured yet (`tests/` directory exists but is empty).

## Architecture

### Request flow

Browser → Next.js App Router → `src/app/api/**` route handlers → Prisma (`db`) → PostgreSQL

- **Auth** is NextAuth.js v4 with `strategy: "jwt"` and a `CredentialsProvider` that handles both email/password and magic-token flows in one `authorize` callback.
- **Middleware** (`src/middleware.ts`) protects `/profile`, `/workouts`, and `/team` via `withAuth`.
- **Route groups**: `(auth)` for public auth pages, `(dashboard)` for protected app pages.

### Key modules

| Path | Purpose |
|------|---------|
| `src/lib/db/index.ts` | Prisma singleton using `PrismaPg` adapter from `@prisma/adapter-pg` |
| `src/lib/auth/index.ts` | `authOptions` — imported in every API route that checks session |
| `src/lib/utils.ts` | `generateApiResponse()` — used in every API route for response shape; `cn()` for Tailwind class merging |
| `src/lib/validations/` | Zod schemas per domain: `auth.ts`, `exercise.ts`, `profile.ts`, `workout.ts` |
| `src/store/auth.ts` | Zustand store (currently only loading state) |
| `src/components/ui/` | shadcn/ui components (new-york style, neutral base, lucide icons) |

## Key Conventions

### API response shape
Every route handler returns JSON via `generateApiResponse()`:
```ts
{ success: boolean, data?: T, message?: string, error?: { code, message, details? }, timestamp: string }
```
Always use `generateApiResponse` — never return raw `{ error: "..." }` shapes.

### Session user id
NextAuth doesn't include `id` on `session.user` by default. Cast it everywhere it's needed:
```ts
const userId = (session.user as { id: string }).id;
```

### Prisma client
Import as `import { db } from "@/lib/db"` — never instantiate `PrismaClient` directly.
The adapter is `PrismaPg` (not default prisma-client). After any `schema.prisma` change, run `npx prisma generate`.

### IDs
The actual schema uses `cuid()` (not UUID). The plan docs mention UUID — the Prisma schema is the source of truth.

### Soft deletes on exercises
`Exercise` has `isDeleted: boolean`. Always filter with `isDeleted: false` in queries. Never hard-delete exercises.

### Exercise visibility
Exercises are either system (`isSystemExercise: true`) or user-owned (`createdBy: userId`). Queries must restrict to:
```ts
OR: [{ isSystemExercise: true }, { createdBy: userId }]
```

### Validation pattern
Use Zod `safeParse` in route handlers. Return `422` with `result.error.flatten()` in the `error.details` field on failure.

### Path alias
`@/*` maps to `src/*` (configured in `tsconfig.json`).

### shadcn/ui
Use the CLI to add components: `npx shadcn add <component>`. Style: new-york, neutral base color, CSS variables enabled.

## Environment Variables

Required in `project/.env`:
```
DATABASE_URL=         # PostgreSQL connection string
NEXTAUTH_SECRET=      # Generate: openssl rand -base64 32
NEXTAUTH_URL=         # e.g. http://localhost:3000
RESEND_API_KEY=       # For magic link / transactional emails
EMAIL_FROM=           # Sender address for emails
```

## Feature Specs

Detailed API endpoint definitions, data models, and UI flows for all 8 features are in `plan/features/`. The database schemas are in `plan/architecture/`. When implementing a new feature, check the relevant spec first.

Known bugs are tracked in `logs/error.md`.
