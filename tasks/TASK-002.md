# TASK-002: Security Architecture & Data Protection

Assigned: 2026-10-11. Role: Security Architecture Builder.
Branch: `task/TASK-002`. Base: accepted main merge
`084da18b2d00ba5e4ef90b918cc4b48badf1fd26`.

## Mission and scope

Research and propose a practical, recoverable security architecture for a free,
mobile-first, offline-first iPhone/Android PWA, without a required backend,
application account, paid service, or recurring infrastructure expense. This is
documentation and research only. All new design choices are **PROPOSED, NOT
APPROVED** until Architect acceptance; accepting this report does not implicitly
approve every unresolved design choice.

## Acceptance criteria

- Verify clean Git state and the TASK-001 merge in current remote main; branch
  from that main without changing main or discarding unrelated work.
- Record TASK-001 acceptance: PR #1 merged, independent review PASS and R01/R02
  RESOLVED as supplied by the owner, successful run 38094473519, technical preview
  URL, and owner-reported 5/5 real-iPhone checks. Do not invent device versions or
  security tests; distinguish technical foundation from financial-data security.
- Read POC-01/02 documentation and source as references, with bounded evidence
  and limitations; do not modify their repositories or import source.
- Deliver [threat model](../docs/security/THREAT_MODEL.md) covering all thirteen
  assigned threats and the limits of browser protection.
- Deliver [architecture proposal](../docs/security/SECURITY_ARCHITECTURE_PROPOSAL.md)
  comparing viable approaches across all assigned decision dimensions. Address
  key lifecycle, local storage, authentication, PIN, portable Vault recovery,
  origin selection, safe upgrades, security limitations and test costs. Cite
  primary sources; distinguish evidence, platform specifications and hypotheses.
- Deliver [POC-03 plan](POC-03_PLAN.md) with fictional data, automated and manual
  device acceptance, failure/corruption/version/interruption tests, independent
  security review, and decisions required before experimental implementation.
- Update project state and directly relevant references without duplicating the
  proposal. Validate Markdown, links, scope, consistency, diff and staged content.
- Commit/push this branch, open a PR against main, and return exact commit/PR,
  recommendation, risks, PIN/Vault/origin policy, open decisions and checks.

## Exclusions and delivery boundary

No application code, runtime dependencies, production Service Worker, Actions,
Pages configuration or permanent tests change. No cryptographic implementation,
Vault implementation, final UI, hosting migration, POC-03 implementation or
TASK-003. No POC/Downloads repository changes, new agent framework or Skills.
Use fictional examples only; never publish real financial data or secrets.

The [workflow](../docs/WORKFLOW.md) and
[task-delivery skill](../.agents/skills/task-delivery/SKILL.md) apply. Builder
documentation checks are not independent security approval. No merge,
deployment, main modification or branch-protection bypass is authorized.

Delivery target: **TASK-002 READY FOR INDEPENDENT SECURITY REVIEW**. Stop after
the Builder Report; implementation requires a separate accepted assignment.

## Builder documentation validation (2026-10-11)

- Clean preflight; remote main and PR #1 verified at the required merge commit.
  Actions run 38094473519 and live preview build ID verified read-only. Local
  `main` was not changed; this task branch starts at the verified remote main.
- Relevant POC source/docs inspected at the proposal's pinned commits via
  read-only GitHub/API/raw access. No POC code imported, changed or executed.
- Prettier check passed for the seven changed Markdown files. One-off Node
  structure checks passed: 33 local links/anchors, UTF-8/fences, T01-T13,
  D01-D08, comparison dimensions and proposal labels. `git diff --check` passed.
- Of 31 unique external references, 28 HTTP/fragment checks passed. Three GitHub
  page endpoints (POC-02 root, pinned POC-01 tree and pinned POC-02 VALIDATION)
  returned HTTP 503/504 on retry; their underlying content/commit identities were
  verified through GitHub connector/API/raw reads. This is an access limitation,
  not evidence of a missing repository. Primary technical references were read.
- Builder reviewed scope, assertions, decision consistency and staged text for
  secrets/private data. Only the seven documented Markdown paths are delivered.
  No application, crypto, POC or manual device tests were run; none is claimed
  PASS. Independent security review and Architect decisions remain pending.
