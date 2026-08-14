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

**Status:** ACTIVE initially

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

**Status:** NOT_STARTED

### Objective
Make real authentication reliable without breaking demo mode.

### Scope
- Clerk token/session transport
- `/api/users/me`
- protected route behavior
- logout/re-login
- role resolution

### Exit Criteria
- Clerk login works.
- Protected routes remain protected.
- `/api/users/me` works.
- Demo mode still works.
- Unauthorized users cannot access protected APIs.
- Multiple roles resolve correctly.

---

## M2 — ROUTING & NAVIGATION

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
| YYYY-MM-DD | M0 | ACTIVE | Initial AI baseline |
