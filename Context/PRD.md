# AI Accounting --- Product Requirements Document (PRD)

**Product:** AI Accounting\
**Market:** India\
**Document status:** Product foundation / prototype-to-production
baseline\
**Current focus:** Sprint 1 --- Project Foundation

------------------------------------------------------------------------

## 1. Product Overview

AI Accounting is an India-focused accounting SaaS platform designed for
business owners, accountants, finance teams, bookkeepers, and
experienced accounting professionals.

The product combines familiar accounting workflows with AI-assisted
capabilities. The long-term product should cover accounting operations,
GST workflows, banking/reconciliation, reporting, document processing,
and AI-powered review and insights.

The first production sprint is intentionally narrower: establish a
secure, multi-tenant foundation on which the accounting and AI layers
can later be built.

### Core product principle

> The user already understands accounting. AI Accounting should make
> their work faster, clearer, safer, and more intelligent.

The product should feel like serious professional accounting software
rather than a generic AI dashboard.

------------------------------------------------------------------------

## 2. Target Users

### Primary users

-   Experienced accountants
-   Finance professionals
-   Business owners
-   Finance managers
-   Bookkeepers
-   Users familiar with Tally/ERP-style accounting workflows
-   Small and medium Indian businesses

### User expectations

The interface should allow an experienced user to quickly understand:

-   Which business they are working in
-   Which financial year is active
-   What requires attention
-   Where transactions are located
-   Where sales, purchases, expenses, customers and vendors are managed
-   Where GST and reports are located
-   What AI assistance is available

------------------------------------------------------------------------

## 3. Product Design Direction

### Swiss Minimalist

The application uses a Swiss Minimalist / International Typographic
Style direction.

Design characteristics:

-   Strong typography
-   Strict grid alignment
-   High contrast
-   Purposeful whitespace
-   Thin dividers
-   Restrained color palette
-   Minimal decoration
-   Strong table readability
-   Clear numerical hierarchy
-   Subtle motion

Avoid:

-   Excessive gradients
-   Excessive rounded cards
-   Neon colors
-   Rainbow dashboards
-   Decorative animations
-   Excessive shadows
-   Gamification
-   Childish illustrations
-   Generic AI-chatbot visual language

The application should communicate:

**Precision · Trust · Control · Intelligence**

------------------------------------------------------------------------

## 4. Product Vision

The long-term product should evolve into:

``` text
                    AI ACCOUNTING
                         |
             +-----------+-----------+
             |                       |
         FRONTEND                  BACKEND
         Next.js                  NestJS
             |                       |
             +---------- API --------+
                         |
                    PostgreSQL
                         |
        +----------------+----------------+
        |                |                |
     Accounting        GST             AI Layer
        |                                 |
   Transactions                     OpenRouter
   Sales / Invoices
   Purchases
   Expenses
   Banking
   Customers
   Vendors
   Reports
```

------------------------------------------------------------------------

## 5. Long-Term Product Modules

The following are future product areas. They are not all Sprint 1
implementation requirements.

### Workspace

-   Dashboard
-   Transactions
-   Sales
-   Purchases
-   Expenses
-   Banking

### Contacts

-   Customers
-   Vendors

### Compliance

-   GST
-   Reports

### Intelligence

-   AI Assistant
-   AI document processing
-   AI review queue
-   AI insights

### System

-   Business settings
-   Users and roles
-   Audit log
-   Notifications

------------------------------------------------------------------------

## 6. India-Specific Product Context

The product is designed for India and should support concepts such as:

-   INR currency
-   GSTIN
-   PAN
-   Indian financial years, e.g. FY 2026--27
-   Indian business types such as Proprietorship, Partnership, LLP,
    Private Limited, Public Limited, Trust, Society, etc.
-   GST-related accounting workflows
-   Indian accounting terminology

The initial Sprint 1 specification keeps actual GST functionality out of
the detailed sprint scope. GSTIN/financial-year requirements appear in
the higher-level FRD and prototype requirements, so the final schema
decision should be made deliberately rather than silently.

------------------------------------------------------------------------

## 7. Sprint 1 Product Goal

Sprint 1 establishes the foundation required for every later module.

### Target user journey

``` text
Signup
  |
  v
Login
  |
  v
JWT authentication
  |
  v
Create Business / Organization
  |
  v
Owner membership
  |
  v
Protected Dashboard
```

The dashboard is initially a stub and may show placeholder metrics.

------------------------------------------------------------------------

## 8. Sprint 1 Scope

### In scope

-   User signup
-   User login
-   User logout
-   Secure password hashing
-   JWT authentication
-   Authentication guards
-   Basic RBAC framework
-   Organization creation
-   User/organization membership
-   Owner role assignment
-   Tenant isolation
-   PostgreSQL schema and migrations
-   NestJS REST API foundation
-   Next.js authentication/onboarding UI
-   Dashboard stub
-   Environment configuration
-   Docker foundation
-   CI/CD foundation
-   Unit/integration tests
-   Developer documentation

