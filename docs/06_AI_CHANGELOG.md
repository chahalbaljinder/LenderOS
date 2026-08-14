# LenderOS — AI Change Log

This file records meaningful implementation changes.

| Date | Milestone | Change | Files | Tests | Notes |
|---|---|---|---|---|---|
| 2026-08-15 | M0 | Initial baseline created | docs/* | N/A | Starting point |
| 2026-08-15 | M1 | Clerk token getter registration for auth transport | artifacts/lending-os/src/App.tsx | 5/5 API tests pass | Added `ClerkAuthTokenRegistrar` component that calls `setAuthTokenGetter(() => getToken())` inside `ClerkProvider` |
| 2026-08-15 | M1 | Backend bearer token verification for Clerk auth | artifacts/api-server/src/lib/auth.ts | 5/5 API tests pass | Added `verifyToken` support to accept Clerk JWT in Authorization header, enabling Clerk auth in dev (where proxy doesn't run) and prod |
| 2026-08-15 | M1 | Fix login redirect after sign-in/sign-up | artifacts/lending-os/src/App.tsx | 5/5 API tests pass | Added `forceRedirectUrl` to SignIn/SignUp components to redirect to `/dashboard` |
| 2026-08-15 | M1 | Fix logout to clear Clerk session | artifacts/lending-os/src/components/layout/dashboard-layout.tsx | 5/5 API tests pass | Use `signOut({ redirectUrl: "/" })` from `useClerk` hook |
| 2026-08-15 | M1 | Fix session race condition in protected routes | artifacts/lending-os/src/App.tsx, artifacts/lending-os/src/components/layout/dashboard-layout.tsx | 5/5 API tests pass | Wait for `useAuth().isLoaded` and `isSignedIn` before calling `useGetMe()` |
| 2026-08-15 | M1 | Disable rate limiting in dev for testing | artifacts/api-server/src/app.ts | 5/5 API tests pass | Skip `generalLimiter` and `strictLimiter` when NODE_ENV !== production |
| 2026-08-15 | M1b | Add clerkId to customers table | lib/db/src/schema/customers.ts, lib/db/src/schema/index.ts | 5/5 API tests pass | Nullable unique column for linking Clerk identity to borrower records |
| 2026-08-15 | M1b | Create invitations table with full lifecycle | lib/db/src/schema/invitations.ts, lib/db/src/schema/index.ts | 5/5 API tests pass | States: invited → pending → accepted → provisioned → active + expired/cancelled/revoked |
| 2026-08-15 | M1b | Document identity provisioning architecture | docs/11_IDENTITY_PROVISIONING.md | N/A | Single source for invitation lifecycle, webhook contract, customer-clerk linking rules |
| 2026-08-15 | M1b | Update milestones and gap matrix | docs/02_MILESTONES.md, docs/08_GAP_MATRIX.md | N/A | Inserted M1b milestone, updated gap tracking |
| 2026-08-15 | M1b | Invitation API (CRUD + resend/cancel/revoke) | artifacts/api-server/src/routes/invitations.ts | 5/5 API tests pass | Tenant-scoped, RBAC protected, token-based acceptance flow |
| 2026-08-15 | M1b | Clerk webhook endpoint with provisioning logic | artifacts/api-server/src/routes/webhooks.ts | 5/5 API tests pass | Handles user.created → invitation provisioning, customer linking, user.deleted cleanup |
| 2026-08-15 | M1b | Register new routes | artifacts/api-server/src/routes/index.ts | 5/5 API tests pass | Added invitationsRouter and webhooksRouter |
