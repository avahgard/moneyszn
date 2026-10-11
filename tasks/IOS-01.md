# IOS-01: installed iPhone update and offline launch investigation

Date: 2026-10-11. Role: Builder / PWA Lifecycle Investigator.
Disposition: **BLOCKED on real-device diagnosis and targeted design review**.
Real-device acceptance: **FAILED**. Desktop results do not supersede it.

Investigation branch: `codex/IOS-01-ios-pwa`, based on accepted main
`b413446d56f4d8b3997160ba29156d4fd62e4f92` (B).
Phase 1 ended without a commit, push or PR. Phase 2 authorizes evidence-only
preservation, a commit/push and a draft PR; diagnostic implementation/deployment
remain unauthorized. No production correction, merge or deployment was made.
The independent Phase 2 Reviewer returned **CHANGES REQUIRED** at
`721f3e40208ef41984c61109bcdaa514ed67253a`: evidence/reproductions were independently
verified; diagnostic architecture was not approved. This R1/R2/N1 closure is
documentation only and awaits targeted review; all protocol/tests below are design,
not implemented or validated recorder behavior.
Only this report and local evidence were added. TASK-002, PR #2,
project state, POC repositories, and the owner's installation/data were preserved.

## Confirmed field observations

Source: owner's account, including follow-up tests; no remote device inspection.
Device: **iPhone 13, iOS 26.6.2, installed Home Screen PWA**.
Existing installation retained; no site data was intentionally cleared.

| October 11, Minsk UTC+3 | Observation                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| Before deployment       | A (`084da18b2d00ba5e4ef90b918cc4b48badf1fd26`) reported Ready for offline use.                      |
| Approximately 04:30     | A → B update showed Preparing… with empty Version/build and Connectivity.                           |
| During the delay        | Repeated force-closing and reopening did **not** resolve it.                                        |
| Approximately 04:34     | B eventually displayed Online and Ready for offline use.                                            |
| Approximately 04:35     | Airplane mode ON, Wi-Fi OFF, fully closed/reopened: completely black screen, no MoneySZN interface. |
| Follow-up               | Airplane mode ON, Wi-Fi ON and connected: application launches.                                     |
| Follow-up               | Airplane mode OFF, all internet connectivity disabled: completely black screen.                     |

The repeatable trigger is loss of connectivity, rather than airplane mode itself.
The delayed update and offline black screen may have different causes. The exact
network used during the first update, device HTTP responses, launch URL, worker
identity, cache entries, and error logs remain unavailable.

## Source and deployment inspection

Read repository rules, workflow, architecture, project state, [TASK-001](TASK-001.md),
[CI-01](CI-01.md), application startup, worker generation/template, manifest,
preview/fixture servers, lifecycle unit/browser tests, and the complete Actions
workflow. The main project-state document predates the merged changes; it was
left untouched because PR #2 changes it.

