# AGENTS.md — LenderOS Universal AI Agent Instructions

This is the canonical instruction file for AI coding agents working on LenderOS.
It must remain agent-agnostic: usable by OpenCode, Claude Code, Codex, Cursor,
Windsurf, Gemini CLI, Cline, GitHub Copilot, and other MCP-compatible agents.

---

## Project Overview

**LenderOS** is a multi-tenant AI lending operating system — a SaaS platform where
NBFCs, banks, fintechs, and lending service providers (LSPs) onboard independently
and run digital lending operations with full tenant data isolation.

Think of it as **Shopify + Salesforce + Stripe + OpenAI for lending**: one platform,
many lenders, each with their own customers, products, risk rules, and white-labeled
branding.

### Current Development State

- Multi-tenant architecture: isolated tenants, users, customers, products, applications, active loans, collections
- Zero-Config Demo Mode: out-of-the-box local execution without live Clerk API keys
- 1-Click Demo Role Switcher: instant switching between Super Admin, Tenant Admin, Relationship Manager, Customer
- REST API: Express 5 with OpenAPI spec, Zod validation, Pino logging, React Query hooks
- Authentication & RBAC: Clerk integration + graceful local demo fallback
- Super-Admin Dashboard: platform overview, global analytics, tenant management & onboarding
- Tenant Command Center: applications, customer CRM, active loan book, loan products, collections
- Customer Portal: digital loan application flow (`/apply`)
- AI Risk & Underwriting: scoring engine calculating risk grade (A1–C3), DTI ratio, credit weight, recommendation
- Collections Management: DPD tracking, automated priority scoring (0–100), agent assignment

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LenderOS Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐     ┌──────────────────────┐     ┌──────────────────┐   │
│  │   Browser    │     │      API Server      │     │   Data Layer     │   │
│  │   (Client)   │────▶│    (Express 5)       │────▶│  (PostgreSQL 16) │   │
│  │              │     │                      │     │                  │   │
│  │ • React 19   │     │ • Auth Middleware    │     │ • Drizzle ORM    │   │
│  │ • Vite 7     │     │   (Clerk / Demo)     │     │ • Migrations     │   │
│  │ • Tailwind 4 │     │ • Domain Routes      │     │ • Seeding        │   │
│  │ • Wouter     │     │ • Rate Limiting      │     │                  │   │
│  │ • TanStack Q │     │ • CORS               │     │                  │   │
│  └──────────────┘     └──────────────────────┘     └──────────────────┘   │
│         ▲                      ▲                        ▲                  │
│         │                      │                        │                  │
│         │              ┌───────┴───────┐                │                  │
│         │              │ Contract Layer│                │                  │
│         │              │               │                │                  │
│         └──────────────│ • OpenAPI 3.0 │                │                  │
│                        │   (YAML)      │                │                  │
│                        │ • Orval       │                │                  │
│                        │   Codegen     │                │                  │
│                        │ • Zod Schemas │                │                  │
│                        │ • React Hooks │                │                  │
│                        └───────────────┘                │                  │
│                                                           │                  │
└───────────────────────────────────────────────────────────┘                  │
```

### Package/Workspace Structure (pnpm workspaces)

```
LenderOS/
├── AGENTS.md                    # This file — canonical AI agent instructions
├── BUSINESS_OVERVIEW.md         # Business perspective document
├── DEMO_CREDENTIALS.md          # Seeded demo accounts for role testing
├── change-log.md                # Keep a Changelog format
├── decisions.md                 # Architecture Decision Records (ADRs)
├── execution-flow.md            # Request execution flow documentation
├── known-issues.md              # Known technical issues
├── package.json                 # Root package.json (workspace config)
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── docker-compose.yml           # Local PostgreSQL service
├── .env.example                 # Environment variable template
├── tsconfig.base.json           # Base TypeScript config
├── tsconfig.json                # Root TypeScript config
├── .npmrc                       # npm/pnpm configuration
├── .replit                      # Replit configuration
├── .gitignore                   # Git ignore rules
├── artifacts/
│   ├── api-server/              # Express 5 API server (port 5000)
│   │   ├── src/
│   │   │   ├── app.ts           # Express app factory (createApp)
│   │   │   ├── index.ts         # Entry point
│   │   │   ├── routes/          # Domain route handlers
│   │   │   │   ├── health.ts    # Health check endpoint
│   │   │   │   ├── health.test.ts  # Vitest unit tests
│   │   │   │   ├── tenants.ts   # Tenant management
│   │   │   │   ├── users.ts     # User management
│   │   │   │   ├── customers.ts # Customer CRM
│   │   │   │   ├── loanApplications.ts
│   │   │   │   ├── loanProducts.ts
│   │   │   │   ├── loans.ts
│   │   │   │   ├── kyc.ts
│   │   │   │   ├── risk.ts
│   │   │   │   ├── offers.ts
│   │   │   │   ├── repayments.ts
│   │   │   │   ├── collections.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── settings.ts
│   │   │   │   └── index.ts     # Router aggregation
│   │   │   ├── middlewares/
│   │   │   │   ├── clerkProxyMiddleware.ts  # Clerk Frontend API proxy
│   │   │   │   ├── rateLimiter.ts           # express-rate-limit tiers
│   │   │   │   └── rbac.ts                  # RBAC middleware
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts      # Authentication & user resolution
│   │   │   │   ├── logger.ts    # Pino logger
│   │   │   │   ├── idgen.ts     # ID generation
│   │   │   │   └── demoData.ts  # Demo fallback data (deprecated)
│   │   │   └── seed.ts          # Database seeding script
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── build.mjs            # esbuild build script
│   │   └── vitest.config.ts     # Vitest configuration
│   ├── lending-os/              # React 19 frontend (Vite, port 5173)
│   │   ├── src/
│   │   │   ├── App.tsx          # Root component with routing
│   │   │   ├── main.tsx         # Entry point
│   │   │   ├── pages/           # Page components
│   │   │   ├── components/      # Shared UI components
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   └── lib/             # Frontend utilities
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── index.html
│   └── mockup-sandbox/          # UI component testing sandbox
├── lib/
│   ├── api-spec/                # OpenAPI 3.0 spec + Orval config
│   │   ├── openapi.yaml         # Single source of truth for API contracts
│   │   ├── orval.config.ts      # Orval codegen configuration
│   │   └── package.json
│   ├── api-zod/                 # Generated Zod validation schemas
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── generated/       # Generated by Orval
│   │   └── package.json
│   ├── api-client-react/        # Generated React Query hooks + fetcher
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── custom-fetch.ts  # Custom fetch with auth/demo headers
│   │   │   └── generated/       # Generated by Orval
│   │   └── package.json
│   └── db/                      # Drizzle PostgreSQL schema & connection
│       ├── src/
│       │   ├── index.ts         # Drizzle instance + pool export
│       │   └── schema/          # Table definitions
│       │       ├── tenants.ts
│       │       ├── users.ts
│       │       ├── customers.ts
│       │       ├── loanProducts.ts
│       │       ├── loanApplications.ts
│       │       └── loans.ts
│       ├── drizzle.config.ts    # Drizzle Kit configuration
│       └── package.json
└── scripts/
    ├── setup.mjs                # One-time project setup
    ├── dev.mjs                  # Concurrent dev runner
    └── run-with-env.mjs         # Environment loading helper
