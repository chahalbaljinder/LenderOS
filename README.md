# LenderOS

A multi-tenant AI lending operating system — a SaaS platform where NBFCs, banks, fintechs, and lending service providers (LSPs) onboard independently and run lending operations with full tenant isolation.

Think of it as **Shopify + Salesforce + Stripe + OpenAI for lending**: one platform, many lenders, each with their own customers, products, risk rules, and branding.

---

## What it does today

| Area | Status |
|------|--------|
| Multi-tenant data model | Tenants, users, customers, products, applications, loans |
| REST API | Express 5 with OpenAPI spec, Zod validation, React Query hooks |
| Authentication | Clerk (sign-in / sign-up, role-based routing) |
| Super-admin dashboard | Platform overview, tenant management |
| Tenant dashboard | Applications, customers, loans, collections |
| Customer portal | Loan application flow (`/apply`) |
| Landing page | Marketing site with features, pricing, FAQ |
| AI / risk engine | API routes for scoring, KYC, offers (backend stubs + seed data) |

Planned modules (from product spec): OCR, eSign, disbursements, marketplace, workflow builder, partner APIs, notifications, and more.

---

## Architecture

```mermaid
flowchart TB
  subgraph client [Browser]
    UI[Lending OS UI<br/>React 19 + Vite]
  end

  subgraph api [API Server]
    Express[Express 5]
    ClerkMW[Clerk Middleware]
    Routes[Domain Routes]
  end

  subgraph data [Data Layer]
    PG[(PostgreSQL)]
    Drizzle[Drizzle ORM]
  end

  subgraph codegen [Contract Layer]
    OpenAPI[openapi.yaml]
    Orval[Orval Codegen]
    ZodSchemas[@workspace/api-zod]
    ReactHooks[@workspace/api-client-react]
  end

  UI -->|"/api/*"| Express
  Express --> ClerkMW --> Routes
  Routes --> Drizzle --> PG
  OpenAPI --> Orval
  Orval --> ZodSchemas
  Orval --> ReactHooks
  ReactHooks --> UI
  Routes --> ZodSchemas
```

### Design principles

- **OpenAPI-first** — `lib/api-spec/openapi.yaml` is the contract; Zod schemas and React Query hooks are generated via Orval.
- **Tenant isolation** — every lending entity is scoped to a tenant; platform admins operate across tenants.
- **Monorepo workspaces** — shared libraries in `lib/`, runnable apps in `artifacts/`.
- **Type-safe end-to-end** — TypeScript 5.9, Drizzle ORM, Zod v4, generated API client.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 24, pnpm workspaces |
| Frontend | React 19, Vite 7, Tailwind CSS 4, ShadCN UI, Wouter, TanStack Query, Framer Motion |
| Backend | Express 5, Pino logging |
| Database | PostgreSQL 16, Drizzle ORM, drizzle-zod |
| Auth | Clerk (`@clerk/express`, `@clerk/react`) |
| Codegen | Orval (OpenAPI → Zod + React Query) |
| Build | esbuild (API bundle), Vite (frontend) |

---

## Repository layout

```
LenderOS/
├── artifacts/
│   ├── api-server/       # Express API (port 5000)
│   ├── lending-os/       # Main web app (port 5173)
│   └── mockup-sandbox/   # UI component sandbox
├── lib/
│   ├── api-spec/         # OpenAPI spec + Orval config
│   ├── api-zod/          # Generated Zod schemas (do not edit by hand)
│   ├── api-client-react/ # Generated React Query hooks (do not edit by hand)
│   └── db/               # Drizzle schema + migrations push
├── scripts/              # Local dev & setup helpers
├── attached_assets/      # Product spec & design references
├── docker-compose.yml    # Local PostgreSQL
└── .env.example          # Environment template
```

### Key files

| File | Purpose |
|------|---------|
| `lib/api-spec/openapi.yaml` | API contract (source of truth) |
| `lib/db/src/schema/` | Database tables and enums |
| `artifacts/api-server/src/routes/` | Route handlers |
| `artifacts/api-server/src/seed.ts` | Demo data for local dev |
| `artifacts/lending-os/src/App.tsx` | Routes, auth, role redirects |

---

## Prerequisites

