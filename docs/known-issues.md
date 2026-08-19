# Known Issues

## Issue Tracking

This file tracks known technical issues in the LenderOS codebase.
Each issue should contain: Problem, Reproduction, Impact, Suspected Cause, Status, Possible Solution, Related Files.

---

## Issue #001: TypeScript Errors in Route Handlers (Pre-existing)

### Problem
TypeScript typecheck fails for several route files with Drizzle ORM type inference errors:
- `collections.ts`: `eq()` overload mismatch with string arrays
- `customers.ts`: `employmentType` and `status` enum type mismatches
- `kyc.ts`: Parameter type mismatches (string vs string[])

### Reproduction
```bash
pnpm typecheck
# OR
pnpm --filter @workspace/api-server typecheck
```

### Impact
- Typecheck fails in CI/CD
- Build succeeds (esbuild doesn't type check)
- IDE shows red squiggles in affected files

### Suspected Cause
Drizzle ORM type inference with `eq()` and `inArray()` when used with parameters that can be `string | string[]` from query params. The Zod schemas generate union types that don't match Drizzle's expected types.

### Status
**Known / Pre-existing** — Not introduced by recent changes

### Possible Solutions
1. Add explicit type assertions: `eq(table.column, param as string)`
2. Use `inArray()` for array parameters with proper type guards
3. Update Zod schemas to be more specific
4. Add `.array().optional()` vs `.optional()` distinction

### Related Files
- `artifacts/api-server/src/routes/collections.ts` (lines 50, 84)
- `artifacts/api-server/src/routes/customers.ts` (lines 67, 94, 95, 109)
- `artifacts/api-server/src/routes/kyc.ts` (lines 33, 51, 58, 63, 74, 77, 81, 104, 126)

---

## Issue #002: In-Memory Rate Limiting (Scalability)

### Problem
`express-rate-limit` uses in-memory store by default. Won't work correctly in:
- Multi-instance deployments (Kubernetes, ECS, Cloud Run)
- Serverless environments
- Load-balanced setups

### Reproduction
Deploy 2+ API server instances behind a load balancer and exceed rate limit on one instance — other instances won't share the counter.

### Impact
- Rate limiting ineffective in production clusters
- Potential for abuse bypass

### Status
**Known / Architectural Limitation**

### Possible Solutions
1. Add Redis store: `rate-limit-redis` or `@fastify/rate-limit` with Redis
2. Use external rate limiting (API Gateway, Cloudflare, etc.)
3. Implement custom distributed rate limiter

### Related Files
- `artifacts/api-server/src/middlewares/rateLimiter.ts`
- `artifacts/api-server/src/app.ts` (lines 63, 86-92)

---

## Issue #003: No Database Migration System

### Problem
Using `pnpm db:push` (Drizzle Kit push) for schema changes. This:
- Doesn't create migration files
- Can't rollback
- Not suitable for production deployments
- No version control for schema changes

### Reproduction
```bash
# Current workflow
pnpm db:push  # Pushes directly to DB

# No migration files generated
ls lib/db/migrations/  # Empty or non-existent
```

### Impact
- Production deployments risky
- No rollback capability
- Schema drift possible

### Status
**Known / Development Workflow Only**

### Possible Solutions
1. Enable Drizzle Kit migrations: `drizzle-kit generate` + `drizzle-kit migrate`
2. Add migration scripts to CI/CD
3. Document migration workflow

### Related Files
- `lib/db/drizzle.config.ts`
- `lib/db/package.json`

---

## Issue #004: No API Versioning

### Problem
All routes mounted at `/api/*` without version prefix. Breaking changes require:
- Coordinated frontend/backend deployments
- No backward compatibility
- Risk of breaking existing integrations

### Reproduction
Check route registration in `artifacts/api-server/src/routes/index.ts` — no version prefix.

### Impact
- Future breaking changes will be painful
- Can't run multiple API versions simultaneously

### Status
**Planned / Not Implemented**

### Possible Solutions
1. Add `/api/v1/` prefix to all routes
2. Version in header: `Accept: application/vnd.lenderos.v1+json`
3. Subdomain versioning: `v1.api.lenderos.com`
4. Plan for v2 with deprecation policy

### Related Files
- `artifacts/api-server/src/routes/index.ts`
- `artifacts/api-server/src/app.ts`
- `lib/api-spec/openapi.yaml`

---

## Issue #005: Demo Fallback Error Handling Removed (Intentional)

### Problem
Previously, `app.ts` had `shouldUseDemoFallback()` and `getDemoFallbackResponse()` that returned mock data on database errors. This was removed for production security.

### Reproduction
In development with DB down, API returns 500 instead of mock data.

### Impact
- Development workflow slightly affected (need DB running)
- Production is more secure (no silent failures)

### Status
**Intentional Design Decision** — Not a bug

### Related Files
- `artifacts/api-server/src/app.ts` (removed error handling block)
- `artifacts/api-server/src/lib/demoData.ts` (deprecated but kept)

---

## Issue #006: Clerk Proxy Only Works in Production

### Problem
`clerkProxyMiddleware` only activates when `NODE_ENV === 'production'`. In development:
- Clerk Frontend API calls go directly to Clerk
- Works fine for localhost
- Custom domains in dev won't work

### Reproduction
Try to use LenderOS on a custom local domain (e.g., `lenderos.local`) without production Clerk keys.

### Impact
- Custom domain testing requires production Clerk config
- Minor developer experience issue

### Status
**Known / By Design**

### Possible Solutions
1. Add `CLERK_PROXY_ENABLED` env var to override
2. Detect custom domains automatically
3. Document workaround (use localhost)

### Related Files
- `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts` (lines 57-59)

---

## Issue #007: Missing Comprehensive Test Coverage

### Problem
Only 5 tests exist (health endpoint). No tests for:
- Authentication flows
- Authorization/RBAC
- Tenant isolation
- Loan application lifecycle
- Collections workflows
- Risk scoring

### Reproduction
```bash
pnpm --filter @workspace/api-server test
# Only 1 test file, 5 tests
```

### Impact
- Regressions likely
- Refactoring risky
- No confidence in critical paths

### Status
**Known / Technical Debt**

### Possible Solutions
1. Add integration tests for each route
2. Test auth + RBAC combinations
3. Test tenant isolation edge cases
4. Add E2E tests for critical user journeys

### Related Files
- `artifacts/api-server/src/routes/*.test.ts` (mostly missing)
- `artifacts/api-server/vitest.config.ts`

---

## Issue #008: No Structured Audit Logging

### Problem
No audit trail for:
- User login/logout
- Tenant creation/approval
- Loan approval/rejection
- Collections actions
- Settings changes
- Admin actions

### Reproduction
Check `artifacts/api-server/src/routes/` — no audit logging middleware or calls.

### Impact
- Compliance gap (financial regulations)
- No forensic capability
- Debugging difficult

### Status
**Known / Compliance Gap**

### Possible Solutions
1. Add audit middleware for mutating endpoints
2. Create `audit_logs` table
3. Log: user, action, resource, before/after, timestamp, IP
4. Add audit log API for compliance team

### Related Files
- `lib/db/src/schema/` (missing audit_logs table)
- `artifacts/api-server/src/middlewares/` (missing audit middleware)

---

## Issue #009: Missing Request/Response Validation Middleware

### Problem
Zod validation done inline in route handlers (`Schema.safeParse(req.body)`). No centralized validation middleware.

### Reproduction
Check any route file — validation is manual per handler.

### Impact
- Inconsistent error responses
- Duplicate validation code
- Easy to forget validation

### Status
**Known / Code Quality**

### Possible Solutions
1. Create `validateBody(schema)`, `validateQuery(schema)`, `validateParams(schema)` middleware
2. Apply globally or per route
3. Standardize error format

### Related Files
- `artifacts/api-server/src/routes/*.ts`
- `artifacts/api-server/src/middlewares/` (missing validation middleware)

---

## Issue #010: Frontend TypeScript Config Not Strict Enough

### Problem
Frontend `tsconfig.json` may not have all strict flags enabled. Potential for runtime errors.

### Reproduction
```bash
pnpm --filter @workspace/lending-os typecheck
```

### Impact
- Possible runtime type errors
- Inconsistent with backend strictness

### Status
**Needs Verification**

### Related Files
- `artifacts/lending-os/tsconfig.json`

---

## Issue #011: No Helmet.js Security Headers

### Problem
Express server doesn't use Helmet.js for security headers (CSP, HSTS, X-Frame-Options, etc.)

### Reproduction
Check `artifacts/api-server/src/app.ts` — no Helmet import or usage.

### Impact
- Missing security headers
- Potential XSS, clickjacking vulnerabilities

### Status
**Known / Security Gap**

### Possible Solutions
1. Add `helmet` package
2. Configure CSP for frontend assets
3. Add HSTS for production

### Related Files
- `artifacts/api-server/src/app.ts`

---

## Issue #012: WebSocket / Real-time Not Implemented

### Problem
No real-time updates for:
- Loan status changes
- Collections assignments
- New applications
- System notifications

### Reproduction
Check for WebSocket or Server-Sent Events — none exist.

### Impact
- Poor UX for dashboard users
- Polling required for updates
- Scalability concerns with polling

### Status
**Planned / Not Implemented**

### Possible Solutions
1. Add Socket.io or native WebSocket
2. Server-Sent Events for simpler implementation
3. Redis pub/sub for multi-instance

### Related Files
- N/A (new feature)

---

## Issue Tracking Notes

- Issues #001, #003, #004, #007, #008, #009, #010, #011, #012 are tracked for future resolution
- Issue #005 is an intentional design decision
- Issue #006 is a known limitation of Clerk proxy
- Issue #002 requires Redis for production deployment

### Resolved Issues

## Issue #013: Clerk Auth Redirect Loop (RESOLVED 2026-08-19)

### Problem
Login/Signup/protected pages flash then redirect to `/` in Clerk mode. Users cannot stay on protected routes after authentication.

### Reproduction
1. Sign in via Clerk
2. Redirect to `/dashboard`
3. Brief render then redirect back to `/`

### Impact
- Complete auth failure in Clerk mode
- Demo mode worked but production auth broken

### Root Cause
Frontend/API auth transport mismatch:
- `customFetch` sent demo headers from localStorage but **no Clerk bearer token or cookies** for production API calls
- `ClerkAuthTokenRegistrar` registered token getter in `useEffect` (runs after render) while `DashboardRoute`'s `useGetMe()` fired immediately on mount
- Race condition: API call made before auth token available → 401 → redirect

### Status
**RESOLVED** — Fixed in commit af9e660

### Solution
1. `ClerkAuthTokenRegistrar` now waits for `isLoaded`/`isSignedIn` before setting token getter
2. `DashboardRoute` and `DashboardLayout` handle `isError` for expired sessions
3. API server binds to `0.0.0.0` with proper error logging

### Related Files
- `lib/api-client-react/src/custom-fetch.ts` (already had `credentials: 'include'`)
- `artifacts/api-server/src/app.ts` (CORS `credentials: true`)
- `artifacts/lending-os/src/App.tsx` (`ClerkAuthTokenRegistrar`, `DashboardRoute`)
- `artifacts/lending-os/src/components/layout/dashboard-layout.tsx` (`isError` handling)

**Last Updated**: 2026-08-19
**Next Review**: Before production deployment

---

## Issue #014: JSX Conditional Rendering Parse Error (RESOLVED 2026-08-19)

### Problem
Build fails with "Unterminated regular expression" error at `</DashboardLayout>` when using conditional rendering with `&&` operator for JSX elements in collections list page.

### Reproduction
1. Add conditional rendering `{condition && <Component />}` in collections list page
2. Run `pnpm --filter @workspace/lending-os run build`
3. Build fails with "Unterminated regular expression" at `</DashboardLayout>`

### Impact
- Build fails for collections page with performance dashboard
- Parser confused by conditional JSX rendering

### Root Cause
esbuild parser confusion with conditional JSX rendering using `&&` operator inside grid container children array. The parser gets confused by the conditional expression and reports false positive "Unterminated regular expression" error at unrelated location.

### Status
**RESOLVED** — Fixed in commit c7a6195

### Solution
1. Move conditional trend chart rendering outside the grid container to separate sibling element
2. Use ternary operator `condition ? <Component /> : null` instead of `condition && <Component />` for better parsing
3. Ensure conditional JSX elements are properly wrapped and positioned in component tree

### Related Files
- `artifacts/lending-os/src/pages/collections/list.tsx`

**Last Updated**: 2026-08-19
**Next Review**: Before production deployment