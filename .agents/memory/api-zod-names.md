---
name: API Zod schema naming conventions
description: Correct import names for generated @workspace/api-zod schemas
---

KYC mutation schemas are prefixed with the HTTP verb, not just the noun:
- `SubmitPanVerificationBody` (NOT `PanVerificationBody`)
- `SubmitAadhaarVerificationBody` (NOT `AadhaarVerificationBody`)
- `SubmitFaceVerificationBody` (NOT `FaceVerificationBody`)
- `SubmitEmploymentVerificationBody` (NOT `EmploymentVerificationBody`)

Always grep `lib/api-zod/src/generated/api.ts` for exact export names before importing.

**Why:** The OpenAPI operationId determines the generated name; `submitPanVerification` → `SubmitPanVerificationBody`.