- **Node.js 24+**
- **pnpm** (npm/yarn are blocked by the workspace preinstall hook)
- **Docker Desktop** (for local PostgreSQL)
- **Clerk account** — [dashboard.clerk.com](https://dashboard.clerk.com) (free tier works)

---

## Local development

### 1. First-time setup

```bash
# Clone and enter the repo
cd LenderOS

# Bootstrap: create .env, start Postgres, install deps, push schema, seed data
pnpm setup
```

This will:

1. Copy `.env.example` → `.env` (if missing)
2. Start PostgreSQL via Docker Compose
3. Run `pnpm install`
4. Push the Drizzle schema to the database
5. Seed demo tenants, customers, loans, and collections

### 2. Configure Clerk

Edit `.env` and set your Clerk keys:

```env
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

In the Clerk dashboard, add these to **Allowed origins**:

- `http://localhost:5173`

### 3. Start the dev stack

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost:5173 |
| API health | http://localhost:5000/api/healthz |
| PostgreSQL | `localhost:5432` (user/pass/db: `lenderos`) |

The dev script starts the API server and Vite frontend together. API requests from the browser are proxied through Vite (`/api` → `localhost:5000`).

### 4. Verify progress

After signing in via Clerk, role-based routing sends you to:

- **Super admin / platform admin** → `/dashboard` (platform stats, tenant list)
- **Tenant staff** → `/dashboard` (tenant workspace)
- **Customer** → `/apply` (loan application)

Quick smoke checks:

```bash
# API is up
curl http://localhost:5000/api/healthz

# Typecheck everything
pnpm typecheck

# Full production build
pnpm build
```

---

## Common commands

| Command | Description |
|---------|-------------|
| `pnpm setup` | One-time local bootstrap (DB + schema + seed) |
| `pnpm dev` | Run API + frontend together |
| `pnpm dev:api` | API server only |
| `pnpm dev:web` | Frontend only |
| `pnpm db:push` | Push schema changes to PostgreSQL |
| `pnpm db:seed` | Reload demo data |
| `pnpm db:reset` | Wipe DB volume and re-run setup |
| `pnpm codegen` | Regenerate Zod + React Query from OpenAPI |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm build` | Typecheck + build all artifacts |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | Yes | API server port (default `5000`) |
| `VITE_PORT` | Yes | Frontend dev port (default `5173`) |
| `BASE_PATH` | Yes | Frontend base path (use `/` locally) |
| `API_PROXY_TARGET` | Dev | Vite proxy target for `/api` |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (API server) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (frontend) |
| `VITE_CLERK_PROXY_URL` | No | Production Clerk proxy URL |

See [`.env.example`](.env.example) for a full template.

---

## API overview

All routes are mounted under `/api`. Major resource groups:

| Tag | Endpoints | Description |
|-----|-----------|-------------|
| `health` | `GET /healthz` | Liveness check |
| `tenants` | CRUD + approve, stats | Tenant lifecycle |
| `users` | `/me`, list, CRUD | Auth-linked user profiles |
| `customers` | CRUD, search | Borrower records |
| `loan-products` | CRUD | Product catalog per tenant |
| `loan-applications` | CRUD, status transitions | Origination pipeline |
| `kyc` | Verify PAN, Aadhaar, face, employment | KYC workflow |
| `risk` | Score, credit report | AI risk engine |
| `offers` | Generate, accept, reject | Offer engine |
| `loans` | CRUD, disburse | Active loan book |
| `repayments` | Schedule, record payment | EMI tracking |
| `collections` | List, assign, resolve | Delinquency management |
| `analytics` | Dashboards, trends | Reporting |
| `audit` | Log viewer | Compliance trail |
| `settings` | Tenant + platform config | Configuration |

Full spec: [`lib/api-spec/openapi.yaml`](lib/api-spec/openapi.yaml)

---

## User roles

| Role | Access |
|------|--------|
| `super_admin` | Full platform control |
| `platform_admin` | Platform operations |
| `tenant_owner` / `tenant_admin` | Tenant configuration & ops |
| `risk_manager` | Underwriting & risk |
| `loan_manager` | Origination & disbursement |
| `collection_manager` | Delinquency & recovery |
| `relationship_manager` | Customer relationships |
| `customer` | Self-service apply portal |
| `auditor` / `compliance_officer` | Read-only audit access |

---

## Database

Schema lives in `lib/db/src/schema/`. Tables include:

- `tenants`, `tenant_settings`
- `users`
- `customers`
- `loan_products`
- `loan_applications`, `kyc_records`, `risk_scores`, `loan_offers`
- `loans`, `repayments`, `collections`
- `audit_logs`, `api_keys`

Push schema changes (development only):

```bash
pnpm db:push
```

Load demo data:

```bash
pnpm db:seed
```

---

## Regenerating API clients

After editing `lib/api-spec/openapi.yaml`:

```bash
pnpm codegen
```

This updates:

- `lib/api-zod/src/generated/` — request/response Zod schemas
- `lib/api-client-react/src/generated/` — React Query hooks

Do not edit generated files manually.

---

## Product roadmap

The full product vision (modules, customer journey, AI capabilities, marketplace) is documented in [`attached_assets/`](attached_assets/). High-level planned modules:

- Loan origination & KYC (PAN, Aadhaar, OCR, face match)
- AI underwriting & fraud detection
- Offer engine, eSign, disbursement
- Repayments, EMI calculator, collections
- Insurance & credit card marketplace
- Analytics, audit logs, workflow builder
- Partner / API management

---

## Troubleshooting

**`pnpm install` fails with "Use pnpm instead"**  
Install pnpm globally: `npm install -g pnpm`

**Database connection refused**  
Ensure Docker is running: `docker compose up -d`

**Clerk sign-in errors on localhost**  
Verify `http://localhost:5173` is in Clerk allowed origins and all three Clerk env vars are set.

**Frontend shows "Missing VITE_CLERK_PUBLISHABLE_KEY"**  
Copy `.env.example` to `.env` and fill in Clerk keys, then restart `pnpm dev`.

**Schema out of sync**  
Run `pnpm db:push` after pulling schema changes.

**Port already in use**  
Change `PORT` / `VITE_PORT` in `.env`.

---

## License

MIT
