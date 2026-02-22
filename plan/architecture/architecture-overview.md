# Gym Progress App - Architecture Overview

## System Architecture

### High-Level Architecture
```
┌─────────────┐
│   Client    │ (Web App - React/Next.js)
│  (Browser)  │
└──────┬──────┘
       │ HTTPS/WSS
       │
┌──────▼──────────────────────────────────┐
│         API Gateway / Load Balancer     │
│         (Nginx / AWS ALB)               │
└──────┬──────────────────────────────────┘
       │
┌──────▼──────────────────────────────────┐
│      Application Server Layer           │
│   (Node.js / Express or Next.js API)    │
│                                          │
│  ┌──────────┐  ┌──────────┐            │
│  │   Auth   │  │ Workout  │  [More     │
│  │ Service  │  │ Service  │   Services]│
│  └──────────┘  └──────────┘            │
└──────┬──────────────┬───────────────────┘
       │              │
       │              │
┌──────▼──────┐  ┌───▼────────┐  ┌────────────┐
│  Database   │  │   Redis    │  │   Email    │
│ PostgreSQL  │  │   Cache    │  │  Service   │
└─────────────┘  └────────────┘  └────────────┘
```

## Technology Stack

### Frontend
- **Framework:** React with Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand or React Context
- **Form Handling:** React Hook Form + Zod validation
- **HTTP Client:** Axios or native fetch with interceptors
- **Charts/Graphs:** Recharts or Chart.js (for progress tracking)
- **PWA:** next-pwa for offline capability

### Backend
- **Framework:** Next.js API Routes or Express.js
- **Language:** TypeScript
- **Authentication:** NextAuth.js or Passport.js
- **Validation:** Zod
- **ORM:** Prisma (recommended) or TypeORM
- **Email:** Resend or SendGrid
- **File Upload:** AWS S3 or Cloudinary (for future avatar uploads)

### Database
- **Primary DB:** PostgreSQL 15+
  - Relational data (users, workouts, exercises)
  - ACID compliance for critical operations
  - Full-text search capabilities
  
- **Cache:** Redis
  - Session storage
  - Rate limiting
  - Frequently accessed data (max lifts, user preferences)

### Infrastructure
- **Hosting:** Vercel (Next.js) or AWS (EC2/ECS)
- **Database:** AWS RDS, Supabase, or Neon
- **CDN:** Cloudflare or AWS CloudFront
- **Monitoring:** Sentry for error tracking
- **Analytics:** PostHog or Mixpanel
- **CI/CD:** GitHub Actions

## Project Structure

