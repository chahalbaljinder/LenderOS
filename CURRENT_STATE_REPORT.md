# LenderOS — Current Project State

## 1. Executive Summary

- **Multi-tenant lending OS** with React 19 frontend, Express 5 API, PostgreSQL/Drizzle backend
- **Monorepo** (pnpm workspaces): 4 lib packages + 2 artifact apps (api-server, lending-os)
- **Authentication**: Dual-mode — Clerk (production) + Demo mode (localStorage-based role switching)
- **Database**: 6 core tables (tenants, users, customers, loan_products, loan_applications, loans) + related tables (kyc_records, risk_scores, loan_offers, repayments, collections, audit_logs, api_keys)
- **API Layer**: OpenAPI 3.1 spec → Orval → Zod schemas + React Query hooks (contract-first)
- **UI**: Dark theme, Tailwind 4, shadcn-style components, Wouter routing, TanStack Query
- **Current State**: Demo-ready MVP with working dashboards, list views, and customer application flow; auth transport bug in Clerk mode; many routes are placeholders

---

## 2. Tech Stack

| Technology | Current Implementation | Evidence/Location |
|------------|------------------------|-------------------|
| **React** | 19.1.0 (exact version pinned) | `pnpm-workspace.yaml:59`, `artifacts/lending-os/package.json` |
| **Vite** | 7.3.2 | `pnpm-workspace.yaml:65`, `artifacts/lending-os/vite.config.ts` |
| **Express** | 5.x | `artifacts/api-server/package.json`, `artifacts/api-server/src/app.ts` |
| **PostgreSQL** | 16 (via Docker) | `docker-compose.yml`, `lib/db/src/index.ts` |
| **Drizzle ORM** | 0.45.2 | `pnpm-workspace.yaml:55`, `lib/db/src/schema/*.ts` |
| **Clerk** | @clerk/react, @clerk/express | `artifacts/lending-os/src/App.tsx`, `artifacts/api-server/src/app.ts` |
| **Orval** | Codegen from OpenAPI | `lib/api-spec/orval.config.ts`, `lib/api-spec/openapi.yaml` |
| **Zod** | 4.0.0 | `pnpm-workspace.yaml:67`, `lib/api-zod`, `@workspace/api-zod` imports |
| **TypeScript** | 5.9.3 strict mode | `tsconfig.base.json`, `pnpm-workspace.yaml:26` |
| **TanStack Query** | 5.90.21 | `pnpm-workspace.yaml:48`, `artifacts/lending-os/src/App.tsx:28` |
| **Wouter** | 3.3.5 (routing) | `pnpm-workspace.yaml:66`, `artifacts/lending-os/src/App.tsx` |
| **Tailwind CSS** | 4.1.14 | `pnpm-workspace.yaml:62-63`, `artifacts/lending-os/src/index.css` |
| **pnpm** | 9+ (workspaces) | `pnpm-workspace.yaml`, `package.json:6` |
| **Vitest + Supertest** | API testing | `artifacts/api-server/src/routes/health.test.ts` |

---

## 3. Application Modules

| Module | Status | Files/Pages | Notes |
|--------|--------|-------------|-------|
| **Dashboard (Super Admin)** | Working | `dashboard-super.tsx` | Platform overview, tenant stats, revenue chart (mock data) |
| **Dashboard (Tenant)** | Working | `dashboard-tenant.tsx` | Command center with applications, disbursals, collections, revenue, action queue |
| **Customers** | List works | `customers/list.tsx` | DataTable with search/pagination; uses `useListCustomers` hook |
| **Loan Applications** | List works | `applications/list.tsx` | DataTable with status badges, risk grades; uses `useListLoanApplications` |
| **Loans** | List works | `loans/list.tsx` | DataTable with DPD tracking, summary cards (outstanding, active, overdue, NPA) |
| **Collections** | List works | `collections/list.tsx` | DataTable with DPD, priority, AI score; uses `useListCollections` |
| **Loan Products** | List works | `products/list.tsx` | DataTable; uses `useListLoanProducts` |
| **Tenants** | List works | `tenants/list.tsx` | DataTable; super_admin only; uses `useListTenants` |
| **Audit Logs** | List works | `audit/list.tsx` | DataTable; uses `useListAuditLogs` |
| **Settings** | UI complete | `settings.tsx` | 4-5 tabs (general, notifications, security, integrations, platform) - all mock UI |
| **Customer Apply Flow** | **Complete** | `apply.tsx` | 5-step wizard: Product → KYC → Financial → Review → Success; creates application via API |
| **Landing Page** | Complete | `landing.tsx` | Marketing page with demo mode entry points |
| **Platform Analytics** | Placeholder | `App.tsx:309` | `PlaceholderPage` component |
| **New Application** | Placeholder | `App.tsx:313` | `PlaceholderPage` |
| **Application Detail** | Placeholder | `App.tsx:317` | `PlaceholderPage` (dynamic route exists) |
| **New Tenant** | Placeholder | `App.tsx:322` | `PlaceholderPage` |
| **Tenant Detail** | Placeholder | `App.tsx:326` | `PlaceholderPage` (dynamic route exists) |

