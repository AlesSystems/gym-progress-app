# Database Schema - User Accounts & Onboarding

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                           USER                              │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│     email: VARCHAR(255) UNIQUE NOT NULL                     │
│     passwordHash: VARCHAR(255) NULL                         │
│     displayName: VARCHAR(100) NOT NULL                      │
│     unitPreference: ENUM('kg', 'lb') DEFAULT 'kg'           │
│     emailVerified: BOOLEAN DEFAULT false                    │
│     emailVerifiedAt: TIMESTAMP NULL                         │
│ FK  invitedBy: UUID NULL -> User.id                         │
│     inviteCode: VARCHAR(20) UNIQUE NOT NULL                 │
│     createdAt: TIMESTAMP DEFAULT NOW()                      │
│     updatedAt: TIMESTAMP DEFAULT NOW()                      │
│     lastLoginAt: TIMESTAMP NULL                             │
└───────────┬─────────────────────────────────────────────────┘
            │
            │ 1:N
            │
┌───────────▼─────────────────────────────────────────────────┐
│                        MAX_LIFT                             │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│ FK  userId: UUID NOT NULL -> User.id                        │
│ FK  exerciseId: UUID NOT NULL -> Exercise.id                │
│     weight: DECIMAL(6,2) NOT NULL                           │
│     unit: ENUM('kg', 'lb') NOT NULL                         │
│     reps: INTEGER DEFAULT 1                                 │
│     achievedAt: TIMESTAMP NOT NULL                          │
│ FK  workoutId: UUID NULL -> Workout.id                      │
│     createdAt: TIMESTAMP DEFAULT NOW()                      │
│     updatedAt: TIMESTAMP DEFAULT NOW()                      │
│ UNIQUE (userId, exerciseId)                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         INVITE                              │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│     code: VARCHAR(20) UNIQUE NOT NULL                       │
│ FK  createdBy: UUID NOT NULL -> User.id                     │
│ FK  usedBy: UUID NULL -> User.id                            │
│     expiresAt: TIMESTAMP NULL                               │
│     usedAt: TIMESTAMP NULL                                  │
│     maxUses: INTEGER NULL                                   │
│     currentUses: INTEGER DEFAULT 0                          │
│     createdAt: TIMESTAMP DEFAULT NOW()                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      MAGIC_LINK                             │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│     email: VARCHAR(255) NOT NULL                            │
│     token: VARCHAR(255) UNIQUE NOT NULL                     │
│     expiresAt: TIMESTAMP NOT NULL                           │
│     usedAt: TIMESTAMP NULL                                  │
│     ipAddress: VARCHAR(45) NULL                             │
│     userAgent: TEXT NULL                                    │
│     createdAt: TIMESTAMP DEFAULT NOW()                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     PASSWORD_RESET                          │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│ FK  userId: UUID NOT NULL -> User.id                        │
│     token: VARCHAR(255) UNIQUE NOT NULL                     │
│     expiresAt: TIMESTAMP NOT NULL                           │
│     usedAt: TIMESTAMP NULL                                  │
│     createdAt: TIMESTAMP DEFAULT NOW()                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        SESSION                              │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│ FK  userId: UUID NOT NULL -> User.id                        │
│     token: VARCHAR(255) UNIQUE NOT NULL                     │
│     expiresAt: TIMESTAMP NOT NULL                           │
│     ipAddress: VARCHAR(45) NULL                             │
│     userAgent: TEXT NULL                                    │
│     createdAt: TIMESTAMP DEFAULT NOW()                      │
│     lastActivityAt: TIMESTAMP DEFAULT NOW()                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       EXERCISE                              │
│                   (Reference table)                         │
├─────────────────────────────────────────────────────────────┤
│ PK  id: UUID                                                │
│     name: VARCHAR(100) UNIQUE NOT NULL                      │
│     category: VARCHAR(50) NOT NULL                          │
│     description: TEXT NULL                                  │
│     isCompound: BOOLEAN DEFAULT false                       │
│     muscleGroups: JSON NULL                                 │
│     createdAt: TIMESTAMP DEFAULT NOW()                      │
│     updatedAt: TIMESTAMP DEFAULT NOW()                      │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Schema Definitions