```

### Key Design Principles

1. **OpenAPI-First**: `lib/api-spec/openapi.yaml` is the single source of truth;
   Zod schemas and React Query hooks are generated automatically via Orval.
2. **Tenant Isolation**: Every lending entity operates in complete isolation;
   platform admins oversee multi-tenant operations.
3. **Contract-Driven Type Safety**: TypeScript 5.9, Drizzle ORM, Zod v4,
   generated API client.
4. **Zero-Config Developer Experience**: Runs locally out-of-the-box in Demo Mode
   without requiring third-party API accounts.
5. **Production-Ready Defaults**: Rate limiting, CORS restriction, RBAC,
   structured logging, health checks.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 24, pnpm workspaces |
| Frontend | React 19, Vite 7, Tailwind CSS 4, ShadCN UI, Wouter, TanStack Query, Lucide Icons |
| Backend | Express 5, Pino logging, esbuild |
| Database | PostgreSQL 16, Drizzle ORM, drizzle-zod |
| Auth | Clerk (`@clerk/express`, `@clerk/react`) with seamless local Demo Mode fallback |
| Codegen | Orval (OpenAPI → Zod + React Query) |
| Testing | Vitest, Supertest (API server) |
| Build | esbuild (API), Vite (Frontend) |
| Linting | Prettier (via package.json) |

---

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# One-time setup: starts Postgres, installs deps, pushes schema, seeds demo data
pnpm setup

# Development (runs API + Frontend concurrently)
pnpm dev

# Run API server only
pnpm dev:api

# Run Vite web frontend only
pnpm dev:web

# Push Drizzle schema changes to PostgreSQL
pnpm db:push

# Seed demo tenants, users, loans, applications
pnpm db:seed

# Reset database (down + setup)
pnpm db:reset

# Regenerate Zod schemas & React Query hooks from OpenAPI spec
pnpm codegen

# Type checking across all monorepo packages
pnpm typecheck

# Type checking only lib packages
pnpm typecheck:libs

# Production build for all applications
pnpm build

# Run API server tests
pnpm --filter @workspace/api-server test

# Run API server typecheck
pnpm --filter @workspace/api-server typecheck

# Run API server build
pnpm --filter @workspace/api-server build
```

