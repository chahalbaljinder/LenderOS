# Architecture Decision Records (ADRs)

## ADR-001: Monorepo Structure with pnpm Workspaces
**Date**: 2026-08-13
**Status**: Accepted

### Context
The LenderOS platform consists of multiple interconnected packages: database layer, API server, frontend, shared types, and API client.

### Decision
Use pnpm workspaces with the following packages:
- `@workspace/db` - Drizzle ORM schema and database connection
- `@workspace/api-zod` - Zod validation schemas generated from OpenAPI spec
- `@workspace/api-client-react` - React Query hooks and custom fetch client
- `@workspace/api-spec` - OpenAPI specification and Orval codegen config
- `@workspace/api-server` - Express.js API server
- `@workspace/lending-os` - React frontend (Vite)

### Consequences
- Shared types and schemas across frontend and backend
- Independent versioning and deployment possible
- Faster installs with pnpm's symlink strategy
- Single lockfile for all packages

---

## ADR-002: Database - PostgreSQL with Drizzle ORM
**Date**: 2026-08-13
**Status**: Accepted

### Context
Need a type-safe, performant ORM for PostgreSQL with good TypeScript integration.

### Decision
Use Drizzle ORM with `drizzle-orm/node-postgres` driver.

### Consequences
- Full TypeScript type inference from schema
- Lightweight, no heavy runtime overhead
- SQL-like query API, easy to optimize
- Migration management with Drizzle Kit
- Schema defined in TypeScript, single source of truth

---

## ADR-003: Authentication - Clerk with Proxy Middleware
**Date**: 2026-08-13
**Status**: Accepted

### Context
Need authentication that works on custom domains and Replit deployments without CNAME configuration.

### Decision
Use Clerk for authentication with a custom proxy middleware (`/api/__clerk`) that forwards requests to Clerk's Frontend API.

### Consequences
- Works on any domain without DNS changes
- Supports all Clerk features (social login, MFA, etc.)
- Proxy middleware only active in production
- Demo mode fallback for local development without Clerk keys

---

## ADR-004: API Design - OpenAPI-First with Orval Codegen
**Date**: 2026-08-13
**Status**: Accepted

### Context
Need consistent API contracts between frontend and backend with type safety.

### Decision
Define API in OpenAPI spec (YAML), generate:
- Zod schemas (`@workspace/api-zod`) for runtime validation
- React Query hooks (`@workspace/api-client-react`) for frontend
- TypeScript types for both

### Consequences
- Single source of truth for API contracts
- Breaking changes caught at compile time
- Frontend and backend types always in sync
- Orval handles code generation automatically

---

## ADR-005: Rate Limiting - express-rate-limit
**Date**: 2026-08-13
**Status**: Accepted

### Context
Need to protect API from abuse and ensure fair usage.

### Decision
Use `express-rate-limit` with three tiers:
- General: 100 req/15min (all routes except health)
- Auth: 20 req/15min (sign-in, sign-up, auth endpoints)
- Strict: 30 req/15min (tenant/user management)

### Consequences
- Prevents brute force attacks on auth
- Protects sensitive operations
- Health check excluded from limiting
- In-memory store (consider Redis for multi-instance)

---

## ADR-006: CORS - Restricted Origins with Env Config
**Date**: 2026-08-13
**Status**: Accepted

### Context
Default CORS was permissive (`origin: true`), allowing any origin.

### Decision
Restrict CORS to configured origins via `CORS_ALLOWED_ORIGINS` environment variable. Defaults to localhost ports for development.

### Consequences
- Prevents unauthorized cross-origin requests
- Production must explicitly configure allowed origins
- Development works out of the box

---

## ADR-007: RBAC - Role-Based Access Control Middleware
**Date**: 2026-08-13
**Status**: Accepted

### Context
Multi-tenant platform needs fine-grained access control.

### Decision
Implement RBAC middleware with role hierarchy:
- Super admin (100) > Platform admin (90) > Tenant owner (80) > Tenant admin (70) > ...
- Middleware functions: `requireRole()`, `requireSuperAdmin()`, `requireTenantAdmin()`, `requireTenantAccess()`, `requireCustomerAccess()`
- Tenant isolation enforced via `ensureTenantAccess()`

### Consequences
- Centralized authorization logic
- Easy to add new roles/permissions
- Tenant data isolation by default
- Role hierarchy allows flexible permissions

---

## ADR-008: Health Check - Enhanced with DB Status & Uptime
**Date**: 2026-08-13
**Status**: Accepted

### Context
Basic health check only returned `{ status: "ok" }`.

### Decision
Enhanced health check returns:
- Overall status: `ok` | `degraded` | `down`
- API status
- Database connectivity status
- Server uptime in seconds
- ISO 8601 timestamp
- API version

### Consequences
- Better observability for load balancers and monitoring
- Database issues detected without full API failure
- Uptime useful for deployment verification

---

## ADR-009: Demo Mode - Header-Based Role Switching
**Date**: 2026-08-13
**Status**: Accepted

### Context
Need to test different roles without Clerk configuration in local development.

### Decision
Use `x-demo-user-id` header to simulate different users. Maps to seeded database users.

### Consequences
- Instant role switching for testing
- No Clerk setup required for development
- Seeded data provides realistic test scenarios
- Production requires valid Clerk session

---

## ADR-010: Testing - Vitest with Supertest
**Date**: 2026-08-13
**Status**: Accepted

### Context
Need unit and integration tests for API endpoints.

### Decision
Use Vitest (Vite-native test runner) with Supertest for HTTP testing. Mock database and logger for unit tests.

### Consequences
- Fast test execution
- TypeScript support out of the box
- Easy mocking with vi.hoisted()
- Integration with Vite ecosystem