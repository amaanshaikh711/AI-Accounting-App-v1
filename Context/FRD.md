# AI Accounting --- Functional Requirements Document (FRD)

**Product:** AI Accounting\
**Country/market:** India\
**Current scope:** Sprint 1 --- Project Foundation\
**Backend:** NestJS\
**Frontend:** Existing Next.js/React prototype\
**Database:** PostgreSQL

------------------------------------------------------------------------

# 1. Purpose

This FRD defines the functional behavior required to turn the existing
static frontend prototype into the Sprint 1 full-stack foundation.

The detailed requirements below are derived from the supplied Sprint 1
Project Foundation specification.

------------------------------------------------------------------------

# 2. Sprint 1 Objective

Build the application foundation so a user can:

1.  Register.
2.  Log in.
3.  Log out.
4.  Create an organization/business.
5.  Become the Owner of that organization.
6.  Access a protected dashboard.
7.  Access only organizations they are authorized to access.

The system must provide a secure foundation for later accounting and AI
modules.

------------------------------------------------------------------------

# 3. Functional Requirements

## FR-001 --- User Registration

### Endpoint

``` http
POST /api/auth/register
```

### Authentication

Public.

### Request

``` json
{
  "email": "alice@example.com",
  "password": "SecurePass1!"
}
```

Optional:

``` json
{
  "email": "alice@example.com",
  "password": "SecurePass1!",
  "name": "Alice"
}
```

### Validation

-   Email is required.
-   Email must have valid format.
-   Password is required.
-   Password must meet configured complexity requirements.
-   Email must be unique.

### Processing

1.  Validate request.
2.  Check whether email already exists.
3.  Hash password using bcrypt or argon2.
4.  Create user.
5.  Create JWT payload.
6.  Sign JWT using server-side secret.
7.  Return user ID, email and access token.

### Success

HTTP `201 Created`

``` json
{
  "userId": "uuid",
  "email": "alice@example.com",
  "access_token": "jwt..."
}
```

### Duplicate email

HTTP `400 Bad Request`

``` json
{
  "message": "Email already exists"
}
```

### Security

Never store plaintext passwords.

------------------------------------------------------------------------

# 4. FR-002 --- User Login

### Endpoint

``` http
POST /api/auth/login
```

### Authentication

Public.

### Request

``` json
{
  "email": "alice@example.com",
  "password": "SecurePass1!"
}
```

### Processing

1.  Find user by email.
2.  Compare supplied password with stored password hash.
3.  Reject invalid credentials.
4.  Create JWT.
5.  Return access token.

### Success

HTTP `200 OK`

``` json
{
  "access_token": "jwt..."
}
```

### Invalid credentials

HTTP `401 Unauthorized`

``` json
{
  "message": "Invalid credentials"
}
```

------------------------------------------------------------------------

# 5. FR-003 --- JWT Authentication

Use `@nestjs/jwt`.

JWT should contain minimal identity information.

Example payload:

``` json
{
  "sub": "user-uuid",
  "email": "alice@example.com",
  "exp": 1780000000
}
```

### Rules

-   JWT secret comes from environment variables.
-   Token must have an expiry.
-   Protected endpoints require:

``` http
Authorization: Bearer <token>
```

-   Invalid or expired tokens return `401`.
-   Missing tokens return `401`.

------------------------------------------------------------------------

# 6. FR-004 --- Current User

### Endpoint

``` http
GET /api/auth/me
```

### Authentication

Required.

### Response

``` json
{
  "userId": "uuid",
  "email": "alice@example.com",
  "roles": ["Owner"],
  "orgs": [
    {
      "orgId": "uuid",
      "name": "Alice Industries",
      "role": "Owner"
    }
  ]
}
```

The endpoint must only expose organization memberships belonging to the
authenticated user.

------------------------------------------------------------------------

# 7. FR-005 --- Logout

The Sprint 1 source includes logout as a user requirement.

### Prototype behavior

The frontend should clear authentication state and return the user to
login.

### Backend note

