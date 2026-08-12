# Request Execution Flow

## Overview
This document describes the request execution flow through the LenderOS API server, including all middleware, authentication, authorization, and error handling layers.

## Middleware Chain (Order of Execution)

```
1. pinoHttp (Request Logging)
   ↓
2. Clerk Proxy Middleware (/api/__clerk)
   ↓
3. CORS (Origin Validation)
   ↓
4. express.json() / express.urlencoded() (Body Parsing)
   ↓
5. General Rate Limiter (100 req/15min)
   ↓
6. Clerk Middleware (Authentication)
   ↓
7. Auth Rate Limiter (20 req/15min) - /api/auth, /api/sign-in, /api/sign-up
   ↓
8. Strict Rate Limiter (30 req/15min) - /api/tenants, /api/users
   ↓
9. API Router (/api/*)
   ↓
   ├─ Health Router (/api/healthz) - No auth required
   ├─ Tenants Router - requireAuth + requireSuperAdmin() + ensureTenantAccess()
   ├─ Users Router - requireAuth + requireSuperAdmin()
   ├─ Customers Router - requireAuth + requireTenantAccess()
   ├─ Loan Products Router - requireAuth + requireTenantAccess()
   ├─ Loan Applications Router - requireAuth + requireTenantAccess()
   ├─ KYC Router - requireAuth + requireTenantAccess()
   ├─ Risk Router - requireAuth + requireTenantAccess()
   ├─ Offers Router - requireAuth + requireTenantAccess()
   ├─ Loans Router - requireAuth + requireTenantAccess()
   ├─ Repayments Router - requireAuth + requireTenantAccess()
   ├─ Collections Router - requireAuth + requireTenantAccess()
   ├─ Analytics Router - requireAuth + requireSuperAdmin()
   └─ Settings Router - requireAuth + requireTenantAccess()
   ↓
10. Global Error Handler
```

## Detailed Flow

### 1. Request Logging (pinoHttp)
- Logs every request with method, URL, request ID
- Logs response status code
- **Skipped in test environment** (NODE_ENV=test)

### 2. Clerk Proxy Middleware
- **Path**: `/api/__clerk/*`
- Proxies requests to Clerk Frontend API (`https://frontend-api.clerk.dev`)
- **Only active in production** (NODE_ENV=production)
- Adds `Clerk-Proxy-Url` and `Clerk-Secret-Key` headers
- Handles response buffering for Cloud Run compatibility

### 3. CORS Validation
- **Allowed Origins**: From `CORS_ALLOWED_ORIGINS` env var (comma-separated)
- **Default**: `http://localhost:5173`, `http://localhost:3000`
- **Credentials**: Enabled (cookies/auth headers allowed)
- Rejects requests from unauthorized origins with 403

### 4. Body Parsing
- JSON body parser (express.json())
- URL-encoded body parser (express.urlencoded({ extended: true }))

### 5. General Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Excluded**: `/healthz` endpoint
- **Response**: 429 with retry-after header

### 6. Clerk Authentication
- **Condition**: Only if `CLERK_PUBLISHABLE_KEY` is valid (not placeholder)
- Extracts `userId` from Clerk session
- Sets `publishableKey` based on request host (for multi-domain)
- **Demo Mode**: If Clerk not configured, runs in local mode without auth

### 7. Auth Rate Limiting (Stricter)
- **Paths**: `/api/auth`, `/api/sign-in`, `/api/sign-up`
- **Window**: 15 minutes
- **Limit**: 20 requests per IP
- Prevents brute force on authentication endpoints

### 8. Strict Rate Limiting (Sensitive Operations)
- **Paths**: `/api/tenants`, `/api/users`
- **Window**: 15 minutes
- **Limit**: 30 requests per IP
- Protects tenant/user management endpoints

### 9. API Router
All routes mounted under `/api`:

#### Health Check (`/api/healthz`)
- **Auth**: Not required
- **Rate Limit**: Excluded from general limiter
- **Response**: 
  - 200: `{ status: "ok", api: "ok", database: "ok", uptime, timestamp, version }`
  - 503: `{ status: "degraded", api: "ok", database: "down", uptime, timestamp, version }`

#### Protected Routes (All Others)
- **Auth**: `requireAuth` middleware required
- Extracts user via:
  1. `x-demo-user-id` header (demo mode)
  2. Clerk session (production)
  3. Demo super admin fallback (development only)
- Creates/updates user in database via `getOrCreateUser()`
- Attaches to request: `clerkId`, `userRole`, `user`

#### Tenant Routes (`/api/tenants`)
- **Auth**: requireAuth + requireSuperAdmin() + ensureTenantAccess()
- **Operations**: List, Create, Get, Update, Delete, Approve, Stats
- **Tenant Isolation**: Super admin sees all, tenant users see only their tenant