---

## Test Commands

```bash
# API server tests (Vitest + Supertest)
pnpm --filter @workspace/api-server test

# Run tests with UI (if available)
pnpm --filter @workspace/api-server test -- --ui

# Run tests in watch mode
pnpm --filter @workspace/api-server test -- --watch
```

---

## Build Commands

```bash
# Build all packages
pnpm build

# Build API server only
pnpm --filter @workspace/api-server build

# Build frontend only
pnpm --filter @workspace/lending-os build
```

---

## Typecheck Commands

```bash
# Typecheck all packages (libs + artifacts)
pnpm typecheck

# Typecheck only lib packages
pnpm typecheck:libs

# Typecheck API server
pnpm --filter @workspace/api-server typecheck

# Typecheck frontend
pnpm --filter @workspace/lending-os typecheck
```

---

## Lint Commands

```bash
# Format with Prettier (if configured)
pnpm exec prettier --write .

# Check formatting
pnpm exec prettier --check .
```

---

## Coding Conventions

### General TypeScript

- Use TypeScript 5.9+ features
- Prefer `type` over `interface` for simple types
- Use `const` assertions for literal types
- Enable `strict: true` in tsconfig
- Use Zod for runtime validation (generated from OpenAPI)
- Avoid `any` — use proper generics or `unknown`
- Use `readonly` for immutable data structures

### Backend (API Server)

- **Routes**: One file per domain (e.g., `tenants.ts`, `customers.ts`)
- **Middleware**: Separate files in `src/middlewares/`
- **Authentication**: Use `requireAuth` from `../lib/auth`
- **Authorization**: Use RBAC middleware from `../middlewares/rbac`
  - `requireSuperAdmin()` — platform-level access
  - `requireTenantAdmin()` — tenant admin + above
  - `requireTenantAccess()` — any tenant role
  - `requireCustomerAccess()` — customer + above
  - `ensureTenantAccess()` — tenant isolation guard
- **Validation**: Use Zod schemas from `@workspace/api-zod`
  - Parse request: `Schema.safeParse(req.body)`
  - Response: `ResponseSchema.parse(data)`
- **Error Handling**: Throw errors, let global handler catch
  - Don't return error responses from route handlers directly
- **Database**: Use Drizzle ORM from `@workspace/db`
  - Import: `import { db, tenantsTable } from "@workspace/db"`
  - Use `eq`, `and`, `desc`, `count`, `sql` from `drizzle-orm`
- **Logging**: Use `logger` from `../lib/logger` (Pino)
- **IDs**: Use `genId()` from `../lib/idgen` (crypto.randomUUID)
- **Environment**: Access via `process.env.VAR_NAME`

### Frontend (React)

- **Routing**: Wouter (lightweight, hook-based)
- **State**: TanStack Query (server state), React context (client state)
- **Components**: ShadCN UI + custom components in `src/components/`
- **Styling**: Tailwind CSS 4 (CSS-first config)
- **Forms**: React Hook Form + Zod resolver (use generated schemas)
- **API Calls**: Use generated hooks from `@workspace/api-client-react`
  - `useGetMe()`, `useListTenants()`, `useCreateTenant()`, etc.
- **Auth**: Clerk React (`@clerk/react`) — `ClerkProvider`, `SignIn`, `SignUp`
- **Demo Mode**: `x-demo-user-id` header via custom fetch
- **Theme**: Dark mode default, `ThemeProvider` with localStorage persistence

### API Conventions

