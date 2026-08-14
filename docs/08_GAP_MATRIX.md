# LenderOS — Current → Target Gap Matrix

This file is a living matrix. Update it after verification.

| Area | Current State | Target | Gap | Milestone | Status |
|---|---|---|---|---|---|
| Authentication | Clerk + demo; Clerk transport issue | Reliable production auth + demo | Token/session transport | M1 | COMPLETE |
| Identity Provisioning | ❌ Missing entirely | Invitations, webhooks, customer.clerkId | Full provisioning layer | M1b | ACTIVE |
| Routing | Missing/placeholder routes | Complete truthful routes | Detail/action routes | M2 | NOT_STARTED |
| Customer application | Working public flow | Full borrower lifecycle | Review/offer/loan UI | M3-M5 | OPEN |
| Application review | Backend capability | Full reviewer UI | Detail/review/actions | M3 | OPEN |
| Offers | Backend/domain exists | End-to-end borrower offer | UI/state integration | M4 | OPEN |
| Disbursement | Backend capability | Authorized UI workflow | Loan execution UI | M5 | OPEN |
| Loan servicing | List/schedule APIs | Full loan detail | Detail/actions | M5 | OPEN |
| Collections | Backend route exists | Operational collection workflow | Queue/actions | M6 | OPEN |
| RBAC UX | Backend foundation; coarse UI | Role-specific UX | Navigation/actions/scope | M7 | OPEN |
| Tenant operations | Partial | Complete tenant workspace | Admin workflows | M8 | OPEN |
| Platform operations | Partial | Complete platform workspace | Tenant/platform workflows | M9 | OPEN |
| Analytics | Mock data in dashboards | Real API-backed metrics | Replace mocks | M10 | OPEN |
| Audit | Table exists | Automatic critical-action audit | Middleware/events | M10 | OPEN |
| Rate limiting | In-memory | Production-safe strategy | Architecture | M10 | OPEN |
| Theme | Dark, contrast issues | Light-first accessible SaaS | Design tokens/UI | M11 | OPEN |
| Testing | Minimal health tests | Workflow/E2E coverage | Test suite | M12 | OPEN |
