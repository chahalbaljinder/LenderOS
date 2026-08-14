# LenderOS — AI Baseline

**Generated:** 2026-08-15  
**Source:** Verified from repository inspection + `CURRENT_STATE_REPORT.md`

---

## 1. Repository Structure

```
LenderOS/
├── AGENTS.md                           # Canonical agent instructions
├── CURRENT_STATE_REPORT.md             # Full current-state audit
├── README.md                           # Project overview
├── ROUTES.md                           # Route reference (minimal)
├── ROADMAP.md                          # Product roadmap
├── BUSINESS_OVERVIEW.md                # Business context
├── DEMO_CREDENTIALS.md                 # Demo accounts
├── package.json                        # Workspace root (pnpm)
├── pnpm-workspace.yaml                 # Workspace config + catalog
├── tsconfig.json / tsconfig.base.json  # TypeScript config
├── docker-compose.yml                  # PostgreSQL 16
├── .env / .env.example                 # Environment variables
├── artifacts/
│   ├── api-server/                     # Express 5 API (port 5000)
│   │   ├── src/
│   │   │   ├── app.ts                  # Express factory, middleware chain
│   │   │   ├── index.ts                # Entry point
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts             # Auth logic (Clerk + demo fallback)
│   │   │   │   ├── idgen.ts            # ID generation (SHA-256 hash)
│   │   │   │   ├── logger.ts           # Pino logger
│   │   │   │   └── demoData.ts         # Demo data constants
│   │   │   ├── middlewares/
│   │   │   │   ├── clerkProxyMiddleware.ts
│   │   │   │   ├── rateLimiter.ts      # 3-tier in-memory rate limiting
│   │   │   │   └── rbac.ts             # Role-based access control
│   │   │   ├── routes/
│   │   │   │   ├── index.ts            # Route aggregation
│   │   │   │   ├── health.ts           # Health check
│   │   │   │   ├── tenants.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── customers.ts
│   │   │   │   ├── loanProducts.ts
│   │   │   │   ├── loanApplications.ts
│   │   │   │   ├── kyc.ts
│   │   │   │   ├── risk.ts
│   │   │   │   ├── offers.ts
│   │   │   │   ├── loans.ts
│   │   │   │   ├── repayments.ts
│   │   │   │   ├── collections.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── settings.ts
│   │   │   ├── seed.ts                 # Demo data seeding
│   │   │   └── seed-users.ts           # User seeding helpers
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── lending-os/                     # React 19 frontend (port 5173)
│   │   ├── src/
│   │   │   ├── App.tsx                 # Root: routing, providers, auth
│   │   │   ├── main.tsx                # Entry point
│   │   │   ├── index.css               # Tailwind 4 + CSS variables (theme)
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   └── dashboard-layout.tsx
│   │   │   │   └── ui/                 # 40+ shadcn-style components
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── pages/
│   │   │       ├── apply.tsx           # Complete 5-step customer flow
│   │   │       ├── dashboard-super.tsx
│   │   │       ├── dashboard-tenant.tsx
│   │   │       ├── landing.tsx
│   │   │       ├── settings.tsx
│   │   │       ├── placeholder.tsx
│   │   │       ├── applications/list.tsx
│   │   │       ├── customers/list.tsx
│   │   │       ├── loans/list.tsx
│   │   │       ├── collections/list.tsx
│   │   │       ├── products/list.tsx
│   │   │       ├── tenants/list.tsx
│   │   │       └── audit/list.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── mockup-sandbox/                 # UI component testing
├── lib/
│   ├── api-spec/                       # OpenAPI 3.1 + Orval
│   │   ├── openapi.yaml                # Single source of truth
│   │   ├── orval.config.ts
│   │   └── package.json
│   ├── api-zod/                        # Generated Zod schemas
│   ├── api-client-react/               # Generated React Query hooks + customFetch
│   │   └── src/custom-fetch.ts         # Auth header logic (P0 bug here)
│   └── db/                             # Drizzle ORM
│       └── src/
│           ├── index.ts                # Drizzle instance + pool
│           └── schema/
│               ├── index.ts
│               ├── tenants.ts
│               ├── users.ts
│               ├── customers.ts
│               ├── loanProducts.ts
│               ├── loanApplications.ts
│               └── loans.ts
├── scripts/
│   ├── dev.mjs                         # Concurrent dev runner
│   ├── setup.mjs                       # One-time setup
│   └── ...
└── docs/                               # Project documentation
```

---

