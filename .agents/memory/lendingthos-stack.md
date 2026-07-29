---
name: LendingOS backend stack
description: Key decisions for the LendingOS API server and DB
---

- Express 5 + Drizzle ORM + PostgreSQL
- All routes mounted under `/api` in app.ts; route files in `artifacts/api-server/src/routes/`
- DB schema in `lib/db/src/schema/` — push with `pnpm --filter @workspace/db run push`
- Seed data: `npx tsx artifacts/api-server/src/seed.ts`
- Clerk auth: `clerkMiddleware` from `@clerk/express`; proxy middleware at `/api/__clerk`
- Auth helper `requireAuth` + `getOrCreateUser` in `artifacts/api-server/src/lib/auth.ts`
- ID generation and EMI calc in `artifacts/api-server/src/lib/idgen.ts`

**Why:** Standard monorepo workspace pattern; Clerk proxy handles dev→prod portability.