---

## 4. User Roles

| Role | Defined In | Permissions (Backend) | Dashboard | Frontend Access Control |
|------|------------|----------------------|-----------|------------------------|
| **super_admin** | `lib/db/src/schema/users.ts:13`, `rbac.ts:20` | Full platform access (`requireSuperAdmin()`) | Platform Overview | Sidebar shows: Dashboard, Tenants, Global Analytics |
| **platform_admin** | `users.ts:14`, `rbac.ts:21` | Same as super_admin | Platform Overview | Same as super_admin |
| **tenant_owner** | `users.ts:15`, `rbac.ts:22` | Tenant admin + tenant access | Command Center | Sidebar shows tenant modules |
| **tenant_admin** | `users.ts:16`, `rbac.ts:23` | Tenant admin + tenant access | Command Center | Sidebar shows tenant modules |
| **risk_manager** | `users.ts:17`, `rbac.ts:24` | Tenant access (`requireTenantAccess()`) | Command Center | Same tenant modules |
| **loan_manager** | `users.ts:18`, `rbac.ts:25` | Tenant access | Command Center | Same tenant modules |
| **collection_manager** | `users.ts:19`, `rbac.ts:26` | Tenant access | Command Center | Same tenant modules |
| **customer_support** | `users.ts:20`, `rbac.ts:27` | Tenant access | Command Center | Same tenant modules |
| **sales_agent** | `users.ts:21`, `rbac.ts:28` | Tenant access | Command Center | Same tenant modules |
| **dsa** | `users.ts:22`, `rbac.ts:29` | Tenant access | Command Center | Same tenant modules |
| **relationship_manager** | `users.ts:23`, `rbac.ts:30` | Tenant access | Command Center | Same tenant modules |
| **customer** | `users.ts:24`, `rbac.ts:31` | Customer access (`requireCustomerAccess()`) | Command Center | Same tenant modules (but limited by API) |
| **auditor** | `users.ts:25`, `rbac.ts:32` | Level 5 (minimal) | Command Center | Unclear - same UI as tenant users |
| **compliance_officer** | `users.ts:26`, `rbac.ts:33` | Level 5 (minimal) | Command Center | Unclear - same UI as tenant users |

**Key Observations**:
- **Backend RBAC**: Fully implemented in `artifacts/api-server/src/middlewares/rbac.ts` with role hierarchy (100→5) and middleware functions (`requireSuperAdmin`, `requireTenantAdmin`, `requireTenantAccess`, `requireCustomerAccess`, `ensureTenantAccess`)
- **Frontend RBAC**: Partial — sidebar links differ by `isSuper` flag (super_admin/platform_admin vs others), but no per-role route guards beyond that. All tenant roles see identical sidebar.
- **Demo Mode**: 4 seeded users map to roles: super_admin, tenant_admin, relationship_manager, customer (see `seed.ts:172-214`)

---

## 5. Route Map

