# Project state

Updated: 2026-10-11.

## Status

TASK-000 is ACCEPTED by the Architect, as stated in the TASK-001 assignment.
Accepted commit: `a4ad0a612be1b300e07e911819c548545f54f908`.

TASK-001 is ACCEPTED as a technical PWA foundation. [PR #1](https://github.com/avahgard/moneyszn/pull/1)
merged into main at `084da18b2d00ba5e4ef90b918cc4b48badf1fd26`.
The TASK-002 assignment records independent review **PASS**, R01 and R02
**RESOLVED**, and owner real-iPhone acceptance **5/5**: Safari startup, PWA
installation, offline reopening, airplane-mode operation, and reopening after
iPhone restart. These review/device results are supplied acceptance evidence;
TASK-002 did not rerun them. iPhone model, iOS version and a detailed device
transcript were not supplied. No update-on-device or security-test result is
inferred from those five checks.

[GitHub Actions run 38094473519](https://github.com/avahgard/moneyszn/actions/runs/38094473519)
completed **SUCCESS** for that merge commit. TASK-002 read-only verification
confirmed remote-main ancestry, PR merge metadata, the run's completed/success
result and the deployed `build-info.json` commit on 2026-10-11. The technical
preview is deployed at [MoneySZN preview](https://avahgard.github.io/moneyszn/).
TASK-001 established a technical foundation, **not production financial-data
security**: no finance features, authentication, encryption or financial storage
exist. The preview origin remains unapproved for sensitive functionality.

[TASK-002](../tasks/TASK-002.md) is assigned for security architecture/research
only on `task/TASK-002`. Its [threat model](security/THREAT_MODEL.md),
[architecture proposal](security/SECURITY_ARCHITECTURE_PROPOSAL.md) and
[POC-03 plan](../tasks/POC-03_PLAN.md) are **PROPOSED, NOT APPROVED** and await
independent security review and explicit Architect decisions. No security
implementation or application-security PASS is claimed.

## Completed feasibility work

POC-01 and POC-02 are accepted technical experiments, as reported by the project
owner. TASK-002 inspected their documentation and relevant source at pinned remote
snapshots; no POC source was imported or changed and tests were not rerun. The
[proposal evidence table](security/SECURITY_ARCHITECTURE_PROPOSAL.md#previous-experiments-inspected-not-rerun)
separates source observations, historical Builder results and owner device reports.

## Outstanding decisions

- TASK-002 decisions D01-D08: origin/RP, PRF key hierarchy and provider/platform
  matrix, Vault/KDF/profile/passphrase rules, payload/replacement rules, locking
  and tabs, resource/rotation/update rules, PIN/alternative policy, recovery gate.
  See the [decision register](security/SECURITY_ARCHITECTURE_PROPOSAL.md#open-architect-decisions-and-validation-costs).
- POC-03 assignment and validation of portable encrypted recovery. Its plan is
  prepared; implementation has not begun and is not authorized by TASK-002.
- Secure local-storage implementation and independent security review. Defer
  six-digit app PIN and migrate away from the shared preview origin are proposed
  recommendations only, not accepted decisions.
- Final UI stack, data model, supported platform/version matrix, and storage durability strategy. TASK-001 selects only a framework-free TypeScript/Vite technical foundation.
- Product UI through a separate Designer workflow; ordinary CSV export behavior.

## Next task

Independently review TASK-002 and resolve/accept specific design decisions before
assigning implementation. No POC-03 implementation, TASK-003, hosting migration,
deployment or real-financial-data use is authorized by this documentation task.
Real iPhone/Android security verification remains future work.

## Decision record

- 2026-10-10 / TASK-000: keep the foundation documentation-only; adopt MIT and the lightweight workflow in [WORKFLOW.md](WORKFLOW.md). Initial repository creation, commit, and push are explicitly authorized by the project owner. This bootstrap authorization does not approve a security design or functional release.
- 2026-10-10 / TASK-001 assignment: record Architect acceptance of TASK-000.
  Authorize TypeScript/Vite technical preview, Node 24 LTS, automated production
  tests, and a gated Pages workflow. `/moneyszn/` on GitHub Pages is a provisional
  demonstration path, not the accepted future security origin. Product UI and
  all security decisions remain unresolved. TASK-001 acceptance was pending at
  assignment and is superseded by the acceptance entry below.
- 2026-10-11 / TASK-002 assignment: record TASK-001 accepted technical foundation
  and the bounded acceptance evidence above. Authorize documentation/research,
  commit/push of `task/TASK-002` and PR delivery only; no merge or deployment.
  Proposed architecture and D01-D08 remain unapproved until explicit Architect
  acceptance. Preparing POC-03 does not authorize implementing it.
