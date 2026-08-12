# LenderOS Demo Credentials for Role-Based Testing

This file contains the seeded user credentials for testing different roles in the LenderOS platform.

## Seeded Users (from seed.ts)

### Super Admin
- **Email**: superadmin@lendingtechplatform.in
- **Clerk ID**: user_demo_super_admin
- **Role**: super_admin
- **Tenant**: None (platform level)
- **Test Header**: `x-demo-user-id: user_demo_super_admin`

### Tenant Admin (CapitalFirst NBFC)
- **Email**: admin@capitalfirst.in
- **Clerk ID**: user_demo_tenant_admin_t1
- **Role**: tenant_admin
- **Tenant**: CapitalFirst NBFC (tenant_capitalfirst)
- **Test Header**: `x-demo-user-id: user_demo_tenant_admin_t1`

### Relationship Manager (Swift Fintech)
- **Email**: rm@swiftfin.in
- **Clerk ID**: user_demo_rm_t2
- **Role**: relationship_manager
- **Tenant**: Swift Fintech (tenant_swiftfin)
- **Test Header**: `x-demo-user-id: user_demo_rm_t2`

### Customer (CapitalFirst NBFC)
- **Email**: vikram.singh@gmail.com
- **Clerk ID**: user_demo_customer_c1
- **Role**: customer
- **Tenant**: CapitalFirst NBFC (tenant_capitalfirst)
- **Test Header**: `x-demo-user-id: user_demo_customer_c1`

---

## Role Hierarchy & Permissions

| Role | Level | Can Access |
|------|-------|------------|
| super_admin | 100 | All platform resources, tenant management, user management |
| platform_admin | 90 | All platform resources, tenant management |
| tenant_owner | 80 | Own tenant resources, tenant settings |
| tenant_admin | 70 | Tenant resources, user management within tenant |
| risk_manager | 60 | Risk assessment, loan approval workflows |
| loan_manager | 50 | Loan products, applications, disbursements |
| collection_manager | 40 | Collections, repayments, overdue management |
| customer_support | 30 | Customer queries, ticket management |
| sales_agent | 20 | Lead management, customer onboarding |
| dsa | 15 | Direct sales agent activities |
| relationship_manager | 10 | Customer relationship, loan applications |
| customer | 5 | Own profile, loan applications, repayments |
| auditor | 5 | Read-only audit access |
| compliance_officer | 5 | Compliance reporting |

---

## Testing with Demo Headers

To test different roles, add the `x-demo-user-id` header to your API requests:

```bash
# Test as Super Admin
curl -H "x-demo-user-id: user_demo_super_admin" http://localhost:5000/api/tenants

# Test as Tenant Admin
curl -H "x-demo-user-id: user_demo_tenant_admin_t1" http://localhost:5000/api/tenants

# Test as Relationship Manager
curl -H "x-demo-user-id: user_demo_rm_t2" http://localhost:5000/api/loan-applications

# Test as Customer
curl -H "x-demo-user-id: user_demo_customer_c1" http://localhost:5000/api/loans
```

---

## Seeded Tenants

### CapitalFirst NBFC (Active)
- **ID**: tenant_capitalfirst
- **Type**: nbfc
- **Status**: active
- **Contact**: ops@capitalfirst.in
- **Primary Color**: #00c896

### Swift Fintech (Active)
- **ID**: tenant_swiftfin
- **Type**: fintech
- **Status**: active
- **Contact**: admin@swiftfin.in
- **Primary Color**: #6366f1

### Bharath LSP (Pending)
- **ID**: tenant_bharath
- **Type**: lsp
- **Status**: pending
- **Contact**: contact@bharathlsp.in
- **Primary Color**: #f59e0b

---

## Seeded Customers

### Vikram Singh (CapitalFirst)
- **Email**: vikram.singh@gmail.com
- **Phone**: 9876543210
- **PAN**: ABCDE1234F
- **Credit Score**: 742
- **KYC Status**: verified
- **Employment**: salaried
- **Monthly Income**: ₹75,000

### Anita Patel (CapitalFirst)
- **Email**: anita.patel@gmail.com
- **Phone**: 9123456780
- **PAN**: FGHIJ5678K
- **Credit Score**: 685
- **KYC Status**: verified
- **Employment**: self_employed
- **Monthly Income**: ₹120,000

