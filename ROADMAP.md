# LenderOS Product Roadmap

This roadmap captures the current direction of LenderOS as a multi-tenant AI lending operating system for NBFCs, fintechs, banks, and lending service providers. Milestones are tracked with checkboxes so the team can mark progress as work is completed.

## Project Context Summary

LenderOS currently includes:
- Multi-tenant architecture with isolated data and role-based access
- A demo-ready local experience with instant role switching
- A React-based lending UI and an Express-based API server
- Core lending workflows such as applications, loans, collections, and tenant management
- AI-assisted underwriting and risk scoring concepts tied to customer and loan operations

## Roadmap Tracker

### Phase 1 — Foundation & Demo Readiness
- [x] Establish the multi-tenant platform architecture
- [x] Build a local demo mode with zero-config setup
- [x] Create role-based UI switching for super admin, tenant admin, RM, and customer personas
- [x] Deliver core dashboards for platform and tenant operations
- [x] Implement baseline API structure with OpenAPI-driven contracts

### Phase 2 — Core Lending Operations
- [x] Support customer loan application flow
- [x] Create tenant-level management for applications, loans, and products
- [x] Add collections workflows with DPD tracking and priority scoring
- [x] Introduce underwriting and risk scoring logic
- [ ] Expand workflow coverage for end-to-end loan lifecycle management

### Phase 3 — Compliance, Automation & Trust
- [ ] Add stronger audit trail and compliance-friendly event logging
- [ ] Improve document verification and KYC workflow support
- [ ] Implement configurable rule engines for product and risk policies
- [ ] Add stronger approval and exception handling for loan operations
- [ ] Improve reporting for operational, financial, and compliance visibility

### Phase 4 — Scale & Market Expansion
- [ ] Integrate eSign and eMandate capabilities
- [ ] Add bank statement analysis and enhanced borrower verification
- [ ] Support co-lending and marketplace-style partner workflows
- [ ] Add AI-driven collections automation and recovery insights
- [ ] Prepare enterprise-grade deployment, observability, and tenant onboarding tooling

## Milestone Notes

- Use this file as the single planning reference for major initiatives.
- Mark a milestone as complete by changing its checkbox to [x] when the work is delivered and validated.
- Add new milestones under the relevant phase whenever new scope is introduced.

## Suggested Next Priorities

1. Strengthen compliance and audit capabilities
2. Improve KYC and document workflows
3. Expand underwriting and policy customization
4. Prepare integrations for eSign and payment mandates