The specified JWT model is stateless. A server-side token
blacklist/invalidation mechanism is optional in the source example and
should not be invented as a Sprint 1 dependency unless required.

------------------------------------------------------------------------

# 8. FR-006 --- Organization Creation

### Endpoint

``` http
POST /api/organizations
```

### Authentication

Required.

### Request

``` json
{
  "name": "Alice Industries",
  "type": "PrivateLimited"
}
```

### Behavior

1.  Verify JWT.
2.  Identify current user.
3.  Validate organization name/type.
4.  Create organization UUID.
5.  Create membership in `user_organizations`.
6.  Assign role `Owner`.
7.  Return created organization.

### Response

HTTP `201 Created`

``` json
{
  "orgId": "uuid",
  "name": "Alice Industries",
  "type": "PrivateLimited",
  "createdAt": "2026-08-24T15:32:10Z"
}
```

------------------------------------------------------------------------

# 9. FR-007 --- List Organizations

### Endpoint

``` http
GET /api/organizations
```

### Authentication

Required.

### Behavior

Return only organizations to which the authenticated user belongs.

### Response

``` json
[
  {
    "orgId": "uuid",
    "name": "Alice Industries",
    "type": "PrivateLimited",
    "role": "Owner"
  }
]
```

A user must never receive another user's organizations.

------------------------------------------------------------------------

# 10. FR-008 --- Organization Roles

Roles:

``` text
Owner
Admin
Accountant
Viewer
```

The Sprint 1 implementation primarily uses Owner.

When an organization is created:

``` text
Current User
     ↓
Organization
     ↓
user_organizations
     ↓
role = Owner
```

Only Owners are expected to edit organization-level information in
Sprint 1.

------------------------------------------------------------------------

# 11. FR-009 --- Multi-Tenant Isolation

This is a critical security requirement.

### Rule

A user can only access organizations they belong to.

Conceptual flow:

``` text
JWT
 ↓
User ID
 ↓
UserOrganization membership
 ↓
Authorized Organization
 ↓
Organization data
```

Never:

``` text
Client sends orgId
       ↓
Backend blindly trusts it
       ↓
Data returned
```

The backend must verify membership before accessing organization-scoped
data.

### Database strategy

Use strict repository/query filters and consider PostgreSQL Row-Level
Security.

Every future tenant-owned table should have an organization/tenant
reference.

------------------------------------------------------------------------

# 12. FR-010 --- Database Schema

## Users

``` text
users
--------------------------------
id             UUID PK
email          VARCHAR UNIQUE
password_hash  VARCHAR NOT NULL
created_at     TIMESTAMP
updated_at     TIMESTAMP
```

Constraints:

-   `id` primary key.
-   `email` unique.
-   `email` not null.
-   `password_hash` not null.

------------------------------------------------------------------------

## Organizations

``` text
organizations
--------------------------------
id          UUID PK
name        VARCHAR NOT NULL
type        VARCHAR
created_at  TIMESTAMP
```

The supplied specification describes global organization-name uniqueness
as an initial assumption, while also noting this can be decided. Do not
silently enforce a different business rule without recording the
decision.

------------------------------------------------------------------------

## User Organizations

``` text
user_organizations
--------------------------------
user_id     UUID FK → users.id
org_id      UUID FK → organizations.id
role        VARCHAR NOT NULL
created_at  TIMESTAMP
```

Primary key:

``` text
(user_id, org_id)
```

Recommended index:

``` text
(org_id, user_id)
```

------------------------------------------------------------------------

# 13. FR-011 --- Dashboard

### Route

``` text
/dashboard
```

### Access

Authenticated user with an organization.

### Required display

``` text
Hello, [User Name]!
```

Placeholder metrics:

``` text
Revenue: --
Expenses: --
Profit: --
Cash: --
Receivables: --
Payables: --
```

The source specification allows these to remain placeholders.

Example:

``` text
Your accounting dashboard will appear here.
Create your first invoice or expense to see data.
```

No real accounting calculations are required in Sprint 1.

------------------------------------------------------------------------

# 14. FR-012 --- Signup UI

### Route

``` text
/signup
```