| Route | Page/Component | Access | Status/Observation |
|-------|----------------|--------|-------------------|
| `/` | `LandingPage` | Public | Working — marketing page with demo entry |
| `/sign-in/*` | `SignInPage` | Public | Shows Clerk sign-in or demo fallback |
| `/sign-up/*` | `SignUpPage` | Public | Shows Clerk sign-up or demo fallback |
| `/dashboard` | `DashboardRoute` → `SuperAdminDashboard` / `TenantDashboard` | Protected | **Critical auth bug** — flashes then redirects in Clerk mode (AGENTS.md P0) |
| `/tenants` | `TenantsList` | Super/Platform Admin | Working list view |
| `/tenants/new` | `NewTenantPage` (Placeholder) | Super/Platform Admin | Placeholder only |
| `/tenants/:tenantId` | `TenantDetailPage` (Placeholder) | Super/Platform Admin | Placeholder only |
| `/applications` | `ApplicationsList` | Tenant roles | Working list view |
| `/applications/new` | `NewApplicationPage` (Placeholder) | Tenant roles | Placeholder only |
| `/applications/:applicationId` | `ApplicationDetailPage` (Placeholder) | Tenant roles | Placeholder only |
| `/customers` | `CustomersList` | Tenant roles | Working list view |
| `/customers/new` | **NOT IN ROUTER** | — | Sidebar links to it but route missing! |
| `/loans` | `LoansList` | Tenant roles | Working list view |
| `/loans/new` | **NOT IN ROUTER** | — | Sidebar links to it but route missing! |
| `/collections` | `CollectionsList` | Tenant roles | Working list view |
| `/products` | `ProductsList` | Tenant roles | Working list view |
| `/products/*` | `ProductsList` (catch-all) | Tenant roles | Wildcard route |
| `/audit` | `AuditList` | Tenant roles | Working list view |
| `/audit/*` | `AuditList` (catch-all) | Tenant roles | Wildcard route |
| `/settings` | `SettingsPage` | Tenant roles | Working — full UI, mock saves |
| `/settings/*` | `SettingsPage` (catch-all) | Tenant roles | Wildcard route |
| `/platform/analytics` | `PlatformAnalyticsPage` (Placeholder) | Super/Platform Admin | Placeholder only |
| `/apply` | `CustomerApply` | Public (customer) | **Complete 5-step flow** — creates application |
| `/*` | `NotFound` | — | Catch-all 404 |

**Route Issues Found**:
1. **Missing routes**: `/customers/new`, `/loans/new` — linked in sidebar but not in router
2. **Placeholder routes**: `/tenants/new`, `/tenants/:tenantId`, `/applications/new`, `/applications/:applicationId`, `/platform/analytics` — exist but show placeholder
3. **Wildcard routes**: `/products/*`, `/audit/*`, `/settings/*` — catch-all to list pages (may mask missing detail routes)
4. **Auth redirect bug**: `/dashboard` flashes then redirects to `/` in Clerk mode (see AGENTS.md)

---

## 6. Navigation

**Sidebar** (`dashboard-layout.tsx:46-116`):
- **Super Admin links**: Platform Overview (`/dashboard`), Tenants (`/tenants`), Global Analytics (`/platform/analytics`)
- **Tenant links**: Command Center (`/dashboard`), Applications (`/applications`), Customers (`/customers`), Loans (`/loans`), Collections (`/collections`), Products (`/products`), Audit Logs (`/audit`), Tenant Settings (`/settings`)

**Mismatches**:
| Sidebar Link | Router | Status |
|--------------|--------|--------|
| `/customers/new` (Add Customer button) | **Missing** | **Broken** — 404 |
| `/loans/new` (New Loan button) | **Missing** | **Broken** — 404 |
| `/applications/new` (New Application button) | Exists → Placeholder | Partial |
| `/tenants/new` | Exists → Placeholder | Partial |

**Header** (`dashboard-layout.tsx:226-260`):
- Demo role switcher (when not Clerk-configured)
- Sign out button (clears demo localStorage or redirects to Clerk sign-out)

**No breadcrumbs** observed in any page.

---

## 7. Current User Flows

### Flow 1: Demo Mode Login → Dashboard
```
Landing Page (/)
  → Click "Continue in Demo Mode" → /dashboard
  → DashboardRoute calls useGetMe() 
    → customFetch sends x-demo-user-id from localStorage
    → API returns user with role
  → DashboardRoute renders SuperAdminDashboard or TenantDashboard
  → Sidebar navigation works for list views
```
**Status**: Working in demo mode. **Broken in Clerk mode** (auth transport mismatch).