## 2. Frontend Architecture

- **Framework:** React 19.1.0 (pinned)
- **Build:** Vite 7.3.2
- **Routing:** Wouter 3.3.5 (client-side, no React Router)
- **State/Server:** TanStack Query 5.90.21
- **Styling:** Tailwind CSS 4.1.14 + CSS variables (dark theme)
- **UI Components:** 40+ shadcn-style components (Radix primitives)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Auth:** `@clerk/react` (ClerkProvider in App.tsx)
- **Theme:** ThemeProvider (dark-only, localStorage persistence)

**Key Files:**
- `artifacts/lending-os/src/App.tsx` — Routing, ClerkProvider, DashboardRoute, role detection
- `artifacts/lending-os/src/components/layout/dashboard-layout.tsx` — Sidebar, Header, DemoRoleSwitcher
- `artifacts/lending-os/src/index.css` — Design tokens (CSS variables)

---

## 3. Backend Architecture

- **Framework:** Express 5
- **Language:** TypeScript 5.9 strict
- **Logging:** Pino HTTP
- **Database:** Drizzle ORM → PostgreSQL 16
- **Auth:** `@clerk/express` middleware + demo fallback
- **Rate Limiting:** 3 tiers (in-memory store)
- **CORS:** Credentials enabled, origin allowlist
- **Validation:** Zod (generated from OpenAPI)

**Middleware Chain (app.ts):**
1. Pino HTTP logging (skip in test)
2. Clerk proxy middleware (before body parsers)
3. CORS (credentials: true)
4. JSON/URL-encoded body parsers
5. General rate limiter (100 req/15min)
6. Clerk middleware (if configured)
7. Auth rate limiter (20 req/15min) on `/api/auth`, `/api/sign-in`, `/api/sign-up`
8. Strict rate limiter (30 req/15min) on `/api/tenants`, `/api/users`
9. Router mounted at `/api`

**Key Files:**
- `artifacts/api-server/src/app.ts` — Express factory
- `artifacts/api-server/src/lib/auth.ts` — `requireAuth`, `getOrCreateUser`, demo mode logic
- `artifacts/api-server/src/middlewares/rbac.ts` — Role hierarchy + middleware functions
- `artifacts/api-server/src/routes/index.ts` — Route aggregation

---

## 4. Database Entities

**Core Tables (6):**

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `tenants` | Lending organizations | id, name, type (nbfc/bank/lsp/fintech), status, contact_email, totals |
| `users` | Platform + tenant users | id, clerk_id, email, role (14 values), tenant_id, is_active |
| `customers` | Borrowers | id, tenant_id, name, email, phone, pan, kyc_status, credit_score, employment |
| `loan_products` | Product catalog | id, tenant_id, name, type, min/max amount/tenure, rate, fees |
| `loan_applications` | Application lifecycle | id, customer_id, tenant_id, product_id, amounts, status (13 values), risk_score/grade |
| `loans` | Active loans | id, application_id, customer_id, tenant_id, principal, outstanding, emi, dpd, status |

**Related Tables:**
- `tenant_settings` — Per-tenant UI/config settings
- `kyc_records` — PAN/Aadhaar/Face/Employment verification per application
- `risk_scores` — Computed risk breakdown (credit, income, DTI, employment, fraud)
- `loan_offers` — Generated offers with amounts, rates, EMI, expiry
- `repayments` — Schedule + payment records per loan
- `collections` — Overdue tracking, priority, assignment, AI score
- `audit_logs` — Action logging (table exists, no middleware observed)
- `api_keys` — Tenant API credentials

**Enums (pgEnum):**
- `tenant_type`: nbfc, bank, lsp, fintech
- `tenant_status`: active, pending, suspended, inactive
- `user_role`: 14 roles (super_admin → compliance_officer)
- `kyc_status`: pending, partial, verified, rejected
- `customer_status`: active, inactive, blacklisted
- `application_status`: draft, submitted, under_review, kyc_pending, kyc_verified, risk_assessment, offer_generated, offer_accepted, esign_pending, approved, disbursed, rejected, withdrawn
- `loan_status`: active, closed, npa, written_off
- `repayment_status`: pending, paid, overdue, partial
- `loan_type`: personal, business, msme, education, medical, home, gold, vehicle, salary_advance, bnpl, credit_line
- `employment_type`: salaried, self_employed, business, student, retired

**PK Strategy:** UUID via `genId()` (SHA-256 hash of seed string, first 32 chars)
**No Migration System:** `pnpm db:push` only (dev workflow)

