# Security architecture proposal

Status: **PROPOSED, NOT APPROVED** / TASK-002 / 2026-10-11.
Architect approval is required before implementation. The current application
is a technical preview without financial storage or cryptography. Read with the
[threat model](THREAT_MODEL.md) and [POC-03 plan](../../tasks/POC-03_PLAN.md).

## Recommendation and evidence vocabulary

Propose a random local DEK, encrypted IndexedDB snapshots, and a DEK wrapper
unlocked by WebAuthn PRF with required system user verification on explicitly
tested configurations. Keep usable keys only in the unlocked session. Provide
independent, strong-passphrase encrypted snapshot backups, recovered without the
original passkey, phone, provider account or origin. Defer an application
six-digit PIN. Select an isolated long-lived HTTPS origin before sensitive use.

This meets fast everyday unlock **conditionally**, not on every iPhone/Android
browser/provider. On unsupported configurations, preserve data and explain the
limitation; do not silently downgrade. A separately approved strong local
passphrase mode could broaden support, but would require that passphrase on cold
launch and would not meet the desired everyday UX. No MoneySZN account/backend
is needed; OS credential providers may themselves depend on accounts/cloud sync.

- **E — evidence:** inspected source or historical/owner-reported observations,
  attributed below. Not an independent production audit.
- **S — specification/platform documentation:** an API contract or documented
  policy, not universal deployed compatibility.
- **H — hypothesis/proposal:** design inference requiring implementation, device
  measurements and security review. All proposed controls below are H.

### Previous experiments: inspected, not rerun

Read remote main snapshots on 2026-10-11 without cloning, modifying or importing
POC code. Relevant inspected files: POC-01 README, app, db and worker; POC-02
README, VALIDATION, app, crypto, db, worker and all three test runners. UI/style,
icon and manifest contents were not security-audited. No POC tests were executed
in TASK-002.

