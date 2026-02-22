# Feature 1: User Accounts & Onboarding

## Overview
A secure and user-friendly authentication system allowing users to create accounts, join private groups, and manage their fitness profiles.

## Feature Breakdown

### 1.1 Authentication System
**User Stories:**
- As a new user, I want to sign up with email + password so I can create an account
- As a new user, I want to sign up with a magic link so I can authenticate without remembering a password
- As a returning user, I want to log in securely to access my workout data
- As a user, I want to reset my password if I forget it

**Technical Requirements:**
- Email/password authentication with secure password hashing (bcrypt/argon2)
- Magic link authentication (passwordless login via email)
- JWT or session-based token management
- Password reset flow via email
- Email verification for new accounts
- Rate limiting on authentication endpoints
- HTTPS/TLS encryption for all auth traffic

### 1.2 Invite/Friend System
**User Stories:**
- As a user, I want to generate an invite link to share with friends
- As a user, I want to generate an invite code that friends can enter manually
- As a new user, I want to join using an invite link/code to be part of my friend's team
- As a user, I want to see who invited me to the platform

**Technical Requirements:**
- Unique invite code generation (alphanumeric, easy to type)
- Invite link generation with tracking
- Invite code validation and expiration logic (optional)
- Group/team assignment upon successful invite redemption
- Track invite relationships (who invited whom)
- Limit invites per user (optional)

### 1.3 User Profile
**User Stories:**
- As a user, I want to set my display name so others can identify me
- As a user, I want to choose my preferred units (kg/lb) for consistency
- As a user, I want to track my max lifts that update automatically
- As a user, I want to view and edit my profile information

**Technical Requirements:**
- Display name (editable, unique within team optional)
- Unit preference toggle (kg/lb) affecting all weight displays
- Max lift tracking per exercise (auto-calculated from workout history)
- Profile avatar/photo (optional for v1)
- Last updated timestamps
- Profile completion percentage (optional)

## Data Models

### User Entity
```
User {
  id: UUID (primary key)
  email: string (unique, indexed)
  passwordHash: string (nullable for magic link users)
  displayName: string
  unitPreference: enum ('kg', 'lb')
  emailVerified: boolean
  invitedBy: UUID (foreign key to User, nullable)
  inviteCode: string (unique, indexed)
  createdAt: timestamp
  updatedAt: timestamp
  lastLoginAt: timestamp
}
```

