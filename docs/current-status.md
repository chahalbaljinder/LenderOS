# Current Status

## 1. Current Implementation Status

LenderOS is currently a **demo-ready MVP/prototype**, not yet a production-complete lending OS. The core multi-tenant domain model exists and the app can represent the intended product shape: super-admin platform views, tenant command center, customer application flow, seeded demo users, and an API/data layer built around Clerk, Express, Drizzle, and Postgres.

What is implemented is enough to demonstrate the target business model, but several flows are still shell-like, and many routes are placeholders or lightly wired views rather than full operational workflows.

**Auth reliability in Clerk mode is now RESOLVED (2026-08-19).**

## 2. Completed Features

- Monorepo structure with frontend, API server, DB, shared API spec/client packages.
- Multi-tenant schema with tenants, users, customers, loan products, applications, loans, repayments, collections, KYC, risk scores, and tenant settings.
- React/Vite frontend with landing page, dashboards, apply flow, and route wiring for the major product areas.
- Express API with health endpoint, route aggregation, CORS, rate limiting, and Clerk integration.
- Demo mode fallback using seeded users and `x-demo-user-id` switching.
- RBAC middleware and tenant isolation helpers exist on the backend.
- Seed data for multiple roles and realistic lending records.
- Documentation for user stories, testing guide, architecture, decisions, and known issues.
- **Clerk authentication fully working** — login, signup, protected routes, logout/re-login all stable.
- **Identity Provisioning (M1b)** — Invitations API, Clerk webhooks, customer.clerkId linking, frontend invitations page.

## 3. Partially Implemented Features

- Dashboard pages render meaningful metrics, but some actions are mock or read-only.
- Customer apply flow exists, but it is not yet a full end-to-end application lifecycle with all downstream approvals, offers, and disbursement behavior.
- Tenant/admin management screens are present, but some are placeholders or simplified views.
- Backend endpoints exist for many domains, but several routes are not fully exercised by tests and some authorization coverage is incomplete or inconsistent.

## 4. Missing / Pending Features

- Production-grade migrations instead of `db:push`-only development workflow.
- API versioning.
- Comprehensive route and integration tests for auth, RBAC, tenant isolation, and loan lifecycle.
- Redis-backed rate limiting.
- Audit logging across mutating operations.
- Metrics/observability endpoints.
- Real KYC document upload and verification workflows.
- Full CRUD implementation for several placeholder screens.
- Webhook/event system for async lending workflows (Clerk webhook for user lifecycle implemented).

## 5. Technical Debt / Architectural Issues

- The frontend and API run on different ports in dev, which increases the chance of cookie/session mismatch unless the proxy/auth transport is deliberate.
- Some routes are still placeholders, so the UI can look complete while the underlying workflow is not.
- Backend route protection is uneven: some admin-sensitive routes are locked down, but not every domain appears equally hardened yet.
- The project relies on several docs that are slightly ahead of or broader than the shipped implementation, so documentation and runtime behavior need periodic reconciliation.

## 6. Critical Bug Analysis: Why Login / Signup / Protected Pages Bounce Home — **RESOLVED**

**Root Cause**: Race condition in `ClerkAuthTokenRegistrar` — token getter registered in `useEffect` (after render) while `DashboardRoute`'s `useGetMe()` fired immediately on mount, before auth token was available → 401 → redirect to `/`.

**Fix Applied** (commit af9e660):
1. `ClerkAuthTokenRegistrar` now waits for `isLoaded`/`isSignedIn` before setting token getter
2. `DashboardRoute` and `DashboardLayout` handle `isError` for expired sessions
3. API server binds to `0.0.0.0` with proper error logging

## 7. Recommended Improvements

- Add a small auth-state integration test for `/sign-in`, `/sign-up`, and a protected page to catch redirect regressions.
- Replace placeholder route screens with actual business workflows or clearly label them as stubs.
- Harden tenant isolation and RBAC consistently across all sensitive routes.
- Add production-ready database migrations and audit logging.
- Reconcile documentation with actual implementation so the test guide and user stories reflect runtime reality.

## 8. Priority Task List

### P0 - Critical (COMPLETED)
- ✅ Fix Clerk/demo auth transport so sign-in, sign-up, and protected pages stay on the correct route.

### P1 - High
- Finish RBAC and tenant-isolation coverage for all admin/tenant-sensitive routes.
- Add integration tests for auth, route access, and `GET /api/users/me` behavior.
- Replace or complete the remaining placeholder screens (M2 — Routing & Navigation).
- Tighten manual testing docs to match the current route/auth behavior.

### P2 - Medium
- Add Drizzle migrations.
- Add API versioning.
- Add Redis-backed rate limiting.
- Add audit logging and metrics.
- Expand backend route test coverage beyond health.

### P3 - Nice-to-have
- Improve dashboard fidelity with more real analytics and charts.
- Add webhook/event handling for async lending workflows.
- Add deeper compliance/reporting views.
- Polish UI flows that are currently demo-grade rather than workflow-complete.

## 9. Bottom Line

LenderOS has a solid foundation and matches the intended target product structurally. **The biggest blocker (auth/session reliability) is now resolved.** The next most important work is tightening authorization (M2), filling in placeholder workflows (M3+), and adding tests so the product behaves like a stable lending OS rather than a convincing demo shell.
