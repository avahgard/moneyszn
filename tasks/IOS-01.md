# IOS-01: installed iPhone update and offline launch investigation

Date: 2026-10-11. Role: Builder / PWA Lifecycle Investigator.
Disposition: **BLOCKED on real-device diagnosis and Architect disposition**.
Real-device acceptance: **FAILED**. Desktop results do not supersede it.

Investigation branch: `codex/IOS-01-ios-pwa`, based on accepted main
`b413446d56f4d8b3997160ba29156d4fd62e4f92` (B).
Phase 1 ended without a commit, push or PR. Phase 2 authorizes evidence-only
preservation, a commit/push and a draft PR; diagnostic implementation/deployment
remain unauthorized. No production correction, merge or deployment was made.
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

1. Download the above original Pages archives; verify archive SHA-256. Unzip each,
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
  Raw retained evidence is not added wholesale to Git.
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
Recording defaults OFF. Only a visible consent action enables metadata recording,
including a consent flag that can be read on subsequent cold launches. An error
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

Proposed budget: one explicit session, 15 minutes maximum, 200 records and 64 KiB
total persisted metadata, with truncation/drop counters. Recording expires and
does not restart automatically. A separate diagnostic IndexedDB database and
reserved local consent flag are the only diagnostic writes; existing shell caches
and application storage are never repaired or deleted. On failure to read consent,
default OFF. On store failure, show a volatile-ring fallback if a page exists.
Stop, copy/export, and erase **only diagnostic records** are separate owner actions.
Retained metadata expires after 24 hours, checked on next opted-in access; no
background cleanup job. Export is manual copy/text download; clipboard failure
falls back to selectable text. No submission, telemetry or external infrastructure.
Limit each event to 1 KiB, snapshots to four app generations including the
acknowledged controller generation, and HTML references to eight known shell paths.
Record excess counts and unknown-path categories rather than unbounded names/data.

