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