---

## 5. API Inventory

**Contract Layer:** `lib/api-spec/openapi.yaml` → Orval → `@workspace/api-zod` + `@workspace/api-client-react`

**Route Groups (all under `/api`):**

| Route File | Endpoints | Auth Middleware |
|------------|-----------|-----------------|
| `health.ts` | `GET /healthz` | None |
| `tenants.ts` | CRUD + stats + approve | `requireAuth`, `requireSuperAdmin()`, `ensureTenantAccess` |
| `users.ts` | CRUD | `requireAuth` + RBAC |
| `customers.ts` | CRUD + credit report | `requireAuth` |
| `loanProducts.ts` | CRUD | `requireAuth` |
| `loanApplications.ts` | CRUD + submit/approve/reject/disburse | `requireAuth` |
| `kyc.ts` | KYC status/update | `requireAuth` |
| `risk.ts` | Risk scoring | `requireAuth` |
| `offers.ts` | Offer CRUD + accept | `requireAuth` |
| `loans.ts` | Loan CRUD | `requireAuth` |
| `repayments.ts` | Repayment schedule/record | `requireAuth` |
| `collections.ts` | Collection CRUD + actions | `requireAuth` |
| `analytics.ts` | Platform/tenant analytics | `requireAuth` + RBAC |
| `settings.ts` | Settings CRUD | `requireAuth` |

**Generated Client (api-client-react):**
- Hooks: `useGetMe()`, `useListTenants()`, `useListCustomers()`, `useListLoanApplications()`, `useListLoans()`, `useListCollections()`, `useListLoanProducts()`, `useListAuditLogs()`, `useGetTenantDashboard()`, `useCreateLoanApplication()`, etc.
- All use `customFetch` from `lib/api-client-react/src/custom-fetch.ts`

---

## 6. Frontend Route Inventory

| Route | Component | Access | Status |
|-------|-----------|--------|--------|
| `/` | `LandingPage` | Public | Working |
| `/sign-in/*` | `SignInPage` | Public | Clerk or demo fallback |
| `/sign-up/*` | `SignUpPage` | Public | Clerk or demo fallback |
| `/dashboard` | `DashboardRoute` → Super/Tenant | Protected | **Broken in Clerk mode** |
| `/tenants` | `TenantsList` | Super/Platform Admin | Working |
| `/tenants/new` | `NewTenantPage` (Placeholder) | Super/Platform Admin | Placeholder |
| `/tenants/:tenantId` | `TenantDetailPage` (Placeholder) | Super/Platform Admin | Placeholder |
| `/applications` | `ApplicationsList` | Tenant roles | Working |
| `/applications/new` | `NewApplicationPage` (Placeholder) | Tenant roles | Placeholder |
| `/applications/:applicationId` | `ApplicationDetailPage` (Placeholder) | Tenant roles | Placeholder |
| `/customers` | `CustomersList` | Tenant roles | Working |
| `/customers/new` | **NOT IN ROUTER** | — | **Broken (sidebar links to it)** |
| `/loans` | `LoansList` | Tenant roles | Working |
| `/loans/new` | **NOT IN ROUTER** | — | **Broken (sidebar links to it)** |
| `/collections` | `CollectionsList` | Tenant roles | Working |
| `/products` | `ProductsList` | Tenant roles | Working |
| `/products/*` | `ProductsList` (catch-all) | Tenant roles | Wildcard |
| `/audit` | `AuditList` | Tenant roles | Working |
| `/audit/*` | `AuditList` (catch-all) | Tenant roles | Wildcard |
| `/settings` | `SettingsPage` | Tenant roles | Working (mock save) |
| `/settings/*` | `SettingsPage` (catch-all) | Tenant roles | Wildcard |
| `/platform/analytics` | `PlatformAnalyticsPage` (Placeholder) | Super/Platform Admin | Placeholder |
| `/apply` | `CustomerApply` | Public | **Complete 5-step flow** |
| `/*` | `NotFound` | — | Catch-all 404 |

---

## 7. Authentication Flow

```
Request
  ├─ x-demo-user-id header? → Demo mode, use as clerkId
  └─ Clerk configured?
       ├─ YES → getAuth(req) → clerkId from session cookie
       └─ NO → Demo mode? → clerkId = "user_demo_super_admin" : 401
  ↓
getOrCreateUser(clerkId)
  ├─ Found by clerkId → Return user
  ├─ Demo clerkId → Map to seeded email → Update clerkId → Return
  ├─ Email provided → Create customer user → Return
  └─ No email → null → 401 (prod) / Continue (demo)
  ↓
Attach: req.clerkId, req.userRole, req.user
```

