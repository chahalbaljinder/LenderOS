# LenderOS — Recommended Project Documentation Structure

The existing source tree should remain the source-code structure.

Add/maintain a dedicated product-control layer:

```text
LenderOS/
├── apps/
├── artifacts/
├── lib/
├── docs/
│   ├── 00_LENDEROS_MASTER_PLAN.md
│   ├── 01_AI_BASELINE.md
│   ├── 02_MILESTONES.md
│   ├── 03_ROLE_JOURNEYS.md
│   ├── 04_PRODUCT_WORKFLOWS.md
│   ├── 05_EXECUTION_RULES.md
│   ├── 06_AI_CHANGELOG.md
│   ├── 07_DECISIONS.md
│   ├── 08_GAP_MATRIX.md
│   ├── 09_AI_SESSION_CHECKLIST.md
│   ├── 10_PROJECT_STRUCTURE.md
│   ├── CURRENT_STATE_REPORT.md
│   └── ...
└── ...
```

## Responsibility of each document

| Document | Purpose |
|---|---|
| Master Plan | What LenderOS is and where it is going |
| AI Baseline | What is actually true right now |
| Milestones | Controlled sequence of delivery |
| Role Journeys | Who does what |
| Product Workflows | How lending workflows operate |
| Execution Rules | How the AI must work |
| Changelog | What the AI has changed |
| Decisions | Why important architecture/product decisions were made |
| Gap Matrix | Current → target tracking |
| Session Checklist | Prevent AI from drifting between sessions |

## Important distinction

Do not duplicate technical source-of-truth files unnecessarily.

Existing technical documents such as `ROUTES.md`, OpenAPI, schema files and `CURRENT_STATE_REPORT.md` remain authoritative for their respective domains.

The new control documents sit above them and tell the AI:

- what matters
- what order to work in
- what not to break
- how to verify completion
