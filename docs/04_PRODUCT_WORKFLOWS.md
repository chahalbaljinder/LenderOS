# LenderOS — Core Product Workflows

## 1. Customer Application

### State flow

`Draft → Submitted → Under Review → KYC → Risk → Offer → Approved/Rejected → Disbursed`

The exact state transitions must follow the existing DB/API enums and business logic. Do not invent incompatible statuses.

### Actor
Borrower

### Result
A persisted loan application with a trackable reference/status.

---

## 2. Application Review

### Actor
Risk/authorized lending staff

### Inputs
- customer
- application
- KYC
- financial information
- available documents
- risk information

### Actions
- review
- request information
- approve/reject where authorized

### Required outcome
Persisted state transition + UI refresh + audit where required.

---

## 3. Offer

### Flow
`Approved application → Offer generated → Customer views → Accept/Decline`

The offer must come from real backend state.

---

## 4. Disbursement

### Flow
`Accepted/approved application → final checks → disbursement → loan creation → repayment schedule`

The existing backend report indicates disbursement creates a loan and repayment schedule.

---

## 5. Loan Servicing

Loan detail should answer:

- principal
- interest
- outstanding
- repayment schedule
- payments
- status
- relevant history

---

## 6. Repayment

`Upcoming → Due → Paid / Partial / Overdue`

The UI must reflect the actual repayment record.

---

## 7. Collections

`Overdue → Collection queue → Assignment → Agent action → Follow-up/payment → Resolution or escalation`

---

## 8. Tenant Onboarding

`Create tenant → organization details → configuration → tenant admin → staff → products/integrations → activation`

Only implement configuration that is actually supported by current backend/domain models.

---

## 9. Audit

Critical action example:

`Risk Manager → Approves application → DB state changes → audit record`

Audit should capture, where applicable:

- actor
- action
- entity
- timestamp
- relevant before/after data
- tenant
- outcome

---

# Workflow Completion Rule

A workflow is complete only if:

1. actor can reach it
2. actor is authorized
3. UI calls real API
4. API validates action
5. DB changes correctly
6. resulting state is visible
7. audit is handled
8. errors are surfaced
9. tests cover critical behavior
