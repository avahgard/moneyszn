# POC-03 plan: portable encrypted backup and recovery

Status: **PROPOSED, NOT APPROVED** / prepared by TASK-002 / 2026-10-11.
Experimental implementation requires a separate Architect assignment. This plan
does not approve the production Vault format, product schema, dependencies, UI
or hosting. See the
[proposal](../docs/security/SECURITY_ARCHITECTURE_PROPOSAL.md) for rationale and
[threat model](../docs/security/THREAT_MODEL.md) for residual risks.

## Questions to resolve before implementation

- Approve experimental container/AAD layout, extension/MIME, algorithm/KDF and
  exact profiles, passphrase byte/Unicode rules, parser bounds and version policy
  (D03). Select a reviewed implementation with provenance before adding a dependency.
- Approve a fictional snapshot schema, replacement-only recovery and encrypted
  generation staging/retention (D04). Product financial data model remains separate.
- Set experimental origin/workspace and authorization for deployment/device tests
  (D01). No real or production passkeys; the backup must not depend on WebAuthn.
- Approve resource limits and interrupted-operation/lock semantics (D05/D06):
  proposed 10 MiB plaintext, 10,000 records, no attachments/compression; derive
  bounded header/container limits for the selected encoding. Measure before
  accepting those limits as mobile-safe.
- Approve devices/OS/browser contexts and independent security-review gate (D08).
  Decide whether POC uses an in-memory source plus synthetic encrypted staging
  adapter; it must not be mistaken for production local-storage validation.

## Bounded experiment

Use a standalone test harness, not the production MoneySZN application or either
existing POC. Include only backup creation/download, file selection, complete
validation/restore and failure handling. No PIN, synchronization, background
cloud API, production passkey unlock, product UI or real financial data. Current
MoneySZN source, worker, CI and permanent tests stay untouched unless the later
assignment explicitly authorizes integration.

Dataset: deterministic fictional accounts `Pocket Test` and `Example Bank`,
categories `Food Test` and `Travel Test`, and four transactions with stable IDs:
opening income 10,000 minor units, expenses 450 and 725, and refund 125 (BYN),
plus fictional notes in Cyrillic, emoji and markup-like text. Expected net is
8,950 minor units. Include date boundaries, account/category references and
optional fictional budget/settings fields only as the approved schema permits.
Use separate invalid fixtures for duplicate IDs, conflicting account definitions,
missing references, unsafe integers and oversized/deep strings. No real Vaults.

Compute canonical semantic equivalence of all fields, IDs, relationships and
totals for round trips; a count-only or screenshot-only check is insufficient.
Use generated test secrets or explicitly fictional vectors; never print passwords,
keys or complete decrypted snapshots in test output.

## Acceptance matrix

| Case                              | Automated evidence                                                                                                                                                                | Manual device acceptance                                                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create backup                     | Approved KDF/AEAD vectors; fresh salt/nonces/data key; no plaintext/credential metadata in container; self-decrypt semantic equality                                              | User creates/downloads encrypted file; filenames do not expose account names.                                                                                                                 |
| Save and select file              | Browser download/picker wiring; bytes/hash unchanged on harness round trip                                                                                                        | Safari and installed iPhone PWA: Save to Files, On My iPhone and iCloud Drive; choose file back and restore. Android: Downloads and system picker. Verify complete bytes after provider save. |
| Full restoration                  | All fields/IDs/references/totals equal in fresh store; restore generates new local staging key; active generation readback succeeds                                               | Delete only disposable fictional harness data after verified backup; restore same complete dataset. Never clear unrelated origin data.                                                        |
| Independent device                | No dependency on original key/passkey/provider/DB or hostname in import                                                                                                           | Export on real iPhone, restore on another compatible device/browser with file + passphrase; record destination configuration. Also test a fresh storage context without original credentials. |
| Wrong passphrase                  | No plaintext output or writes, current generation/hash unchanged; correct retry succeeds                                                                                          | Generic wrong-password/damaged-file message; existing fictional data remains intact.                                                                                                          |
| Tamper/corruption                 | Flip each header/wrapper/body/tag field; truncate at boundaries; append bytes; reject invalid lengths/encodings and unknown profiles                                              | Select one corrupted file and show rejection without replacing current data. Original intact file still recovers.                                                                             |
| Version handling                  | Golden supported-old fixtures migrate; future container/crypto rejects; future payload rejects after authentication; no downgrade or field loss                                   | Clear unsupported-version guidance, current data unchanged. Record exact fixture version.                                                                                                     |
| Duplicate/conflict/import content | Invalid duplicates/references/types rejected; hostile text stays inert; same-file reimport replaces without duplication                                                           | Preview/explicit replacement confirmation; cancel preserves original; no automatic merge.                                                                                                     |
| Interruption/quota                | Inject abort, quota failure, pagehide/termination before staging, during staging and before/after active switch; restart exposes whole old or whole new state; stale writer fails | Cancel chooser/export/import, background/resume, force-close around operations; reopen and inspect complete dataset.                                                                          |
| Offline                           | Installed harness has no runtime fetch dependency; cached local file and crypto work with network disabled                                                                        | Airplane mode + Wi-Fi off: create/save/select/restore locally available file, reopen/restart and restore. iCloud cloud-only file failure is distinct from crypto failure.                     |
| Resource abuse                    | Reject huge/header/KDF cost inputs before excessive work; boundary-size payloads; no partial success; validate memory-allocation errors                                           | Measure KDF time/peak memory and largest approved fixture on minimum target devices; no crash, unusable freeze or silent loss.                                                                |
| Replacement/rollback              | Original active generation retained on failure; old valid backup accepted as old, not claimed latest; failed candidate never active                                               | Backup-before-replace prompt and date/count preview. User verifies a complete saved file, not just a successful download click.                                                               |

For interruptions, record operation phase and outcome; browser emulation cannot
prove physical power-loss durability. Test a delayed file provider, share denial,
unsupported custom MIME and async user-activation expiry. Provide a direct
download path when file sharing is unavailable; do not require a paid provider.
An already cached shell and locally available file are prerequisites for offline
recovery; first installation and cloud-only fetch are not promised offline.

## Evidence and security-review requirements

Record exact candidate commit, container/profile/schema versions, fixture digest,
automated commands/results, date, device model, OS/browser/provider versions
where available, Safari versus installed context, offline state and each result
as PASS/FAIL/BLOCKED/NOT TESTED. Do not infer real Safari results from desktop
WebKit or generalize a single Android/provider result. Unknown facts remain unknown.

Builder reports are evidence for an independent Reviewer. Review must inspect
crypto composition, nonce/AAD/version boundaries, dependency provenance, parser
resource limits, password handling, no sensitive output/networking, no writes
before complete authentication/validation and transaction failure paths. Review
fresh mutation/interruption probes, not only round trips. All manual required
cases must have device evidence or explicit unresolved blockers before acceptance.

Deliver code/evidence only within a separately assigned POC workspace and scope.
POC technical acceptance does not approve production security or the final Vault
format. Architect records what was learned, selects or revises the format and
assigns next work. TASK-002 stops at this plan; no experiment is implemented now.
