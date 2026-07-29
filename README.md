# LenderOS

A multi-tenant AI lending operating system — a SaaS platform where NBFCs, banks, fintechs, and lending service providers (LSPs) onboard independently and run digital lending operations with full tenant data isolation.

Think of it as **Shopify + Salesforce + Stripe + OpenAI for lending**: one platform, many lenders, each with their own customers, products, risk rules, and white-labeled branding.

> 📖 **Business Overview**: For a comprehensive business perspective, market opportunity, monetization model, and regulatory compliance breakdown, view [`BUSINESS_OVERVIEW.md`](BUSINESS_OVERVIEW.md).

---

## What it does today

| Area | Status |
|------|--------|
| **Multi-Tenant Architecture** | Isolated tenants, users, customers, products, applications, active loans, and collections |
| **Zero-Config Demo Mode** | Out-of-the-box local execution without requiring live Clerk API keys |
| **1-Click Demo Role Switcher** | Switch instantly between **Super Admin**, **Tenant Admin**, **Relationship Manager**, and **Customer** in the UI |
| **REST API** | Express 5 with OpenAPI spec, Zod validation, Pino logging, and React Query hooks |
| **Authentication & RBAC** | Clerk integration (`@clerk/express`, `@clerk/react`) + graceful local demo fallback |
| **Super-Admin Dashboard** | Platform overview, global analytics, tenant management & onboarding |
| **Tenant Command Center** | Applications, customer CRM, active loan book, loan products, and collections |
| **Customer Portal** | Digital loan application flow (`/apply`) |
| **AI Risk & Underwriting** | Scoring engine calculating risk grade (`A1`-`C3`), DTI ratio, credit weight, and recommendation |
| **Collections Management** | DPD (Days Past Due) tracking, automated priority scoring (`0-100`), and agent assignment |

---

## Architecture

```mermaid
flowchart TB
  subgraph client [Browser / Client]
    UI[Lending OS UI<br/>React 19 + Vite]
    RoleSwitcher[Demo Role Switcher UI]
  end

  subgraph api [API Server]
    Express[Express 5]
    AuthMW[Auth Middleware<br/>Clerk / Demo Mode]
    Routes[Domain Routes]
  end

  subgraph data [Data Layer]
    PG[(PostgreSQL 16)]
    Drizzle[Drizzle ORM]
  end

  subgraph codegen [Contract Layer]
    OpenAPI[openapi.yaml]
    Orval[Orval Codegen]
    ZodSchemas[@workspace/api-zod]
    ReactHooks[@workspace/api-client-react]
  end

  UI -->|"/api/* (x-demo-user-id)"| Express
  Express --> AuthMW --> Routes
  Routes --> Drizzle --> PG
  OpenAPI --> Orval
  Orval --> ZodSchemas
  Orval --> ReactHooks
  ReactHooks --> UI
  Routes --> ZodSchemas
```

### Key Design Principles

- **OpenAPI-first**: `lib/api-spec/openapi.yaml` is the single source of truth; Zod schemas and React Query hooks are generated automatically.
- **Tenant Isolation**: Every lending entity operates in complete isolation; platform admins oversee multi-tenant operations.
- **Contract-Driven Type Safety**: TypeScript 5.9, Drizzle ORM, Zod v4, generated API client.
- **Zero-Config Developer Experience**: Runs locally out-of-the-box in Demo Mode without requiring third-party API accounts.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 24, pnpm workspaces |
| Frontend | React 19, Vite 7, Tailwind CSS 4, ShadCN UI, Wouter, TanStack Query, Lucide Icons |
| Backend | Express 5, Pino logging, esbuild |
| Database | PostgreSQL 16, Drizzle ORM, drizzle-zod |
| Auth | Clerk (`@clerk/express`, `@clerk/react`) with seamless local Demo Mode fallback |
| Codegen | Orval (OpenAPI → Zod + React Query) |

---

## Quick Start (Local Development)

### 1. Bootstrap Project

```bash
# Clone and enter directory
cd LenderOS

# Run one-time setup (starts Postgres container, installs deps, pushes schema, seeds demo users)
pnpm setup
```

### 2. Start Dev Server

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| **Web App** | [http://localhost:5173](http://localhost:5173) |
| **API Health** | [http://localhost:5000/api/healthz](http://localhost:5000/api/healthz) |
| **PostgreSQL** | `localhost:5432` (`user/pass/db: lenderos`) |

---

## Demo Accounts & Instant Role Switching

LenderOS includes **Zero-Config Demo Mode**. When opening `http://localhost:5173`, a green **"Switch Role"** dropdown appears in the top navigation bar, allowing instant switching between pre-seeded personas:

| Persona | Email | Role | Features Unlocked |
|---------|-------|------|-------------------|
| 👑 **Super Admin** | `superadmin@lendingtechplatform.in` | `super_admin` | Global Platform Overview, Tenants List, Global Analytics |
| 🏢 **Tenant Admin** | `admin@capitalfirst.in` | `tenant_admin` | CapitalFirst NBFC Command Center, Applications, Active Loans, Collections, Products |
| 💼 **Relationship Manager** | `rm@swiftfin.in` | `relationship_manager` | Swift Fintech Command Center & RM Lead Management |
| 👤 **Customer / Borrower** | `vikram.singh@gmail.com` | `customer` | Customer Loan Application Portal (`/apply`) |

---

## Repository Structure

```
LenderOS/
├── BUSINESS_OVERVIEW.md  # Detailed business POV document
├── artifacts/
│   ├── api-server/       # Express 5 API server (port 5000)
│   ├── lending-os/       # Main React 19 frontend app (port 5173)
│   └── mockup-sandbox/   # UI component testing sandbox
├── lib/
│   ├── api-spec/         # OpenAPI 3.0 specification + Orval config
│   ├── api-zod/          # Generated Zod validation schemas
│   ├── api-client-react/ # Generated React Query hooks & custom fetcher
│   └── db/               # Drizzle PostgreSQL schema & migrations
├── scripts/              # Setup, dev runner & environment helpers
├── docker-compose.yml    # Local PostgreSQL service
└── .env.example          # Environment variable template
```

---

## Common Development Commands

| Command | Description |
|---------|-------------|
| `pnpm setup` | Initial setup (Docker + Install + DB Push + Seed) |
| `pnpm dev` | Run API server + Frontend together |
| `pnpm dev:api` | Run API server only |
| `pnpm dev:web` | Run Vite web frontend only |
| `pnpm db:push` | Push Drizzle schema changes to PostgreSQL |
| `pnpm db:seed` | Seed demo tenants, users, loans, and applications |
| `pnpm codegen` | Regenerate Zod schemas & React Query hooks from OpenAPI |
| `pnpm typecheck` | Run typechecker across all monorepo packages |
| `pnpm build` | Production build for all applications |

---

## License

MIT