- **RESTful**: Standard HTTP verbs and status codes
- **Prefix**: All routes under `/api`
- **Health**: `/api/healthz` (no auth, no rate limit)
- **Pagination**: Query params `page`, `limit` (default 1, 20)
- **Filtering**: Query params per resource (e.g., `status`, `type`)
- **Errors**: Standard format `{ error: string, message: string }`
- **Validation**: Zod parse in route handlers, 400 on failure
- **Versioning**: Not yet implemented (planned: `/api/v1/`)

### Database Conventions

- **Schema**: Defined in `lib/db/src/schema/*.ts`
- **Tables**: snake_case, singular (e.g., `tenants`, `loan_applications`)
- **Columns**: snake_case, descriptive names
- **Primary Keys**: `id` (text, UUID via `genId()`)
- **Foreign Keys**: Explicit `.references(() => otherTable.id)`
- **Timestamps**: `created_at`, `updated_at` (auto-managed)
- **Enums**: PostgreSQL enums via `pgEnum` (e.g., `user_role`, `tenant_status`)
- **Indexes**: Add for frequently queried columns
- **Migrations**: Drizzle Kit (`pnpm db:push` for dev, migrations for prod)

### Security Rules

1. **Never commit secrets**: `.env` is gitignored
2. **CORS**: Restricted via `CORS_ALLOWED_ORIGINS` env var
3. **Rate Limiting**: Three tiers (general, auth, strict)
4. **Auth**: Clerk in production, demo fallback only in development
5. **RBAC**: All protected routes require authorization middleware
6. **Tenant Isolation**: `ensureTenantAccess()` on all tenant-scoped routes
7. **Input Validation**: Zod parse all request bodies/params
8. **SQL Injection**: Drizzle ORM parameterized queries (safe by default)

### Dependency Rules

1. **Workspace packages**: Use `workspace:*` protocol
2. **Catalog**: Use `catalog:` for shared dependencies (defined in pnpm-workspace.yaml)
3. **Minimum release age**: 1 day (1440 min) enforced by pnpm
4. **Peer dependencies**: Check with `pnpm peers check`
5. **No duplicate dependencies**: Use workspace protocol

---

## AI Agent Workflow

### Context-Efficient Exploration (MANDATORY)

**DO NOT read the entire repository for every task.**

Follow this workflow:

1. **Understand the Task**
   - What is the user asking for?
   - What subsystem is likely involved?

2. **Query Code Graph** (if available)
   - Search for relevant symbols, functions, classes
   - Find call chains and dependencies
   - Identify blast radius of changes

3. **Retrieve Project Memory**
   - Read `docs/project-memory.md`
   - Read `docs/decisions.md` for relevant ADRs
   - Read `docs/known-issues.md` for known problems

4. **Identify Relevant Files**
   - Use symbol search, not directory traversal
   - Read only the specific files needed

5. **Implement**
   - Follow existing patterns and conventions
   - Update tests alongside implementation

6. **Test & Verify**
   - Run relevant tests
   - Run typecheck
   - Run build

7. **Update Documentation**
   - Update `docs/change-log.md`
   - Update `docs/decisions.md` for significant decisions
   - Update `docs/execution-flow.md` if architecture changes
   - Update `docs/known-issues.md` if new issues discovered

### Code Review Requirements

Before declaring a feature complete, review:

- **Correctness**: Does it actually work?
- **Architecture**: Does it fit the existing architecture?
- **Security**: Did the change introduce vulnerabilities?
- **Performance**: Did it introduce unnecessary computation?
- **UX**: Does the feature make sense to the user?
- **Maintainability**: Will another developer understand it?
- **Regression Risk**: What existing functionality could break?

### Definition of Done

A task is complete only when:

- [ ] Implementation follows project conventions
- [ ] Tests pass (existing + new)
- [ ] Typecheck passes
- [ ] Build succeeds
- [ ] Documentation updated (change-log, decisions, execution-flow, known-issues)
- [ ] Code graph updated (if applicable)
- [ ] No secrets committed
- [ ] No unrelated changes

---

## Code Graph (code-review-graph)

### Installation

```bash
# Install code-review-graph globally or as dev dependency
npm install -g code-review-graph
# OR
pnpm add -D code-review-graph
```

### Usage

```bash
# Generate code graph for the repository
code-review-graph generate --workspace-root .

# Query the graph
code-review-graph query "find all functions calling db.execute"
code-review-graph query "show call chain for requireAuth"
code-review-graph query "list all route handlers in api-server"

# Update graph after changes
code-review-graph update
```

