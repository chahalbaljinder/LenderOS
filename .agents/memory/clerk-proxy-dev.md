---
name: Clerk proxy optional in dev
description: How to handle VITE_CLERK_PROXY_URL being unset without breaking ClerkProvider
---

In development, `VITE_CLERK_PROXY_URL` may not be set. Pass it conditionally:

```tsx
{...(clerkProxyUrl ? { proxyUrl: clerkProxyUrl } : {})}
```

DNS resolution errors for Clerk in the Replit preview iframe are normal — the iframe sandbox blocks external DNS. Auth works fine in a real browser tab.

**Why:** Passing an empty string as proxyUrl causes Clerk to try resolving "" as a hostname, which fails loudly.