| Reference                                                                                                   | Established or reported behavior                                                                                                                                                                                                                                                                                                                                                                                                                            | Still unverified / not established                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [POC-01 snapshot](https://github.com/avahgard/finance-poc-01/tree/3eac0adcb205eecb4bde9d7a075176e76f92cd90) | E: source persists plaintext fictional expenses in IndexedDB, resolves writes on transaction completion, renders names as text, and caches a static shell. Prior owner acceptance records offline persistence feasibility; README supplies reopen/offline/restart scenarios.                                                                                                                                                                                | Exact device/version and fresh per-scenario results are unavailable here. No encryption, backup, durability guarantee, migration, security review or Android certification. A test plan is not a result.          |
| [POC-02 snapshot](https://github.com/avahgard/finance-poc-02/tree/a4c7db5488e85ad1e7303c55c00cea6bd0faabd7) | E: source derives a note-encryption key directly from PRF using HKDF, uses AES-GCM and ciphertext-only ready storage, requires user verification and a 32-byte PRF output, and keeps pending enrollment metadata separate. Historical [Builder validation](https://github.com/avahgard/finance-poc-02/blob/a4c7db5488e85ad1e7303c55c00cea6bd0faabd7/VALIDATION.md) reports actual crypto/IDB/worker checks with mocked WebAuthn and late-unlock regression. | Builder checks are historical and not independent production approval. The source has no random independently wrapped DEK, portable backup, key rotation, app PIN, multi-tab protocol or production threat model. |
| POC-02 real device, supplied TASK-002 evidence                                                              | E: owner reports usable PRF with Apple Passwords on a real iPhone and successful offline/restart unlock; tested KeePassium configuration returned no usable PRF.                                                                                                                                                                                                                                                                                            | Device/iOS versions and complete acceptance transcript unavailable; do not extrapolate to all Apple Passwords, KeePassium, Android, synced credentials or browsers. No independent production-security audit.     |

POC-02's historical VALIDATION said real-device work was pending; the later
owner report above adds bounded observations rather than rewriting that report.
Its direct PRF-to-note key derivation proves neither a recoverable production key
hierarchy nor the adequacy of all lock races. Retain the lesson to reject late
unlock after hiding/locking, not an assumption that the experiment is complete.

## Candidate comparison

Scores are conditional design assessments (H), not measured security ratings.
All candidates still trust running application code and OS. Backup recovery in
this table assumes an independently encrypted Vault; that backup is itself H.

| Approach                                     | Confidentiality                                                        | Recoverability                                              | Offline reliability                                              | iPhone                                | Android                        | Offline PIN resistance                                                      | Complexity / maintenance          | UX                                                           | Mandatory recurring cost                                   |
| -------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Plaintext IDB + UI lock                      | None against storage copy                                              | Backup possible, often plaintext                            | Local storage feasible E, eviction risk S                        | POC-01 owner evidence only            | Unverified                     | None                                                                        | Low / low                         | Fast but misleading lock                                     | None                                                       |
| Six-digit PIN-derived encrypted DB           | Limited by at most 19.9-bit secret                                     | Vault possible H                                            | Browser crypto available S; exact flow H                         | Unverified                            | Unverified                     | Inadequate; offline guesses bypass counters                                 | Medium / medium                   | Convenient, unsafe as fallback                               | None                                                       |
| Persisted non-extractable DEK + UI/PIN check | Export restriction S; no proven authentication/storage-copy boundary   | Vault possible H                                            | Key persistence/reuse H                                          | Unverified                            | Unverified                     | UI check bypassable by same-origin code; copied-key protection not promised | Medium / medium                   | Fast, insufficient threat coverage                           | None                                                       |
| Strong local passphrase + encrypted DEK      | Depends on passphrase/KDF H                                            | Independent Vault possible H                                | No provider dependency H                                         | Web Crypto mechanism S, device flow H | Same                           | No PIN path; strong-secret guessing remains                                 | Medium / moderate                 | Long passphrase on cold launch; fails desired fast-unlock UX | None                                                       |
| PRF-wrapped random DEK + independent Vault   | Strong conditional storage-copy boundary H; usable PRF E on one iPhone | Passphrase snapshot restore H; unbacked changes can be lost | Apple Passwords offline/restart report E, other configurations H | Bounded E, broader support H          | H, must test                   | No app PIN wrapper; provider user verification external                     | High / moderate-high              | Fast on supported configurations; recovery is separate       | None under free static hosting; provider policies external |
| Native keystore/hardware-backed app          | Potential stronger device-bound gate H                                 | Portable Vault still required H                             | Platform-specific                                                | Separate native implementation        | Separate native implementation | Can use OS-enforced gating, not established for this PWA                    | Very high / high across platforms | Potentially fast                                             | Distribution/tooling may incur cost; outside PWA scope     |

Reject plaintext/UI lock and PIN-only storage protection. Reject stored
non-extractable key plus UI gate as the primary boundary. Defer native work,
server-backed guessing controls (contradict no backend), and universal provider
support. Retain strong local passphrase mode as a separately decidable option,
not an automatic fallback. Prefer PRF wrapping plus independent backups subject
to the following gates.

## Working local database and key lifecycle

### Key hierarchy and persistence

Proposed first version uses an encrypted whole-data snapshot per committed
generation, with no plaintext financial indexes. This minimizes leakage and
transaction complexity for a small dataset. Whole-snapshot rewriting and memory
cost must be measured; per-record encryption is a later option needing record
identity binding, an authenticated manifest and deletion/reordering analysis.

1. Generate a random 256-bit DEK and random database ID. Encrypt the snapshot
   using AES-256-GCM with a fresh 96-bit nonce and 128-bit tag; bind format,
   database ID, generation, schema and key ID as authenticated associated data.
2. Enroll a passkey at the accepted exact RP host. Obtain actual PRF output with
   required user verification through a separate user-triggered assertion; a
   successful registration/API presence is insufficient. Confirm repeat unwrap
   before making enrollment active. Failed enrollment leaves no usable database
   dependent on an unproven key and may leave an unused credential in the provider.
3. Derive a wrapping key using HKDF-SHA-256 from the high-entropy PRF output,
   public random salt and a versioned MoneySZN wrapping label. The PRF input is
   a separately stored random 32-byte value stable for that wrapper. Neither
   salt nor input is a password or secret. Bind credential ID, RP ID, DB/key IDs
   and wrapper/profile version into authenticated wrapper metadata.
4. AEAD-encrypt the DEK under that wrapping key with a fresh nonce. Persist only
   encrypted snapshots, wrapped DEK and bounded public metadata in IndexedDB;
   never persist raw DEK, PRF output, decrypted state or passphrase.
5. After unwrap, import the DEK as a non-extractable session CryptoKey for the
   minimum necessary operations. Raw creation/unwrap bytes temporarily exist;
   overwrite owned buffers where possible and release references. JavaScript
   garbage collection, copies and browser internals prevent a zeroization promise.

AES-GCM requires nonce uniqueness per key, and authenticates supplied AAD;
never reuse a nonce for different plaintext. Use random nonces rather than a
counter vulnerable to restored snapshots, with an approved conservative per-key
write bound and rotation before it is exceeded. Proposed experimental bound:
at most 2^20 snapshot encryptions per DEK; production bound, collision analysis
and restored-copy handling require review. Key wrappers and backup keys have
separate domains and nonces. [NIST GCM guidance](https://csrc.nist.gov/pubs/sp/800/38/d/final)
is the primitive basis, not a MoneySZN certification.

Web Crypto supplies cryptographic operations, not a secure application keystore.
`extractable: false` blocks export/wrap through the API; it does not prevent
allowed decrypt operations by hostile same-origin code, guarantee hardware
storage, or promise secrecy of copied browser-profile internals. Do not persist a
directly usable session DEK. HKDF separates high-entropy key material; it is not a
password-hardening KDF. [Web Crypto](https://www.w3.org/TR/webcrypto/),
[HKDF RFC 5869](https://www.rfc-editor.org/rfc/rfc5869.html).

### PRF, system authentication and failure

[WebAuthn PRF](https://www.w3.org/TR/webauthn-3/#prf-extension) is a credential-scoped
derivation facility. Extensions can be unsupported; passkey success alone is
not a decryption secret. Require an actual correctly sized result and successful
authenticated unwrap. The OS/provider controls user verification; do not promise
Face ID or treat synced passkeys as necessarily device-bound.
[Apple's passkey guidance](https://support.apple.com/guide/iphone/use-passkeys-to-sign-in-to-apps-and-websites-iphf538ea8d0/ios)
describes system authentication and provider ecosystem, not PRF compatibility.

Propose local checks of fresh random challenge, expected credential ID, exact
origin/RP, user-presence/user-verification flags and assertion signature using
enrollment public-key metadata; validate through a reviewed parser. There is no
remote account authentication or trusted server registry. The security goal is
possession of PRF material sufficient to unwrap the DEK; local checks do not
protect against replacement of the executing code. They also cannot stop malicious
code on an RP-eligible descendant from omitting those checks and requesting PRF
itself; see the hosting credential-boundary policy below. Determine the precise
local verification profile in D02; do not copy POC-02's mocked checks as production proof.

Cancel, timeout, missing PRF, wrong credential, corrupt wrapper and failed
decrypt all remain locked and preserve existing bytes. Use bounded generic
messages, no raw credential/exception payloads. Do not assume `NotAllowedError`
uniquely identifies cancellation. Offer explicit retry or recovery, never key
regeneration over an unreadable database. Provider synchronization, changed
devices and restart/offline behavior need actual configuration tests.

### Locking, tabs and transactions

Start locked on every new process/navigation. Manual lock, hidden visibility and
pagehide invalidate a monotonically increasing session token, abort pending
authentication/work, drop usable key references and clear plaintext views,
forms and derived caches. Late auth, decryption, export preparation or rendering
must recheck token/visibility before use. BFCache/pageshow must resume locked.
System authentication or file chooser may hide the app: fail safely and require
a new deliberate attempt; POC device tests must resolve usability without a
blanket exception that leaves a hidden app unlocked.

Propose immediate background lock plus a two-minute visible inactivity limit,
subject to D05 device/accessibility review. Events/timers are best-effort;
process termination can happen without callbacks and must leave only encrypted
committed state. No usable keys in Service Worker, shared worker, Cache API,
localStorage or cross-tab messages. OS screen snapshots remain a residual risk.

Initially permit one unlocked writer tab, coordinated by a feature-tested Web
Locks capability; fail to locked/read-only guidance if unavailable rather than
implementing an unproven lock fallback. BroadcastChannel may notify lock/update
events without secrets, but is not a guaranteed all-tabs revocation mechanism.
Each client must check authoritative IDB generation/session metadata before
committing; tabs independently authenticate and enforce lifecycle. Suspended tabs
must revalidate on resume; no keys are transferred between tabs.
The [Web Locks draft](https://www.w3.org/TR/web-locks/) defines cooperative
coordination, not an authentication boundary against hostile same-origin code.

Prepare crypto/validation outside short IndexedDB transactions. Commit candidate
ciphertext, wrapper and active generation pointer together; compare expected
generation in that transaction and reject stale writers. Report save success
only after transaction completion. Schema upgrades close connections on
versionchange; blocked clients get explicit guidance. Interrupted staging cannot
replace current active data. Transaction atomicity is not guaranteed retention
after disk/device failure. [IndexedDB transactions](https://w3c.github.io/IndexedDB/#transaction-concept).

### Rotation, migrations and upgrades

Passkey changes normally rewrap the existing DEK after successful unlock, verify
the new wrapper, commit it, and only then retire the old authorized wrapper. A
new passkey alone cannot recover the old key. Credential deletion does not
remotely erase wrappers/keys in old copies. Actual DEK rotation reencrypts all
live records into a new generation and atomically switches after readback;
retained snapshots/backups remain decryptable with old secrets. No retroactive
revocation or secure erasure of stolen copies is possible.

Maintain separate container, crypto-profile, payload-schema and IDB versions.
Migrate a validated decrypted snapshot into a new encrypted generation, preserving
the old one until commit/readback. Do not migrate from malformed/incompatible
input, delete the DB on version errors, or downgrade schemas blindly.

The TASK-001 worker caches only public assets but activates/reloads promptly.
That technical-preview lifecycle must be reevaluated before finance writes:
future updates need a coherent asset set, locked/quiescent activation, no forced
reload over unsaved work, old/new schema coordination and recovery on interruption.
An old client must not write after a newer incompatible generation is active.
No production worker changes are authorized here.

Request persistent storage where supported and expose quota/backup status; handle
denial and write failure without silent loss. WebKit documents best-effort
eviction and heuristic persistence. External backups remain required, including
after successful persistence requests. [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/).

## Access UX and six-digit PIN policy

A uniformly random six-digit application PIN has only 1,000,000 values; chosen
PINs are often weaker. With a stolen PIN-wrapped key plus authenticated
ciphertext, attackers can test guesses offline. Even an illustrative one second
per guess on a single serial worker averages about 5.8 days; attacker parallelism
and optimized hardware can reduce that. This is arithmetic, not a benchmark.
PBKDF2/Argon2 work factors cannot turn six digits into a strong secret.

Local retry counters, delays, lockouts and deletion policies can be bypassed by
copying/restoring storage or changing client code. A random secret stored beside
the PIN wrapper does not fix the storage-copy threat. A non-extractable browser
key is not a portable documented OS-enforced PIN gate. A PRF secret requiring
system authentication could protect a PIN wrapper, but then the passkey remains
necessary and the PIN is not an independent alternative. Cached session keys
behind a PIN are a UI convenience with weaker unlocked-session protection.

**Propose deferring the app PIN entirely.** Everyday unlock is system-verified
PRF where validated. OS passcode/provider PIN is controlled outside MoneySZN and
must not be confused with a six-digit application PIN. No repeated backup
passphrase on normal launches. Unsupported PRF configurations are explicitly
unsupported for fast unlock until an approved alternative exists. A secure
independent app PIN would require a demonstrable device-bound, non-copyable
secret with enforced anti-guessing available to this PWA; none is established.

## Portable encrypted Vault: separate snapshot, independent recovery

The working database is not the Vault file. Export decrypts a consistent local
snapshot in the unlocked session, validates it, and encrypts a **new portable
snapshot under a fresh backup key**. It does not export the original local DEK,
passkey wrapper or a credential identifier. Restore needs a compatible recovery
app, complete file and strong passphrase, not the original credential/device.

### Proposed cryptographic and format profile

Prefer an independently reviewed, bundled Argon2id implementation for a
password-derived backup wrapping key, with AES-256-GCM for a randomly generated
256-bit backup data key and payload. Use a fresh random salt of at least 16 bytes,
distinct fresh 96-bit nonces for wrap/payload, and 128-bit tags. Per-export fresh
data key prevents unrelated backups sharing a payload key. The passphrase must
be independently strong, e.g. several randomly generated words saved outside
the phone. Loss of it has no server reset. Do not store it or its derived key in
the local DB. Proposed encoding is exact UTF-8 without trimming or implicit
normalization; D03 must approve Unicode/length rules and human recovery guidance.

[RFC 9106](https://www.rfc-editor.org/rfc/rfc9106.html) supplies Argon2id profiles
and vectors, including a 64 MiB / three-pass / four-lane profile for constrained
environments relative to its larger profile. Benchmark that candidate on real
supported phones; it is not an approved mobile work factor. Argon2id adds WASM
supply-chain, memory, offline bundling and CSP costs; no dependency is selected
or installed here. Web Crypto PBKDF2-HMAC-SHA-256 is a simpler native alternative
but lacks Argon2's memory hardness. Retain it only as an explicitly approved,
versioned alternative after measurements/review, never automatic weakening.
[PBKDF2 specification](https://www.rfc-editor.org/rfc/rfc8018.html).

Proposed container: fixed magic/type marker, container version, bounded header
length, crypto-profile/KDF identifiers and parameters, salt, nonces, wrapped
backup key, and encrypted payload/tag. Authenticate the exact encoded header
bytes (with an unambiguous fixed layout excluding self-referential tag fields),
wrapped-key bytes and relevant lengths with the payload, and the appropriate
immutable header fields with the key wrapper. Avoid reserializing ambiguous JSON
headers for authentication. Public header contains no financial names, balance,
credential ID or origin dependency; file length/version still leak. Exact magic,
extension/MIME, byte encoding and AAD boundaries await D03, not this proposal.

Check format/version, structural bounds and allowlisted KDF profiles **before**
running attacker-controlled work factors; never honor unbounded memory/iterations.
No algorithm negotiation by guesswork or decrypt-to-downgrade. Unknown future
container/crypto versions reject clearly before overwrite; unsupported payload
schemas reject after authenticated decryption. Compatibility readers support
explicit old profiles and pure validated migrations, with golden fixtures; do
not silently discard unfamiliar required fields. No compression/attachments in
the first experiment; avoid decompression and archive-path attack surfaces.

### Import and recovery semantics

After authentication, validate the entire payload: required fields, exact types,
bounded lengths/depth/counts, unique stable IDs, finite safe-integer minor-unit
amounts, supported currency/date semantics and all referential relationships.
Reject duplicate IDs and conflicting entities within the file. Render strings
as inert text even in previews. A valid tag does not make a malicious payload safe.

Propose **full replacement only** initially; no automatic merges with existing
data or heuristic deduplication. Show record/count summary only after validation,
and require explicit user confirmation before replacing existing finances.
Offer backup of the current data first. Reimporting the same snapshot should
replace deterministically rather than duplicate transactions. If old local data
is locked/unreadable, replacement must be separately confirmed and its encrypted
bytes retained until the new candidate has been verified; never overwrite during
password trials. Merge/conflict UI is deferred to a separate accepted design.

On the destination, enroll/test a compatible local unlock method and generate
a **new local DEK**, encrypt the restored dataset under that local key, stage a
candidate generation, then atomically switch active metadata in the same DB.
An import to empty storage follows the same validation and readback path.
Wrong passphrase and authentication failure give a bounded combined message
(wrong passphrase or damaged file), no partial plaintext and no mutation. Known
unsupported version/resource failures can be distinct. Keep the original file
and current active database on all failures. Interrupted migration/import is
restartable; readers see the complete old or complete new dataset, never a mix.

Corrupted authenticated ciphertext cannot generally be repaired; use another
intact backup. Modified header/body/tag, truncation and appended bytes reject.
An older valid backup remains valid: authenticated encryption provides neither
freshness nor a trusted author signature. Show authenticated snapshot date and
identity for user review, without promising rollback detection after total loss.
Changing a passphrase affects newly created files, not leaked historical ones.

### Memory, Files providers and exports

Web Crypto encryption is buffer-oriented; a Blob download does not make crypto
streaming. For POC-03 propose a 10 MiB plaintext / 10,000-record ceiling and a
separate bounded container limit derived from encoding overhead. These are
experimental caps, not proven mobile capacity. Measure peak memory and KDF/parse
cost, including copies, on the lowest supported phone. Refuse oversized input
before allocation/KDF. True large-file support would need a reviewed chunked
AEAD format binding order/count/finalization and must not expose partial imports.

Create encrypted bytes completely, self-decrypt/validate in memory, then offer a
user-triggered download; optional file sharing only after capability testing.
Use ordinary file input for restore, rather than depending on File System Access
APIs. [Web Share](https://www.w3.org/TR/web-share/) is mediated by the user agent
and a completed share promise does not certify a durable file in its target.
Two user actions may be needed after async crypto to obtain fresh user activation.

Test Safari and Home Screen PWA separately: Blob download, Save to Files, On My
iPhone and iCloud Drive, file naming/extension, selecting/reopening identical
bytes, cancellation and provider delay. Android tests cover Downloads and the
system file picker/share targets. Do not promise a custom file type will be
shareable. No background iCloud/Drive API, cloud synchronization or cloud login
inside MoneySZN; providers are user-chosen OS storage. Cloud-only files may need
network access; offline recovery needs an already downloaded file and installed
recovery shell. User reimport/readback is the evidence of a complete saved backup,
not merely a download click. Keep multiple dated copies outside browser storage;
recent backup reminders must disclose that later changes remain at risk.

CSV is separate, generally unencrypted and explicitly user-authorized. Warn at
export, minimize fields, and resolve spreadsheet formula-injection handling in
its own design. Never produce CSV as an automatic recovery fallback. No secrets,
financial payloads, raw errors or downloaded backup bytes in logs/devtools
captures/test artifacts. No plaintext Service Worker caching or network upload.

## Hosting origin and malicious updates

The preview URL `https://avahgard.github.io/moneyszn/` has origin
`https://avahgard.github.io`; the path is not a security boundary. Other project
Pages apps, including the two POCs, use that host. Their JavaScript may access
same-storage-context IndexedDB and caches; a distinct DB name prevents accidents,
not attackers. Installation/storage partition details cannot be used as a
general path-isolation guarantee. Origin definition is scheme/host/port,
not repository/path. [HTML origins](https://html.spec.whatwg.org/multipage/browsers.html#concept-origin),
[IndexedDB storage keys](https://w3c.github.io/IndexedDB/#database).

Worker scope limits controlled URLs; a sibling worker is not automatically
root-scoped, and expanding beyond its script directory requires suitable
`Service-Worker-Allowed`. Nevertheless worker scope does not isolate same-origin
storage or ordinary script authority. A root-scope app or same-origin hostile
code increases risk. [Service Worker scope rules](https://w3c.github.io/ServiceWorker/#service-worker-allowed).
WebAuthn RP ID is a domain, not a URL path: the preview's exact-host RP would be
`avahgard.github.io`, not `/moneyszn/`. Sibling apps must be treated as trusted
first-party code if credentials/data ever share that origin.

### Credential scope and descendant previews (SR-01)

WebAuthn RP ID scope is **not identical to same-origin storage isolation**.
An HTTPS descendant may request an RP ID that is a registrable domain suffix of
its own host. Thus, with RP ID `example-project.pages.dev`, an eligible origin
such as `https://branch.example-project.pages.dev` may exercise that RP's
credentials despite having a different storage origin. This is a scope rule,
not proof of credential/provider availability on a particular device.
[WebAuthn RP ID rules](https://www.w3.org/TR/webauthn-3/#relying-party-identifier).
The current [Public Suffix List](https://publicsuffix.org/list/public_suffix_list.dat)
lists `pages.dev`, not each project's hostname; recheck actual eligibility when
evaluating D01. Use of the exact project host as RP ID does not exclude descendants.

Cloudflare documents branch aliases such as `development.<project>.pages.dev`
and hash deployment addresses such as `<hash>.<project>.pages.dev`. These are
descendants of the production project host. Old hash deployments can remain
accessible after a branch alias moves; preview URLs are public by default.
[Cloudflare preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/).
An unreviewed eligible descendant is therefore a possible credential/PRF attack
surface even when it cannot directly read production IndexedDB.

Inference for this proposal: malicious descendant code could request the same
credential and stable PRF input. Given a usable PRF result after successful user
verification and a copied encrypted payload plus public wrapper metadata, it
could derive the unwrap key. This is **not automatic decryption without user
participation**; RP eligibility alone supplies neither the payload nor usable
PRF. System/provider behavior still governs authentication and PRF availability.
Production-only application assertion-origin checks cannot constrain the
malicious caller, which can omit them; they are not a provider-enforced PRF
release policy. [WebAuthn malicious-subdomain considerations](https://www.w3.org/TR/webauthn-3/#sctn-code-injection).

### Proposed credential trust namespace policy

- Production and unreviewed experimental deployments must occupy **disjoint
  credential trust namespaces**. Prefer a separate test Pages project with a
  distinct hostname, such as `example-project-test.pages.dev`, and its own exact
  RP ID; it must not be a descendant of the production RP ID. Do not broaden the
  RP ID or configure related-origin permissions to reconnect these namespaces.
- Inventory the actual production host/RP, all RP-eligible descendants, branch
  and old hash aliases/deployments, custom-domain mappings and any related-origin
  configuration. Record each publisher, deployed code revision, access policy
  and deployment/review controls, including who can change those controls.
- Disabling future preview builds must **not** be assumed to revoke old
  deployments. Verify existing aliases and direct hash URLs independently;
  retirement/removal, access changes and their effectiveness require separate
  authorization and evidence. A moved alias is not proof its old target vanished.
- If any descendant remains RP-eligible, it must satisfy production trust and
  publisher-review requirements. An access gate alone does not make unreviewed
  code safe for a user who can reach it. No experimental code may execute there
  using production credential authority.
- A custom domain is not automatically secure. Assess its chosen RP ID,
  eligible subdomains, DNS/delegations, aliases and related-origin permissions
  under the same policy before enrollment.
- CSP, URL paths, IndexedDB origin isolation and application-only origin checks
  must not be the sole defense. Keep origin checks as local validation, but
  control code/publishers across the complete credential scope.

### Future fictional-passkey scope experiment

Before D01 acceptance, separately authorize a bounded pre-production experiment
at the intended hostname before any production credentials/data, with its actual
deployment controls. A disposable topology may rehearse the comparison, but its
results do not replace actual intended-host evidence required for D01. Use only
a clearly named fictional passkey, synthetic encrypted note/wrapper and generated
test material. Never enroll a production credential or use financial data. No
projects, deployments or credentials are created by TASK-002 or SR-01 remediation.

Compare four contexts:

1. Intended production origin and proposed exact RP ID: establish fictional
   credential enrollment and repeat PRF baseline before sensitive use. Label any
   disposable-host rehearsal distinctly and repeat on the actual candidate later.
2. An eligible descendant preview origin: explicitly request that parent RP ID
   using the same fictional credential/input. Test without the production app's
   origin check and with/without the synthetic copied ciphertext/metadata to
   separate credential access from actual note recovery.
3. An unrelated sibling origin: request the parent RP ID and record eligibility
   rejection or unexpected acceptance; do not infer rejection from its name alone.
4. A separate experimental RP namespace: confirm its own fictional credential
   works, then test access to the parent namespace. Inventory related-origin
   settings and do not enable cross-namespace authorization for the experiment.

For each context record actual origin/RP/alias, browser RP eligibility or exact
error, credential-selection availability, user-verification behavior and
cancellation, PRF availability, authenticated synthetic unwrap result and actual
PASS/FAIL/BLOCKED/NOT TESTED. Record candidate/configuration revision, date,
supported device/OS/browser/provider and Safari versus installed-PWA context.
Separate browser eligibility from credential absence or unsupported PRF; a mock
cannot establish these device results. Do not log raw PRF/keys or credential
secrets. Unexpected sibling/cross-namespace acceptance blocks D01 until explained.
The actual production hostname, eligible origins, controls and supported-device
evidence must still receive explicit Architect approval; a disposable experiment
alone does not approve a future production deployment.

### Hosting options and migration gate

| Option                                                                      | Cost and isolation                                                                                                | Operational tradeoff                                                                                                                                                                      |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current project Pages path                                                  | No mandatory fee for this public preview; shares host with unrelated apps                                         | Reject for real financial storage/passkey enrollment. Different repository paths do not isolate trust.                                                                                    |
| Dedicated GitHub account/organization Pages hostname used only for MoneySZN | Public static Pages option without mandatory subscription; dedicated host if no other apps are published under it | Account/host lifecycle must be secured and maintained. Other project Pages on that host would reintroduce sharing. Exact header capabilities need checking before accepting CSP strategy. |
| Dedicated Cloudflare Pages project hostname, no custom domain or Functions  | Current Free plan offers static Pages and per-project hostname; proposed only                                     | Distinct storage origin does not exclude descendant preview credential authority. Require the disjoint test namespace and descendant controls above. Free terms/availability can change.  |
| Owned custom domain on free static hosting                                  | Stronger control over future host migration if domain retained                                                    | Domain registration/renewal normally costs money; does not meet strict no mandatory recurring expense. Optional future owner-funded decision only.                                        |

[GitHub Pages host model](https://pages.github.com/),
[GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages),
[Cloudflare Pages Free limits](https://developers.cloudflare.com/pages/platform/limits/),
[Cloudflare static headers](https://developers.cloudflare.com/pages/configuration/headers/).
Free hosting does not promise permanent free service or perpetual hostname
ownership. Publisher accounts are needed even though application users register
no MoneySZN account.

**Prefer a dedicated Cloudflare Pages project hostname under its current Free
static tier**, subject to the credential trust policy above and unresolved D01;
dedicated Pages account host is the viable GitHub-only alternative. No host has
been reserved, configured or deployed by this task. Use the exact production
hostname as RP ID, not a broader parent domain, while treating eligible
descendants as part of its credential trust boundary. Place unreviewed tests in
a separate project/RP namespace. Exclude unrelated applications and untrusted
uploads from production origin and credential authority.

Before real credentials/data: select/reserve the host with authorization, review
headers, all eligible origins and current/old descendant deployment controls;
perform the separately authorized fictional-passkey scope experiment and port/test
the technical shell. Verify offline updates, then independently review and obtain
Architect approval of the actual topology/device evidence before enrollment.
Keep the old site technical-only with a navigation notice
after a separately authorized migration; never enroll sensitive preview passkeys
to be migrated later. New origins cannot read old IndexedDB. If later migration
is necessary, use a verified Vault file, reinstall, restore and enroll a new
passkey; provider sync/related-origin requests are not the recovery dependency.

Restrict first-party deployment access, require reviewed changes/checks, bundle
dependencies with integrity/provenance review, use restrictive CSP (including
no arbitrary script, object/frame and network destinations), and test actual
headers. [CSP specification](https://www.w3.org/TR/CSP3/). These reduce injection
risk but cannot defeat a publisher who replaces both code and policy. A version
display or hashes delivered by the same compromised host are not an independent
trust anchor. Offline copies can delay malicious updates but are not an update
authenticity system. Accept this browser-distribution limitation explicitly.

## Open Architect decisions and validation costs

| ID  | Decision required before implementation                                                                               | Proposed direction and evidence still needed                                                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D01 | Stable origin, RP-eligible origins, publisher trust and residual deployment risk                                      | UNRESOLVED: approve actual host/RP, eligible origins, current/old preview controls and fictional-passkey device evidence; require a disjoint test namespace before sensitive use.    |
| D02 | PRF/local key hierarchy, assertion verification, supported browser/OS/provider matrix and unsupported UX              | PRF-wrapped random DEK, session-only keys; repeat/offline/restart/cancel/enrollment/provider-sync tests on actual iPhone and Android. Parser/crypto review required.                 |
| D03 | Vault container/AAD, algorithms, KDF implementation/work factors, passphrase/Unicode rules and backward compatibility | Fresh backup DEK + Argon2id wrapper + AEAD; compare native PBKDF2 explicitly; vectors, tamper/resource tests and mobile KDF/memory measurements before profile acceptance.           |
| D04 | Payload schema, restore replacement/retention and duplicate/conflict rules                                            | Whole snapshot; validated full replacement with no merge; approve fictional experimental schema separately from product model.                                                       |
| D05 | Lock/inactivity/file-chooser behavior, tab coordination and accessibility                                             | Immediate hidden lock, proposed two-minute inactivity, one unlocked writer; lifecycle/late-result/BFCache/suspended-tab experiments.                                                 |
| D06 | Storage/memory caps, nonce write bound, rotation/migration and safe update protocol                                   | Bounded snapshots; crash/quota/stale-client/fresh-nonce tests. Large/chunked backups deferred.                                                                                       |
| D07 | PIN policy and optional strong local passphrase mode                                                                  | Defer app PIN; decide whether unsupported PRF means unsupported product or explicit slower passphrase mode. No weak fallback.                                                        |
| D08 | Recovery readiness and real-data release gate                                                                         | Verified external backup before real use, backup-age reminders, loss disclosure and independent security review. Decide acceptable unbacked-change loss and device/version coverage. |

Cost is engineering/review effort, not recurring server spending. POC-03 needs
bounded crypto/container code, vectors and a fictional snapshot adapter plus
real Files-provider tests; no production integration. Later local key storage
adds WebAuthn/provider lifecycle tests and tab/crash tests. Argon2 requires an
approved maintained dependency, reproducible offline bundle and upgrade policy.
All require independent review; no timeline or compatibility guarantee is
inferred from the existing experiments.

Proposed sequence:

1. Independent TASK-002 review and explicit decisions D01-D04/D07 plus bounded
   POC resource/lifecycle rules; assign POC-03 separately.
2. Implement/review isolated POC-03 with fictional data under its accepted plan;
   validate complete recovery and device Files flows, choose/freeze a reviewed
   experimental format before any production-format commitment.
3. Authorize and validate origin migration of the technical shell before any
   real passkey or financial data. POC credentials remain explicitly experimental.
4. Assign local encryption/PRF feasibility and hardening against the accepted
   threat model; resolve D02/D05/D06 with iPhone/Android evidence, then independently
   review key lifecycle, rotations, migrations and coherent upgrades.
5. Implement production storage/Vault only in separately accepted tasks. D08
   release review includes recovery rehearsal and explicit residual-risk acceptance.

No implementation, deployment, TASK-003 or POC-03 work is authorized by this
sequence. Real financial-data security remains unapproved and untested.