| Event                                               | Recorded / why needed                                                                                                                        | Observation point; online/offline                                                                       | Behavior impact                                                                                                          | Privacy / failure modes                                                                                                                      |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `session` / `store-health`                          | Consent, limits, expiry, retained/drop count, read/write error enum; establish recorder health.                                              | Explicit opt-in and bootstrap/store operations; both if code runs.                                      | Writes only diagnostic flag/database; stop disables recording.                                                           | No account/device identifier; inaccessible storage may lose consent or records.                                                              |
| `document-start` / `module-start` / `module-status` | HTML build hint, known script/CSS references, app build marker; locate startup stage and version mismatch.                                   | Inline bootstrap before main; opt-in main hooks at entry/status assignment; both.                       | Small inline facility/hooks; never delays main on storage writes.                                                        | Missing HTML/inline execution gives no marker; first pre-consent startup is unobserved.                                                      |
| `page-lifecycle`                                    | Sanitized entry path, standalone/display-mode, navigation type, pageshow/persisted, visibility, online flag.                                 | Bootstrap and native events; both.                                                                      | Passive listeners, no reload or network probes.                                                                          | Online flag is not reachability; cold process deaths may give no final event.                                                                |
| `startup-error` / `resource-error`                  | Runtime/rejection error class and known failing resource category/path; distinguish JS/CSS/startup failure.                                  | Inline capture-phase resource errors and error/rejection listeners; both.                               | Passive capture; no preventDefault, retries or suppression.                                                              | Message allowlist/truncation; uncaught worker errors and failures before HTML are invisible.                                                 |
| `register` / `update` start, resolve, reject        | Operation ID, original options, elapsed time, resulting snapshot/error class; locate stalled promise.                                        | Minimal future hooks around the app's existing calls, only when opted in; same original call frequency. | Do not wrap globally or add register/update calls; preserve return, ordering and error handling.                         | Old B has no hooks; begin without end can also mean process/log loss.                                                                        |
| `registration-state`                                | Scope category, installing/waiting/active presence, per-page worker IDs, states, updatefound/statechange.                                    | Subscribe then snapshot, settle/status/events, manual snapshot; both.                                   | Passive reads/listeners; no skipWaiting or claim commands.                                                               | Object IDs are page-local; events before subscription, background suspension and vanished candidates can be missed.                          |
| `controller-state`                                  | Controller presence, state, sanitized script path, controllerchange, correlation to acknowledged worker.                                     | Earliest opted-in bootstrap and events; both.                                                           | Passive reads/listeners.                                                                                                 | Mutable sw.js URL is not a build identity; active registration does not prove current control.                                               |
| `worker-handshake`                                  | Worker-instance/build/cache generation and expected asset manifest, reply latency or `no-reply`.                                             | One explicit baseline/readout exchange plus cold-launch readout if page runs; both.                     | Message wakes worker; no update/unregister/reset.                                                                        | B ignores new messages; timeout means unsupported/not observed, not proof of failed control.                                                 |
| `cache-access` / `cache-consistency`                | Existing MoneySZN names, per-known-entry hit/miss/error, cached HTML references and asset digest comparison; verify coherent shell.          | Manual baseline/offline/reconnect snapshots, using local expected A/B/diagnostic manifests; both.       | Read existing caches via keys and caches.match with cacheName; no caches.open/add/put/delete. Finite local reads/hashes. | Limit to app prefix and seven expected entries plus known HTML references; concurrent deletion/errors must be explicit, not called eviction. |
| `worker-lifecycle`                                  | Install/activate entry/settlement/failure with generation and elapsed time, if consent is already accessible; capture incomplete activation. | Future opt-in worker hooks and page state events; both.                                                 | Hooks preserve original lifecycle promises; durable writes may extend worker lifetime and must be disclosed.             | First diagnostic installation before consent is missed; page snapshots are then the only available evidence.                                 |
| `fetch-start`                                       | Navigation ID, request mode/path category, worker instance/generation, elapsed clock; establish event reception.                             | Opted-in worker fetch handler before original fetch; both if dispatched.                                | Logging runs beside the existing response path; no synthetic fetch or interception expansion.                            | Durable write can be lost at termination; worker startup may precede flag read, so initial events may be omitted.                            |
| `network-settlement`                                | Matching ID, fulfilled status category or rejected error enum and elapsed time; distinguish pending network.                                 | Original fetch's fulfillment/rejection; both if it settles.                                             | Observe original promise; never abort, substitute or time out application fetch.                                         | No settlement within 60 seconds is an observation, not proof it never settles; force-close/log loss can remove an end record.                |
| `fallback` / `response-selected`                    | Matching ID, fallback attempted, cache hit/miss/access error, selected response category/generation if locally known.                        | Existing navigation response-selection path; both when reached.                                         | Preserve response and exception behavior; no additional page-data download.                                              | Selected response does not prove browser commit/render; old cached HTML may be unverifiable without local manifest.                          |
| `readout` / `export`                                | Snapshot/log range, omitted/truncated fields and store errors; preserve evidence for manual review.                                          | Owner action in same installed context after baseline/reconnect; both if panel runs.                    | Local read/text generation; copy/download only on action.                                                                | Export unavailable on a black/no-document screen; device/network metadata is potentially identifying, so owner reviews before sharing.       |

Worker logging must not await metadata writes before returning/settling the
application response. A bounded logging-only event.waitUntil can improve retention
but changes worker lifetime; logs may still be lost on force termination. It must
not turn rejected install/activation into success or postpone app fetch fallback.
Do not buffer unconsented early events for later export. Observe install/activation
without adding a logging wait to their completion boundary; settlement writes may
therefore be lost. These compromises are part of independent review, not hidden
claims of behavior-neutral instrumentation.

Read the cache via `caches.match(request, { cacheName })` against already listed
names: opening an allegedly existing cache can recreate it after concurrent deletion.
HTML-reference/digest checks use bounded cloned cached responses, never consume a
response returned to the app. No automatic reachability probes, storage.persist(),
cache surgery, navigation aborts, reload loops or delayed activation fixes.

### Smallest decisive experiment and limits

**Now, with the unchanged installation:** retain the existing failure account and,
if not already recorded, one short online B → offline cold-launch → reconnect
recording, with times and screens at 0/15/60 seconds. No reset/reinstall or repeated
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
   A timeout/error is recorded; do not force activation or clear anything.
2. Disable all internet while the same document remains open; take one manual cache/
   lifecycle snapshot. This separates local Cache API failure from cold navigation.
3. Fully close once and reopen that same icon offline. Record 0/15/60 seconds;
   export if the panel appears. Do not repeat or wait indefinitely.
4. Restore connectivity and reopen the same installation if needed. Before starting
   a new diagnostic session, manually copy/export the retained session records;
   include missing ranges/store errors. No deployment occurs during the experiment.

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

IOS-01 PHASE 2 READY FOR REVIEW
