# LenderOS — Role & Journey Specification

## Product POVs

### POV 1 — Borrower
"I want a loan and want to understand what is happening."

### POV 2 — NBFC
"I want to operate my lending business efficiently and safely."

### POV 3 — Platform Owner
"I want to operate and scale multiple lending organizations on LenderOS."

---

# Borrower — Customer

## Goal
Get and manage a loan.

## Journey
`Register → Profile → KYC/Documents → Application → Status → Offer → Acceptance → Loan → Repayment → Support`

## Key capabilities
- profile
- KYC
- application
- application status
- offer
- acceptance
- loan
- repayment
- support

---

# NBFC — Tenant Owner

## Goal
Understand and control lending business performance.

## Journey
`Dashboard → Portfolio → Applications → Loans → Collections → Analytics → Staff → Settings`

---

# NBFC — Tenant Admin

## Goal
Administer organization and users.

## Journey
`Organization → Users → Roles → Configuration → Audit`

---

# Sales Agent

## Goal
Acquire/process customers.

`Lead → Customer → Application → Documents → Submission → Follow-up`

---

# DSA

## Goal
Bring applications to the NBFC.

`Customer → Application → Documents → Status → Partner follow-up`

---

# Relationship Manager

## Goal
Manage assigned customers.

`Assigned customers → Applications → Follow-up → Customer communication`

---

# Risk Manager

## Goal
Make/recommend informed credit decisions.

`Review Queue → Application → KYC → Financials → Risk → Decision`

Actions:
- approve where authorized
- reject where authorized
- request information
- add notes/recommendation

---

# Loan Manager

## Goal
Execute and service approved loans.

`Approved Application → Final Checks → Disbursement → Loan → Repayment Schedule → Servicing`

---

# Collection Manager

## Goal
Manage overdue portfolio.

`Overdue → Queue → Assignment → Agent Performance → Escalation → Recovery`

---

# Collection Agent

## Goal
Resolve assigned overdue accounts.

`My Queue → Customer/Loan → Contact → Interaction → Promise/Follow-up → Payment/Escalation`

---

# Customer Support

## Goal
Resolve customer questions without unauthorized financial actions.

`Customer → Application/Loan → Issue → Communication → Resolution/Escalation`

---

# Compliance Officer

## Goal
Monitor compliance and exceptions.

`Compliance Queue → KYC/Exceptions → Review → Resolution → Reporting`

---

# Auditor

## Goal
Understand what happened and who did it.

`Audit → Entity → History → User → Timestamp → Before/After → Report`

Primarily read/audit access.

---

# Platform Admin

## Goal
Operate the LenderOS platform.

`Platform → Tenants → Users → Configuration → Analytics → Support`

---

# Super Admin

## Goal
Control the entire platform.

`Platform Overview → Tenants → Platform Users → Analytics → Monitoring → Audit → Configuration`

---

# Role Design Rule

Every role definition must specify:

| Dimension | Required |
|---|---|
| Purpose | Yes |
| Modules | Yes |
| Actions | Yes |
| Data scope | Yes |
| Approval authority | Yes, if relevant |
| Prohibited actions | Yes |
| Audit visibility | Yes |

Do not create a role merely because a dashboard exists.