### MaxLift Entity
```
MaxLift {
  id: UUID (primary key)
  userId: UUID (foreign key to User)
  exerciseId: UUID (foreign key to Exercise)
  weight: decimal
  unit: enum ('kg', 'lb')
  achievedAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Invite Entity
```
Invite {
  id: UUID (primary key)
  code: string (unique, indexed)
  createdBy: UUID (foreign key to User)
  usedBy: UUID (foreign key to User, nullable)
  expiresAt: timestamp (nullable)
  usedAt: timestamp (nullable)
  maxUses: integer (nullable, for multi-use codes)
  currentUses: integer (default 0)
  createdAt: timestamp
}
```

### MagicLink Entity
```
MagicLink {
  id: UUID (primary key)
  email: string (indexed)
  token: string (unique, indexed)
  expiresAt: timestamp
  usedAt: timestamp (nullable)
  createdAt: timestamp
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/magic-link/request` - Request magic link via email
- `GET /api/auth/magic-link/verify/:token` - Verify magic link token
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/password/reset-request` - Request password reset
- `POST /api/auth/password/reset` - Reset password with token
- `GET /api/auth/me` - Get current user info

### Invites
- `POST /api/invites/generate` - Generate new invite code/link
- `GET /api/invites/validate/:code` - Validate invite code
- `POST /api/invites/accept/:code` - Accept invite and join team
- `GET /api/invites/my-invites` - Get user's generated invites
- `GET /api/invites/my-tree` - Get invite relationship tree

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile (name, units)
- `GET /api/profile/max-lifts` - Get all max lifts
- `GET /api/profile/max-lifts/:exerciseId` - Get specific exercise max

## Frontend Pages/Components

### Pages
1. **Signup Page** (`/signup`)
   - Email/password form
   - Magic link option
   - Invite code input field
   - Link to login

2. **Login Page** (`/login`)
   - Email/password form
   - Magic link option
   - Forgot password link
   - Link to signup

3. **Magic Link Verification** (`/auth/verify`)
   - Loading state while verifying token
   - Success/error messaging

4. **Profile Page** (`/profile`)
   - Display name editor
   - Unit preference toggle
   - Max lifts display (table/cards)
   - Invite code/link section

5. **Invite Landing** (`/join/:code`)
   - Welcome message
   - Signup form pre-filled with invite
   - Team/group preview

### Components
- `AuthForm` - Reusable email/password form
- `MagicLinkButton` - Trigger magic link flow
- `InviteGenerator` - Generate and display invite codes/links
- `MaxLiftCard` - Display individual max lift
- `MaxLiftsList` - Display all max lifts
- `UnitToggle` - Switch between kg/lb
- `ProfileEditor` - Edit profile fields
- `InviteTree` - Visualize invite relationships

## Security Considerations

1. **Password Security**
   - Minimum 8 characters, complexity requirements
   - Hash with bcrypt (cost factor 12+) or argon2
   - Never store plain text passwords

2. **Magic Link Security**
   - Cryptographically secure token generation
   - Short expiration (15 minutes)
   - Single-use tokens
   - Rate limiting on requests

3. **Session Management**
   - Secure HTTP-only cookies or JWT with refresh tokens
   - Session expiration (7-30 days)
   - Logout on all devices option

4. **Invite Security**
   - Validate invite codes server-side
   - Optional expiration dates
   - Prevent invite spam/abuse

5. **Data Privacy**
   - GDPR compliance (data export, deletion)
   - Email verification required
   - Clear privacy policy

## Testing Strategy

### Unit Tests
- Password hashing/validation
- JWT token generation/validation
- Invite code generation/validation
- Max lift calculation logic
- Unit conversion (kg/lb)

### Integration Tests
- Signup flow (email + password)
- Signup flow (magic link)
- Login flow (both methods)
- Password reset flow
- Invite acceptance flow
- Profile update flow

### E2E Tests
- Complete user onboarding journey
- Friend inviting friend scenario
- Max lift auto-update on workout completion
- Unit preference affecting display across app

## Dependencies & Tech Stack

### Backend
- **Authentication:** Passport.js, NextAuth, or Auth0
- **Email Service:** SendGrid, AWS SES, or Resend
- **Database:** PostgreSQL with Prisma/TypeORM or MongoDB
- **Validation:** Zod, Yup, or Joi
- **Security:** helmet, express-rate-limit, bcryptjs

### Frontend
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context, Zustand, or Redux Toolkit
- **HTTP Client:** Axios or Fetch API with interceptors
- **Routing:** React Router or Next.js
- **UI Components:** Tailwind CSS, shadcn/ui, or Material-UI

## Implementation Phases

### Phase 1: Core Authentication (Week 1)
- Database setup and migrations
- User model and basic CRUD
- Email/password signup and login
- JWT token management
- Protected routes middleware

### Phase 2: Magic Link (Week 1)
- Magic link token generation
- Email service integration
- Magic link verification flow
- Frontend magic link UI

### Phase 3: Invite System (Week 2)
- Invite model and generation logic
- Invite validation and acceptance
- Team/group assignment
- Frontend invite UI

### Phase 4: Profile & Max Lifts (Week 2)
- Profile editor UI
- Unit preference implementation
- Max lift tracking model
- Auto-calculation logic (will integrate with workout feature)

### Phase 5: Polish & Testing (Week 3)
- Password reset flow
- Email verification
- Comprehensive testing
- Security audit
- Documentation

## Success Metrics

- User signup completion rate > 80%
- Magic link usage > 40% of signups
- Invite acceptance rate > 60%
- Profile completion rate > 90%
- Authentication error rate < 2%
- Average onboarding time < 3 minutes

## Future Enhancements (Post-MVP)

- Social authentication (Google, Apple)
- Two-factor authentication (2FA)
- Profile photos/avatars
- Custom exercise max lifts (user-defined)
- Team/group management dashboard
- Invite leaderboards (who invited most)
- Profile badges/achievements
- Account linking (merge multiple accounts)
