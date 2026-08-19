# Change Log

All notable changes to the LenderOS platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **M1b — Identity Provisioning Foundation** (2026-08-19)
  - Frontend invitations management page (`artifacts/lending-os/src/pages/invitations/list.tsx`)
    - Create invitations with email, role, tenant
    - List all invitations with status, role, expiry
    - Resend pending invitations (new token, extended expiry)
    - Cancel pending invitations
    - Revoke active/provisioned invitations (deactivates linked user)
    - Copy acceptance URL to clipboard
  - Sidebar navigation for Invitations (tenant admins + super admins) in `dashboard-layout.tsx`
  - OpenAPI spec additions (`lib/api-spec/openapi.yaml`):
    - `/invitations` POST/GET, `/invitations/{id}` GET/PATCH
    - `/invitations/{id}/resend`, `/invitations/{id}/cancel`, `/invitations/{id}/revoke` POST
    - `/invitations/accept/{token}` POST
    - `/webhooks/clerk` POST (Clerk user lifecycle events)
    - Schemas: Invitation, InvitationInput, InvitationUpdate, InvitationListResponse, InvitationResendResponse, InvitationAcceptResponse, WebhookResponse
  - Codegen: Zod schemas + React Query hooks generated for all new endpoints
  - Demo invitation seeds in `artifacts/api-server/src/seed.ts`:
    - NBFC admin invitation (super_admin → tenant_admin)
    - Risk Manager invitation (tenant_admin → risk_manager)

- **Clerk Auth Fix** (2026-08-19)
  - Fixed redirect loop on login/signup/protected pages
  - `ClerkAuthTokenRegistrar` now waits for `isLoaded`/`isSignedIn` before setting token getter
  - `DashboardRoute` and `DashboardLayout` handle `isError` for expired sessions
  - API server binds to `0.0.0.0` with proper error logging

### Changed
- **Auth Token Registration** (`artifacts/lending-os/src/App.tsx`): Token getter registered synchronously after Clerk session loaded
- **Dashboard Layout** (`artifacts/lending-os/src/components/layout/dashboard-layout.tsx`): Added Invitations link to tenant and super admin sidebars
- **Database Seed** (`artifacts/api-server/src/seed.ts`): Added demo invitations for NBFC admin and Risk Manager onboarding

### Testing
- All existing API tests pass (5/5 health endpoint tests)
- Build passes for API server and frontend

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