### User Table
Primary table for user accounts and authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  display_name VARCHAR(100) NOT NULL,
  unit_preference VARCHAR(10) DEFAULT 'kg' CHECK (unit_preference IN ('kg', 'lb')),
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_users_invited_by ON users(invited_by);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

**Notes:**
- `password_hash` is nullable to support magic link-only users
- `invite_code` is generated on user creation and used for referral system
- `invited_by` creates a self-referential relationship for tracking invite chains

### MaxLift Table
Stores personal records for each exercise per user.

```sql
CREATE TABLE max_lifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight DECIMAL(6,2) NOT NULL CHECK (weight > 0),
  unit VARCHAR(10) NOT NULL CHECK (unit IN ('kg', 'lb')),
  reps INTEGER DEFAULT 1 CHECK (reps > 0),
  achieved_at TIMESTAMP NOT NULL,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exercise_id)
);

-- Indexes
CREATE INDEX idx_max_lifts_user_id ON max_lifts(user_id);
CREATE INDEX idx_max_lifts_exercise_id ON max_lifts(exercise_id);
CREATE INDEX idx_max_lifts_achieved_at ON max_lifts(achieved_at DESC);
```

**Notes:**
- `UNIQUE(user_id, exercise_id)` ensures one max lift per exercise per user
- `workout_id` links to the workout where the max was achieved (nullable for manual entries)
- Weight is stored with 2 decimal precision (e.g., 100.50 kg)

### Invite Table
Manages invite codes and their usage tracking.

```sql
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP,
  used_at TIMESTAMP,
  max_uses INTEGER CHECK (max_uses > 0),
  current_uses INTEGER DEFAULT 0 CHECK (current_uses >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_invites_code ON invites(code);
CREATE INDEX idx_invites_created_by ON invites(created_by);
CREATE INDEX idx_invites_used_by ON invites(used_by);
CREATE INDEX idx_invites_expires_at ON invites(expires_at);
```

**Notes:**
- `max_uses` NULL means unlimited uses (for public team links)
- `used_by` is nullable as one invite can be used by multiple people
- Consider adding a separate `invite_uses` junction table for many-to-many tracking

### MagicLink Table
Temporary tokens for passwordless authentication.

```sql
CREATE TABLE magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_magic_links_email ON magic_links(email);
CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_expires_at ON magic_links(expires_at);

-- Cleanup old tokens (optional: run via cron)
-- DELETE FROM magic_links WHERE expires_at < NOW() - INTERVAL '7 days';
```

**Notes:**
- Tokens expire in 15 minutes (enforced in application logic)
- Single-use tokens (marked used via `used_at`)
- Store IP and user agent for security audit trail

### PasswordReset Table
Manages password reset token lifecycle.

```sql
CREATE TABLE password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);
```

**Notes:**
- Tokens expire in 1 hour
- Single-use tokens
- Old tokens should be cleaned up periodically

### Session Table
Tracks active user sessions for authentication.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Notes:**
- Alternative to JWT: server-side session management
- Can use Redis instead for faster lookups
- `last_activity_at` enables sliding expiration

### Exercise Table
Reference table for predefined exercises.

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_compound BOOLEAN DEFAULT false,
  muscle_groups JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_category ON exercises(category);