### Flow 2: Customer Application (Public)
```
/apply
  → Step 1: Select Product (fetches active products for tenant)
  → Step 2: Personal & KYC (form validation)
  → Step 3: Financial Details (employment, income, amount, purpose, tenure)
  → Step 4: Review & Submit (shows summary, consent)
  → Step 5: Success (shows reference ID)
  → API: POST /api/loan-applications (createApplication mutation)
```
**Status**: **Complete and functional** — creates draft application in DB.

### Flow 3: Application Lifecycle (Backend API exists, Frontend partial)
```
POST /loan-applications (draft)
  → POST /loan-applications/:id/submit (submitted)
  → POST /loan-applications/:id/approve (approved)
  → POST /loan-applications/:id/disburse (disbursed → creates loan + repayment schedule)
  → GET /loans (list active loans)
  → GET /repayments (schedule)
  → POST /collections (collection actions)
```
**Status**: Backend routes fully implemented. Frontend: only list views exist; no detail/review/approve/disburse UI.

### Flow 4: Tenant Onboarding (Super Admin)
```
GET /tenants (list)
  → POST /tenants (create, status=pending)
  → POST /tenants/:id/approve (activate)
  → GET /tenants/:id/stats (dashboard data)
```
**Status**: Backend complete. Frontend: list works; create/approve/detail are placeholders.

---

## 8. Frontend ↔ Backend Connectivity

| Frontend | API Client Hook | Backend Route | Controller/Handler | Status |
|----------|-----------------|---------------|-------------------|--------|
| `useGetMe()` | `@workspace/api-client-react` | `GET /api/users/me` | `users.ts` (not shown, but implied) | **Broken in Clerk mode** — no token/cookie sent |
| `useListTenants()` | `useListTenants` | `GET /api/tenants` | `tenants.ts:23` | Working (demo mode) |
| `useListCustomers()` | `useListCustomers` | `GET /api/customers` | `customers.ts:15` | Working |
| `useListLoanApplications()` | `useListLoanApplications` | `GET /api/loan-applications` | `loanApplications.ts:43` | Working |
| `useListLoans()` | `useListLoans` | `GET /api/loans` | `loans.ts` (not read) | Working |
| `useListCollections()` | `useListCollections` | `GET /api/collections` | `collections.ts` (not read) | Working |
| `useCreateLoanApplication()` | `useCreateLoanApplication` | `POST /api/loan-applications` | `loanApplications.ts:69` | Working (apply flow) |
| `useGetTenantDashboard()` | `useGetTenantDashboard` | `GET /api/tenants/:id/stats` | `tenants.ts:128` | Working |

**Critical Connectivity Issue**:
- `custom-fetch.ts:354-358` attaches Bearer token **only if** `setAuthTokenGetter` was called
- `custom-fetch.ts:376-380` sets `credentials: "include"` for Clerk cookies
- **But**: Frontend never calls `setAuthTokenGetter` with Clerk token getter!
- `App.tsx` has no Clerk token extraction logic
- Result: `GET /api/users/me` returns 401 in Clerk mode → `useGetMe()` fails → DashboardRoute redirects to `/`

**API Path Alignment**: Frontend calls `/api/...` via Vite proxy (`vite.config.ts` proxies `/api` to `localhost:5000`). Backend routes mounted at `/api` in `app.ts:98`. **Aligned**.

---

## 9. Database

### Major Entities & Relationships

```
tenants (1) ──< (N) users
tenants (1) ──< (N) customers
tenants (1) ──< (N) loan_products
tenants (1) ──< (N) loan_applications
tenants (1) ──< (N) loans
tenants (1) ──< (N) audit_logs
tenants (1) ──< (N) api_keys

users (1) ──< (N) loan_applications (via customer→user link, implicit)
users (1) ──< (N) collections (assigned_to)

customers (1) ──< (N) loan_applications
customers (1) ──< (N) loans
customers (1) ──< (N) repayments
customers (1) ──< (N) collections
customers (1) ──< (1) kyc_records (via application)

loan_products (1) ──< (N) loan_applications

loan_applications (1) ──< (1) loans
loan_applications (1) ──< (1) kyc_records
loan_applications (1) ──< (1) risk_scores
loan_applications (1) ──< (1) loan_offers

loans (1) ──< (N) repayments
loans (1) ──< (N) collections
```

