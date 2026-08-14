# LenderOS — Master Product & Development Plan

**Status:** Baseline planning document  
**Purpose:** Single source of truth for the AI coding agent and future project work  
**Rule:** The repository and verified current-state evidence take precedence over assumptions.

---

## 1. Product Definition

LenderOS is a multi-tenant lending operating system with three primary product POVs:

1. **Borrower** — wants a loan and manages their application/loan.
2. **NBFC / Lender** — originates, reviews, approves, disburses, services and collects loans.
3. **Platform Owner** — operates LenderOS across multiple lending tenants.

The product must eventually support a complete lending lifecycle:

`Customer → Profile → KYC/Documents → Application → Review → Risk → Decision → Offer → Acceptance → Disbursement → Loan → Repayment → Collections → Closure`

The current repository already contains a substantial backend/domain foundation. The project must be evolved from that foundation rather than rebuilt blindly.

---

## 2. Verified Starting Point

According to `CURRENT_STATE_REPORT.md`, the project is approximately 55% implemented.

### Existing foundation

- pnpm monorepo
- React 19 + Vite frontend
- Express 5 API
- PostgreSQL + Drizzle
- OpenAPI 3.1 → Orval → Zod + React Query contract-first flow
- Clerk + demo authentication modes
- Backend RBAC and tenant-isolation helpers
- Lending domain tables and APIs
- Working dashboards and list views
- Working public customer application flow
- Seed/demo data

### Current major blockers

1. Clerk authentication transport is broken.
2. Missing and placeholder routes exist.
3. Frontend detail/action workflows are incomplete.
4. Frontend and backend capabilities are not fully connected.
5. Dark theme has accessibility/contrast problems.
6. Dashboards contain mock data.
7. Audit table exists but automatic audit middleware is not observed.
8. Test coverage is minimal.
9. In-memory rate limiting is not suitable for multi-instance production.

### Current working customer flow

`/apply → product → personal/KYC → financial details → review/submit → application reference`

### Existing backend lifecycle

`create application → submit → approve → disburse → loan → repayments → collections`

The backend has more capability than the current frontend exposes.

---

## 3. Product Architecture

### Borrower experience

- Registration/authentication
- Profile
- Documents/KYC
- Loan products
- Application
- Application status
- Offer
- Acceptance
- Loan
- Repayment
- Notifications/support

### NBFC experience

- Command center
- Customers
- Applications
- KYC
- Risk/credit
- Offers
- Disbursement
- Loans
- Repayments
- Collections
- Reports/analytics
- Staff/users
- Audit/compliance
- Settings

### Platform-owner experience

- Platform overview
- Tenant onboarding
- Tenant management
- Tenant users
- Platform analytics
- Platform monitoring
- Integrations/configuration
- Audit/governance

---

## 4. Role Model

### Platform

- `super_admin`
- `platform_admin`

### NBFC / Tenant

- `tenant_owner`
- `tenant_admin`
- `sales_agent`
- `dsa`
- `relationship_manager`
- `risk_manager`
- `loan_manager`
- `collection_manager`
- `customer_support`
- `compliance_officer`
- `auditor`

### Borrower

- `customer`

Do not invent new roles unless a demonstrated product requirement requires one.

For every role, define:

- purpose
- responsibilities
- accessible modules
- allowed actions
- data scope
- prohibited actions
- dashboard objective

---

## 5. Core Product Principle

**Build vertical workflows, not disconnected pages.**

A feature is not complete because a screen exists.

Example:

`Approve Application`

must connect:

`UI → permission → API → business rule → DB → status transition → audit → notification/state refresh`

---

## 6. Golden Product Loop

The first complete end-to-end business workflow should be:

### Borrower

1. Create/complete profile
2. Submit application
3. Upload/provide required information
4. Track status

### NBFC

5. Receive application
6. Review application
7. Review KYC/documents
8. Assess risk
9. Approve/reject/request information
10. Generate offer
11. Prepare disbursement

### Borrower

12. Review and accept offer

### NBFC

13. Disburse
14. Create/activate loan
15. Generate repayment schedule
16. Record/manage repayments
17. Handle overdue accounts through collections

---

## 7. Target Information Architecture

### Borrower

- Home
- Profile
- Documents
- Applications
- Offers
- Loans
- Repayments
- Notifications
- Support

### NBFC

- Overview
- Customers
- Applications
- Credit/Risk
- Offers
- Loans
- Disbursements
- Repayments
- Collections
- Analytics
- Reports
- Users
- Roles
- Audit
- Settings

### Platform

- Overview
- Tenants
- Tenant details
- Tenant users
- Analytics
- Monitoring
- Integrations
- Audit
- Configuration

---

## 8. Target RBAC Model

Permissions must be evaluated at:

`Role + Permission + Scope`

Possible scopes:

- Platform
- Tenant
- Assigned
- Own

Possible actions:

- View
- Create
- Edit
- Approve
- Reject
- Assign
- Disburse
- Collect
- Export
- Configure
- Audit

Example:

A Collection Agent may view and act on assigned collection accounts, but cannot approve loans or modify tenant configuration.

---

## 9. Development Principles

1. Inspect before changing.
2. Reuse existing APIs/models/components where appropriate.
3. Prefer existing OpenAPI-generated contracts.
4. Do not duplicate APIs.
5. Do not hide broken routes with catch-all routes.
6. Do not bypass authentication to make tests pass.
7. Preserve tenant isolation.
8. Make state transitions explicit.
9. Every critical financial action should be auditable.
10. Every feature must be tested through its actual workflow.
11. Documentation is updated with meaningful architectural changes.
12. One milestone/task at a time.

---

## 10. Implementation Sequence

### M0 — Baseline
Verified repository, route, API, DB, RBAC and test inventory.

### M1 — Authentication Foundation
Fix Clerk transport and verify protected routes.

### M2 — Routing & Navigation
Remove broken links/placeholders and align navigation with real destinations.

### M3 — Application Review
Build application detail/review and decision UI using existing APIs.

### M4 — Offer & Acceptance
Complete offer generation, display and borrower acceptance.

### M5 — Disbursement & Loan
Complete disbursement, loan creation/detail and repayment schedule.

### M6 — Collections
Complete overdue queues, assignment and collection actions.

### M7 — RBAC UX
Make navigation, actions and pages role-aware.

### M8 — Tenant Operations
Complete tenant administration, users, roles and operational settings.

### M9 — Platform Operations
Complete tenant onboarding, platform management and analytics.

### M10 — Data & Governance
Replace mock analytics, add audit middleware, improve rate limiting and operational controls.

### M11 — UX & Accessibility
Move to a light-first professional lending SaaS theme and fix WCAG issues.

### M12 — Quality & Release
Expand automated tests and run complete end-to-end scenarios.

---

## 11. Definition of Done

A milestone/feature is complete only when:

- UX exists
- frontend is connected
- API works
- DB state is persisted
- permissions are enforced
- tenant isolation is verified
- validation exists
- loading/empty/error states exist
- audit is handled where required
- notifications/state refresh are handled where required
- typecheck passes
- relevant tests pass
- build passes
- end-to-end workflow is verified
- documentation is updated

---

## 12. What We Must Not Do

- Do not rebuild the application from scratch.
- Do not replace the current architecture without evidence.
- Do not implement every role simultaneously.
- Do not redesign the entire UI before stabilizing core workflows.
- Do not create fake frontend-only states for lending actions.
- Do not use mock data where a real API already exists.
- Do not mark a feature complete because a page renders.
- Do not move to the next milestone while the current milestone's exit criteria are failing.