```
gym-progress-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── verify/
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── profile/
│   │   │   ├── workouts/
│   │   │   └── team/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── profile/
│   │   │   ├── invites/
│   │   │   └── workouts/
│   │   └── layout.tsx
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (shadcn)
│   │   ├── auth/             # Auth-related components
│   │   ├── profile/          # Profile components
│   │   ├── workout/          # Workout components
│   │   └── shared/           # Shared components
│   │
│   ├── lib/                   # Utility functions
│   │   ├── db/               # Database client
│   │   ├── auth/             # Auth helpers
│   │   ├── email/            # Email service
│   │   ├── utils/            # General utilities
│   │   └── validations/      # Zod schemas
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # State management
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Next.js middleware
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # DB migrations
│   └── seed.ts                # Seed data
│
├── public/                    # Static assets
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Database Schema Design Principles

### Normalization
- 3NF (Third Normal Form) for most tables
- Denormalization for read-heavy data (cached max lifts)

### Indexing Strategy
- Primary keys: UUID v4 or ULID
- Foreign keys: Indexed
- Email addresses: Unique index
- Invite codes: Unique index
- Created/updated timestamps: Indexed for sorting

### Data Integrity
- Foreign key constraints
- Check constraints for valid enums
- NOT NULL where appropriate
- Default values for timestamps

## API Design Principles

### RESTful Conventions
- GET: Retrieve resources
- POST: Create resources
- PUT/PATCH: Update resources
- DELETE: Remove resources

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "timestamp": "2026-02-22T12:00:00Z"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly error message",
    "details": { ... }
  },
  "timestamp": "2026-02-22T12:00:00Z"
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Server validates and generates JWT
3. JWT stored in HTTP-only cookie
4. Subsequent requests include JWT
5. Middleware validates JWT on protected routes

### Authorization Levels
- **Public:** Anyone (signup, login pages)
- **Authenticated:** Logged-in users (profile, workouts)
- **Team Member:** Within same team (view team data)
- **Team Admin:** Team owner (future: manage team)

### Security Measures
- HTTPS enforcement
- CORS configuration
- Rate limiting (express-rate-limit)
- Helmet.js security headers
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS prevention (React escaping + CSP)
- CSRF tokens for state-changing operations

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Session data in Redis (shared state)
- Load balancer distribution

### Database Scaling
- Read replicas for heavy queries
- Connection pooling (Prisma)
- Pagination for large datasets
- Caching frequently accessed data

### Performance Optimization
- CDN for static assets
- Image optimization (Next.js Image)
- Database query optimization
- API response caching (Redis)
- Lazy loading components
- Code splitting

## Development Workflow

### Git Strategy
- **main:** Production-ready code
- **develop:** Integration branch
- **feature/*:** Feature branches
- **fix/*:** Bug fix branches

### Code Review Process
1. Create feature branch
2. Implement feature with tests
3. Create pull request
4. Code review + CI checks
5. Merge to develop
6. Deploy to staging
7. Merge to main (production)

### CI/CD Pipeline
1. Run linter (ESLint)
2. Run type checker (TypeScript)
3. Run unit tests (Jest)
4. Run integration tests
5. Build application
6. Deploy to staging (auto)
7. Deploy to production (manual approval)

## Monitoring & Logging

### Application Monitoring
- Error tracking: Sentry
- Performance: Vercel Analytics or AWS CloudWatch
- Uptime: Pingdom or UptimeRobot

### Logging Strategy
- Structured JSON logs
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized logging: CloudWatch or Datadog
- Log rotation and retention

### Metrics to Track
- User signups (daily/weekly)
- Active users (DAU/MAU)
- API response times
- Error rates by endpoint
- Database query performance
- Cache hit rates

## Development Environment Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Git

### Environment Variables
```
# Database
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Email
EMAIL_FROM="noreply@gymapp.com"
SENDGRID_API_KEY="..." or RESEND_API_KEY="..."

# Redis
REDIS_URL="redis://localhost:6379"

# App
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

### Local Setup Commands
```bash
# Clone repository
git clone <repo-url>
cd gym-progress-app

# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start development server
npm run dev
```

## Testing Strategy

### Test Pyramid
- **70% Unit Tests:** Individual functions/components
- **20% Integration Tests:** API endpoints, DB interactions
- **10% E2E Tests:** Critical user flows

### Testing Tools
- **Unit:** Jest + React Testing Library
- **Integration:** Jest + Supertest
- **E2E:** Playwright or Cypress
- **API Testing:** Postman/Insomnia collections

## Documentation Standards

### Code Documentation
- JSDoc comments for complex functions
- README in each major directory
- Inline comments for non-obvious logic

### API Documentation
- OpenAPI/Swagger specification
- Example requests/responses
- Authentication requirements

### User Documentation
- Onboarding guide
- Feature tutorials
- FAQ section

## Deployment Strategy

### Staging Environment
- Auto-deploy from `develop` branch
- Test with realistic data
- QA testing before production

### Production Deployment
- Manual approval required
- Database migrations run first
- Blue-green deployment (zero downtime)
- Rollback plan documented

### Backup Strategy
- Daily database backups
- 30-day retention
- Backup restoration testing (monthly)

## Cost Estimation (Monthly)

### Small Scale (0-1,000 users)
- Hosting: $20-50 (Vercel Pro or AWS t3.small)
- Database: $25-50 (Supabase/Neon or RDS t3.micro)
- Email: $15-30 (SendGrid/Resend)
- Total: ~$60-130/month

### Medium Scale (1,000-10,000 users)
- Hosting: $100-200
- Database: $100-200
- Email: $50-100
- CDN/Cache: $50-100
- Total: ~$300-600/month

## Risk Management

### Identified Risks
1. **Data Loss:** Mitigated by backups + replication
2. **Security Breach:** Mitigated by security best practices + audits
3. **Scaling Issues:** Mitigated by scalable architecture
4. **API Rate Limits:** Mitigated by caching + efficient queries
5. **Email Deliverability:** Mitigated by reputable providers + SPF/DKIM

### Disaster Recovery
- Database: Point-in-time recovery (PITR)
- Application: Infrastructure as Code (IaC)
- Documentation: Runbook for common issues
