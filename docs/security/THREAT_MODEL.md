# MoneySZN threat model

Status: **PROPOSED, NOT APPROVED** / TASK-002 / 2026-10-11.
Applies to the candidate in the
[architecture proposal](SECURITY_ARCHITECTURE_PROPOSAL.md), not today's technical
preview. No described security control has been implemented or tested here.

## Assets and boundaries

Protect transactions, balances, account/category names, notes, budgets and
relationships; their integrity and availability matter alongside confidentiality.
Protect random local data-encryption keys (DEKs), wrapping keys, PRF outputs,
backup passphrases and decrypted snapshots. Protect the ability to recover and
the integrity of application code, schema migrations and backup interpretation.
Opaque identifiers, credential metadata, versions, ciphertext size and file
timestamps may remain observable; minimize them and document this leakage.

Trust boundaries are: user and screen/clipboard; application JavaScript and
browser APIs; browser storage and copied files; browser and OS/credential
provider; public deployment/Service Worker and installed application; imported
file and validated internal data; each tab/process; working local database and
independent user-owned backup. Other applications sharing an origin are **not**
isolated merely by URL paths or database names. See the proposal's origin analysis.

Credential authority is a separate boundary: different storage origins can be
eligible for the same WebAuthn RP ID. For RP `example-project.pages.dev`, eligible
branch/hash descendants may request its credential/PRF. Treat those publishers
as production trust dependencies, or place unreviewed experiments on a separate
project/RP namespace outside that scope. Inventory old descendants as well as
future deployment settings; disabling future previews does not prove revocation.
See the [SR-01 scope analysis and proposed policy](SECURITY_ARCHITECTURE_PROPOSAL.md#credential-scope-and-descendant-previews-sr-01).

## Attacker model and assumptions

An attacker may steal a locked or unlocked phone, copy/modify/delete browser
storage or backup files, make unlimited offline guesses, restore old snapshots,
submit hostile imports, or control another same-origin application. An attacker
may also publish unreviewed code on a different-origin, RP-eligible
descendant preview and request the production-RP credential. Direct production
IndexedDB access remains origin-isolated; usable PRF after user verification and
copied encrypted payload/wrapper metadata are prerequisites for the described
unwrap attack. The malicious caller can omit local assertion-origin checks;
those checks cannot enforce a PRF release policy. This is not automatic decryption
without user participation. The [future fictional-passkey experiment](SECURITY_ARCHITECTURE_PROPOSAL.md#future-fictional-passkey-scope-experiment)
must measure eligibility, selection, verification and PRF behavior on devices.
A stronger attacker may inject JavaScript, distribute a malicious update, install a privileged
extension, compromise the OS, or control a credential-provider account.

The proposed confidentiality boundary assumes an uncompromised browser, OS,
cryptographic implementation, random generator, deployment and credential
provider. It assumes effective device locking/user verification, a PRF secret
not present in the stolen storage copy, a high-entropy independent recovery
passphrase, and at least one complete, readable backup kept outside browser
storage. These are conditions, not guarantees or facts established by TASK-001.
Synced passkeys extend trust to the provider's account, synchronization and
recovery system; they are not necessarily device-bound.

## Threat assessment

| ID  | Scenario and intended protection                                                                                                                                  | Residual risk / validation requirement                                                                                                                                                                                |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T01 | Lost/stolen locked phone: OS lock plus PRF-gated unwrapping; local storage contains encrypted data and wrapped DEK only.                                          | Device passcode/provider recovery may unlock credentials. No guarantee against forensic OS compromise. Test cold startup and offline unlock on each supported configuration.                                          |
| T02 | Stolen phone with unlocked app: immediate manual/hidden-page lock, short inactivity policy, session-only keys and minimal plaintext.                              | Visible records can be read before locking; screenshots and OS app-switcher snapshots cannot be reliably recalled. Lifecycle events/timers may be delayed or absent. Test races, background/resume and termination.   |
| T03 | Copied IndexedDB/browser storage: random DEK wrapped by a PRF-derived secret; no raw or directly usable persistent DEK.                                           | Confidentiality depends on the missing PRF secret. Exposed metadata/size remain; OS/provider compromise and deletion are not mitigated. A stored non-extractable CryptoKey alone is not this boundary.                |
| T04 | Six-digit PIN offline attack: do not create a PIN-only key wrapper or PIN verifier unlock path.                                                                   | Only 1,000,000 candidates (about 19.9 bits at best). KDFs slow guesses but do not add entropy; local counters can be reset or bypassed on copies. App PIN deferred.                                                   |
| T05 | Deleted passkey / incompatible provider: reject unavailable PRF, preserve encrypted storage and offer independent Vault restore and new enrollment.               | No backup means possible total loss; an old backup loses newer changes. One iPhone Apple Passwords result does not establish other-provider support.                                                                  |
| T06 | Clearing browser data / eviction: persistence request, quota checks, visible backup status and regular external backups.                                          | Persistence is not a backup; user clearing, device failure and browser decisions still destroy data/shell. A deleted shell needs online reinstallation unless a compatible recovery app is already cached elsewhere.  |
| T07 | Malicious extension / compromised OS: reduce plaintext lifetime and dependency surface.                                                                           | Explicitly unsupported as a confidentiality guarantee: privileged code can observe input, use keys or plaintext, or alter the app. OS disk protection remains external.                                               |
| T08 | XSS / malicious import: strict schema/size/depth limits, inert text rendering, no executable markup, restrictive CSP and bundled assets.                          | Encryption does not protect data from code executing during unlock. Authenticated files can contain hostile values or come from a malicious passphrase holder. Parser and UI need adversarial review.                 |
| T09 | Compromised deployment/update or RP-eligible descendant preview: reviewed code/publishers across credential scope; disjoint experimental namespaces.              | Malicious descendant may request credential/PRF; needs user verification and copied payload/wrapper metadata. Local origin checks are bypassable; CSP/HTTPS do not make hostile publishers safe.                      |
| T10 | Corrupt/replaced/modified backup: authenticated encryption binds header and payload; reject truncation/extra data and unsupported profiles; retain original file. | Cannot repair corrupted ciphertext or detect replacement with an older valid backup without an independent trusted freshness reference. Authentication proves key possession/integrity, not provenance or latestness. |
| T11 | Interrupted import/export/migration: validate fully, stage encrypted candidate, transactionally switch active generation; keep original until success.            | Transaction completion is not indefinite disk durability. A partially saved external file cannot be called a verified backup. Test quota/termination/abort at each stage and both sides of the commit.                |
| T12 | Origin/RP scope and portability: assess eligible descendants before enrollment; use passphrase Vault for independent recovery.                                    | Distinct storage origins may share RP authority. A custom domain also needs subdomain/control review. IndexedDB does not transfer; provider sync is not a portable recovery contract.                                 |
| T13 | Logs/devtools/CSV/backups: no sensitive logs, telemetry or URL fields; no plaintext caches; explicit CSV consent and exposure notice; encrypted Vault by default. | An unlocked session is observable in devtools; CSV/clipboard/screenshots and leaked weak passwords remain user/OS exposure paths. Secure deletion from browser/flash storage is not promised.                         |

## Non-guarantees and review gates

No claim of hardware-isolated JavaScript keys, guaranteed Face ID, app PIN
rate-limiting against offline attacks, perpetual storage, prevention of all
rollback, cloud-free passkey-provider internals, recovery without a usable backup
and its passphrase, or confidentiality after hostile code/OS compromise.
An attacker can always destroy copies they control. Offline-first means normal
use of an installed supported configuration works offline; it cannot promise
first installation or cloud-only file retrieval without connectivity.

Before implementation approval, Architect must accept these residual risks and
the proposal's decisions D01-D08. The [POC-03 plan](../../tasks/POC-03_PLAN.md)
tests backup correctness and recovery only; later local-storage/PRF experiments
must test T01-T05 and lifecycle behavior. Independent security review must trace
every claimed control to implementation and fresh evidence before real data use.

Platform basis: [WebAuthn security considerations](https://www.w3.org/TR/webauthn-3/#sctn-security-considerations),
[Web Crypto security considerations](https://www.w3.org/TR/webcrypto/#security-considerations),
[WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/),
[CSP Level 3](https://www.w3.org/TR/CSP3/). These describe platform mechanisms and
limits; they do not certify MoneySZN.
