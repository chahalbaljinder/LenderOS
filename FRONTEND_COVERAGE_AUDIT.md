# API Endpoint → Frontend Page Coverage Audit

## Summary
- **Total API Operations**: 70
- **Frontend Pages**: 25
- **Estimated Coverage**: ~60% (many endpoints are CRUD variants of same resource)

## Detailed Mapping

### ✅ FULLY COVERED (List + Detail + Actions)

| Domain | Operations | Frontend Pages | Status |
|--------|------------|----------------|--------|
| **Auth** | healthCheck, getMe, updateMe, clerkWebhook | Login, Signup, Dashboard | ✅ |
| **Loan Applications** | list, create, get, update, submit, approve, reject, disburse | List, New, Detail | ✅ |
| **Offers** | getOffers, acceptOffer, calculateEmi | Offers page | ✅ |
| **Collections** | list, get, update | List, Detail | ✅ |
| **Invitations** | create, list, get, update, resend, cancel, revoke, accept | List page | ✅ |
| **Loans** | list, get, getLoanSchedule | List, Detail | ✅ |
| **Loan Products** | list, create, get, update | List, New, Detail, Edit | ✅ |
| **Invitations** | create, list, get, update, resend, cancel, revoke, accept | List page | ✅ |
| **Tenants** | list, create, get, update, approve, stats | List, New, Detail, Users | ✅ |

### ⚠️ PARTIALLY COVERED (Missing pages or actions)

| Domain | Operations | Frontend Pages | Missing |
|--------|------------|----------------|---------|
| **Tenants** | list, create, get, update, delete, approve, stats | List, New, Detail, Users | ✅ List, New, Detail, Users, Approve, Stats |
| **Customers** | list, create, get, update, credit-report | List, New | ❌ **Detail page**, Credit Report |
| **KYC** | getKycStatus, submitPan, submitAadhaar, submitFace, submitEmployment | KYC Detail page with 4 tabs | ✅ |
| **Risk** | getRiskScore, analyzeRisk, getFraudFlags | In Application Detail | ✅ (partial) |
| **Repayments** | list, record | In Loan Detail | ✅ (partial) |
| **Users** | getMe, updateMe, list, create, get, update | Me, Tenant Users | ❌ **List (super), Create (super), Detail (super), Update (super)** |
| **Settings** | getTenantSettings, updateTenantSettings, listApiKeys, createApiKey, revokeApiKey | Placeholder | ❌ **Real implementation** |
| **Analytics** | platform, tenant, funnel, collection-rate, revenue | Platform, Tenant | ❌ **Funnel, Collection-rate, Revenue (tenant)** |
| **Audit Logs** | list | List only | ✅ (minimal) |
| **API Keys** | list, create, revoke | Placeholder | ❌ **Real implementation** |

### ❌ NOT COVERED AT ALL

| Domain | Operations | Notes |
|--------|------------|-------|
| **KYC** | getKycStatus, submitPan, submitAadhaar, submitFace, submitEmployment | 5 operations - no UI at all |
| **Customer Detail** | getCustomer, updateCustomer, credit-report | No detail page |
| **Settings** | get, update, api-keys CRUD | Placeholder only |

## Priority Gaps to Fill

### P0 - Critical (Core workflows broken)
1. **Settings page** - real implementation needed (tenant settings API exists)

### P1 - High (Important workflows)
2. **Loan Schedule page** - getLoanSchedule exists
3. **User Management (super admin)** - list, create, get, update
4. **Settings/API Keys** - real implementation
5. **Loan Products** - Edit page needs connect to update API

### P2 - Medium
6. **Customer Credit Report** page
7. **Audit Logs** (enhance)
8. **API Keys** real implementation

## Next Steps

1. **Continue M9 (Platform Operations)** - tenant onboarding, platform users, monitoring
2. **After M9**, do dedicated sprint for remaining gaps:
   - Customer Detail page
   - KYC pages (5 operations)
   - Settings page (connect to real API)
   - User Management (super admin)
   - Loan Schedule page
   - Settings/API Keys real implementation