### Integration with AI Agents

Agents should use the code graph to:
- Find relevant symbols without full repo reads
- Understand call chains and dependencies
- Assess blast radius of changes
- Navigate to exact file locations

---

## Persistent Memory

### Repository-Based Memory (Primary)

The following files in `docs/` serve as persistent project memory:

| File | Purpose |
|------|---------|
| `project-memory.md` | Compact durable knowledge for future sessions |
| `decisions.md` | Architecture Decision Records (ADRs) |
| `execution-flow.md` | Request execution flow documentation |
| `change-log.md` | Keep a Changelog format history |
| `known-issues.md` | Known technical issues |

### claude-mem (Optional Enhancement)

If available in the agent environment, claude-mem can provide
cross-session memory. However, the repository-based memory above
is the primary and universal mechanism.

---

## MCP Configuration

If the agent environment supports MCP (Model Context Protocol):

1. Configure code-review-graph MCP server if available
2. Configure any project-specific MCP servers
3. Document configuration in `.mcp.json` or agent-specific config

---

## Agent-Specific Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | **Canonical** — all agents read this |
| `CLAUDE.md` | Claude-specific overrides (if needed) |
| `.cursorrules` | Cursor-specific rules (if needed) |
| `.windsurfrules` | Windsurf-specific rules (if needed) |

**Rule**: AGENTS.md is the single source of truth. Agent-specific files
should only contain overrides or additions, not duplicate the full instruction set.

---

## Environment Requirements

- Node.js 24+
- pnpm 9+
- PostgreSQL 16 (via Docker or local)
- Clerk account (for production auth)

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://lenderos:lenderos@localhost:5432/lenderos

# API Server
PORT=5000
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Clerk (required for production)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Frontend
VITE_PORT=5173
BASE_PATH=/
API_PROXY_TARGET=http://localhost:5000
```

---

## Common Debugging Procedures

### Database Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check database connection
pnpm exec tsx -e "import { db } from '@workspace/db'; import { sql } from 'drizzle-orm'; console.log(await db.execute(sql`SELECT 1`))"

# Push schema changes
pnpm db:push

# Reset and reseed
pnpm db:reset
```

### Type Errors

```bash
# Full typecheck
pnpm typecheck

# Lib-only typecheck
pnpm typecheck:libs

# Single package
pnpm --filter @workspace/api-server typecheck
```

### Build Failures

```bash
# Clean build
pnpm build

# Single package
pnpm --filter @workspace/api-server build
```

### Test Failures

```bash
# Run with verbose output
pnpm --filter @workspace/api-server test -- --reporter=verbose

# Run specific test file
pnpm --filter @workspace/api-server test -- src/routes/health.test.ts
```

---

## Documentation Requirements

Every significant change must update:

1. **`docs/change-log.md`** — What changed, why, files affected
2. **`docs/decisions.md`** — New ADRs for architectural decisions
3. **`docs/execution-flow.md`** — If request flow changes
4. **`docs/known-issues.md`** — If new issues discovered
5. **`docs/project-memory.md`** — If durable knowledge changes
6. **`AGENTS.md`** — If conventions or workflows change

---

## Important Files to Know

| File | Description |
|------|-------------|
| `lib/api-spec/openapi.yaml` | Single source of truth for API |
| `artifacts/api-server/src/app.ts` | Express app factory |
| `artifacts/api-server/src/lib/auth.ts` | Authentication logic |
| `artifacts/api-server/src/middlewares/rbac.ts` | Authorization middleware |
| `artifacts/api-server/src/middlewares/rateLimiter.ts` | Rate limiting |
| `artifacts/api-server/src/routes/index.ts` | Route aggregation |
| `lib/db/src/index.ts` | Drizzle instance |
| `lib/db/src/schema/*.ts` | Database schema |
| `artifacts/lending-os/src/App.tsx` | Frontend root + routing |
| `artifacts/lending-os/src/main.tsx` | Frontend entry |

---

## Version Information

- Current version: 0.1.0 (development)
- Package manager: pnpm 11.x
- Node.js: 24.x
- TypeScript: 5.9.x

---

## Contact / Resources

- Business Overview: `BUSINESS_OVERVIEW.md`
- Demo Credentials: `DEMO_CREDENTIALS.md`
- Routes Documentation: `ROUTES.md`
- Roadmap: `ROADMAP.md`