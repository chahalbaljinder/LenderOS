---
name: Zod v4 + Orval codegen
description: Orval 8.x generates Zod v4 syntax; workspace catalog must be on zod ^4
---

Orval 8.23.0+ generates `zod.int()`, `zod.looseObject()` and other Zod v4-only APIs.
The workspace pnpm catalog must pin `zod: ^4.0.0` (not ^3.x) or codegen output won't typecheck.

**Why:** Orval silently switched to v4 syntax in 8.x. Using zod ^3 produces 100+ TS errors.

**How to apply:** In `pnpm-workspace.yaml` catalog section, set `zod: ^4.0.0`. Run `pnpm install` then `pnpm --filter @workspace/api-spec run codegen`.