Fields:

-   Email
-   Password
-   Confirm Password

### Validation

-   Empty email
-   Invalid email
-   Empty password
-   Weak password
-   Password mismatch

### Success flow

``` text
Signup
  ↓
POST /api/auth/register
  ↓
JWT
  ↓
If no organization
  ↓
/create-organization
```

------------------------------------------------------------------------

# 15. FR-013 --- Login UI

### Route

``` text
/login
```

Fields:

-   Email
-   Password

Links:

-   Forgot password
-   Sign up

### Success flow

``` text
Login
  ↓
POST /api/auth/login
  ↓
JWT
  ↓
GET /api/auth/me
  ↓
Check organization membership
  ↓
No organization → /create-organization
Organization exists → /dashboard
```

### Token storage

The source specification gives localStorage as an illustrative example
but notes that secure HttpOnly cookies are preferable for production.

Do not treat localStorage as the final production security decision.

------------------------------------------------------------------------

# 16. FR-014 --- Create Organization UI

### Route

``` text
/create-organization
```

### Access

Authenticated users who need an organization.

### Fields

-   Organization Name
-   Organization Type

Optional/stub depending on final product decision:

-   GSTIN

Example organization types:

-   LLP
-   Proprietorship
-   Partnership
-   Private Limited
-   Public Limited
-   Other

### Success

``` text
POST /api/organizations
       ↓
201 Created
       ↓
/dashboard
```

------------------------------------------------------------------------

# 17. FR-015 --- Environment Configuration

## Backend

Required/future environment variables include:

``` env
DATABASE_URL=
JWT_SECRET=
NODE_ENV=development
PORT=4000
```

Future:

``` env
OPENROUTER_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Frontend

``` env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit real secrets.

------------------------------------------------------------------------

# 18. FR-016 --- CORS

Development setup:

``` text
Frontend: http://localhost:3000
Backend:  http://localhost:4000
```

Backend CORS must allow only the intended frontend origin.

Do not use unrestricted wildcard CORS in the production configuration.

------------------------------------------------------------------------

# 19. FR-017 --- Validation

All API inputs must be validated.

Validation should include:

-   Email format
-   Password rules
-   Organization name required
-   Organization type validation
-   String length limits

Use NestJS validation mechanisms and DTOs.

------------------------------------------------------------------------

# 20. FR-018 --- Error Handling

Standard error categories:

``` text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

Example:

``` json
{
  "message": "Invalid credentials"
}
```

Do not expose stack traces or secrets to clients.

------------------------------------------------------------------------

# 21. FR-019 --- Logging

Log important events:

-   User registration
-   Successful login
-   Failed login
-   Organization creation
-   Authorization failures where useful

Never log:

-   Passwords
-   Password hashes
-   JWT access tokens
-   Secrets

NestJS Logger is sufficient for Sprint 1.

------------------------------------------------------------------------

# 22. FR-020 --- Testing

## Unit tests

### Password hashing

``` ts
const hash = await bcrypt.hash(password, 10);

