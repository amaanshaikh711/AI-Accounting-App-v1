# AI Accounting --- Architecture

**Product:** AI Accounting\
**Market:** India\
**Architecture status:** Foundation / Sprint 1\
**Frontend:** Next.js\
**Backend:** NestJS\
**Database:** PostgreSQL\
**Future AI Gateway:** OpenRouter

------------------------------------------------------------------------

# 1. Architecture Overview

AI Accounting is designed as a full-stack, multi-tenant accounting
platform.

The application is intentionally separated into a **Next.js frontend**
and a **NestJS backend**.

``` text
                         AI ACCOUNTING
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
          Next.js Frontend           NestJS Backend
                 │                         │
                 │       REST API          │
                 └────────────┬────────────┘
                              │
                              ▼
                       PostgreSQL
                              │
                    Organization/Tenant
                       scoped data
                              │
                              ▼
                    Future AI Layer
                         OpenRouter
```

## Core architectural principles

1.  Frontend and backend remain separate applications.
2.  The frontend is responsible for presentation and user interaction.
3.  The backend is the authority for authentication, authorization and
    business rules.
4.  PostgreSQL is the source of truth for persisted application data.
5.  Organization is the tenant boundary.
6.  Every tenant-owned data access must be organization-scoped.
7.  AI functionality is a future layer and must not be coupled into the
    Sprint 1 foundation.
8.  Secrets are never committed to source control.
9.  The existing professional Swiss Minimalist UI should be preserved
    while backend functionality is integrated.

------------------------------------------------------------------------

# 2. Application Architecture

## High-level request flow

``` text
User
 │
 ▼
Next.js Frontend
 │
 │ HTTPS / REST
 ▼
NestJS API
 │
 ├── Authentication
 ├── Authorization / RBAC
 ├── Organization Management
 ├── Tenant Isolation
 ├── Validation
 ├── Business Logic
 └── Database Access
 │
 ▼
PostgreSQL
```

## Authentication flow

``` text
Signup
   │
   ▼
POST /api/auth/register
   │
   ▼
NestJS AuthService
   │
   ├── Validate input
   ├── Hash password
   ├── Create user
   └── Issue JWT
   │
   ▼
Frontend receives authentication state
   │
   ▼
Create Organization
   │
   ▼
POST /api/organizations
   │
   ▼
Organization + Owner Membership
   │
   ▼
Dashboard
```

## Existing frontend → backend transition

The current frontend prototype contains the complete visual/product
experience and is initially static.

We will progressively replace static/mock behavior with real API data.

``` text
CURRENT

Next.js UI
   │
   └── Static / mock data


TARGET

Next.js UI
   │
   ▼
API Client
   │
   ▼
NestJS REST API
   │
   ▼
PostgreSQL
```

Do not rebuild the frontend simply to connect the backend.

------------------------------------------------------------------------

# 3. Technology Stack

## Frontend

  Technology                   Purpose
  ---------------------------- ---------------------------------
  Next.js                      Web application framework
  React                        UI
  TypeScript                   Type safety
  Tailwind CSS                 Styling
  Motion / animation library   Subtle UI motion where required
  Lucide / icon library        Interface icons
  Fetch or API client          Backend communication

### Frontend responsibilities

-   Pages and layouts
-   Components
-   Forms
-   Client-side validation
-   Navigation
-   Authentication state presentation
-   API integration
-   Loading states
-   Error states
-   Empty states
-   Dashboard rendering

The frontend must **not** be the final security boundary.

------------------------------------------------------------------------

## Backend

  Technology               Purpose
  ------------------------ --------------------------
  NestJS                   Backend framework
  TypeScript               Type safety
  PostgreSQL               Relational database
  JWT                      API authentication
  bcrypt / argon2          Password hashing
  DTO validation           Request validation
  ORM / repository layer   Database access
  Jest                     Unit/integration testing
  Supertest                API testing

### Backend responsibilities

-   Authentication
-   JWT issuance/verification
-   Authorization
-   RBAC
-   Organization management
-   Tenant isolation
-   Validation
-   Business rules
-   Database access
-   Error handling
-   Logging
-   API contracts

------------------------------------------------------------------------

## Database

### PostgreSQL

PostgreSQL is the primary persistent data store.

Initial Sprint 1 entities:

``` text
users
organizations
user_organizations
```

Future accounting entities will be organization-scoped.

------------------------------------------------------------------------

## Future AI Layer

``` text
NestJS
   │
   ▼
AI Service
   │
   ▼
OpenRouter
   │
   ├── AI Assistant
   ├── Document Processing
   ├── Transaction Review
   ├── Categorization
   └── Financial Insights
```

AI is intentionally outside the Sprint 1 critical path.

