# LenderOS Project Memory

## What is LenderOS?

LenderOS is a **multi-tenant AI lending operating system** — a SaaS platform where
NBFCs, banks, fintechs, and lending service providers (LSPs) onboard independently
and run digital lending operations with full tenant data isolation.

**Analogy**: Shopify + Salesforce + Stripe + OpenAI for lending

---

## Current Development State (as of 2026-08-19)

### ✅ Completed Features
- Multi-tenant architecture with complete data isolation
- Zero-Config Demo Mode (runs without Clerk keys)
- 1-Click Demo Role Switcher (Super Admin, Tenant Admin, RM, Customer)
- Express 5 REST API with OpenAPI spec
- Clerk authentication + graceful demo fallback
- Super-Admin Dashboard (platform overview, global analytics, tenant management)
- Tenant Command Center (applications, CRM, loan book, products, collections)
- Customer Portal (`/apply` digital loan application)
- AI Risk & Underwriting engine (risk grade A1–C3, DTI, credit weight)
- Collections Management (DPD tracking, priority scoring 0–100, agent assignment)
- Health check endpoint with DB connectivity, uptime, version
- Three-tier rate limiting (general, auth, strict)
- RBAC middleware with role hierarchy
- CORS restriction via environment variable
- Vitest + Supertest unit tests for health endpoint
- Comprehensive documentation (AGENTS.md, architecture.md, decisions.md, execution-flow.md, change-log.md, DEMO_CREDENTIALS.md)
- **Identity Provisioning Foundation (M1b)** — Invitations, Clerk webhooks, customer.clerkId linking
  - Invitations API: create, list, get, resend, cancel, revoke, accept
  - Clerk webhook endpoint: `user.created` → provision/link customer
  - Frontend invitations page with full CRUD + copy acceptance URL
  - Sidebar navigation for tenant admins & super admins
  - OpenAPI spec + Orval codegen for all invitation/webhook endpoints
  - Demo invitation seeds for NBFC admin & Risk Manager onboarding

### 🚧 In Progress / Planned
- API versioning (`/api/v1/`)
- Redis-backed distributed rate limiting
- Prometheus metrics endpoint
- Comprehensive test coverage for all routes
- Helmet.js security headers
- Database migrations for production
- Webhook system for async events (Clerk webhook implemented for user lifecycle)
- Audit logging for compliance

---

## Major Architectural Decisions

| Decision | Summary | ADR |
|----------|---------|-----|
| Monorepo | pnpm workspaces with 6 packages | ADR-001 |
| Database | PostgreSQL 16 + Drizzle ORM | ADR-002 |
| Auth | Clerk with custom proxy middleware | ADR-003 |
| API Contracts | OpenAPI-first with Orval codegen | ADR-004 |
| Rate Limiting | express-rate-limit (3 tiers) | ADR-005 |
| CORS | Restricted origins via env var | ADR-006 |
| RBAC | Role hierarchy with middleware | ADR-007 |
| Health Check | Enhanced with DB status + uptime | ADR-008 |
| Demo Mode | Header-based role switching | ADR-009 |
| Testing | Vitest + Supertest | ADR-010 |

---

## Important Business/Domain Concepts

### Tenant Types
- **NBFC**: Non-Banking Financial Company (primary target)
- **Bank**: Traditional banks
- **FinTech**: Technology-first lenders
- **LSP**: Lending Service Providers (marketplace model)

### User Roles (Hierarchy)
1. `super_admin` (100) — Platform owner, full access
2. `platform_admin` (90) — Platform operations
3. `tenant_owner` (80) — Tenant business owner
4. `tenant_admin` (70) — Tenant operations manager
5. `risk_manager` (60) — Credit risk decisions
6. `loan_manager` (50) — Loan operations
7. `collection_manager` (40) — Collections operations
8. `customer_support` (30) — Customer service
9. `sales_agent` (20) — Lead generation
10. `dsa` (15) — Direct Sales Agent
11. `relationship_manager` (10) — Customer relationships
12. `customer` (5) — End borrower
13. `auditor` (5) — Read-only audit
14. `compliance_officer` (5) — Compliance reporting