**Demo Mode:** 4 seeded users → localStorage `lenderos_demo_user_id` → `x-demo-user-id` header
- `user_demo_super_admin` → super_admin (Arjun Sharma)
- `user_demo_tenant_admin_t1` → tenant_admin (Priya Mehta, CapitalFirst)
- `user_demo_rm_t2` → relationship_manager (Rahul Gupta, Swift Fintech)
- `user_demo_customer_c1` → customer (Vikram Singh)

**Clerk Mode (Broken):**
- Frontend: `ClerkProvider` with `publishableKey`, `proxyUrl`, `routerPush/replace`
- `customFetch` sends `credentials: "include"` but **never calls `setAuthTokenGetter`**
- No Bearer token attached → `/api/users/me` returns 401 → `useGetMe()` fails → redirect to `/`

---

## 8. RBAC

**Role Hierarchy (numeric levels):**
- super_admin (100) > platform_admin (90) > tenant_owner (80) > tenant_admin (70)
- risk_manager (60) > loan_manager (50) > collection_manager (40)
- customer_support (30) > sales_agent (20) > dsa (15) > relationship_manager (10)
- customer / auditor / compliance_officer (5)

**Backend Middleware (rbac.ts):**
- `requireRole(...roles)` — minimum level check
- `requireSuperAdmin()` — super_admin, platform_admin
- `requireTenantAdmin()` — super_admin, platform_admin, tenant_owner, tenant_admin
- `requireTenantAccess()` — all tenant roles (10 roles)
- `requireCustomerAccess()` — all roles including customer
- `ensureTenantAccess()` — tenant isolation: super/platform bypass, others must match `user.tenantId`

**Frontend RBAC:** Partial — sidebar differs by `isSuper` (super_admin/platform_admin vs others). All tenant roles see identical sidebar. No per-role route guards.

---

## 9. Tenant Isolation

**Backend:** `ensureTenantAccess()` middleware checks `user.tenantId` against route param/body/query `tenantId`. Super/platform admins bypass.

**Frontend:** Relies on `user.tenantId` from `useGetMe()` for API calls. No independent enforcement.

**Database:** All lending tables have `tenant_id` FK → `tenants.id`. Queries in routes filter by tenant where applicable.

---

## 10. Existing Workflows

### Working (Complete Vertical)
1. **Customer Application** (`/apply`): 5-step wizard → `POST /api/loan-applications` → draft application created

### Backend-Complete, Frontend-Partial
2. **Application Lifecycle**: `POST /loan-applications` → `submit` → `approve` → `disburse` (creates loan + repayment schedule) → `loans` → `repayments` → `collections`
3. **Tenant Onboarding**: `POST /tenants` (pending) → `POST /tenants/:id/approve` (active) → `GET /tenants/:id/stats`

### Frontend-Only (Mock)
4. **Settings**: Full UI, save is mock (no API)
5. **Dashboards**: Real API calls but charts use hardcoded mock data

---

## 11. Working Features

- ✅ Monorepo (pnpm workspaces)
- ✅ Database schema + seed data
- ✅ OpenAPI → Zod + React Query hooks (contract-first)
- ✅ All backend API routes implemented
- ✅ Backend RBAC + tenant isolation
- ✅ Demo mode auth + role switching
- ✅ Landing page, dashboards, all list views
- ✅ Customer application flow (complete)
- ✅ Settings UI (comprehensive)
- ✅ UI component library (40+ components)
- ✅ Health checks, rate limiting, CORS, Clerk proxy

---

## 12. Partial Features

- ⚠️ **Authentication**: Demo works; Clerk transport broken
- ⚠️ **Application lifecycle**: Backend complete; frontend only list view
- ⚠️ **Tenant management**: Backend complete; frontend create/approve/detail are placeholders
- ⚠️ **Frontend RBAC**: Binary (super vs tenant); no granularity
- ⚠️ **Dashboard data**: Real API but mock charts
- ⚠️ **Pagination**: UI exists, `onPageChange` is no-op
- ⚠️ **Settings**: Full UI, mock save
- ⚠️ **KYC/Risk/Offers**: Backend routes exist; no frontend
- ⚠️ **Collections actions**: Backend routes exist; frontend only list

---

## 13. Broken Features