```

**Sample Data:**
```sql
INSERT INTO exercises (name, category, is_compound, muscle_groups) VALUES
('Bench Press', 'Chest', true, '["Chest", "Triceps", "Shoulders"]'),
('Squat', 'Legs', true, '["Quadriceps", "Glutes", "Hamstrings"]'),
('Deadlift', 'Back', true, '["Back", "Glutes", "Hamstrings", "Traps"]'),
('Overhead Press', 'Shoulders', true, '["Shoulders", "Triceps"]'),
('Barbell Row', 'Back', true, '["Back", "Biceps"]');
```

## Database Triggers

### Update Timestamps
Auto-update `updated_at` on row modification.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_max_lifts_updated_at BEFORE UPDATE ON max_lifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Generate Invite Code
Auto-generate unique invite code on user creation.

```sql
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := upper(substring(md5(random()::text) from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_user_invite_code BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION generate_invite_code();
```

## Prisma Schema (TypeScript)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UnitPreference {
  kg
  lb
}

model User {
  id               String          @id @default(uuid())
  email            String          @unique
  passwordHash     String?         @map("password_hash")
  displayName      String          @map("display_name")
  unitPreference   UnitPreference  @default(kg) @map("unit_preference")
  emailVerified    Boolean         @default(false) @map("email_verified")
  emailVerifiedAt  DateTime?       @map("email_verified_at")
  invitedBy        String?         @map("invited_by")
  inviter          User?           @relation("UserInvites", fields: [invitedBy], references: [id])
  invitees         User[]          @relation("UserInvites")
  inviteCode       String          @unique @map("invite_code")
  createdAt        DateTime        @default(now()) @map("created_at")
  updatedAt        DateTime        @updatedAt @map("updated_at")
  lastLoginAt      DateTime?       @map("last_login_at")
  
  maxLifts         MaxLift[]
  invitesCreated   Invite[]        @relation("InviteCreator")
  sessions         Session[]
  passwordResets   PasswordReset[]

  @@index([email])
  @@index([inviteCode])
  @@map("users")
}

model MaxLift {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  exerciseId  String   @map("exercise_id")
  exercise    Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  weight      Decimal  @db.Decimal(6, 2)
  unit        UnitPreference
  reps        Int      @default(1)
  achievedAt  DateTime @map("achieved_at")
  workoutId   String?  @map("workout_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([userId, exerciseId])
  @@index([userId])
  @@index([exerciseId])
  @@map("max_lifts")
}

model Invite {
  id           String    @id @default(uuid())
  code         String    @unique
  createdBy    String    @map("created_by")
  creator      User      @relation("InviteCreator", fields: [createdBy], references: [id], onDelete: Cascade)
  usedBy       String?   @map("used_by")
  expiresAt    DateTime? @map("expires_at")
  usedAt       DateTime? @map("used_at")
  maxUses      Int?      @map("max_uses")
  currentUses  Int       @default(0) @map("current_uses")
  createdAt    DateTime  @default(now()) @map("created_at")

  @@index([code])
  @@index([createdBy])
  @@map("invites")
}

model MagicLink {
  id        String    @id @default(uuid())
  email     String
  token     String    @unique
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  ipAddress String?   @map("ip_address")
  userAgent String?   @map("user_agent")
  createdAt DateTime  @default(now()) @map("created_at")

  @@index([email])
  @@index([token])
  @@map("magic_links")
}

model PasswordReset {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String    @unique
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  @@index([userId])
  @@index([token])
  @@map("password_resets")
}

model Session {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token          String   @unique
  expiresAt      DateTime @map("expires_at")
  ipAddress      String?  @map("ip_address")
  userAgent      String?  @map("user_agent")
  createdAt      DateTime @default(now()) @map("created_at")
  lastActivityAt DateTime @default(now()) @map("last_activity_at")

  @@index([userId])
  @@index([token])
  @@map("sessions")
}

model Exercise {
  id           String     @id @default(uuid())
  name         String     @unique
  category     String
  description  String?
  isCompound   Boolean    @default(false) @map("is_compound")
  muscleGroups Json?      @map("muscle_groups")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  
  maxLifts     MaxLift[]

  @@index([name])
  @@index([category])
  @@map("exercises")
}
```

## Data Migration Strategy

### Initial Migration
1. Create all tables
2. Add indexes
3. Add constraints
4. Seed exercise data

### Future Migrations
- Use Prisma Migrate or manual SQL migration files
- Always test migrations on staging first
- Backup production before applying migrations
- Use transactions for multi-step migrations
- Document rollback procedures

## Performance Considerations

### Query Optimization
- Use proper indexes on foreign keys
- Limit SELECT columns (avoid SELECT *)
- Paginate large result sets
- Use EXPLAIN ANALYZE to identify slow queries

### Caching Strategy
- Cache user profiles (Redis, 5 min TTL)
- Cache max lifts (Redis, 1 min TTL, invalidate on update)
- Cache exercise list (Redis, 1 hour TTL)

### Data Archival
- Archive old magic links/password resets (> 7 days)
- Archive inactive sessions (> 30 days)
- Keep user data indefinitely (GDPR: provide export/delete)
