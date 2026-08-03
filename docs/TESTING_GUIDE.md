# Testing Guide

## A. Test Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@test.com | Test@12345 |
| Tenant Admin | admin@test.com | Test@12345 |
| Relationship Manager | rm@test.com | Test@12345 |
| Customer | customer@test.com | Test@12345 |

## B. Application URL

- Frontend: http://localhost:5173/
- API health: http://localhost:5000/api/healthz

## C. Testing Order

1. Start the app with the existing local setup.
2. Open the landing page and confirm it loads.
3. Sign in as Super Admin and open the dashboard.
4. Verify tenant and user management pages.
5. Log out and switch to a tenant role.
6. Verify tenant-specific routes and data.
7. Attempt to access a Super Admin-only route as a non-admin and confirm access is blocked.

## D. Role-by-Role Testing

### Super Admin
- Login with superadmin@test.com / Test@12345
- Open /dashboard
- Verify /tenants, /platform/analytics, and /settings are reachable
- Confirm /users is blocked for non-admins and allowed for admins through the API layer

### Tenant Admin
- Login with admin@test.com / Test@12345
- Open /dashboard
- Verify /applications, /customers, /loans, /collections, and /settings are reachable
- Confirm admin-only tenant routes are blocked when the role is not super admin

### Relationship Manager
- Login with rm@test.com / Test@12345
- Open /dashboard
- Verify application and collections views work
- Confirm platform-only or tenant-management routes stay blocked

### Customer
- Login with customer@test.com / Test@12345
- Open /apply
- Verify the customer can reach the application form and see loan products
- Confirm admin-only routes stay blocked

## E. Route Testing Checklist

- [x] /
- [x] /sign-in
- [x] /sign-up
- [x] /dashboard
- [x] /tenants
- [x] /tenants/:tenantId
- [x] /applications
- [x] /applications/:applicationId
- [x] /customers
- [x] /loans
- [x] /collections
- [x] /products
- [x] /audit
- [x] /settings
- [x] /platform/analytics
- [x] /apply

## F. CRUD Testing

- Create: create or seed a tenant/application/customer record and verify it appears in the list.
- Read/View: open the dashboard and detail screens.
- Edit/Update: update a tenant or user record from the API and verify the UI refreshes.
- Delete: remove a tenant record and verify the API returns success and the UI reflects the change.

## G. Expected Results

- Landing page remains reachable without an automatic redirect.
- Login routes resolve correctly.
- Dashboard loads based on role.
- Super Admin routes remain available for super admins only.
- Non-admin users receive a 403 response from protected API endpoints.

## H. Known Limitations

- Clerk-based authentication is still optional; the local demo mode uses seeded test accounts.
- Some management screens are placeholder routes wired to the existing navigation structure.
