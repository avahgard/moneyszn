# Project state

Updated: 2026-10-10.

## Status

TASK-000 establishes the foundation documents and the two repository Skills under the owner's initial commit and publication authorization. No application code, CI, deployment, or finance features exist. Delivery evidence (commit, remote confirmation, checks, and blockers) is reported in the Builder Report; user acceptance remains pending.

## Completed feasibility work

POC-01 and POC-02 are accepted technical experiments, as reported by the project owner. Their READMEs were inspected for this foundation; device tests were not rerun. [Architecture](ARCHITECTURE.md) records the bounded findings and limitations.

## Outstanding decisions

- POC-03: portable encrypted Vault format, export/import integrity, recovery, and device migration.
- Secure storage threat model and implementation; credential-provider compatibility and failure behavior.
- Whether and how a six-digit PIN can safely fit the desired UX.
- Stable hosting origin and its relationship to credential scope and recovery.
- Application stack, data model, supported platform/version matrix, and storage durability strategy.
- Product UI through a separate Designer workflow; ordinary CSV export behavior.

## Next task

TASK-001 is not started. Architect must define its bounded scope and acceptance criteria for runnable application foundation, CI, and deployment before Builder begins. It must respect the unresolved security and design decisions above.

## Decision record

- 2026-10-10 / TASK-000: keep the foundation documentation-only; adopt MIT and the lightweight workflow in [WORKFLOW.md](WORKFLOW.md). Initial repository creation, commit, and push are explicitly authorized by the project owner. This bootstrap authorization does not approve a security design or functional release.