### Deepak Kumar (Swift Fintech)
- **Email**: deepak.k@gmail.com
- **Phone**: 9988776655
- **PAN**: KLMNO9012P
- **Credit Score**: 610
- **KYC Status**: partial
- **Employment**: salaried
- **Monthly Income**: ₹45,000

### Sunita Reddy (CapitalFirst)
- **Email**: sunita.r@gmail.com
- **Phone**: 9871234560
- **PAN**: null
- **Credit Score**: 590
- **KYC Status**: pending
- **Employment**: business
- **Monthly Income**: ₹200,000

---

## Seeded Loan Products

### Personal Loan Prime (CapitalFirst)
- **Type**: personal
- **Min Amount**: ₹50,000
- **Max Amount**: ₹10,00,000
- **Tenure**: 12-60 months
- **Interest Rate**: 13.5%
- **Processing Fee**: 1%

### MSME Business Loan (CapitalFirst)
- **Type**: msme
- **Min Amount**: ₹2,00,000
- **Max Amount**: ₹50,00,000
- **Tenure**: 12-84 months
- **Interest Rate**: 15%
- **Processing Fee**: 1.5%

### Salary Advance (Swift Fintech)
- **Type**: salary_advance
- **Min Amount**: ₹10,000
- **Max Amount**: ₹1,50,000
- **Tenure**: 1-12 months
- **Interest Rate**: 18%
- **Processing Fee**: 2%

---

## Seeded Loan Applications

### APP-001-2026 (Disbursed)
- **Customer**: Vikram Singh
- **Product**: Personal Loan Prime
- **Requested**: ₹5,00,000 for 36 months
- **Status**: disbursed
- **Risk Score**: 78 (Grade B1)
- **Approved**: ₹5,00,000 at 13.5%

### APP-002-2026 (Approved)
- **Customer**: Anita Patel
- **Product**: MSME Business Loan
- **Requested**: ₹20,00,000 for 60 months
- **Status**: approved
- **Risk Score**: 71 (Grade B1)
- **Approved**: ₹18,00,000 at 15%

### APP-003-2026 (Under Review)
- **Customer**: Deepak Kumar
- **Product**: Salary Advance
- **Requested**: ₹80,000 for 6 months
- **Status**: under_review

### APP-004-2026 (KYC Pending)
- **Customer**: Sunita Reddy
- **Product**: Personal Loan Prime
- **Requested**: ₹3,00,000 for 24 months
- **Status**: kyc_pending

---

## Seeded Loans

### LN-2026-0001 (Active)
- **Application**: APP-001-2026
- **Principal**: ₹5,00,000
- **Outstanding**: ₹4,12,000
- **Total Paid**: ₹88,000
- **EMI**: ₹16,947
- **Status**: active
- **DPD**: 0

### LN-2026-0002 (Overdue)
- **Application**: APP-002-2026
- **Principal**: ₹18,00,000
- **Outstanding**: ₹17,40,000
- **Total Paid**: ₹60,000
- **EMI**: ₹42,824
- **Status**: active
- **DPD**: 12

---

## Environment Variables for Testing

Add these to your `.env` file for local development:

```env
# Demo mode - enables demo user header authentication
NODE_ENV=development

# Clerk keys (optional for demo mode)
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Database
DATABASE_URL=postgresql://lenderos:lenderos@localhost:5432/lenderos

# API Server
PORT=5000

# Frontend
VITE_PORT=5173
API_PROXY_TARGET=http://localhost:5000
```

---

## Quick Test Commands

```bash
# Health check
curl http://localhost:5000/api/healthz

# List tenants (super admin)
curl -H "x-demo-user-id: user_demo_super_admin" http://localhost:5000/api/tenants

# Create tenant (super admin)
curl -X POST -H "Content-Type: application/json" \
  -H "x-demo-user-id: user_demo_super_admin" \
  -d '{"name":"Test NBFC","type":"nbfc","contactEmail":"test@test.com","primaryColor":"#00c896"}' \
  http://localhost:5000/api/tenants

# Get tenant stats (super admin)
curl -H "x-demo-user-id: user_demo_super_admin" http://localhost:5000/api/tenants/tenant_capitalfirst/stats

# List loan applications (tenant admin)
curl -H "x-demo-user-id: user_demo_tenant_admin_t1" http://localhost:5000/api/loan-applications

# Customer view own loans
curl -H "x-demo-user-id: user_demo_customer_c1" http://localhost:5000/api/loans
```