- ❌ **Clerk authentication** — login flashes → redirect to `/` (P0)
- ❌ **Missing routes** — `/customers/new`, `/loans/new` linked in sidebar but not routed
- ❌ **Wildcard routes** — `/products/*`, `/audit/*`, `/settings/*` mask missing detail pages
- ❌ **Dark theme contrast** — WCAG AA failures (invisible text/buttons/inputs)
- ❌ **Dashboard auth redirect** — `DashboardRoute` redirects after brief render

---

## 14. Placeholder Routes

| Route | Component | Notes |
|-------|-----------|-------|
| `/tenants/new` | `NewTenantPage` | Placeholder |
| `/tenants/:tenantId` | `TenantDetailPage` | Placeholder |
| `/applications/new` | `NewApplicationPage` | Placeholder |
| `/applications/:applicationId` | `ApplicationDetailPage` | Placeholder |
| `/platform/analytics` | `PlatformAnalyticsPage` | Placeholder |

---

## 15. Mock Data

| Location | What |
|----------|------|
| `dashboard-super.tsx:17-25` | Revenue chart data (7 months) |
| `dashboard-tenant.tsx:21-26` | Disbursals vs Collections trend (4 weeks) |
| `dashboard-tenant.tsx:167` | Hardcoded "12" high-priority collections |
| `dashboard-tenant.tsx:175` | Hardcoded "4" KYC exceptions |
| `settings.tsx` | All form values, switches, badges, API keys |
| `apply.tsx:588` | Random REF_ID on success |

---

## 16. Test Baseline

| Package | Test File | Tests | Status |
|---------|-----------|-------|--------|
| `@workspace/api-server` | `src/routes/health.test.ts` | 5 | Passing |

**Coverage:** Health endpoint only. No auth, RBAC, tenant isolation, or lending lifecycle tests.

---

## 17. Build/Typecheck Baseline

**Typecheck:** **FAILING** — Multiple TS errors in `artifacts/api-server/src/routes/`:
- `collections.ts`: `eq()` with `string | string[]` (pre-existing, AGENTS.md #001)
- `customers.ts`: Enum type mismatches (employmentType, status)
- `kyc.ts`: Param type mismatches (`string | string[]` vs `string`)

**Build:** Not tested (typecheck blocks)

**Prettier:** Not tested

---

## 18. P0/P1/P2 Issues

### P0 (Blockers)
1. **Clerk auth transport broken** — `custom-fetch.ts` + `App.tsx` — no token getter registered
2. **Missing routes** — `/customers/new`, `/loans/new` — sidebar links to 404
3. **Dashboard auth redirect loop** — `DashboardRoute` flashes then redirects

### P1 (Major)
4. **Placeholder pages** — 5 key routes show `PlaceholderPage`
5. **Dark theme contrast** — WCAG AA violations in `index.css` + `App.tsx` Clerk appearance
6. **No Clerk token getter registration** — Root cause of P0 #1
7. **Wildcard routes** — Mask missing detail pages
8. **In-memory rate limiting** — Not production-ready (AGENTS.md #002)

### P2 (Important)
9. No breadcrumbs
10. Mock dashboard data
11. Settings save is mock
12. Pagination no-op
13. No light theme
14. Hardcoded demo user IDs (seed ↔ auth coupling)
15. Only 5 tests (health)

---

## 19. Recommended Next Task

**Start M1 — Authentication Foundation**

**Objective:** Fix Clerk authentication transport without breaking demo mode.

**Smallest Safe Change:**
1. In `artifacts/lending-os/src/App.tsx`: Import `useAuth` from `@clerk/react`, call `setAuthTokenGetter(() => clerk.getToken())` inside a `useEffect` or component that has access to Clerk context
2. In `lib/api-client-react/src/custom-fetch.ts`: Ensure `credentials: "include"` works with Clerk proxy (already set)
3. Verify: Signup → Login → `/api/users/me` → Protected dashboard → Logout → Re-login → Role switching

**Files to Modify:**
- `artifacts/lending-os/src/App.tsx` (add Clerk token getter)
- `lib/api-client-react/src/custom-fetch.ts` (verify no regression)

**Exit Criteria (from 02_MILESTONES.md):**
- Clerk login works
- Protected routes remain protected
- `/api/users/me` works
- Demo mode still works
- Unauthorized users cannot access protected APIs
- Multiple roles resolve correctly

---

**Milestone Status:** `M0 — COMPLETE` (Baseline verified) → `M1 — ACTIVE` (Next)