### Out of scope for Sprint 1

-   Actual invoicing/accounting engine
-   Ledger implementation
-   AI/LLM features
-   OpenRouter integration
-   GST integrations
-   Payments
-   Bank reconciliation
-   Advanced reporting
-   Mobile application/PWA
-   Social login
-   Email-based password reset as a required feature
-   Advanced invitations

------------------------------------------------------------------------

## 9. Success Criteria

Sprint 1 is successful when:

1.  A new user can register.
2.  The password is stored only as a secure hash.
3.  The user can log in and receive a JWT.
4.  Protected APIs reject missing/invalid authentication.
5.  The user can create an organization.
6.  The creating user receives the Owner role.
7.  The user can access the protected dashboard.
8.  A user can only list/access organizations they belong to.
9.  Database migrations run reliably.
10. Authentication and organization flows have automated tests.
11. The existing frontend can communicate with the NestJS backend.

------------------------------------------------------------------------

## 10. Product Architecture

### Frontend

**Next.js**

Responsibilities:

-   UI
-   Navigation
-   Forms
-   Client-side validation
-   API integration
-   Authentication state
-   Dashboard presentation

### Backend

**NestJS**

Responsibilities:

-   Authentication
-   Authorization
-   Organization management
-   Validation
-   Business rules
-   Tenant isolation
-   Database access
-   REST APIs

### Database

**PostgreSQL**

Initial entities:

-   Users
-   Organizations
-   User Organizations

### Future AI gateway

**OpenRouter**

AI functionality is deliberately separated from the Sprint 1 foundation.

------------------------------------------------------------------------

## 11. Tenant Model

An organization is the application's tenant.

Conceptually:

``` text
User
  |
  v
UserOrganization membership
  |
  v
Organization
  |
  v
Organization-owned data
```

Every future tenant-owned table must be organization-scoped.

The backend must never trust a client-provided organization ID without
verifying membership.

------------------------------------------------------------------------

## 12. User Roles

Organization-level roles:

-   Owner
-   Admin
-   Accountant
-   Viewer

Sprint 1 primarily implements the Owner role.

The user who creates an organization becomes its Owner.

------------------------------------------------------------------------

## 13. Future AI Vision

AI should assist accounting professionals rather than replace their
control.

Examples of future capabilities:

-   Explain financial changes
-   Identify unusual transactions
-   Find overdue receivables
-   Suggest transaction categorization
-   Extract invoice/receipt information
-   Detect possible duplicate transactions
-   Identify GST-related review items
-   Summarize financial performance
-   Surface action-required items

The accountant remains the final decision-maker.

------------------------------------------------------------------------

## 14. Product Quality Bar

The application should feel like software that a professional accountant
could use every day.

It should prioritize:

-   Correctness
-   Security
-   Auditability
-   Readability
-   Predictability
-   Fast workflows
-   Clear financial information
-   Strong tenant isolation

Do not optimize only for visual novelty.

------------------------------------------------------------------------

## 15. Roadmap Direction

### Phase 1 --- Foundation

Authentication, organizations, tenant isolation, database and API
foundation.

### Phase 2 --- Core Accounting

Transactions, accounts, sales, purchases, expenses, customers, vendors.

### Phase 3 --- Banking & GST

Bank accounts, reconciliation workflows, GST workflows and compliance
support.

### Phase 4 --- Reporting

Profit & Loss, Balance Sheet, Trial Balance, General Ledger, Cash Flow,
receivables and payables.

### Phase 5 --- AI Accounting

AI assistant, document extraction, review queue, categorization and
financial insights.

### Phase 6 --- Production Hardening

Security hardening, auditability, observability, performance,
deployment, backups and reliability.

------------------------------------------------------------------------

## 16. Product Principles

1.  Security before convenience.
2.  Tenant isolation is mandatory.
3.  AI must be explainable enough to review.
4.  The accountant remains in control.
5.  Do not hide important accounting information.
6.  Prefer established accounting terminology.
7.  Keep workflows predictable.
8.  Preserve the existing prototype UI when integrating the backend.
9.  Do not build future modules before the foundation is stable.
10. Every major feature should have tests.

------------------------------------------------------------------------

## 17. Source Basis

The Sprint 1 requirements in this PRD are based on the supplied **Sprint
1 -- Project Foundation** specification. That document defines the
Next.js + NestJS + PostgreSQL foundation, JWT authentication,
organization management, multi-tenancy, API contracts, database schema,
UI flow, acceptance criteria, tests, deployment/environment requirements
and Sprint 1 task plan.

See the accompanying `FRD.md` for detailed functional requirements.