[PR #3](https://github.com/avahgard/moneyszn/pull/3) is merged at B.
[Main run 38101835083](https://github.com/avahgard/moneyszn/actions/runs/38101835083)
completed successfully, including required checks and deployment. This is existing
CI evidence, not an IOS-01 run or real-iPhone acceptance.

Downloaded the original Pages artifacts, rather than rebuilding approximate A/B:

| Build | Main run                                                                     | Pages artifact ID | Archive SHA-256                                                    |
| ----- | ---------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| A     | [38094473519](https://github.com/avahgard/moneyszn/actions/runs/38094473519) | 11685247336       | `b922fad76150fc62ac6945266ee2583e5fee262497c6eadea8dfacf8ad587d80` |
| B     | [38101835083](https://github.com/avahgard/moneyszn/actions/runs/38101835083) | 11688146896       | `1b69d58ad0d2fbfbd4dc04f3492d8f8c51f66e5ca0cc54e9a44dca02584d2451` |

Both archives contain coherent HTML, JS, CSS, manifest, icons, and worker assets.
Build IDs match A/B. Recomputed worker cache hashes match the generated names.
Every local HTML resource reference is present in the corresponding precache.
A's JS is `index-PxopXoVv.js`; B's is `index-Dd5G5mGz.js`; both use
`index-Dq8WLliC.css`. Cache generation suffixes:

- A: `7642d64c296be6f01e972603bafb071ecda62df04ae06b930067a03379806029`.
- B: `7c31b49ebbcab941484a90342ce826b56217c524faa8191ad688071d2de534c5`.

The workflow builds `dist` once, tests production fixture builds in a different
directory, then uploads the checked `dist`. Deployment depends on all required
checks. No build/upload mixing was found in this pipeline or these artifacts.

One bounded live HTTP audit at approximately **04:42 Minsk / 01:42 UTC** found
the entry HTML, worker, build-info, and every B asset byte-identical to artifact B.
All returned 200 with `Cache-Control: max-age=600`; old A JS returned 404.
This establishes current responses from the investigator's connection only.
It does not establish what the iPhone/CDN delivered at 04:30 or prove a ten-minute
cache lifetime caused the approximately four-minute delay. `updateViaCache: none`
and precache `cache: reload` do not validate the generation of the response bytes.

Local original archives, extracted builds, byte/header audit, and audit script
are retained under ignored `.cache/ios01/`; no private device data is included.

### N1: historical inventory and exact-artifact handoff

The unchanged `phase-1-inventory.json` contains **49 historical entries**: **47
independently verified original raw files** (eight root files, 36 fault screenshots/
traces, three restart screenshots), plus **two unavailable, unverified pre-hardening
harness-source versions**. Their recorded hashes are historical assertions only:
`reproduce.mjs` — `072a2b91ce45f3243370d0de2c174c40286541f0fd29b3ba35d318af1acb4e8d`;
`cold-process.mjs` — `596177a938518d765ebed6eed8c9c61c90d1833cbc0bd82658bf0ff0b08f74d1`.
Those paths now hold the reviewed hardened versions. No original source copy was
located; do not reconstruct it from a newer script or call all 49 entries verified.
Existing source, raw artifacts, results and independent review evidence stay intact.

The exact ZIP digests in the A/B table above are the handoff authority. Original
retained paths are `.cache/ios01/11685247336.zip` (A, SHA-256
`b922fad76150fc62ac6945266ee2583e5fee262497c6eadea8dfacf8ad587d80`) and
`.cache/ios01/11688146896.zip` (B, SHA-256
`1b69d58ad0d2fbfbd4dc04f3492d8f8c51f66e5ca0cc54e9a44dca02584d2451`).
The review recorded Actions expiry at 2026-10-12 **02:18:21 Minsk** for A and
**04:27:56 Minsk** for B (October 11 23:18:21 UTC / October 12 01:27:56 UTC).
These are historical metadata, not a promise of present download availability.

After expiry, an authorized custodian supplies **copies of these exact retained
ZIP bytes** via an approved evidence channel; no transfer is performed by this
documentation task. Verify SHA-256 at source and destination before extracting,
record custodian/time/channel/digest in a new handoff receipt, and preserve originals.
Use a fresh ignored staging directory; reject absolute/traversing paths, links and
unexpected archive entries before unpacking ZIP/TAR. Compare all nine regular files
per build, build-info IDs, worker/configuration, HTML references and asset digests
to the retained audit, then prepare the harness input directories only if absent.
If inputs already exist, compare them; do not overwrite evidence on mismatch.
Transfer any needed raw review files separately with inventory hashes; the PR alone
cannot verify absent raw files. If no matching ZIP survives, mark exact deployment
reproduction unavailable. **Never substitute a rebuilt approximation or live site
download for an original deployment artifact.**

## What current code establishes

In `src/main.ts`, build and connectivity are populated synchronously before
registration or any activation wait. The HTML itself contains Preparing… and
empty fields. Thus the owner's first symptom strongly points to application
startup not reaching those assignments: missing/unusable entry JS, an early
exception, or a document/rendering problem. A pending registration, update, or
`waitForShellActivation()` alone cannot explain both empty fields in this code.
This differs from CI-01's evidence of replacement build B already visible.

Registration uses `updateViaCache: none`. Readiness follows registration settlement
and an activated `registration.active`, then an online `registration.update()`.
It does not verify the current controller's build, cached HTML references,
required entries' continued presence, or survival across a cold installed launch.
An older active worker can satisfy the activation check during an update.
CI-01 waits for replacement controller activation before reloading; it does not
solve absent entry JS or a navigation that never reaches the document.
`pageshow`/visibility handlers refresh connectivity only after JS starts.

`scripts/sw-template.js` installs all configured assets with `cache.addAll()`;
failed requests remove the candidate. However, successful HTTP 200 responses
are not checked against generated bytes or HTML references. A B worker can cache
A HTML alongside B JS, then activate and report Ready. Activation deletes older
MoneySZN generations before claiming clients, preserving unrelated app caches.

Navigation at `/moneyszn/` and `/moneyszn/index.html` is network first. Any successful
network HTML is returned even if it belongs to a different worker generation.
Offline/non-success navigation falls back to cached `index.html`; if absent,
`Response.error()` fails the navigation. Other paths are not shell navigations.
The navigation's network fetch has no application time bound: if the installed
engine leaves it pending, cached HTML is not returned until it settles, even when
the cache is complete. Actual iPhone request settlement times are unknown.
Listed assets are cache first; old/unlisted JS falls through to the browser.
Opening a missing cache can recreate an empty one without proving shell integrity.
The manifest's declared start URL resolves to `/moneyszn/`, but the actual installed
launch URL and fetch interception have not been inspected.

Static HTML includes the MoneySZN interface. Missing JS alone leaves that interface
visible in all three desktop engines; current CSS does not produce a black screen.
The complete offline black screen therefore requires evidence about document
delivery, installed storage/worker dispatch, or platform rendering. It cannot be
claimed as an exact JS-mismatch reproduction.

## Bounded local reproduction campaign

Windows, Node 24.21.0, Playwright 1.64.0. Exact downloaded A/B Pages bytes were served
on isolated loopback origins with fictional profiles. Synthetic responses used
`no-store` to isolate lifecycle/content faults; these are not a reproduction of
historical Pages caching. No owner's caches were read, deleted, or modified.

Six scenarios × Chromium, desktop WebKit, Firefox = **18 probes, no retries**:

| Controlled condition                                             | Actual result in each engine                                                                                                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coherent B, close page, new page offline                         | B interface, Offline, Ready; activated controller; complete cache.                                                                                                      |
| B worker/JS, but precached `index.html` returns A with 200       | Online B reports Ready. Offline page shows static interface with blank build/connectivity and Preparing…; activated B controller; cached HTML references uncached A JS. |
| Coherent B controller, next online HTML is A, old JS unavailable | Static interface, blank fields, Preparing…; activated B controller; old JS 404.                                                                                         |
| A controller, next HTML is B, B JS unavailable                   | Static interface, blank fields, Preparing…; activated A controller; B JS 404.                                                                                           |
| Coherent B, simulate deleting its cached JS, then offline        | Static interface, blank fields, Preparing…; activated B controller; script fetch failure.                                                                               |
| Coherent B, simulate deleting its cached HTML, then offline      | Navigation failure with no MoneySZN document. Desktop WebKit screenshot is blank white, **not** the owner's black installed-PWA screen.                                 |

All 18 diagnostic assertions confirmed their expected outcomes. Failure scenarios
demonstrate defects under deliberately injected conditions; they are not 18 passing
product acceptance tests. Missing-entry simulations do not demonstrate real eviction.
Offline mode was combined with server-side connection destruction so worker network
requests also failed, including Firefox's transport-emulation limitation.

Connection-destruction probes exercise rejected fetches, not a network request
that remains pending. They cannot rule out delayed fallback on the device.

Three additional controls fully closed the browser process, reopened the same
isolated persistent profile, and loaded coherent B offline. **3/3 passed**, including
desktop WebKit. This checks desktop disk persistence but does not emulate iOS
Home Screen process/storage behavior. Parallel worker interaction was not required
for the injected failures: the campaign ran serially. No new Linux CI campaign
or real-device instrumentation was performed.

Reproduction:

1. Obtain the above original Pages archives (N1 handoff applies after expiry);
   verify archive SHA-256 and safely inspect entries. Unzip each,
   then unpack its `artifact.tar` into `.cache/ios01/a` and `.cache/ios01/b`.
   Verify `build-info.json` against the exact commits.
2. Use the repository's locked dependencies and installed Playwright browsers.
   The audited harnesses use normal Playwright installations by default. On this
   Windows machine, select the retained fresh matching Firefox runtime with:

   ```powershell
   $env:MONEYSZN_IOS01_FIREFOX_EXECUTABLE = 'D:\Tools\MoneySZN\.cache\ci01\browsers\firefox-1555\firefox\firefox.exe'
   ```

   Elsewhere leave the variable unset, or point it to an installed matching
   Playwright Firefox executable. No download/install is performed by the harnesses.

3. Run from the repository root:

   ```text
   node tasks/evidence/IOS-01/reproduce.mjs
   node tasks/evidence/IOS-01/cold-process.mjs
   ```

4. Each audited rerun prints its new `.cache/ios01/campaigns/` output directory.
   Inspect its result JSON and `probes/` screenshots/traces. Original Phase 1
   results remain at `.cache/ios01/probe-results.json` and
   `.cache/ios01/cold-process-results.json`. The first harness records console/page errors,
   registration/controller snapshots, cached HTML/entries, and server requests.
   It does not instrument all worker transitions or prove iPhone fetch events.
   Reruns do not overwrite earlier results or profiles. Persistent control profiles
   are isolated and retained. Exact build IDs, asset SHA-256, worker configuration
   and generated cache hashes are checked before any browser launch.

Other fresh checks: typecheck PASS; lint PASS; formatting PASS; 14/14 existing
unit tests PASS. Local report links and campaign result counts were checked.
No application
source changed, so the full existing mobile/desktop browser suite was not rerun
for this investigation. Existing B CI success is reported separately above.

## Hypotheses and confidence

| Mechanism                               | Evidence and confidence                                                                                                                                                                                                                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing/mismatched JS/CSS or mixed HTML | **Proven code vulnerability; plausible field cause, unconfirmed.** Artifact consistency rules out a malformed uploaded bundle in the inspected runs. Injected missing/mismatched JS exactly reproduces initial blank fields. Missing JS alone does not explain the complete black screen. |
| Old/new cache generations               | **Plausible, unconfirmed on device.** Successful wrong-generation precache activates; eager old-cache retirement and unvalidated network HTML allow generation mismatch. Need actual controller, cache name and HTML/JS identities.                                                       |
| Offline navigation fallback failure     | **High diagnostic priority, cause unconfirmed.** Missing HTML fails navigation in simulation. Need entry URL, interception and cache match on iPhone. A live page's Ready does not prove a cold document can be obtained.                                                                 |
| JS startup failure                      | **High confidence as a failure stage for blank fields; trigger unknown.** Assignments precede SW waits. Missing entry bytes reproduced this stage; no original iPhone error exists.                                                                                                       |
| Installed-PWA storage/lifecycle context | **Plausible, unconfirmed.** Desktop persistent profiles succeed; installed iPhone fails without connectivity. Safari and installed storage must be examined separately. No data-clear evidence, quota event or storage snapshot establishes eviction.                                     |
| Temporary network/update race           | **Plausible for delay, unconfirmed.** Removed old JS and mutable cacheable HTML are an unsafe combination; live responses after the incident were coherent. No historical response/worker timeline identifies a race.                                                                     |
| Browser-engine/OS failure               | **Open, low attribution confidence.** Black rendering is not reproduced by desktop WebKit; no process crash/dispatch trace or engine-specific isolation exists. Do not assign an old WebKit bug to iOS 26.6.2.                                                                            |

Root cause of IOS-01: **UNRESOLVED**. The code can explain the initial blank fields
under demonstrated faults and can fail offline navigation if the shell is missing
or defer fallback while its network fetch remains pending.
It does not establish why this existing installed PWA lacks a working offline path
or why its failure is rendered black. A test race cannot dismiss the owner's
repeatable manual failure. There is no evidence yet selecting one mechanism for
both symptoms.

Supporting primary references: [Vite build documentation](https://vite.dev/guide/build#load-error-handling)
describes removed old assets and stale HTML after deployments. This app has a
static entry module, so its dynamic-import error example is not an established
fix here. [WebKit's Safari 17.2 notes](https://webkit.org/blog/14787/webkit-features-in-safari-17-2/)
describe installation copying cookies without other local storage; a Safari-tab
pass cannot establish this installation's cache state.
[WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
describes best-effort storage and origin eviction, including Cache API and workers.
These are background mechanisms, not evidence of an eviction in this incident.

## Phase 2: evidence preservation and diagnostic proposal

Architect disposition: IOS-01 remains BLOCKED. This phase permits committing and
pushing evidence plus a draft PR, not diagnostic implementation, merge, deployment
or modification of the installed PWA. The owner has Windows and the existing
iPhone 13 / iOS 26.6.2 installation; **a Mac is not required for Phase 2 completion**.

### Evidence audit and preservation

Reviewed both harnesses and this report. The fixed campaigns are 18 fault probes
and three desktop process restarts, serial, without retries. Servers bind only
`127.0.0.1`; browsers use new isolated contexts/profiles. Cache deletion is an
explicit fictional-profile simulation. There are no public requests, dependency
installs, production imports, deployment commands, owner-storage operations,
credentials, financial data or unrelated-cache operations in the harnesses.

Audit improvements are confined to evidence tools: unique output directories,
explicit 10-second browser action/navigation/launch limits, deadlines for cache
inspection and cleanup, forced closure of their own server connections, exact
artifact checks, and an optional Firefox executable environment variable. Deadline
rejection is a harness failure, not evidence that an application fetch settled.
No production timeout changed. A runtime/cleanup failure stops the run with failure;
there is no recovery loop or stress-test retry.

Preserved in `tasks/evidence/IOS-01/`:

- `artifact-audit.json`: original byte/configuration/header audit (same JSON data).
- `phase-1-results.json`: original 18 outcomes and three restart controls. Cached
  HTML is reduced to resource references; repeated request bodies/HTML are omitted.
  Original complete records remain local; these are synthetic desktop evidence.
- `phase-1-inventory.json`: paths, byte counts and SHA-256 of original archives,
  results, logs, audit script, screenshots/traces, and pre-audit harness versions.
  Its 49 entries include 47 verified raw files and two source-unavailable/unverified
  historical versions; raw retained evidence is not added wholesale to Git.
- Audited `reproduce.mjs`, `cold-process.mjs`, and `harness-support.mjs`.

Fresh audited-tool validation: **18/18 expected diagnostic outcomes and 3/3 desktop
restart controls**, in separate new campaign directories. All **47 original raw
evidence files** match their preserved hashes; summarized outcomes and the copied
audit match original JSON data. The harness timeout probe passed. Typecheck, lint,
formatting and the existing 14 unit tests also passed. This preserves the distinction between demonstrated failure
mechanisms and the unresolved iPhone cause. It is Builder verification, not an
independent review or real-device acceptance.

### Approaches and present observability

**A — Native Safari Web Inspector, optional future path.**
[WebKit's official instructions](https://webkit.org/web-inspector/enabling-web-inspector/)
support inspection of websites added to the Home Screen through Safari on a Mac.
Enable the iPhone's Web Inspector setting and Mac Safari developer features,
connect/trust the device by cable, open the existing app and select its target in
Develop. This does not require replacing the app or clearing its data. Use cable
for a true Wi-Fi-off experiment. Target availability and worker inspection depend
on the running process; a crash/absent target loses visibility. Inspector attachment,
pausing and extra queries can affect timing. Do not unregister workers or disable
caches. This path is unavailable now, and is not a completion prerequisite.

**B — Opt-in on-screen diagnostics, recommended future Windows/iPhone path.**
The unchanged app presently exposes only visible build, readiness, connectivity
and the launch outcome. Screen recording and externally checked deployment bytes
are obtainable now; neither exposes this installed context's controller, cache,
request settlement or JS errors. Windows Playwright and a Safari tab are separate
contexts. No supported native Safari inspection on the owner's Windows setup is
assumed; no third-party inspector/proxy installation is proposed.

A future reviewed build would keep the same origin, scope, manifest identity and
Home Screen installation. Include a static opt-in control and a small self-contained
inline bootstrap **before** the hashed module, with minimal inline presentation.
Recording defaults OFF. Only a visible consent action creates authoritative
IndexedDB session authorization under R1 below, readable by both producers. An error
before first consent is unavailable, not secretly collected. The inline facility
can survive a missing main module/CSS **only if its HTML is delivered and inline
JS runs**. It cannot render itself when navigation fails.

For pre-document evidence, an opted-in diagnostic worker may independently retain
fetch start/settlement/fallback records in a separate, bounded metadata store. It
must actually receive the event and successfully write the record. After reconnect,
the same installed context can manually export those records without having loaded
the failed offline document. If neither worker nor page runs, there is no internal
recording mechanism: keep the screen recording and classify dispatch/OS failure as
unresolved. Missing logs never prove missing interception or a permanently hung
request. Optional future native inspection or platform diagnostics could add
visibility; this proposal does not require a Mac to be completed or reviewed.

### Exact proposed evidence contract

All rows below are **design only**, unavailable in the unchanged app except its
existing status text and owner recording. Common fields: schema version, explicit
session ID, document/worker-instance ID, per-producer sequence number, wall time
and monotonic elapsed time. Worker/page clocks are not presumed synchronized.
Allow only MoneySZN entry/known asset paths with query/fragment removed; otherwise
record a category such as `other-path`, not a private URL. Record enums, hashes,
bounded counts and sanitized error classes; no cookies, headers, request/response
bodies, DOM text, full stack traces, credentials or personal financial information.

One explicit session remains limited to **15 minutes / 200 records / 64 KiB**,
including bounded accounting metadata, with a **1-KiB event cap**. R1 defines the
sole consent authority, Stop/Erase and export; R2 defines atomic aggregate limits,
queues, inspected bytes and diagnostic-only deadlines. No page-only flag grants
authorization. Missing/unreadable consent disables new collection; an existing
bounded volatile readout may expose previously authorized records only. It cannot
continue recording while consent is inaccessible. Existing application storage and
shell caches are never repaired or erased. Export stays manual with selectable-text
fallback, no telemetry or automatic submission.

| Event                                               | Recorded / why needed                                                                                                                        | Observation point; online/offline                                                                       | Behavior impact                                                                                                               | Privacy / failure modes                                                                                                                      |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `session` / `store-health`                          | Consent, limits, expiry, retained/drop count, read/write error enum; establish recorder health.                                              | Explicit opt-in and bootstrap/store operations; both if code runs.                                      | Writes only the separate diagnostic database under R1; Stop acknowledgement distinguishes local, persisted and worker states. | No account/device identifier; inaccessible storage may lose consent or records.                                                              |
| `document-start` / `module-start` / `module-status` | HTML build hint, known script/CSS references, app build marker; locate startup stage and version mismatch.                                   | Inline bootstrap before main; opt-in main hooks at entry/status assignment; both.                       | Small inline facility/hooks; never delays main on storage writes.                                                             | Missing HTML/inline execution gives no marker; first pre-consent startup is unobserved.                                                      |
| `page-lifecycle`                                    | Sanitized entry path, standalone/display-mode, navigation type, pageshow/persisted, visibility, online flag.                                 | Bootstrap and native events; both.                                                                      | Passive listeners, no reload or network probes.                                                                               | Online flag is not reachability; cold process deaths may give no final event.                                                                |
| `startup-error` / `resource-error`                  | Runtime/rejection error class and known failing resource category/path; distinguish JS/CSS/startup failure.                                  | Inline capture-phase resource errors and error/rejection listeners; both.                               | Passive capture; no preventDefault, retries or suppression.                                                                   | Message allowlist/truncation; uncaught worker errors and failures before HTML are invisible.                                                 |
| `register` / `update` start, resolve, reject        | Operation ID, allowlisted option enums, elapsed time, resulting snapshot/error class; locate stalled promise.                                | Minimal future hooks around the app's existing calls, only when opted in; same original call frequency. | Do not wrap globally or add register/update calls; preserve return, ordering and error handling.                              | Never stringify arbitrary options/errors; old B has no hooks; begin without end can also mean process/log loss.                              |
| `registration-state`                                | Scope category, installing/waiting/active presence, per-page worker IDs, states, updatefound/statechange.                                    | Subscribe then snapshot, settle/status/events, manual snapshot; both.                                   | Passive reads/listeners; no skipWaiting or claim commands.                                                                    | Object IDs are page-local; events before subscription, background suspension and vanished candidates can be missed.                          |
| `controller-state`                                  | Controller presence, state, sanitized script path, controllerchange, correlation to acknowledged worker.                                     | Earliest opted-in bootstrap and events; both.                                                           | Passive reads/listeners.                                                                                                      | Mutable sw.js URL is not a build identity; active registration does not prove current control.                                               |
| `worker-handshake`                                  | Worker-instance/build/cache generation and expected asset manifest, reply latency or `no-reply`.                                             | One explicit baseline/readout exchange plus cold-launch readout if page runs; both.                     | Message wakes worker; no update/unregister/reset.                                                                             | B ignores new messages; timeout means unsupported/not observed, not proof of failed control.                                                 |
| `cache-access` / `cache-consistency`                | Existing MoneySZN names, per-known-entry hit/miss/error, cached HTML references and asset digest comparison; verify coherent shell.          | Manual baseline/offline/reconnect snapshots, using local expected A/B/diagnostic manifests; both.       | Read existing caches via keys and caches.match with cacheName; no caches.open/add/put/delete. Finite local reads/hashes.      | Limit to app prefix and seven expected entries plus known HTML references; concurrent deletion/errors must be explicit, not called eviction. |
| `worker-lifecycle`                                  | Install/activate entry/settlement/failure with generation and elapsed time, if consent is already accessible; capture incomplete activation. | Future opt-in worker hooks and page state events; both.                                                 | Hooks preserve original lifecycle promises; durable writes may extend worker lifetime and must be disclosed.                  | First diagnostic installation before consent is missed; page snapshots are then the only available evidence.                                 |
| `fetch-start`                                       | Navigation ID, request mode/path category, worker instance/generation, elapsed clock; establish event reception.                             | Already consent-hydrated worker handler, beside the original path; both if dispatched.                  | Never await hydration or logging before starting original fetch/respondWith; no interception expansion.                       | Restart before verified consent omits initial events; late observation must not be labelled original fetch start.                            |
| `network-settlement`                                | Matching ID, fulfilled status category or rejected error enum and elapsed time; distinguish pending network.                                 | Original fetch's fulfillment/rejection; both if it settles.                                             | Observe original promise; never abort, substitute or time out application fetch.                                              | No settlement within 60 seconds is an observation, not proof it never settles; force-close/log loss can remove an end record.                |
| `fallback` / `response-selected`                    | Matching ID, fallback attempted, cache hit/miss/access error, selected response category/generation if locally known.                        | Existing navigation response-selection path; both when reached.                                         | Preserve response and exception behavior; no additional page-data download.                                                   | Selected response does not prove browser commit/render; old cached HTML may be unverifiable without local manifest.                          |
| `readout` / `export`                                | Snapshot/log range, omitted/truncated fields and store errors; preserve evidence for manual review.                                          | Owner action in same installed context after baseline/reconnect; both if panel runs.                    | Local read/text generation; copy/download only on action.                                                                     | Export unavailable on a black/no-document screen; device/network metadata is potentially identifying, so owner reviews before sharing.       |

### R1: authoritative consent, revocation and retained readout

The proposed sole authority is IndexedDB database
`moneyszn-ios01-diagnostics-v1`, separate from all application databases/caches.
Three stores, `control`, `sessions` and `records`, participate in every authority
change or append through one overlapping read/write transaction. IndexedDB provides
the required [atomic transactions and scheduling](https://www.w3.org/TR/IndexedDB-3/).
Messages and page flags are notifications only; neither grants authorization.

`control` contains schema version, a random database-generation nonce, monotonic
safe-integer epoch, active session ID or null, and retained session ID or null.
Only a visible **Start** action can initialize missing storage and create a random
session ID. It increments the epoch and commits ACTIVE state with creation time
and expiry exactly 900,000 ms later. Expiry is never extended. Authorization tokens
contain generation/session/epoch/expiry; each producer also has an instance ID and
role-binding revision. At most one page and one worker role are admitted per session;
a replacement instance claims its role transactionally, invalidating stale writers
in that role without granting a new session. Safe-integer exhaustion or invalid
schema fails OFF rather than wrapping or silently migrating authority.

Both producers start OFF after every restart. They hydrate asynchronously from
existing IDB state outside application startup/navigation/fetch settlement; an
open that would initialize an absent database is aborted unless it belongs to
explicit Start. Missing, invalid, expired, inaccessible, blocked or timed-out
consent fails OFF. No event collection, payload construction, error/options
serialization or event buffering occurs before verified hydration. Early startup,
install or navigation events are omitted, never retrospectively reconstructed.
Successful hydration establishes a local gate until expiry, revocation notification
or a failed revalidation; it is not permission to bypass the append transaction.
Worker restart may therefore lose the first navigation event even in an opted-in
session. Application fetches proceed immediately regardless.

Each queued append carries the exact token and producer binding. Within a single
transaction it rechecks generation, session existence, ACTIVE state, epoch, role
revision, wall-clock expiry and its diagnostic deadline, then adds a canonical
allowlisted record and updates aggregate count/bytes/drop accounting atomically.
No network/cache/hash await belongs inside that transaction. A cached token, queue
item or delayed callback cannot create/upsert a session or authority. Admission and
inspection revalidate consent before starting work; after asynchronous inspection,
revalidate before using results and again at append. Already started browser I/O
may outlive revocation/deadline, but its late result is discarded. Local monotonic
remaining-time checks supplement wall-clock expiry. Detectable backward/invalid
clock changes fail OFF; no trusted elapsed-time guarantee across an undetected OS
clock change is claimed.

**Stop** immediately latches the invoking producer OFF, discards its queue/token,
and notifies known producers. Its bounded control transaction targets the exact
generation/session/epoch, increments epoch, clears active authorization, and marks
the retained session STOPPED without removing records. Transactions ordered before
Stop can commit before revocation. Once Stop commits, old-token transactions cannot
commit afterward because the shared control/session/record scope serializes their
checks and writes. A late success callback for an earlier commit is not a new write.
Other producers quiesce upon notification/revalidation; instantaneous global memory
cancellation is not promised. The same stopped session cannot be rehydrated ACTIVE.

Show three separate results: **local recording OFF**, **persistent revocation
confirmed/unconfirmed**, and **worker acknowledgement received/unavailable**.
The acknowledgement must identify session, epoch and worker instance. If storage
fails or its deadline expires, show the error and persistent revocation UNCONFIRMED;
known producers stay locally OFF, with no automatic retry or re-enable. An unknown
or unacknowledged producer/restarted process may still read old persisted consent
until expiry. A user-directed Retry Stop targets that old session only, never a
replacement session. If persistence commits but no worker replies, acknowledge
persisted revocation while explicitly reporting worker quiescence unknown. Do not
claim globally confirmed revocation in either incomplete case. A timeout with a
potentially completed transaction is an unknown outcome, not permission to retry
blindly; a later explicit bounded read can confirm persisted state.

**Erase** first performs local OFF handling and targets the selected retained
generation/session/expected epoch; if authority has changed, report a conflict
rather than erasing a replacement session. It atomically revokes, clears diagnostic
records/session data and resets accounting. Retain the minimal generation/epoch
tombstone in `control`; do not delete the database and accidentally allow a stale
writer to recreate authorization. Existing writers require matching existent ACTIVE
state and cannot resurrect erased rows. External loss of the database fails OFF;
only a new visible Start can initialize a new generation nonce. An erasure failure
is visibly **not confirmed erased**. Erase never deletes app data, shell caches,
unrelated IDB or the Home Screen installation.

STOPPED/EXPIRED sessions remain available to explicit read-only inspection/copy
without recording, worker role claim or a replacement session. Only one retained
session is kept: refuse new Start while it exists; the owner can export and then
explicitly Erase. Expiry makes all appends invalid even without a cleanup transaction.
Retention is at most 24 hours logically; cleanup on subsequent access uses the same
revocation/tombstone protocol. Physical removal at exactly 24 hours is not promised.
A bounded volatile readout holds only previously authorized records and cannot
substitute for persistent consent or prove durable readout.

### R2: aggregate limits and finite diagnostic work

All limits below are proposed implementation acceptance criteria, not current app
timeouts. One session lasts **15 minutes**, permits **200 records total across both
producers**, and stores **65,536 UTF-8 serialized bytes maximum**. Reserve 2,048 bytes
for fixed-size control/session/accounting metadata, leaving at most 63,488 record
bytes. Reject metadata that exceeds its reserve. Each canonical record, including
its IDs/envelope, is at most **1,024 UTF-8 bytes** after allowlisting. Count bytes,
not JavaScript character length. Both counters are shared and checked/updated in
the R1 transaction; concurrent last-slot writers cannot each pass an independent
budget check. Never overwrite old records to admit new ones. Reject oversize/new
records at a cap and update fixed drop counters only while still authorized.
This is a logical serialized budget, not a bound on IDB's physical disk overhead.

Each admitted producer has at most **four queued items plus one in-flight append**.
Items hold only sanitized authorized records (at most 1 KiB each), never raw events,
errors, requests or responses. Keep at most eight authorized volatile readout records
(8 KiB), 16 fixed reason counters and 256 bytes of queue metadata per item; reserve
at most **16 KiB of serialized volatile payload/queue bytes per producer**, 32 KiB
for the two admitted roles. These fixed object/count/string limits bound owned
buffers; engine object/string overhead and all browser process memory are not
claimed to fit that byte figure. Replaced instances purge on revalidation; an
OS-suspended stale instance may retain its own bounded buffers. Drop incoming items on
overflow, coalesce counts in saturating uint32 counters and show saturation/unknown
loss explicitly. Flush counts with the next admitted transaction or one manual
bounded readout action while ACTIVE; stopped/expired export stays read-only. Do
not start a transaction per dropped event. Lost volatile
counters are unknown loss, not zero drops. Logger failure uses one local error enum,
never logs itself recursively or creates retry tasks.

Inspection is manual, page-only, with **one inspection in flight**. List names
once, examine at most 32 returned names capped at 256 UTF-8 bytes each, filter the
app prefix, and stop with explicit truncated coverage rather than scanning the
whole origin. The browser may allocate a larger names result internally; do not
copy/sort it wholesale or claim to bound that API allocation. Select at most four
generations (including the
acknowledged controller generation), and report omitted/unknown generations. Do
not automatically choose an arbitrary generation if controller identity is unknown.
Probe at most seven known shell entries per selected generation: **28 cache matches
maximum, at most four concurrent**. Inspect up to eight known references in HTML.
Read bodies only in the selected controller generation: one HTML **16 KiB**, one
entry JS **64 KiB**, one CSS **32 KiB**; at most three reads/digests and **112 KiB
total inspected body bytes**. Other entries/generations receive presence metadata
only. Presence is not content integrity.

Use cloned cached responses and capped stream consumption, never unbounded
`text()`/`arrayBuffer()` or arbitrary asset-body scans. A Content-Length precheck
can reject oversize data but is not trusted as the cap. Cancel only the inspection
clone on oversize/deadline/error. One body/hash buffer is in flight, at most 64 KiB;
browser-owned incoming chunk allocations are outside this owned-memory guarantee
and oversized chunks are immediately rejected. Hash only a fully read bounded
body; partial/prefix/oversized/timed-out results are **unverified**, never a whole-file
digest mismatch. Parse only complete capped HTML using finite reference extraction.
Inspection workspace is separately capped at 128 KiB, plus logger memory. Export
readout traverses at most 200 retained rows/64 KiB and generates at most 68 KiB of
text including a bounded wrapper in a separate manual export workspace (at most
68 KiB serialized text, at most 200 bounded rows). Stop with an explicit invalid-store result if
stored counters/rows exceed the contract. No background cache sweep or hash loop.

| Diagnostic operation                                            | Proposed finite deadline / work bound                                                                                                                            | Abandonment and limit                                                                                                                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IDB open/hydration/readout or Start/Stop/Erase attempt          | 1,000 ms per explicit attempt                                                                                                                                    | Abort live transactions; close late opens; stay OFF on unavailable consent. No automatic retry.                                                        |
| Append, including queue residence and authority/accounting work | 500 ms from queue admission                                                                                                                                      | Expired queued item is dropped; abort live transaction, discard late callback.                                                                         |
| Worker handshake or Stop acknowledgement                        | 1,000 ms, one exchange per owner action                                                                                                                          | Ignore late/nonmatching replies; report unavailable, never assume control/quiescence. Stop persist plus acknowledgement is at most 2,000 ms.           |
| Manual cache inspection                                         | 2,000 ms total; each cache match 250 ms, body read 500 ms, digest 250 ms, all capped by remaining total/session time                                             | Cancel inspection clone; discard late lookups/hashes; report incomplete coverage.                                                                      |
| Logging-only fetch-event lifetime extension                     | 500 ms maximum per extension; at most four reserved extensions per session, all for a worker instance ending within one 2,000-ms window from its first extension | Only when consent was already verified at dispatch; independent fulfilled logger promise; no extensions on install/activate. No renewal of the window. |

These conservative deadlines allow small local metadata operations while refusing
to diagnose by prolonged waiting. They are testable design choices, not measured
iPhone performance promises. Worker hydration can transactionally reserve some of
the four shared extension permits while consent is valid, within the metadata
reserve. Reservations are consumed from the session budget even if unused/lost at
restart, never replenished or transferred to a replacement instance. An instance
must already hold a valid reserved permit at event dispatch; no asynchronous
hydration is awaited to call waitUntil. Revocation closes the local gate; a missing
acknowledgement leaves possible already-authorized lifetime work uncertain, but
permits and deadlines still bound it. Browser APIs such as Cache API lookup or
WebCrypto
hashing may be uncancellable: deadline races also invalidate operation tokens,
purge queued work, abort live IDB transactions where possible and discard late
results. A Promise race alone is insufficient. Late IDB completion can have an
unknown outcome, but R1 authorization and aggregate accounting still govern every
committed append. Never start follow-on work from a timed-out completion. Revalidate
time/consent after suspension before doing more work; OS/event-loop suspension can
delay a timer, so no hard OS scheduling bound is claimed.

Keep the original synchronous fetch-listener/`respondWith` structure. Original
network fetch and fallback begin without awaiting consent, queue capacity, storage,
handshake or diagnostic inspection. Logging never substitutes responses, adds app
requests/retries, changes fallback choice, swallows app errors or aborts original
fetches. Observe original promise settlement independently and catch logger
rejections separately. Do not defer response delivery or install/activate settlement
for logs. A logging-only [event lifetime extension](https://www.w3.org/TR/service-workers/#dom-extendableevent-waituntil)
is intentionally finite but still perturbs worker lifetime; force termination can
lose logs. Diagnostic deadlines never become application response timeouts.

### Correlation and remaining observation gaps

A worker navigation ID is session/worker-instance/navigation-sequence. Record
`FetchEvent.clientId`, `resultingClientId` and `replacesClientId` only where provided;
the initiating client is not automatically the replacement document. These are
[event identity fields](https://www.w3.org/TR/service-workers/#fetchevent), not proof
of document rendering. The consent-hydrated inline bootstrap assigns a document
ID and sends it in the bounded handshake. Bind it to the message source WindowClient
ID and acknowledged worker instance; correlate the resulting client ID to that
document when available. No extra response header, request, HTML rewrite or wait
for a handshake is introduced into navigation. Only the current app client is
identified; do not enumerate unrelated clients.

Missing/unsupported/empty IDs, absent handshake, a replaced worker, pre-hydration
events or no executable document yield **uncorrelated** evidence. Do not substitute
timestamp proximity for identity. Producer wall clocks are unsynchronized; use
per-producer sequence and monotonic duration for local ordering, not cross-producer
latency. A settlement observed without its original start is labelled unpaired;
a post-hydration snapshot never claims to have observed earlier dispatch. Opaque
IDs are diagnostic-session metadata and remain subject to consent, byte cap,
retention and manual-export privacy rules.

Missing HTML, missing worker dispatch, process termination or lost/inaccessible
persistence may leave no internal evidence. A screen recording remains independent
observation, but cannot uniquely distinguish these mechanisms. Neither a healthy
store probe nor absence of logs proves process-restart durability or non-dispatch.

### Future implementation acceptance tests (not performed in this closure)

1. **Consent and restart:** no records or event buffers before opt-in; both producers
   default OFF and hydrate valid consent after offline worker restart. Missing,
   invalid, expired, inaccessible/blocked storage and failed hydration stay OFF
   without delaying app navigation/fetch. Pre-hydration events remain unobserved.
2. **Concurrency and limits:** interleave both producers at 199/200 rows and byte
   boundaries; assert atomic shared count/UTF-8 byte accounting, metadata reserve,
   1-KiB caps and finite queues. Include multibyte text, oversized records, role
   replacement, saturation and overflow with honest persisted/volatile drop counts.
3. **Stop/Erase races:** revoke while writes are queued/in-flight, then attempt late
   appends with stale epoch/generation/role tokens. Only transactions preceding
   Stop may commit. Erase retains a tombstone and late callbacks cannot restore
   records/authorization. External database loss never implicitly reinitializes it.
   Test Stop storage failure and missing worker acknowledgement with distinct honest
   UI outcomes; read-only expired/stopped export must not restart recording.
   Verify diagnostic-only erasure preserves fictional app/unrelated IDB/cache markers.
4. **Work and timeouts:** oversized, malformed, rejected and never-ending cached
   responses stay within body/read/hash/lookup limits, with partial results unverified.
   Block IDB open/write, cache lookup, hash and logger promises; reject logger writes.
   Assert deadlines, local OFF, no recursive logging/retry loops, no late follow-on
   writes and finite logging-only extensions. Repeat with expired sessions and
   revocation during inspection; a late operation cannot evade authorization/budgets.
5. **Dedicated diagnostic-log persistence/readout control:** in an isolated fictional
   persistent browser profile, opt in and confirm committed page/worker records;
   close the entire browser process, disable all server/network responses, and
   relaunch the same profile offline within the active session. Verify retained
   records and IDs can be manually read, then valid worker/page hydration and new
   appends use the same session. Explicit Stop and expired-session variants allow
   retained export without new recording. Also test unavailable storage and missing
   worker acknowledgement. A force-termination variant must identify lost/unconfirmed
   records rather than guarantee durability. Run applicable Chromium/Firefox/WebKit
   controls in the future candidate stage. The existing 3/3 cold-process shell
   controls do **not** test diagnostic logs or real-iPhone acceptance.
6. **Identity and response preservation:** exercise supported/empty client IDs,
   replacement navigation, worker restart and offset clocks; unresolved correlation
   stays explicit. Compare OFF/ON original app responses/errors, fallback decisions,
   lifecycle/reload behavior and offline controls with deliberately blocked/rejected
   diagnostics. Confirm application paths never inherit diagnostic deadlines.
   Desktop equivalence cannot prove zero iOS timing perturbation; separately require
   the bounded existing-installation iPhone experiment after authorized deployment.

Read the cache via `caches.match(request, { cacheName })` against already listed
names: opening an allegedly existing cache can recreate it after concurrent deletion.
HTML-reference/digest checks use bounded cloned cached responses, never consume a
response returned to the app. No automatic reachability probes, storage.persist(),
cache surgery, navigation aborts, reload loops or delayed activation fixes.

### Smallest decisive experiment and limits

**Now, with the unchanged installation:** retain the existing failure account and,
if not already recorded, one short online B → offline cold-launch → reconnect
recording, with times and screens at 0/15/60 seconds. Zero is the offline Home Screen
icon tap; retain uninterrupted video through 60 seconds, including network settings
and visible transitions. These are observation points, not application timeouts or
a readiness SLA. Record any later recovery separately. No reset/reinstall or repeated
blind force-closing. This can confirm visible failure/recovery only; it cannot
read current controller/cache state on this Windows setup.

**Exact next experiment requiring separate Architect approval:** authorize only
implementation and independent review of the above bounded, default-OFF diagnostic
candidate, then separately authorize a checked same-origin diagnostic deployment
and this one-session owner experiment. No implementation or deployment is authorized
by this proposal or its evidence PR. Before deployment preserve the unchanged-app
recording and current public artifact provenance.

After that future authorization:

1. Owner opens the **existing Home Screen icon online**, verifies the diagnostic
   HTML marker, opts in visibly and copies a baseline: recorder health, controller/
   registration, worker handshake, generation and HTML/JS/CSS consistency. Wait
   for an acknowledged activated diagnostic controller and successful persistent
   recorder-health check, not merely the Ready label or a volatile-only ring.
   One baseline attempt is at most 10 seconds including UI/readout, within the
   15-minute session and R2 operation deadlines; no polling/retry campaign.
   On missing controller acknowledgement, health, coherence or a timeout/error,
   Stop locally, report the R1 persisted/worker acknowledgement results, and do not
   continue to the offline experiment. Do not force activation or clear anything.
2. Disable all internet while the same document remains open; take one manual cache/
   lifecycle snapshot. This separates local Cache API failure from cold navigation.
3. Fully close once and reopen that same icon offline. Record from icon tap at
   0/15/60 seconds without reload/force-closing during that interval; export if
   the panel appears. Do not repeat or wait indefinitely.
4. Restore connectivity and reopen the same installation if needed. Before starting
   a new diagnostic session, manually copy/export the retained session records;
   include missing ranges/store errors. One reconnect/readout attempt is at most
   10 seconds; an unavailable panel/store is an inconclusive result, not a reason
   for a new session or repeated restarts. Stop with separate local/persistent/worker
   status. Complete recording in the 15-minute session; expiration preserves
   read-only export under R1. No deployment occurs during the experiment.

Baseline absence of a controller, Cache API error, wrong generation, missing asset,
or cached HTML/JS mismatch selects the corresponding branch. A recorded navigation
fetch with a fallback miss/error selects the navigation/cache branch. A valid
fallback selection plus inline marker but no module marker selects module startup.
A same-ID fetch start with no settlement during the observed interval supports
pending fetch **only if logging continuity is established**. Activation state
transitions locate a lifecycle stall. A black launch with no records cannot
distinguish no dispatch, process death, storage failure or lost logs. All needed
records plus executed UI markers with a black screen would warrant platform/
rendering investigation; worker response selection alone is insufficient.

The deployment necessarily introduces a new worker/cache generation under the
normal pipeline. Its update/old-cache retirement may hide the original B defect
before or during opt-in. An early snapshot precedes the app's explicit registration
call only, not the browser's automatic update checks. This cannot be sold as an
untouched B forensic snapshot. Do not manually seed the diagnostic HTML into B's
cache, retain every generation permanently, or weaken offline rules to expose UI.
If the defect disappears, record **not reproduced after instrumentation**, not
fixed. Keep before/after evidence and root-cause uncertainty.

Additional risks: inline listeners and hashing affect timing; metadata writes and
worker wake/lifetime change the storage/process workload; consent/log storage can
be unavailable; a stale cached HTML may lack the panel; Apple process/rendering
failures and lost pre-document events remain opaque. A diagnostic path opened in
Safari/another origin cannot establish this installation's state. No privileged
page API can prove OS scheduling or permanent cache durability. Optional future
native inspection/platform traces add visibility but are not a prerequisite to
this Windows/iPhone proposal or Phase 2 evidence review.

Reviewer should independently reproduce the preserved synthetic outcomes, verify
the raw inventory when locally available, and assess the consent/retention contract,
pre-document limits, worker-lifetime perturbation and generation-change risk before
the Architect authorizes diagnostic implementation/deployment. IOS-01 remains
BLOCKED and real-device acceptance FAILED.

### Documentation review closure map

| Finding                | Amendment location                                                                          | Disposition of this amendment                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1                     | Authoritative consent, revocation and retained readout; acceptance tests 1, 3, 5            | IDB authority, atomic stale-writer rejection, honest Stop/Erase and retained export specified; awaiting targeted review.                                     |
| R2                     | Aggregate limits and finite diagnostic work; acceptance tests 2, 4, 6                       | Shared limits, queue/body caps, extension permits and diagnostic-only deadlines specified; awaiting targeted review.                                         |
| N1                     | Historical inventory and exact-artifact handoff; evidence audit and reproduction recipe     | 47 verified raw files distinguished from 49 historical entries; two original source versions remain unavailable/unverified. Exact archive handoff specified. |
| Reviewer clarification | Correlation and remaining observation gaps; acceptance test 5; smallest decisive experiment | Supported client/document identity, unsynchronized-clock uncertainty, separate future offline log-restart test and bounded owner observations specified.     |

This closure changes documentation only. The accepted original evidence/test
results remain intact. No recorder, consent storage, diagnostic timeout, production
fix, deployment or new device acceptance test has been implemented in this phase.

## Correction and acceptance boundary

No production fix is justified as the established IOS-01 remedy yet. Do not change
timeouts, add retries, remove WebKit, weaken offline assertions, or deploy a guessed
repair. Evidence supports a separate candidate design for generation-coherent
precaching/navigation and safe asset retirement, but the Architect/Reviewer must
select its scope and update behavior after device evidence. A visible startup
failure fallback is another candidate; it cannot repair missing navigation HTML.
Neither changing the readiness label nor requesting persistent storage establishes
offline cold-launch acceptance.

Any eventual correction requires focused regressions for successful-200 wrong
HTML generation, stale/new HTML with unavailable entry JS, missing HTML/JS entries,
pending navigation fetches and real transport interruption. Preserve accepted
installation-failure recovery,
late registration, initial install, normal/interrupted updates, offline restart
and unrelated-cache isolation. Run all required static/unit/build/browser checks
on Chromium desktop/mobile, Firefox and WebKit; bounded serial/two-worker WebKit
checks and Linux CI; no blanket retries.

Device acceptance must use the **existing iPhone 13 / iOS 26.6.2 Home Screen
installation**, retain its A → B history, verify actual coherent cache/controller
state, and successfully cold-launch offline with airplane mode both ON and OFF
when all connectivity is disabled. Also test reconnect/update, background return,
and subsequent cold offline reopening. Agree the update observation budget with
the Architect; do not invent an acceptable delay or require a manual reset.

Release implication: the deployed technical preview remains an observed offline
failure on the acceptance device. CI-01's desktop correction remains bounded to
its established lifecycle issue; it is not real-iPhone acceptance. Do not certify
iOS offline reliability or progress to POC-03/TASK-003 on the strength of desktop
green checks. Independent Reviewer should reproduce the injected faults, inspect
the artifact audit, and review the proposed diagnostics before any authorization
to deploy. No independent IOS-01 Reviewer approval is claimed.

IOS-01 R1/R2/N1 CLOSURE — AWAITING TARGETED REVIEW
