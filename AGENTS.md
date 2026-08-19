# AGENTS.md — LenderOS Universal AI Agent Instructions

Canonical instructions for AI agents working on LenderOS. Agent-agnostic.

---

## Project Overview

**LenderOS** = Multi-tenant AI lending OS (Shopify + Salesforce + Stripe + OpenAI for lending). NBFCs, banks, fintechs, LSPs onboard independently with full data isolation.

**Current State**: Demo-ready MVP/prototype. Core domain model exists, but auth is unreliable in Clerk mode, many routes are placeholders, and test coverage is minimal (5 tests for health only).

---

## Architecture (Key Facts)

```
Browser (React 19, Vite 7, Wouter, TanStack Query)
    │
    ▼ API calls (dev: Vite proxy /api → localhost:5000)
Express 5 API (port 5000)
    │
    ▼ Drizzle ORM
PostgreSQL 16
```

**Monorepo** (pnpm workspaces):
- `@workspace/db` — Drizzle schema + connection
- `@workspace/api-zod` — Zod schemas from OpenAPI
- `@workspace/api-client-react` — React Query hooks + custom fetch
- `@workspace/api-spec` — OpenAPI spec + Orval config
- `@workspace/api-server` — Express API
- `@workspace/lending-os` — React frontend

**Contract Layer**: `lib/api-spec/openapi.yaml` → Orval → Zod + React hooks. Run `pnpm codegen` after spec changes.

---

## Critical: Authentication Bug (P0) — **RESOLVED 2026-08-19**

**Problem**: Login/Signup/protected pages flash then redirect to `/` in Clerk mode.

**Root Causes** (investigated in order):
1. **Frontend/API auth transport mismatch** — `customFetch` sends demo headers from localStorage but **no Clerk bearer token or cookies** for production API calls. `GET /api/users/me` returns 401.
2. **Dev origin split** — Frontend on `:5173`, API on `:5000`. Clerk cookies/API session diverge unless `credentials: 'include'` and CORS `credentials: true` align.
3. **Route guard re-render** — Protected pages use `useGetMe()`; auth failure causes redirect after brief render.
4. **`AuthRouteRedirect`** — Touches Wouter location on mount (secondary factor).

**Files Fixed**:
- `lib/api-client-react/src/custom-fetch.ts` — Already had `credentials: 'include'`
- `artifacts/api-server/src/app.ts` — CORS `credentials: true`, Clerk middleware
- `artifacts/lending-os/src/App.tsx` — `ClerkAuthTokenRegistrar` waits for `isLoaded`/`isSignedIn` before setting token getter; `DashboardRoute` handles `isError`
- `artifacts/lending-os/src/components/layout/dashboard-layout.tsx` — Added `isError` handling

**Solution**: `ClerkAuthTokenRegistrar` now registers token getter synchronously after Clerk session loads, eliminating race condition where `useGetMe()` fired before auth token was available.

**Verify Flow**: Signup → Login → Session → Protected Route → Logout → Login again. Test RBAC for all roles. ✅ **All working**

---

## UI/Theme Issues (Critical Usability)

**Current**: Dark theme has insufficient contrast — buttons, inputs, text often invisible.

**Priority Fixes**:
- Readable text (WCAG AA minimum)
- Visible buttons (all states: default, hover, focus, disabled)
- Visible inputs with clear placeholders
- Status badges, tables, cards, modals, alerts, forms
- Clear navigation, hover/focus states

**Approach**: Establish consistent design tokens in `artifacts/lending-os/src/index.css` (CSS variables) and apply globally. Consider light-first theme for better usability. Do NOT change colors page-by-page.

---

## Development Commands