#### User Routes (`/api/users`)
- **Auth**: requireAuth + requireSuperAdmin()
- **Operations**: List, Create, Get, Update, Delete, Me

#### Customer Routes (`/api/customers`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: List, Create, Get, Update, Delete

#### Loan Product Routes (`/api/loan-products`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: List, Create, Get, Update, Delete

#### Loan Application Routes (`/api/loan-applications`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: List, Create, Get, Update, Approve, Reject, Disburse

#### KYC Routes (`/api/kyc`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: Get, Update, Verify

#### Risk Routes (`/api/risk`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: Calculate, Get, History

#### Offers Routes (`/api/offers`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: List, Create, Get, Accept, Reject

#### Loan Routes (`/api/loans`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: List, Get, Schedule, Close

#### Repayment Routes (`/api/repayments`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: List, Record Payment, Schedule

#### Collections Routes (`/api/collections`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: List, Update, Assign, Prioritize

#### Analytics Routes (`/api/analytics`)
- **Auth**: requireAuth + requireSuperAdmin()
- **Operations**: Platform Summary, Revenue Trends, Loan Funnel, Collection Rates

#### Settings Routes (`/api/settings`)
- **Auth**: requireAuth + requireTenantAccess()
- **Operations**: Get, Update Tenant Settings

### 10. Global Error Handler
- Catches all unhandled errors
- Logs error with pino
- Returns 500 with error message (if headers not sent)
- **Demo Fallback Removed** (previously returned mock data on DB errors)

## Authentication Flow

```
Request
  ↓
Has x-demo-user-id header?
  ├─ YES → Use as clerkId (Demo Mode)
  └─ NO → Clerk configured?
          ├─ YES → getAuth(req) → clerkId from session
          └─ NO → Demo Mode?
                  ├─ YES → clerkId = "user_demo_super_admin"
                  └─ NO → 401 Unauthorized
  ↓
getOrCreateUser(clerkId, email?)
  ├─ Found by clerkId → Return user
  ├─ Demo clerkId → Map to seeded user email → Update clerkId → Return user
  ├─ Email provided → Create new user (role: customer) → Return user
  └─ No email → Return null → 401 (production) / Continue (demo)
  ↓
Attach to request: req.clerkId, req.userRole, req.user
  ↓
Next middleware / Route handler
```

## Authorization Flow

```
Route Handler
  ↓
requireAuth (already ran)
  ↓
RBAC Middleware (e.g., requireSuperAdmin())
  ├─ Check req.userRole exists
  │   └─ NO → 401 Unauthorized
  ├─ Check role hierarchy level >= required level
  │   └─ NO → 403 Forbidden
  └─ YES → Next
  ↓
ensureTenantAccess() (if tenant-scoped)
  ├─ Super Admin / Platform Admin → Allow
  ├─ Check req.params.tenantId / req.body.tenantId / req.query.tenantId
  │   └─ Match req.user.tenantId → Allow
  └─ NO → 403 Forbidden
  ↓
Route Logic
```

## Rate Limiting Flow

```
Request
  ↓
General Limiter (all routes except /healthz)
  ├─ Exceeded → 429 Too Many Requests
  └─ OK → Next
  ↓
Auth Limiter (/api/auth, /api/sign-in, /api/sign-up)
  ├─ Exceeded → 429 Too Many Requests
  └─ OK → Next
  ↓
Strict Limiter (/api/tenants, /api/users)
  ├─ Exceeded → 429 Too Many Requests
  └─ OK → Next
```

## Error Handling Flow

```
Error thrown in route handler
  ↓
Caught by Promise wrapper in app.ts
  ↓
Logger.error({ err, req: req.path })
  ↓
Headers sent?
  ├─ YES → End response
  └─ NO → 500 JSON response
          {
            "error": "Internal server error",
            "message": "<error message>"
          }
```

## Data Flow for Tenant-Scoped Operations

```
Request to /api/loan-applications
  ↓
requireAuth → Sets req.user, req.userRole
  ↓
requireTenantAccess()
  ├─ Super Admin → Pass
  ├─ req.user.tenantId === req.params.tenantId → Pass
  └─ Mismatch → 403 Forbidden
  ↓
Route handler
  ↓
Drizzle queries with .where(eq(table.tenantId, tenantId))
  ↓
Response with tenant-scoped data
```

## Health Check Flow

```
GET /api/healthz
  ↓
checkDatabaseHealth()
  ├─ db.execute(sql`SELECT 1`) succeeds → "ok"
  └─ Fails → "down" (logged)
  ↓
getUptimeSeconds() → Math.floor((Date.now() - serverStartTime) / 1000)
  ↓
Build response object
  ↓
HealthCheckResponse.parse() (Zod validation)
  ↓
Status Code: 200 (ok) or 503 (degraded)
  ↓
JSON Response
```