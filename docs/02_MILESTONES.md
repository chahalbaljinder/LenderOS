# LenderOS — Milestone Marker

**Rule:** Only one milestone is ACTIVE at a time.

Status values:

- `NOT_STARTED`
- `ACTIVE`
- `BLOCKED`
- `COMPLETE`
- `DEFERRED`

---

## M0 — VERIFIED BASELINE

**Status:** COMPLETE

### Objective
Establish the exact current state from repository + current-state report.

### Deliverables
- AI baseline
- Route inventory
- API inventory
- DB inventory
- RBAC inventory
- Auth flow
- Working/broken/partial matrix
- Test/build baseline

### Exit Criteria
- Current state is reproducible.
- No major undocumented assumption remains.
- AI can identify the exact next implementation task.

---

## M1 — AUTHENTICATION FOUNDATION

**Status:** COMPLETE

### Objective
Make real authentication reliable without breaking demo mode.

### Scope
- Clerk token/session transport
- `/api/users/me`
- protected route behavior
- logout/re-login
- role resolution

### Exit Criteria
- ✅ Clerk login works.
- ✅ Protected routes remain protected.
- ✅ `/api/users/me` works.
- ✅ Demo mode still works.
- ✅ Unauthorized users cannot access protected APIs.
- ✅ Multiple roles resolve correctly.

---

## M1 — AUTHENTICATION FOUNDATION

**Status:** COMPLETE

### Objective
Make real authentication reliable without breaking demo mode.

### Scope
- Clerk token/session transport
- `/api/users/me`
- protected route behavior
- logout/re-login
- role resolution

### Exit Criteria
- ✅ Clerk login works.
- ✅ Protected routes remain protected.
- ✅ `/api/users/me` works.
- ✅ Demo mode still works.
- ✅ Unauthorized users cannot access protected APIs.
- ✅ Multiple roles resolve correctly.

---

## M1b — IDENTITY PROVISIONING FOUNDATION

**Status:** COMPLETE

### Objective
Build the identity provisioning layer: invitations, Clerk webhooks, and customer-Clerk linking — the prerequisite for all three POVs to onboard users in production.

### Scope
- `customers.clerkId` column (nullable, unique)
- `invitations` table with full lifecycle (INVITED → PENDING → ACCEPTED → PROVISIONED → ACTIVE + EXPIRED/CANCELLED/REVOKED)
- Invitation API: create, list, resend, cancel
- Clerk webhook endpoint: `user.created` → provision user/customer
- Provisioning logic: invitation → tenant+role; existing customer → link clerkId; new → create customer
- Demo invitation seed for NBFC admin onboarding

### Exit Criteria
- ✅ Superadmin can invite NBFC admin via UI → email sent → admin signs up → auto-provisioned with tenant+role
- ✅ NBFC admin can invite staff via UI → staff signs up → auto-provisioned with tenant+role
- ✅ Borrower signs up via Clerk → webhook links to existing customer record (by email) → customer role assigned
- ✅ Borrower with no existing record → webhook creates customer record
- ✅ Invitation expiration, cancellation, revocation work
- ✅ Tenant isolation enforced during provisioning
- ✅ All existing tests pass; new tests for invitation/webhook flow

---

## M2 — ROUTING & NAVIGATION

**Status:** COMPLETE

### Objective
Make navigation truthful.

### Known areas
- `/customers/new`
- `/loans/new`
- `/applications/new`
- `/applications/:applicationId`
- `/tenants/new`
- `/tenants/:tenantId`
- `/platform/analytics`
- wildcard routes

### Exit Criteria
- No visible broken navigation.
- No important placeholder page remains.
- Routes correspond to actual product capabilities.
- Detail pages have real data or explicit empty states.

---

## M3 — APPLICATION REVIEW

### Objective
Turn the existing application API into a usable NBFC workflow.

### Scope
- application detail
- applicant/customer context
- KYC
- financial information
- documents available in current model
- risk information
- timeline/status
- request information
- approve/reject where API supports it

### Exit Criteria
A Risk Manager can open an application and make a valid decision through the UI.

---

## M4 — OFFER & ACCEPTANCE

### Objective
Connect approved application → offer → borrower acceptance.

### Exit Criteria
- Offer is generated through real API/business state.
- Borrower sees offer.
- Borrower can accept/decline.
- State transition is persisted.
- Appropriate audit/state history exists.

---

## M5 — DISBURSEMENT & LOAN

### Objective
Complete approved loan execution.

### Exit Criteria
- Authorized Loan Manager can disburse.
- Loan is created from the approved application.
- Repayment schedule is visible.
- Loan detail page reflects real data.
- Borrower sees active loan.

---

## M6 — COLLECTIONS

### Objective
Make collection operations actionable.

### Exit Criteria
- overdue accounts visible
- assignments supported where applicable
- collection agent can record action
- promise-to-pay/follow-up can be recorded if supported
- payment/collection state updates
- manager can see collection performance

---

## M7 — ROLE-AWARE UX

### Objective
Turn backend RBAC into distinct experiences.

### Exit Criteria
- Each role sees appropriate navigation.
- Unauthorized actions are hidden/blocked.
- Assigned/tenant/platform scope is enforced.
- No role receives broader data merely because it can access a page.

---

## M8 — TENANT OPERATIONS

### Scope
- tenant users
- roles
- organization settings
- loan products/configuration
- operational reporting

### Exit Criteria
Tenant owner/admin can operate their organization without platform-admin access.

---

## M9 — PLATFORM OPERATIONS

### Scope
- tenant onboarding
- tenant details
- platform users
- platform analytics
- monitoring
- platform-level controls

### Exit Criteria
Platform owner can onboard and manage a tenant through real workflows.

---

## M10 — DATA & GOVERNANCE

### Scope
- replace mock analytics
- audit middleware
- production-grade rate limiting
- settings persistence
- API documentation consistency
- data integrity improvements

### Exit Criteria
Critical business actions are traceable and dashboard metrics derive from real data.

---

## M11 — UX & ACCESSIBILITY

### Scope
- light-first theme
- global design tokens
- WCAG AA contrast
- loading/empty/error states
- breadcrumbs where useful
- pagination behavior

### Exit Criteria
Core product workflows are visually consistent, accessible and usable.

---

## M12 — RELEASE QUALITY

### Scope
- authentication tests
- RBAC tests
- tenant isolation tests
- lending lifecycle tests
- collection tests
- E2E scenarios
- production readiness checklist

### Exit Criteria
All critical personas can complete their required workflows end-to-end.

---

# MILESTONE CHANGE LOG

| Date | Milestone | Status | Notes |
|---|---|---|---|
| 2026-08-15 | M0 | COMPLETE | Baseline verified, AI baseline created |
| 2026-08-15 | M1 | COMPLETE | Clerk auth transport fixed: bearer token verification, login redirect, logout, session race condition |
| 2026-08-19 | M1b | COMPLETE | Identity provisioning: invitations, Clerk webhook, customer.clerkId, frontend invitations page, OpenAPI spec, demo seeds |
| 2026-08-19 | M2 | COMPLETE | Routing & Navigation - replaced placeholders with real pages (tenants, applications, platform analytics, customers), removed invalid loans/new route |
| 2026-08-19 | M3 | COMPLETE | Application Review - connected approve/reject/disburse actions to real API, added modals with forms |
| 2026-08-19 | M4 | COMPLETE | Offer & Acceptance - borrower-facing offers page, EMI calculator, accept offer flow |
| 2026-08-19 | M5 | ACTIVE | Disbursement & Loan - complete loan execution from approved application, loan creation, repayment schedule |