expect(hash).not.toBe(password);
expect(await bcrypt.compare(password, hash)).toBe(true);
```

### JWT

Test:

-   Token signing
-   Token verification
-   Expiration behavior

------------------------------------------------------------------------

## Integration tests

### Registration

``` text
POST /api/auth/register
→ 201
→ user created
→ token returned
```

### Duplicate registration

``` text
POST /api/auth/register
same email
→ 400
```

### Login

``` text
POST /api/auth/login
valid credentials
→ 200
→ token returned
```

### Invalid login

``` text
POST /api/auth/login
wrong credentials
→ 401
```

### Protected endpoint

``` text
GET /api/auth/me
without token
→ 401
```

### Organization creation

``` text
POST /api/organizations
valid JWT
→ 201
→ Owner membership created
```

### Organization listing

``` text
GET /api/organizations
valid JWT
→ only current user's organizations
```

------------------------------------------------------------------------

# 23. FR-021 --- Security Tests

Test:

1.  Missing JWT.
2.  Invalid JWT.
3.  Expired JWT.
4.  Unauthorized organization access.
5.  Cross-tenant organization access.
6.  Duplicate email.
7.  SQL injection-like input.
8.  Invalid organization input.

Expected behavior is rejection without leaking sensitive information.

------------------------------------------------------------------------

# 24. FR-022 --- API Contract

All APIs use:

``` text
/api
```

Authentication:

``` http
Authorization: Bearer <token>
```

### Endpoint matrix

  Endpoint               Method   Auth   Purpose
  ---------------------- -------- ------ ---------------------------
  `/api/auth/register`   POST     No     Register user
  `/api/auth/login`      POST     No     Authenticate user
  `/api/auth/me`         GET      Yes    Current user
  `/api/auth/logout`     POST     Yes    End client session
  `/api/organizations`   POST     Yes    Create organization
  `/api/organizations`   GET      Yes    List user's organizations

------------------------------------------------------------------------

# 25. FR-023 --- Performance

Initial target:

-   Auth/org APIs should normally respond in under 200 ms in a healthy
    development/staging environment.
-   Add indexes on email and membership lookup columns.
-   Keep database queries scoped and efficient.

Performance targets are not a reason to skip correctness or tenant
security.

------------------------------------------------------------------------

# 26. FR-024 --- Maintainability

NestJS structure should follow modules.

Recommended:

``` text
backend/src/
├── auth/
├── users/
├── organizations/
├── common/
├── database/
└── main.ts
```

Avoid putting all business logic into `app.service.ts`.

Use:

-   Controllers
-   Services
-   DTOs
-   Guards
-   Strategies
-   Repositories/ORM services

------------------------------------------------------------------------

# 27. FR-025 --- Deployment

The project should support:

``` text
frontend/
backend/
docker-compose.yml
```

Local development:

``` text
Next.js → :3000
NestJS  → :4000
Postgres
```

Docker Compose should eventually include:

-   frontend
-   backend
-   PostgreSQL

------------------------------------------------------------------------

# 28. FR-026 --- CI/CD

CI should eventually perform:

``` text
Checkout
   ↓
Install
   ↓
Lint
   ↓
Unit tests
   ↓
Integration tests
   ↓
Frontend build
   ↓
Backend build
   ↓
Docker build
   ↓
Optional staging deployment
   ↓
Smoke test
```

------------------------------------------------------------------------

# 29. FR-027 --- Existing Frontend Integration

The existing Google AI Studio frontend is already available locally.

Do not rebuild the interface.

Integration work should:

1.  Identify the existing frontend framework/package structure.
2.  Identify routes and components.
3.  Identify static/mock data.
4.  Create an API client/service layer.
5.  Replace static authentication behavior with backend calls.
6.  Replace static organization state with backend data.
7.  Replace dashboard identity/organization data with `/api/auth/me`.
8.  Preserve the Swiss Minimalist design.

------------------------------------------------------------------------

# 30. Example Backend Code

## Auth Controller

``` ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: { email: string; password: string },
  ) {
    return this.authService.register(dto.email, dto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: { email: string; password: string },
  ) {
    const accessToken = await this.authService.login(
      dto.email,
      dto.password,
    );

    return { access_token: accessToken };
  }
}
```

------------------------------------------------------------------------

# 31. Example Auth Service

``` ts
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    // Inject your user service/repository here.
  ) {}

  async register(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Check duplicate email.
    // 2. Save user.
    // 3. Generate JWT.

    // Replace this with the real persisted user.
    const user = {
      id: 'generated-user-uuid',
      email,
    };

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      userId: user.id,
      email: user.email,
      access_token: accessToken,
    };
  }

  async login(email: string, password: string) {
    // Replace with real user lookup.
    const user = await this.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload);
  }

  private async findUserByEmail(email: string) {
    // Replace with database lookup.
    return null;
  }
}
```

**Important:** this snippet is an architectural example, not
production-ready persistence code. The real implementation must use the
database.

------------------------------------------------------------------------

# 32. Example Frontend API Call

``` ts
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  },
);

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message ?? 'Login failed');
}

const data = await response.json();