------------------------------------------------------------------------

# 4. Monorepo / Project Structure

The project uses one repository containing two independent applications.

``` text
Prototype-1/
│
├── AGENTS.md
├── PRD.md
├── FRD.md
├── ARCHITECTURE.md
├── README.md
├── .gitignore
│
├── docs/
│   ├── PROJECT-CONTEXT.md
│   ├── SPRINT-1.md
│   └── DECISIONS.md
│
├── frontend/
│   ├── AGENTS.md
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── public/
│   │
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── lib/
│       ├── hooks/
│       ├── types/
│       └── styles/
│
├── backend/
│   ├── AGENTS.md
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── .env
│   │
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       │
│       ├── auth/
│       ├── users/
│       ├── organizations/
│       ├── database/
│       ├── common/
│       └── health/
│
├── docker-compose.yml
│
└── .github/
    └── workflows/
        └── ci.yml
```

------------------------------------------------------------------------

# 5. Frontend Architecture

## Target Next.js structure

The frontend is a Next.js application.

``` text
frontend/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   │
│   │   ├── create-organization/
│   │   │   └── page.tsx
│   │   │
│   │   └── dashboard/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── navigation/
│   │   └── forms/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── organizations/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── sales/
│   │   ├── purchases/
│   │   ├── expenses/
│   │   ├── banking/
│   │   ├── customers/
│   │   ├── vendors/
│   │   └── reports/
│   │
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── utils/
│   │   └── validation/
│   │
│   ├── hooks/
│   ├── types/
│   └── styles/
│
├── package.json
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

## Feature-based organization

As the application grows, accounting functionality should be organized
by feature.

Example:

``` text
features/
└── sales/
    ├── components/
    ├── hooks/
    ├── services/
    ├── types.ts
    └── validations.ts
```

This prevents the project from becoming one large components folder.

------------------------------------------------------------------------

# 6. Backend Architecture

NestJS should use modular architecture.

``` text
backend/src/
│
├── main.ts
├── app.module.ts
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   ├── guards/
│   └── strategies/
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   └── entities/
│
├── organizations/
│   ├── organizations.module.ts
│   ├── organizations.controller.ts
│   ├── organizations.service.ts
│   ├── dto/
│   └── entities/
│
├── database/
│   ├── migrations/
│   ├── database.module.ts
│   └── database.service.ts
│
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── pipes/
│   └── types/
│
└── health/
    ├── health.module.ts
    └── health.controller.ts
```

## Backend module rule

Each major domain should have its own NestJS module.

Avoid:

``` text
app.service.ts
    ↓
Everything
```

Prefer:

``` text
AuthModule
UsersModule
OrganizationsModule
TransactionsModule
SalesModule
ExpensesModule
...
```

------------------------------------------------------------------------

# 7. API Architecture

All backend APIs use the `/api` prefix.

## Sprint 1 API

``` text
/api
│
├── auth
│   ├── POST /register
│   ├── POST /login
│   ├── GET  /me
│   └── POST /logout
│
└── organizations
    ├── POST /
    └── GET  /
```

Full paths:

``` text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout

POST /api/organizations
GET  /api/organizations
```

------------------------------------------------------------------------

# 8. Authentication Architecture

``` text
                    LOGIN
                      │
                      ▼
              NestJS AuthController
                      │
                      ▼
                AuthService
                      │
             ┌────────┴────────┐
             │                 │
        Find User        bcrypt.compare
             │                 │
             └────────┬────────┘
                      ▼
                  JwtService
                      │
                      ▼
                   JWT
                      │
                      ▼
                 Frontend
```

Protected request:

``` text
Frontend
   │
   │ Authorization: Bearer <JWT>
   ▼
NestJS
   │
   ▼
JWT Guard
   │
   ├── Invalid → 401
   │
   └── Valid
        │
        ▼
    User Identity
        │
        ▼
   Organization Check
        │
        ▼
    Controller/Service
```

------------------------------------------------------------------------

# 9. Multi-Tenant Architecture

The organization is the tenant.

``` text
                    USER
                     │
                     │
                     ▼
             USER_ORGANIZATIONS
                     │
             ┌───────┴───────┐
             │               │
             ▼               ▼
        Organization A   Organization B
             │
             ▼
      Tenant-owned data
```

## Rule

A request must never be authorized merely because the client supplied an
`orgId`.

The backend must verify:

``` text
Authenticated User
       +
Requested Organization
       ↓
Membership exists?
       ↓
YES → continue
NO  → reject
```

## Future accounting tables

Example:

``` text
transactions
-------------------------
id
organization_id
date
amount
...
```

Every organization-owned accounting record must be scoped to an
organization.

------------------------------------------------------------------------

# 10. Database Architecture

Initial schema:

``` text
┌──────────────┐
│    USERS     │
├──────────────┤
│ id PK        │
│ email        │
│ passwordHash │
│ createdAt    │
│ updatedAt    │
└──────┬───────┘
       │
       │
       │
