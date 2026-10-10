# Project state

Updated: 2026-10-10.

## Status

TASK-000 is ACCEPTED by the Architect, as stated in the TASK-001 assignment.
Accepted commit: `a4ad0a612be1b300e07e911819c548545f54f908`.

TASK-001 implements the technical PWA foundation on `task/TASK-001`; independent
review and acceptance are pending. This is a technical preview with no financial
features, authentication, encryption, or financial storage. CI and a main-only
Pages deployment workflow are prepared; their actual run/deployment evidence is
reported in the Builder Report. No merge or public deployment is authorized by
Builder delivery alone.

## Completed feasibility work

POC-01 and POC-02 are accepted technical experiments, as reported by the project owner. Their READMEs were inspected for this foundation; device tests were not rerun. [Architecture](ARCHITECTURE.md) records the bounded findings and limitations.

## Outstanding decisions

- POC-03: portable encrypted Vault format, export/import integrity, recovery, and device migration.
- Secure storage threat model and implementation; credential-provider compatibility and failure behavior.
- Whether and how a six-digit PIN can safely fit the desired UX.
- Stable hosting origin and its relationship to credential scope and recovery.
- Final UI stack, data model, supported platform/version matrix, and storage durability strategy. TASK-001 selects only a framework-free TypeScript/Vite technical foundation.
- Product UI through a separate Designer workflow; ordinary CSV export behavior.

## Next task

Complete independent review of [TASK-001](../tasks/TASK-001.md), then record
acceptance before merging. TASK-002 is unassigned and must not begin. Android
Studio Emulator and real-device security verification belong to later tasks.

## Decision record

- 2026-10-10 / TASK-000: keep the foundation documentation-only; adopt MIT and the lightweight workflow in [WORKFLOW.md](WORKFLOW.md). Initial repository creation, commit, and push are explicitly authorized by the project owner. This bootstrap authorization does not approve a security design or functional release.
- 2026-10-10 / TASK-001 assignment: record Architect acceptance of TASK-000.
  Authorize TypeScript/Vite technical preview, Node 24 LTS, automated production
  tests, and a gated Pages workflow. `/moneyszn/` on GitHub Pages is a provisional
  demonstration path, not the accepted future security origin. Product UI and
  all security decisions remain unresolved. TASK-001 acceptance remains pending.
