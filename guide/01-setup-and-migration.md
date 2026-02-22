# Setup & Migration Guide — Feature 1: User Accounts & Onboarding

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local or cloud)
- npm (comes with Node.js)

---

## 1. PostgreSQL Setup Options

### Option A: Local PostgreSQL

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create the database:
   ```sql
   psql -U postgres
   CREATE DATABASE gym_progress_db;
   \q
   ```

### Option B: Supabase (free cloud PostgreSQL)

1. Sign up at https://supabase.com
2. Create a new project
3. Go to **Settings → Database → Connection string (URI)**
4. Copy the connection string

### Option C: Neon (free serverless PostgreSQL)

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string from the dashboard

---

## 2. Configure Environment Variables

Copy `.env.example` to `.env` (already done) and fill in the values:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/gym_progress_db"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT (same or different from NEXTAUTH_SECRET)
JWT_SECRET="your-jwt-secret-here"

# Resend email service — sign up at https://resend.com (free: 3,000 emails/month)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"

# App URL
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Generate secrets

Run in your terminal:
```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## 3. Install Dependencies

```bash
cd project
npm install
```

---

## 4. Run Database Migration

```bash
# First time setup (creates all tables):
npx prisma migrate dev --name init-user-accounts

# Or if using a production database:
npx prisma migrate deploy
```

### What this creates:
- `User` — with auth fields, unit preference, invite code
- `Workout`, `Exercise`, `WorkoutExercise`, `ExerciseSet` — workout tracking
- `Team`, `TeamMember` — team/group system
- `VerificationToken` — email verification & password reset tokens
- `Invite` — invite code management
- `MagicLink` — passwordless login tokens
- `MaxLift` — personal records per exercise

---

## 5. Generate Prisma Client

```bash
npx prisma generate
```

> This is done automatically after `migrate dev`, but run manually if you update the schema without migrating.

---

## 6. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## 7. Key Routes

| Path | Description |
|------|-------------|
| `/signup` | Create account (email/password or magic link) |
| `/login` | Sign in |
| `/auth/verify` | Magic link verification landing |
| `/forgot-password` | Request password reset |
| `/reset-password?token=...` | Set new password |
| `/profile` | User profile (protected) |
| `/join/:code` | Invite landing page |
| `/api/auth/signup` | POST — create account |
| `/api/auth/me` | GET — current user info |
| `/api/auth/magic-link/request` | POST — request magic link |
| `/api/auth/magic-link/verify/:token` | GET — verify magic link |
| `/api/auth/password/reset-request` | POST — request password reset |
| `/api/auth/password/reset` | POST — reset password |
| `/api/auth/verify-email` | GET — verify email address |
| `/api/invites/generate` | POST — generate invite code |
| `/api/invites/validate/:code` | GET — check invite validity |
| `/api/invites/accept/:code` | POST — accept invite |
| `/api/invites/my-invites` | GET — list my invites |
| `/api/invites/my-tree` | GET — invite relationship tree |
| `/api/profile` | GET/PUT — profile |
| `/api/profile/max-lifts` | GET — all personal records |
| `/api/profile/max-lifts/:exerciseId` | GET — specific PR |

---

## 8. Email Service Setup (Resend)

1. Sign up at https://resend.com
2. Add and verify your domain (or use `onboarding@resend.dev` for testing)
3. Create an API key
4. Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env`

> **Dev tip**: During development, you can skip real emails — the app creates users and tokens regardless of email delivery success.

---

## 9. Troubleshooting

### "Can't reach database server"
- Ensure PostgreSQL is running: `pg_ctl status`
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/dbname`

### "Prisma Client is not generated"
```bash
npx prisma generate
```

### Schema changes not reflected
```bash
npx prisma migrate dev --name your-change-name
npx prisma generate
```

### View database in browser
```bash
npx prisma studio
```
