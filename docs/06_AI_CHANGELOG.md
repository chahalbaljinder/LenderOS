# LenderOS — AI Change Log

This file records meaningful implementation changes.

| Date | Milestone | Change | Files | Tests | Notes |
|---|---|---|---|---|---|
| 2026-08-15 | M0 | Initial baseline created | docs/* | N/A | Starting point |
| 2026-08-15 | M1 | Clerk token getter registration for auth transport | artifacts/lending-os/src/App.tsx | 5/5 API tests pass | Added `ClerkAuthTokenRegistrar` component that calls `setAuthTokenGetter(() => getToken())` inside `ClerkProvider` |
