---
name: release-check
description: Assess MoneySZN functional release readiness and verify a checked deployment. Use for a proposed release or release-readiness review; a documentation-only foundation is not a functional release.
---

# Release check

Read [repository rules](../../../AGENTS.md), [project state](../../../docs/PROJECT_STATE.md), [architecture](../../../docs/ARCHITECTURE.md), [workflow](../../../docs/WORKFLOW.md), and the release task's acceptance criteria.

Identify the exact candidate commit and its Reviewer approval. Verify required checks for that commit, applicable automated tests, and absence of credentials, real financial data, secrets, or real Vault files in release content. Report failures, missing checks, and unresolved decisions that affect this release; do not infer readiness from an unrelated green run.

TASK-000 has no runnable app, CI, or deployment and is ineligible for a functional release. TASK-001 must establish those mechanisms. For later releases, verify automatic deployment is gated on required successful checks and uses approved changes on main. This Skill does not grant permission to publish, select a hosting origin, or bypass checks.

Within authorized release scope, confirm deployment corresponds to the checked commit, record the deployment URL and check results, and provide the user with acceptance steps using fictional data. Record user acceptance or failures in project state when received; technical deployment success alone is not user acceptance.