┌──────▼──────────────┐
│ USER_ORGANIZATIONS  │
├─────────────────────┤
│ userId FK           │
│ orgId FK            │
│ role                │
│ createdAt           │
└──────┬──────────────┘
       │
       │
┌──────▼──────────────┐
│   ORGANIZATIONS     │
├─────────────────────┤
│ id PK               │
│ name                │
│ type                │
│ createdAt           │
└─────────────────────┘
```

## Relationship

``` text
User        N : N        Organization
  │                         │
  └──── UserOrganization ───┘
```

This allows a user to belong to multiple organizations in the future.

------------------------------------------------------------------------

# 11. Organization Context

The selected organization should eventually become part of the
authenticated application context.

Example:

``` text
JWT
 │
 ▼
User
 │
 ▼
Memberships
 │
 ▼
Active Organization
 │
 ▼
Organization-scoped API calls
```

The frontend may show:

``` text
ACME INDUSTRIES PVT LTD
FY 2026–27
```

But the backend remains the authority over whether the user can access
that organization.

------------------------------------------------------------------------

# 12. Frontend ↔ Backend Communication

Development:

``` text
Browser
   │
   ▼
Next.js
localhost:3000
   │
   │ REST
   ▼
NestJS
localhost:4000
   │
   ▼
PostgreSQL
```

Example:

``` env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Production:

``` text
Browser
   │
   ▼
Application Domain
   │
   ├── Next.js
   │
   └── NestJS API
          │
          ▼
      PostgreSQL
```

The exact production hosting provider is not fixed by this architecture
document.

------------------------------------------------------------------------

# 13. Environment Architecture

## Frontend `.env.local`

``` env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Backend `.env`

``` env
NODE_ENV=development
PORT=4000

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=1h

OPENROUTER_API_KEY=
```

Future:

``` env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

Never commit real values.

------------------------------------------------------------------------

# 14. Docker Architecture

Development target:

``` text
docker-compose
      │
      ├── frontend
      │
      ├── backend
      │
      └── postgres
```

Conceptually:

``` text
┌─────────────────────┐
│ Docker Compose      │
│                     │
│ ┌───────────────┐   │
│ │ Next.js       │   │
│ │ :3000         │   │
│ └───────┬───────┘   │
│         │            │
│ ┌───────▼───────┐   │
│ │ NestJS        │   │
│ │ :4000         │   │
│ └───────┬───────┘   │
│         │            │
│ ┌───────▼───────┐   │
│ │ PostgreSQL    │   │
│ │ :5432         │   │
│ └───────────────┘   │
└─────────────────────┘
```

------------------------------------------------------------------------

# 15. CI/CD Architecture

Target pipeline:

``` text
Git Push
   │
   ▼
GitHub Actions
   │
   ├── Install dependencies
   ├── Lint
   ├── Unit tests
   ├── Integration tests
   ├── Frontend build
   ├── Backend build
   └── Docker build
          │
          ▼
      Staging
          │
          ▼
      Smoke tests
```

------------------------------------------------------------------------

# 16. Future Accounting Architecture

After Sprint 1, the backend can grow into:

``` text
backend/src/
│
├── auth/
├── users/
├── organizations/
│
├── accounting/
│   ├── accounts/
│   ├── transactions/
│   ├── ledger/
│   └── journal/
│
├── sales/
│   ├── invoices/
│   └── customers/
│
├── purchases/
│   ├── bills/
│   └── vendors/
│
├── expenses/
│
├── banking/
│   ├── accounts/
│   └── reconciliation/
│
├── gst/
│
├── reports/
│
├── ai/
│
└── audit/
```

This is a future direction, not a requirement to build all modules in
Sprint 1.

------------------------------------------------------------------------

# 17. Future AI Architecture

AI should sit behind the backend rather than exposing provider
credentials to the browser.

``` text
Next.js
   │
   ▼
NestJS
   │
   ▼
AI Service
   │
   ├── Prompt construction
   ├── Context selection
   ├── Permission checks
   ├── Output validation
   └── Audit logging
   │
   ▼
OpenRouter
   │
   ▼
LLM
```

The browser must never receive:

``` text
OPENROUTER_API_KEY
```

AI responses should also respect organization boundaries.

------------------------------------------------------------------------

# 18. Security Architecture

## Authentication

-   JWT
-   Secure password hashing
-   Limited token lifetime
-   Server-side JWT secret

## Authorization

-   Authentication guards
-   Organization membership checks
-   Role-based access control