```bash
# Install
pnpm install

# One-time setup: Postgres + deps + schema + seed
pnpm setup

# Dev (API + Frontend concurrent)
pnpm dev

# API only / Frontend only
pnpm dev:api
pnpm dev:web

# DB
pnpm db:push      # Push schema (dev only, no migrations)
pnpm db:seed      # Seed demo data
pnpm db:reset     # Down + setup

# Codegen (after openapi.yaml changes)
pnpm codegen

# Quality
pnpm typecheck           # All packages
pnpm typecheck:libs      # Lib packages only
pnpm --filter @workspace/api-server typecheck
pnpm --filter @workspace/lending-os typecheck
pnpm build               # All
pnpm --filter @workspace/api-server test  # API tests (5 passing)
pnpm exec prettier --check .
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `lib/api-spec/openapi.yaml` | Single source of truth for API |
| `artifacts/api-server/src/app.ts` | Express factory, middleware chain |
| `artifacts/api-server/src/lib/auth.ts` | Auth logic (Clerk + demo fallback) |
| `artifacts/api-server/src/middlewares/rbac.ts` | Authorization middleware |
| `artifacts/api-server/src/middlewares/rateLimiter.ts` | Rate limiting (3 tiers) |
| `artifacts/api-server/src/routes/index.ts` | Route aggregation |
| `lib/db/src/index.ts` | Drizzle instance + pool |
| `lib/db/src/schema/*.ts` | Database tables |
| `artifacts/lending-os/src/App.tsx` | Frontend root, routing, providers |
| `artifacts/lending-os/src/main.tsx` | Frontend entry |
| `lib/api-client-react/src/custom-fetch.ts` | Auth headers for API calls |

---

## Auth Flow (Critical)

```
Request
  ├─ x-demo-user-id header? → Demo mode, use as clerkId
  └─ Clerk configured?
       ├─ YES → getAuth(req) → clerkId from session
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

**Role Hierarchy** (numeric levels):
- super_admin (100) > platform_admin (90) > tenant_owner (80) > tenant_admin (70)
- risk_manager (60) > loan_manager (50) > collection_manager (40)
- customer_support (30) > sales_agent (20) > dsa (15) > relationship_manager (10)
- customer/auditor/compliance_officer (5)

**RBAC Middleware**: `requireSuperAdmin()`, `requireTenantAdmin()`, `requireTenantAccess()`, `requireCustomerAccess()`, `ensureTenantAccess()` (tenant isolation).

---

## Rate Limiting (3 Tiers)

| Tier | Limit | Paths |
|------|-------|-------|
| General | 100 req/15min | All except `/healthz` |
| Auth | 20 req/15min | `/api/auth`, `/api/sign-in`, `/api/sign-up` |
| Strict | 30 req/15min | `/api/tenants`, `/api/users` |

**Uses in-memory store** — won't work in multi-instance prod (Issue #002).

---

## Database (Drizzle ORM)

- Tables: snake_case, singular (`tenants`, `loan_applications`)
- PK: `id` (text, UUID via `genId()`)
- FK: Explicit `.references(() => otherTable.id)`
- Timestamps: `created_at`, `updated_at` (auto)
- Enums: pgEnum (`user_role`, `tenant_status`, etc.)
- **No migration system** — `pnpm db:push` only (Issue #003)

---

## Known Pre-existing Issues (Don't Waste Time)

| # | Issue | Status |
|---|-------|--------|
| 001 | TS errors in routes (Drizzle `eq()` with `string \| string[]`) | Known, pre-existing |
| 002 | In-memory rate limiting (no Redis) | Architectural limitation |
| 003 | No DB migration system | Dev workflow only |
| 004 | No API versioning (`/api/v1/`) | Planned |
| 005 | Demo fallback removed in prod | Intentional |
| 006 | Clerk proxy only in `NODE_ENV=production` | By design |
| 007 | Only 5 tests (health) | Technical debt |
| 008 | No audit logging | Compliance gap |
| 009 | No centralized validation middleware | Code quality |
| 010 | Frontend TS config not strict enough | Needs verification |
| 011 | No Helmet.js security headers | Security gap |
| 012 | No WebSocket/real-time | Planned |

**Don't fix #001, #005, #006** — they're intentional or pre-existing. Focus on auth transport (#1 in critical bug), UI theme, and business workflow completion.

---

## Business Workflow Gaps (What's Actually Missing)

| Workflow | Current State | Missing for Production |
|----------|---------------|------------------------|
| **Customer Onboarding** | `/apply` flow exists | Full KYC upload/verify, document management, e-sign |
| **Application Lifecycle** | **Submit → dashboard → review UI (M2)** | Approval/rejection actions, offer generation, acceptance, disbursement |
| **Loan Management** | List view | Schedule, repayment recording, closure, restructuring |
| **Collections** | **DPD table + priority + agent actions (M6)** | Legal escalation, recovery tracking |
| **User/Role Management** | **Invitation flow implemented (M1b)** | CRUD, role assignment per tenant |
| **Notifications** | None | Email/SMS/webhook for status changes, due dates, approvals |
| **Reporting/Analytics** | **Real platform analytics (M2)** | Real portfolio metrics, regulatory reports, audit trails |

**Only implement what's supported by existing data model.** Don't invent financial rules.

---

## Documentation Updates Required

After any significant change, update:
1. `docs/change-log.md` — What changed, why, files
2. `docs/decisions.md` — New ADRs for architectural decisions
3. `docs/execution-flow.md` — If request flow changes
4. `docs/known-issues.md` — New issues discovered
5. `docs/project-memory.md` — Durable knowledge changes
6. `AGENTS.md` — If conventions/workflows change

---

## Quality Gates (Must Pass)

```bash
pnpm typecheck      # All packages
pnpm --filter @workspace/api-server test  # 5/5 passing
pnpm build          # All packages
pnpm exec prettier --check .
```

Fix all issues caused by your changes before declaring done.

---

## Environment Variables (Required)

```env
# Database
DATABASE_URL=postgresql://lenderos:lenderos@localhost:5432/lenderos

# API Server
PORT=5000
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Clerk (production)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Frontend
VITE_PORT=5173
BASE_PATH=/
API_PROXY_TARGET=http://localhost:5000
```

---

## Quick Debugging

```bash
# DB connection
pnpm exec tsx -e "import { db } from '@workspace/db'; import { sql } from 'drizzle-orm'; console.log(await db.execute(sql\`SELECT 1\`))"

# Check Postgres
docker ps | grep postgres

# Reset DB
pnpm db:reset
```

---

## Version / Stack

- Node.js 24+, pnpm 9+, PostgreSQL 16
- React 19, Vite 7, Tailwind 4, Express 5, Drizzle ORM
- Clerk auth, Orval codegen, Vitest + Supertest
- TypeScript 5.9 strict mode