console.log(data.access_token);
```

Production token handling should be reviewed carefully; the supplied
Sprint 1 document itself notes that secure HttpOnly cookies are
preferable to localStorage.

------------------------------------------------------------------------

# 33. Acceptance Criteria

## Signup

Given a valid email and strong password:

``` text
WHEN signup is submitted
THEN user is created
AND password is hashed
AND JWT is returned
```

Given an existing email:

``` text
WHEN signup is submitted
THEN API returns 400
```

## Login

Given valid credentials:

``` text
WHEN login is submitted
THEN API returns 200
AND valid JWT is returned
```

Given invalid credentials:

``` text
WHEN login is submitted
THEN API returns 401
```

## Protected APIs

Given no JWT:

``` text
WHEN protected endpoint is requested
THEN API returns 401
```

## Organization

Given authenticated user:

``` text
WHEN valid organization is created
THEN organization is persisted
AND membership is created
AND role is Owner
AND API returns 201
```

## Dashboard

Given authenticated user with organization:

``` text
WHEN dashboard is opened
THEN user sees welcome message
AND placeholder financial metrics
AND no errors occur
```

## Tenant Isolation

Given User A belongs to Organization A and User B belongs to
Organization B:

``` text
WHEN User A requests organization data
THEN only Organization A memberships/data are returned
```

User A must not access User B's organization.

------------------------------------------------------------------------

# 34. Definition of Done

Sprint 1 is done when:

-   Signup works.
-   Login works.
-   Logout works at the application level.
-   Passwords are securely hashed.
-   JWT authentication works.
-   Protected APIs reject unauthorized requests.
-   Organization creation works.
-   Owner role assignment works.
-   Organization listing is tenant-scoped.
-   Existing frontend is connected to the backend.
-   PostgreSQL schema/migrations work.
-   Unit tests exist.
-   Integration tests exist.
-   Cross-tenant access is rejected.
-   Environment configuration is documented.
-   README/developer documentation is updated.

------------------------------------------------------------------------

# 35. Sprint 1 Checklist

``` text
[ ] Project setup
[ ] Existing frontend verified
[ ] NestJS backend running
[ ] PostgreSQL running
[ ] Environment variables configured
[ ] Database migration setup
[ ] Users table
[ ] Organizations table
[ ] UserOrganizations table
[ ] Auth module
[ ] Register API
[ ] Login API
[ ] Me API
[ ] Logout behavior
[ ] JWT guard
[ ] Role framework
[ ] Organization create API
[ ] Organization list API
[ ] Tenant isolation
[ ] Signup connected
[ ] Login connected
[ ] Organization creation connected
[ ] Dashboard connected
[ ] Unit tests
[ ] Integration tests
[ ] Security tests
[ ] Docker
[ ] CI
[ ] Documentation
```

------------------------------------------------------------------------

# 36. Requirement Conflicts to Confirm

Do not silently resolve these.

### GSTIN / Financial Year

The higher-level product FRD mentions:

-   GSTIN
-   Financial year
-   Business type

The detailed Sprint 1 source states GST is out of scope and its initial
organization schema contains:

-   id
-   name
-   type
-   created_at

Therefore:

> GSTIN and financial year should be treated as a product/onboarding
> requirement to confirm before being made mandatory database fields in
> Sprint 1.

### Organization Name Uniqueness

The detailed source says global uniqueness can be assumed for Sprint 1,
but also raises per-user uniqueness as a possible alternative.

Record the final decision before hard-coding the business rule.

------------------------------------------------------------------------

# 37. Traceability

The supplied Sprint 1 specification covers:

-   Executive summary and scope
-   User stories
-   Authentication and authorization
-   Organization management
-   Dashboard stub
-   Non-functional requirements
-   API contract
-   Database schema
-   UI wireframes
-   Acceptance criteria
-   Test cases
-   Security/privacy
-   Deployment/environment
-   CI/CD
-   Sprint task list
-   Timeline
-   Example NestJS and Next.js snippets

This FRD preserves those requirements while organizing them into
implementation-ready functional requirements.