### Loan Lifecycle
```
Application → KYC → Risk Scoring → Approval → Offer → Acceptance → Disbursement → Repayment → Closure
                    ↓
              Collections (if overdue)
```

### Risk Grading
- **A1–A3**: Excellent (prime borrowers)
- **B1–B3**: Good (standard)
- **C1–C3**: Subprime (higher risk)
- Factors: Credit score, DTI ratio, employment stability, fraud signals

---

## Technical Constraints

### Current Limitations
1. **In-memory rate limiting** — Won't work across multiple instances
2. **No API versioning** — Breaking changes require coordination
3. **Demo fallback removed in production** — Requires Clerk keys for prod
4. **TypeScript errors in some routes** — Pre-existing Drizzle type inference issues
5. **No database migration system** — Using `db:push` for dev only
6. **Single health check** — No detailed component health
7. **No structured audit logging** — Compliance gap

### Environment Dependencies
- Node.js 24+ (uses modern TS features)
- PostgreSQL 16 (specific features used)
- Clerk account for production auth
- pnpm 9+ (workspace protocol)

### Performance Considerations
- Drizzle ORM: Lightweight, but N+1 queries possible if not careful
- TanStack Query: Caching configured with 1 retry default
- esbuild: Fast builds, no type checking during build
- Vite: HMR for frontend, proxy for API

---

## Important Implementation Findings

### Authentication Flow
1. Check `x-demo-user-id` header (demo mode)
2. If Clerk configured: extract `userId` from session
3. If no session and demo mode: default to `user_demo_super_admin`
4. If no session and production: return 401
5. `getOrCreateUser()` maps Clerk ID to database user
6. Attaches `clerkId`, `userRole`, `user` to request

### Tenant Isolation Pattern
```typescript
// In route handlers:
requireAuth → requireTenantAccess() → ensureTenantAccess(req, res, next)

// ensureTenantAccess checks:
if (userRole === 'super_admin' || userRole === 'platform_admin') return next();
if (user.tenantId !== requestedTenantId) return 403;
```

### Rate Limiting Integration
- Applied in `app.ts` before route handlers
- Health check excluded via `skip` option
- Auth endpoints get stricter limits
- Tenant/user management get strictest limits

### OpenAPI Codegen
```bash
# Run after any openapi.yaml changes
pnpm codegen
```
Generates:
- `lib/api-zod/src/generated/` — Zod validation schemas
- `lib/api-client-react/src/generated/` — React Query hooks

### Database Seeding
```bash
pnpm db:seed
```
Seeds: 3 tenants, 4 users, 4 customers, 3 products, 4 applications, 2 loans, repayments, collections, KYC, risk scores

---

## Conventions to Follow

### Backend
- One route file per domain
- Middleware in `src/middlewares/`
- Zod validation from `@workspace/api-zod`
- Throw errors, let global handler catch
- Use `genId()` for UUIDs
- Pino logger from `../lib/logger`

### Frontend
- Generated hooks from `@workspace/api-client-react`
- Wouter for routing
- TanStack Query for server state
- ShadCN UI components
- Demo header from localStorage

### Database
- Snake_case tables/columns
- Explicit foreign keys
- pgEnum for enums
- Drizzle Kit for schema changes

---

## Unfinished Work / TODOs

### High Priority
- [ ] Redis-backed rate limiting for multi-instance
- [ ] API versioning strategy
- [ ] Database migration system (Drizzle migrations)
- [ ] Comprehensive test coverage (>80%)
- [ ] Audit logging for all mutating operations

### Medium Priority
- [ ] Prometheus metrics endpoint
- [ ] Helmet.js security headers
- [ ] Request/response validation middleware
- [ ] Webhook system for async events
- [ ] File upload handling (KYC documents)

### Low Priority
- [ ] GraphQL API option
- [ ] Multi-region deployment config
- [ ] Advanced analytics dashboard
- [ ] Mobile app considerations