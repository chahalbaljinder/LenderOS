# LenderOS — AI Execution Rules

These rules keep a single AI coding agent on the product path.

## Rule 1 — One milestone at a time

Never implement multiple major milestones without explicit approval.

## Rule 2 — One vertical slice at a time

Prefer:

`UI → API → DB → authorization → state → audit → test`

over building ten disconnected screens.

## Rule 3 — Inspect before editing

Always locate existing implementation before creating a new one.

## Rule 4 — Evidence over assumption

Use repository code and current project documents as the primary source of truth.

## Rule 5 — Preserve architecture

The current stack is:

- React
- Vite
- Wouter
- TanStack Query
- Tailwind
- Express
- PostgreSQL
- Drizzle
- OpenAPI
- Orval
- Zod
- Clerk

Do not replace a major component without a documented reason.

## Rule 6 — Contract-first

If an API already exists:

- inspect OpenAPI
- inspect generated client/hooks
- reuse them

If an API is missing, first verify that it truly needs to be added.

## Rule 7 — Never fake lending state

Do not make Approve, Disburse, Collect, Pay, etc. appear successful only in frontend state.

## Rule 8 — Never weaken security to pass a test

Do not:
- bypass auth
- broaden permissions
- remove tenant checks
- expose another tenant's data
- hardcode privileged access

## Rule 9 — Navigation must be truthful

Every visible link must either:
- work, or
- be intentionally unavailable/disabled.

Do not use catch-all routes to hide missing functionality.

## Rule 10 — Data must be real

Do not leave hardcoded dashboard metrics where real APIs already exist.

## Rule 11 — Explain architectural decisions

If a change affects:
- database
- authentication
- RBAC
- tenant isolation
- API contracts
- workflow state

record the decision in `docs/DECISIONS.md`.

## Rule 12 — Keep a changelog

Update `docs/AI_CHANGELOG.md` after every meaningful milestone/task.

## Rule 13 — Test the actor journey

Do not test only components. Test:

`actor → route → action → API → DB → resulting state`

## Rule 14 — Stop on uncertainty

Ask for approval if the change requires:
- breaking API changes
- major schema changes
- new roles
- new architecture
- major dependencies
- security model changes

---

# Required task output

Every task report must contain:

### Completed
...

### Files Changed
...

### Tests
...

### Manual Verification
...

### Risks
...

### Documentation Updated
...

### Milestone
`M# — status`

### Next recommended task
...

Then stop.