### Important Enums/Statuses

| Enum | Values | Table |
|------|--------|-------|
| `tenant_type` | nbfc, bank, lsp, fintech | tenants |
| `tenant_status` | active, pending, suspended, inactive | tenants |
| `user_role` | 14 roles (super_admin → compliance_officer) | users |
| `kyc_status` | pending, partial, verified, rejected | customers, kyc_records |
| `customer_status` | active, inactive, blacklisted | customers |
| `application_status` | draft, submitted, under_review, kyc_pending, kyc_verified, risk_assessment, offer_generated, offer_accepted, esign_pending, approved, disbursed, rejected, withdrawn | loan_applications |
| `loan_status` | active, closed, npa, written_off | loans |
| `repayment_status` | pending, paid, overdue, partial | repayments |

### Key Observations
- **No migration system** — uses `pnpm db:push` (Drizzle push) only (AGENTS.md #003)
- **UUID PKs** via `genId()` (SHA-256 hash of seed string)
- **Audit logs table exists** but no audit middleware observed
- **No documents table** — KYC docs stored as fields in `kyc_records`
- **No notifications table** — settings UI has notification config but no backend

---

## 10. Authentication & Authorization

### Authentication Flow
```
Request arrives
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

### Implementation Files
- **Frontend**: `App.tsx` (ClerkProvider, demo mode detection), `custom-fetch.ts` (demo header + credentials:include)
- **Backend**: `auth.ts` (`requireAuth`, `isClerkConfigured`, `isDemoMode`, `getOrCreateUser`), `app.ts` (Clerk middleware, CORS with credentials)

### What Works
- Demo mode: localStorage `lenderos_demo_user_id` → `x-demo-user-id` header → API resolves to seeded user
- Role switching: DemoRoleSwitcher updates localStorage → reload → new role
- Backend RBAC middleware fully implemented

### What's Broken/Incomplete
1. **Clerk mode auth transport** (P0): No Clerk token/cookie sent from frontend → 401 on `/api/users/me`
2. **Frontend never calls `setAuthTokenGetter`** with Clerk's `getToken()`
3. **CORS credentials**: Backend allows credentials, frontend sends them, but Clerk proxy only active in `NODE_ENV=production` (AGENTS.md #006)
4. **Session handling**: No explicit session refresh logic on frontend
5. **User provisioning**: `getOrCreateUser` creates customer role users on first login (production), but no invitation flow

---

## 11. UI / Design System

| Aspect | Current State |
|--------|---------------|
| **Overall Style** | Dark terminal/technical aesthetic — black background (#040405), zinc grays, emerald primary (#00cc88) |
| **Primary Colors** | Primary: `hsl(160 100% 42%)` (#00cc88), Background: `hsl(240 10% 8%)`, Card: `hsl(240 10% 16%)` |
| **Typography** | Font: "Plus Jakarta Sans", mono: "JetBrains Mono" (via CSS variables in `index.css`) |
| **Spacing** | Tailwind 4 spacing scale, consistent 4/6/8px rhythm |
| **Sidebar** | Fixed 256px (md:w-64), collapsible on mobile, role-aware links, demo indicator |
| **Dashboard** | StatCard grid (4 cols), Chart area (Recharts), Action Queue panel |
| **Cards** | `bg-card border border-border` with `p-6`, consistent radius |
| **Tables** | DataTable component with sorting, pagination, search, row actions, loading states |
| **Forms** | React Hook Form + Zod + shadcn Form components, multi-step wizard in apply flow |
| **Buttons** | Variants: default (emerald), outline, destructive, ghost; sizes: sm, default, lg |
| **Status Badges** | StatusBadge component with color-coded variants (success, warning, destructive, default) |
| **Modals** | Dialog component (Radix-based), used in settings, confirmations |
| **Responsive** | Mobile-first: sidebar collapses, tables hide columns, grid stacks |
| **Theme** | ThemeProvider with localStorage persistence, dark-only (no light mode toggle visible) |

**Critical Usability Issue** (AGENTS.md): Dark theme has insufficient contrast — buttons, inputs, text often invisible per WCAG AA.

---

## 12. Problems Found

### Critical
| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | **Clerk auth transport broken** — no token/cookie sent | `custom-fetch.ts`, `App.tsx` | Login flashes then redirects to `/` in Clerk mode; all protected routes fail |
| 2 | **Missing routes** `/customers/new`, `/loans/new` | `App.tsx` router vs `dashboard-layout.tsx` sidebar | Buttons in sidebar lead to 404 |
| 3 | **Dashboard auth redirect loop** | `DashboardRoute` in `App.tsx:331` | `useGetMe()` fails → redirect → flash → redirect |

### Major
| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 4 | **Placeholder pages for key workflows** | `App.tsx:307-336` | Application review, approve, disburse, tenant detail, new tenant — all non-functional |
| 5 | **Dark theme contrast failures** | `index.css`, `App.tsx:74-112` | WCAG AA violations — invisible text/buttons/inputs |
| 6 | **No Clerk token getter registration** | `App.tsx`, `custom-fetch.ts` | Root cause of auth bug #1 |
| 7 | **Wildcard routes mask missing detail pages** | `App.tsx:360-362` | `/products/*`, `/audit/*`, `/settings/*` all route to list views |
| 8 | **In-memory rate limiting** | `rateLimiter.ts` | Won't work in multi-instance production (AGENTS.md #002) |

### Minor
| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 9 | **No breadcrumbs** | All pages | Navigation context missing |
| 10 | **Mock data in dashboards** | `dashboard-super.tsx:17`, `dashboard-tenant.tsx:21` | Charts show hardcoded data |
| 11 | **Settings save is mock** | `settings.tsx:20-26` | No API calls on save |
| 12 | **Pagination onPageChange is no-op** | All list pages (`onPageChange: () => {}`) | Pagination UI exists but doesn't work |
| 13 | **No light theme** | `index.css`, `ThemeProvider` | Only dark mode available |
| 14 | **Hardcoded demo user IDs** | `seed.ts:179,190,201,212`, `auth.ts:86-90` | Tight coupling between seed and auth |
| 15 | **Only 5 tests (health)** | `health.test.ts` | Minimal test coverage (AGENTS.md #007) |

---

## 13. Working vs Partial vs Broken

### WORKING / IMPLEMENTED
- ✅ Monorepo structure with pnpm workspaces
- ✅ Database schema (6 core tables + related) with Drizzle ORM
- ✅ OpenAPI 3.1 spec → Orval → Zod + React Query hooks (contract-first)
- ✅ Backend API routes: tenants, users, customers, loan_products, loan_applications, loans, repayments, collections, analytics, settings, health
- ✅ Backend RBAC middleware with role hierarchy and tenant isolation
- ✅ Demo mode authentication with localStorage role switching
- ✅ Frontend: Landing page, Super Admin Dashboard, Tenant Dashboard
- ✅ Frontend: List views for all modules (tenants, applications, customers, loans, collections, products, audit)
- ✅ Frontend: Customer application flow (5-step wizard, creates application via API)
- ✅ Frontend: Settings page UI (4-5 tabs, comprehensive)
- ✅ UI component library (shadcn-style, 40+ components)
- ✅ Seed data with 3 tenants, 4 users, 4 customers, 3 products, 4 applications, 2 loans, repayments, collections
- ✅ Health checks, rate limiting (3 tiers), CORS, Clerk proxy middleware

### PARTIALLY IMPLEMENTED
- ⚠️ **Authentication**: Demo mode works; Clerk mode broken (transport issue)
- ⚠️ **Application lifecycle**: Backend complete (submit→approve→disburse); Frontend only list view
- ⚠️ **Tenant management**: Backend complete; Frontend create/approve/detail are placeholders
- ⚠️ **Frontend RBAC**: Sidebar differs by super vs tenant; no per-role granularity
- ⚠️ **Dashboard data**: Real API calls but charts use mock data
- ⚠️ **Pagination UI**: Exists but `onPageChange` is no-op
- ⚠️ **Settings**: Full UI but save is mock (no API integration)
- ⚠️ **KYC/Risk/Offer flows**: Backend routes exist (`kyc.ts`, `risk.ts`, `offers.ts`); no frontend
- ⚠️ **Collections actions**: Backend routes exist; frontend only list view

### BROKEN / INCONSISTENT
- ❌ **Clerk authentication** — login flashes then redirects to `/` (P0)
- ❌ **Missing routes** — `/customers/new`, `/loans/new` linked but not routed
- ❌ **Wildcard routes** — `/products/*`, `/audit/*`, `/settings/*` mask missing detail pages
- ❌ **Dark theme contrast** — WCAG AA failures throughout
- ❌ **Dashboard auth redirect** — `DashboardRoute` redirects after brief render

### NOT FOUND
- ❓ **Document management** — no documents table, no upload UI
- ❓ **Notifications** — settings has config but no backend, no in-app notification center
- ❓ **Audit logging middleware** — audit_logs table exists but no automatic audit trail
- ❓ **Email/SMS sending** — settings has provider config but no implementation
- ❓ **E-signature integration** — settings shows SignDesk but disconnected
- ❓ **WebSocket/real-time** — AGENTS.md #012 confirms not implemented
- ❓ **API versioning** — no `/api/v1/` prefix (AGENTS.md #004)
- ❓ **Migration system** — only `db:push` (AGENTS.md #003)
- ❓ **Helmet.js security headers** — AGENTS.md #011
- ❓ **Customer detail page** — list exists but no detail view
- ❓ **Loan detail/repayment schedule** — list exists but no detail view
- ❓ **Application review/underwriting UI** — backend exists, frontend missing

### UNCLEAR
- ❓ **Auditor/Compliance Officer roles** — defined in enum, level 5, but no distinct UI or permissions
- ❓ **DSA/Sales Agent workflows** — roles exist but no dedicated flows
- ❓ **Multi-tenant data isolation in frontend** — backend has `ensureTenantAccess`, frontend relies on user.tenantId
- ❓ **Clerk proxy production behavior** — only active in `NODE_ENV=production` (by design per AGENTS.md #006)
- ❓ **Platform analytics data source** — placeholder only, unclear what metrics intended
- ❓ **Offer generation/acceptance flow** — backend routes exist (`offers.ts`), no frontend

---

## 14. Overall Current State

**Approximately 55% of the core application appears implemented**, with the main instability currently concentrated around:
1. **Authentication transport** (Clerk mode completely broken — P0 blocker)
2. **Routing/navigation consistency** (missing routes, wildcard masks, placeholder pages)
3. **Frontend-backend integration gaps** (list views work; detail/action views missing)
4. **UI accessibility** (dark theme contrast failures)

The application is **demo-ready in demo mode** — you can log in as 4 roles, navigate dashboards, view lists, and submit customer applications. However, **production Clerk authentication does not work**, and most lending workflows (review, approve, disburse, collect) have backend APIs but no frontend implementation.

---

## 15. Files Worth Reviewing Next

| Priority | File/Directory | Reason |
|----------|----------------|--------|
| **P0** | `lib/api-client-react/src/custom-fetch.ts` | Fix Clerk token getter registration |
| **P0** | `artifacts/lending-os/src/App.tsx` | Add Clerk token extraction + `setAuthTokenGetter` call |
| **P0** | `artifacts/api-server/src/app.ts` | Verify CORS + Clerk middleware alignment |
| **P1** | `artifacts/lending-os/src/App.tsx:342-369` | Fix missing routes (`/customers/new`, `/loans/new`) |
| **P1** | `artifacts/lending-os/src/components/layout/dashboard-layout.tsx` | Remove broken sidebar links or add routes |
| **P1** | `artifacts/lending-os/src/index.css` | Fix dark theme contrast (WCAG AA) |
| **P2** | `artifacts/lending-os/src/pages/applications/` | Build application detail/review/approve UI |
| **P2** | `artifacts/lending-os/src/pages/loans/` | Build loan detail + repayment schedule UI |
| **P2** | `artifacts/lending-os/src/pages/customers/` | Build customer detail (360° profile) |
| **P2** | `artifacts/api-server/src/routes/loanApplications.ts` | Verify approve/disburse endpoints match frontend needs |
| **P3** | `artifacts/lending-os/src/pages/settings.tsx` | Connect settings save to backend API |
| **P3** | `lib/db/src/schema/` | Audit enum values match backend/frontend usage |
| **P3** | `lib/api-spec/openapi.yaml` | Verify all endpoints documented for codegen |