## Tenant security

-   Organization-scoped queries
-   Membership verification
-   Future PostgreSQL RLS where appropriate

## Secrets

Never commit:

``` text
JWT_SECRET
DATABASE_URL
OPENROUTER_API_KEY
SMTP credentials
```

## Logging

Never log:

``` text
passwords
password hashes
JWT tokens
API keys
```

------------------------------------------------------------------------

# 19. Error Flow

``` text
Request
  │
  ▼
Validation
  │
  ├── Invalid → 400
  │
  ▼
Authentication
  │
  ├── Invalid → 401
  │
  ▼
Authorization
  │
  ├── Forbidden → 403
  │
  ▼
Resource lookup
  │
  ├── Missing → 404
  │
  ▼
Business logic
  │
  ▼
Success
```

------------------------------------------------------------------------

# 20. Health Check

A simple backend health endpoint should exist for local/deployment
verification.

Example:

``` http
GET /api/health
```

Example response:

``` json
{
  "status": "ok"
}
```

This is useful for Docker, CI and staging smoke tests.

------------------------------------------------------------------------

# 21. Current Workspace Note

The current workspace screenshot shows:

``` text
Prototype-1/
├── backend/
└── frontend/
    ├── assets/
    ├── Context/
    ├── node_modules/
    ├── src/
    ├── .env.example
    ├── index.html
    ├── metadata.json
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

However, the **target architecture for this project is Next.js
frontend + NestJS backend**.

Therefore, before implementing the production integration, verify the
actual frontend framework and migration state.

If the current `frontend/` is still a Vite React application, do not
blindly rename files or mix Vite and Next.js configuration. Decide
whether:

1.  the existing frontend should be migrated to Next.js while preserving
    its UI, or
2.  the current Vite frontend is intentionally retained.

The architecture target remains:

``` text
frontend → Next.js
backend  → NestJS
database  → PostgreSQL
```

This decision should be recorded in `docs/DECISIONS.md` before a large
migration.

------------------------------------------------------------------------

# 22. Architecture Rules for Coding Agents

Agents working on this project must:

1.  Read `AGENTS.md`.
2.  Read `PRD.md`.
3.  Read `FRD.md`.
4.  Read this architecture document before making architectural changes.
5.  Read `docs/DECISIONS.md` before changing established decisions.
6.  Preserve the existing frontend UI.
7.  Keep frontend and backend separate.
8.  Never move NestJS inside the frontend.
9.  Never put database credentials in frontend code.
10. Never expose AI provider secrets to the browser.
11. Never bypass tenant membership checks.
12. Prefer feature/module boundaries.
13. Add tests for security-sensitive changes.
14. Update architecture/decision documentation when the architecture
    changes.

------------------------------------------------------------------------

# 23. Source of Truth Hierarchy

When documents disagree, use this order:

``` text
1. Explicit current project decision
        ↓
2. FRD.md
        ↓
3. PRD.md
        ↓
4. ARCHITECTURE.md
        ↓
5. Sprint-specific documentation
        ↓
6. Agent assumptions
```

If a conflict affects security, database structure or major
architecture, **do not guess**. Record the conflict and ask for
confirmation.

------------------------------------------------------------------------

# 24. Sprint 1 Architecture Boundary

Sprint 1 should establish:

``` text
Next.js
   │
   ▼
NestJS
   │
   ▼
PostgreSQL

       +
Authentication
       +
Organization
       +
Tenant Isolation
       +
Testing
```

Do not expand Sprint 1 into:

``` text
AI
GST integrations
Payments
Bank reconciliation
Full accounting engine
Advanced reports
```

Those belong to later stages unless explicitly brought into scope.

------------------------------------------------------------------------

# 25. Final Architecture

The intended long-term system is:

``` text
                         AI ACCOUNTING
                              │
                              ▼
                     ┌─────────────────┐
                     │    Next.js      │
                     │    Frontend     │
                     └────────┬────────┘
                              │
                         REST / HTTPS
                              │
                              ▼
                     ┌─────────────────┐
                     │     NestJS      │
                     │      API        │
                     ├─────────────────┤
                     │ Auth            │
                     │ Organizations   │
                     │ Accounting      │
                     │ GST             │
                     │ Banking         │
                     │ Reports         │
                     │ AI              │
                     │ Audit           │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │   PostgreSQL    │
                     │ Multi-tenant DB │
                     └────────┬────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
          Tenant Accounting          Audit / History


Future AI path:

NestJS
   │
   ▼
AI Service
   │
   ▼
OpenRouter
   │
   ▼
LLM Providers
```

The architecture is intentionally modular so the Sprint 1 foundation can
grow into a complete India-focused accounting platform without requiring
a rewrite of the core system.
