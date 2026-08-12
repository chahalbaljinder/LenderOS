# Change Log

All notable changes to the LenderOS platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Health Check Endpoint Enhancement** (`artifacts/api-server/src/routes/health.ts`)
  - Extended `HealthStatus` schema in OpenAPI spec with: `api`, `database`, `uptime`, `timestamp`, `version` fields
  - Health check now performs actual database connectivity test (`SELECT 1`)
  - Returns server uptime in seconds since start
  - Returns ISO 8601 timestamp
  - Returns API version from `npm_package_version`
  - Returns 200 for healthy, 503 for degraded (database down)
  - Added comprehensive unit tests with Vitest + Supertest (5 tests passing)

- **Rate Limiting Middleware** (`artifacts/api-server/src/middlewares/rateLimiter.ts`)
  - General limiter: 100 req/15min (all routes except `/healthz`)
  - Auth limiter: 20 req/15min (`/api/auth`, `/api/sign-in`, `/api/sign-up`)
  - Strict limiter: 30 req/15min (`/api/tenants`, `/api/users`)
  - Uses `express-rate-limit` package
  - Proper logging of rate limit violations

- **RBAC (Role-Based Access Control) Middleware** (`artifacts/api-server/src/middlewares/rbac.ts`)
  - Role hierarchy: super_admin (100) > platform_admin (90) > tenant_owner (80) > tenant_admin (70) > risk_manager (60) > loan_manager (50) > collection_manager (40) > customer_support (30) > sales_agent (20) > dsa (15) > relationship_manager (10) > customer/auditor/compliance_officer (5)
  - Middleware functions: `requireRole()`, `requireSuperAdmin()`, `requireTenantAdmin()`, `requireTenantAccess()`, `requireCustomerAccess()`
  - Tenant isolation: `ensureTenantAccess()` prevents cross-tenant data access
  - `getTenantId()` helper for extracting tenant context

- **CORS Restriction** (`artifacts/api-server/src/app.ts`)
  - Replaced permissive `origin: true` with configurable allowed origins
  - Origins from `CORS_ALLOWED_ORIGINS` env var (comma-separated)
  - Defaults to `http://localhost:5173`, `http://localhost:3000` for development
  - Logs blocked origins for security monitoring

- **Production Auth Hardening** (`artifacts/api-server/src/lib/auth.ts`)
  - Removed demo fallback in production (`NODE_ENV=production`)
  - Added `isDemoMode()` helper: `NODE_ENV !== 'production' && !isClerkConfigured()`
  - Returns 401 Unauthorized when no valid Clerk session in production
  - Demo mode still works for local development with `x-demo-user-id` header

- **Demo Credentials Documentation** (`DEMO_CREDENTIALS.md`)
  - Complete list of seeded users with emails, Clerk IDs, roles, tenants
  - Role hierarchy and permissions table
  - Testing instructions with curl examples
  - Seeded tenants, customers, loan products, applications, loans, collections

### Changed
- **Health Check Route** (`artifacts/api-server/src/routes/health.ts`)
  - Moved from simple `{ status: "ok" }` to comprehensive health check
  - Now uses `db.execute(sql\`SELECT 1\`)` for database connectivity
  - Zod validation of response against `HealthCheckResponse` schema

- **Routes Index** (`artifacts/api-server/src/routes/index.ts`)
  - Removed duplicate `/healthz` route from main router
  - Added import and registration of `healthRouter`
  - Maintains route order: health first, then all other routers

- **App Factory** (`artifacts/api-server/src/app.ts`)
  - Refactored to `createApp()` factory function for testing
  - Added rate limiting middleware chain
  - Added CORS configuration with origin validation
  - Added Clerk auth middleware with publishable key derivation
  - Skips pinoHttp logging in test environment
  - Changed `router.handle()` to `router()` for Express 5 compatibility
  - Removed demo fallback error handling (`shouldUseDemoFallback`, `getDemoFallbackResponse`)

- **Tenant Routes** (`artifacts/api-server/src/routes/tenants.ts`)
  - Replaced inline `ensureAdmin()` with `requireSuperAdmin()` middleware
  - Added `ensureTenantAccess()` for tenant-scoped endpoints
  - Removed `any` type usage, improved type safety

- **OpenAPI Spec** (`lib/api-spec/openapi.yaml`)
  - Extended `HealthStatus` schema with detailed fields and enums
  - Added descriptions for all health check properties

- **Environment Example** (`.env.example`)
  - Added `CORS_ALLOWED_ORIGINS` configuration
  - Added comment about production CORS configuration

### Fixed
- **Express 5 Compatibility** (`artifacts/api-server/src/app.ts`)
  - Changed `router.handle(req, res, next)` to `router(req, res, next)`
  - Fixed TypeScript error: Property 'handle' does not exist on type 'Router'

### Security
- **Authentication**: Demo fallback removed in production - requires valid Clerk session
- **Authorization**: All routes now have proper RBAC middleware
- **Rate Limiting**: Three-tier protection against abuse
- **CORS**: Restricted to configured origins only
- **Tenant Isolation**: Cross-tenant data access prevented by default

### Testing
- **Health Endpoint Tests** (`artifacts/api-server/src/routes/health.test.ts`)
  - 5 unit tests covering healthy/degraded states, timestamp validation, version inclusion, schema validation
  - Uses Vitest with vi.hoisted() for proper mock setup
  - Mocks `@workspace/db` and `../lib/logger`
  - All tests passing

### Build
- **TypeScript**: Fixed Express 5 Router type issue
- **Build**: `pnpm --filter @workspace/api-server build` completes successfully
- **Tests**: `pnpm --filter @workspace/api-server test` - 5/5 tests passing

### Dependencies Added
- `express-rate-limit@^8.6.2` (to `@workspace/api-server`)
- `vitest@latest`, `@types/supertest@latest`, `supertest@latest` (devDependencies to `@workspace/api-server`)

---

## [0.1.0] - 2026-07-30
### Added
- Initial project structure with pnpm workspaces
- Database schema with Drizzle ORM (tenants, users, customers, loan products, loan applications, loans, repayments, collections, KYC, risk scores)
- Express API server with Clerk authentication
- React frontend with Vite, TanStack Query, Wouter routing
- OpenAPI specification with Orval code generation
- Demo mode with seeded data
- Multi-tenant architecture with role-based access

---

## Migration Notes

### For Developers
1. Update `.env` with `CORS_ALLOWED_ORIGINS` for production
2. Ensure `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set for production
3. Run `pnpm codegen` after any OpenAPI spec changes
4. Run `pnpm db:push` after schema changes
5. Run `pnpm test` before committing

### For Deployment
1. Set `NODE_ENV=production`
2. Configure `CORS_ALLOWED_ORIGINS` with production frontend URLs
3. Set valid Clerk keys
4. Ensure database is accessible
5. Health check endpoint `/api/healthz` available for load balancer probes