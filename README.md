# MoneySZN

A free, open-source personal finance PWA for iPhone and Android, designed for mobile use, offline operation, and local data ownership. No required backend, account registration, paid API, or server dependency.

## Current stage

TASK-000 and [TASK-001](tasks/TASK-001.md) are accepted. The
[technical PWA preview](https://avahgard.github.io/moneyszn/) is deployed with
automated checks and owner-reported 5/5 real-iPhone foundation acceptance; see
[project state](docs/PROJECT_STATE.md) for bounded evidence. It contains no
financial functionality or sensitive storage. [TASK-002](tasks/TASK-002.md)
proposes [security architecture](docs/security/SECURITY_ARCHITECTURE_PROPOSAL.md)
and a [POC-03 plan](tasks/POC-03_PLAN.md), pending independent security review and
Architect decisions. Production financial-data security remains unapproved.

Local workspace: `D:\Tools\MoneySZN`. Repository: [avahgard/moneyszn](https://github.com/avahgard/moneyszn). License: [MIT](LICENSE).

## Scope

Secure local storage is required. Its implementation, PIN security, portable encrypted Vault format, hosting origin, and product UI remain undecided. Ordinary CSV export is planned. Development uses fictional data only.

## Accepted experiments

- [POC-01: offline storage](https://github.com/avahgard/finance-poc-01) established feasibility of local IndexedDB and a cached PWA shell. It does not establish encryption, backup, or indefinite storage durability.
- [POC-02: Passkey PRF](https://github.com/avahgard/finance-poc-02) proved PRF on a real iPhone with Apple Passwords. KeePassium did not return a usable PRF result in the tested configuration. This is bounded feasibility evidence, not production security approval.

The experiments remain separate references; their code is not imported. See [architecture](docs/ARCHITECTURE.md) for limitations and unresolved decisions.

Start with [project state](docs/PROJECT_STATE.md), [repository rules](AGENTS.md), and [workflow](docs/WORKFLOW.md). The foundation scope is recorded in [TASK-000](tasks/TASK-000.md).

## Local setup

Use Node **24 LTS** and its bundled npm (`.nvmrc` and package engines pin the
major). From the repository root:

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run dev
```

Open the printed URL at `/moneyszn/`. The dev server does not install an offline
worker. For the production shell:

```powershell
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/moneyszn/` and wait for **Ready for offline use** before
disconnecting. HTTPS or localhost is required for Service Workers. The screen
shows package version and build commit; uncommitted builds identify HEAD only.
`dist/build-info.json` records the same identifier. No runtime CDN is used.

## Automated checks

```powershell
npm run check
```

This runs `typecheck`, `lint`, `format:check`, `test:unit`, `build`, and `test:e2e`.
Each is also an npm script. Use `npm run format` to apply formatting. On Linux,
install browser system libraries with
`npx playwright install --with-deps chromium firefox webkit`.

Browser tests use the actual production output on a static server at
`/moneyszn/`, not the dev server. They check startup/errors/title, mobile overflow,
connectivity, worker registration, manifest/icon/asset paths, repeated offline
navigation, and replacement of an installed build while preserving another app's
origin cache. Two additional generated builds under `.test-builds/` test updates.
`npm run test:e2e -- --project=webkit-iphone` selects one project; build `dist`
first when running browser tests separately. Traces/screenshots on failure are in
`test-results/`; `npx playwright show-report` opens the HTML report.

Coverage: desktop Chromium, Pixel 7-profile Chromium, iPhone 13-profile WebKit,
and desktop Firefox. WebKit emulation is **not Safari on an actual iPhone**.
On the Builder's Windows host, Playwright Firefox 157 failed before startup with
a Windows side-by-side configuration error (activation context could not resolve
the `mozglue` assembly). Firefox is still required in Linux
CI; no Firefox pass is claimed for that local attempt. The other three profiles
completed offline reload and build replacement tests locally.
Device profiles do not prove OS install UX, persistence after restart, security,
or every browser version. Connectivity is the browser's online/offline signal,
not a guarantee that the internet is reachable. Browser storage can be evicted;
the preview must then be installed online again. No financial durability claim
is made. Android Studio Emulator and real-device security verification are
planned for later tasks and are not TASK-001 requirements.

## CI and provisional Pages preview

[CI and Pages](.github/workflows/ci.yml) runs on PRs targeting main and pushes to
main: Node 24, clean npm install, typecheck, lint, formatting, unit tests,
production build, and all four browser projects. Any failed check blocks artifact
upload/deployment. PRs never deploy. Only a main push after review/merge can
upload `dist` and run the deployment job. Browser failure evidence is retained for
seven days. Dist and local test output are ignored, not committed.

Owner setup before an approved merge:

1. Repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Ensure Actions are enabled and the workflow's official `actions/*` actions
   are allowed under **Settings → Actions → General**.
3. Under **Settings → Environments → github-pages**, restrict deployment branches
   to `main`. Optionally add a required owner approver.
4. Protect `main` with required PR review and the **Required checks** status check
   after the first PR workflow makes it selectable. Do not bypass review.

These owner settings are not asserted configured merely because the workflow
exists. See the [GitHub Pages workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

The provisional URL is `https://avahgard.github.io/moneyszn/`. This is solely a
technical demonstration origin. It is **not approved for Passkeys, secure
storage, or real financial data**. A later accepted architecture decision must
select the financial application's security origin. Builds record GitHub's
checked commit via `MONEYSZN_BUILD_ID`; actual deployment must be confirmed from
Actions and the deployed build identifier.

## Real iPhone acceptance (after an approved deployment)

1. Record iPhone model, iOS version, Safari version where available, deployed
   build ID, and date. Open the preview URL in Safari with internet access.
2. Check title, notice, readable text, portrait/landscape layout, no horizontal
   scroll, version, Online status, and Ready for offline use.
3. Add to Home Screen through Safari's Share menu. Open the installed preview;
   record icon, launch behavior, and whether standalone display is used.
4. Enable airplane mode and disable Wi-Fi. Reload Safari and reopen the installed
   preview. Confirm readable shell, correct build ID, and Offline status. Close
   and reopen, then restart the phone and repeat; record each result separately.
5. Reconnect and open the preview after a later approved build is deployed. Reload
   online to trigger an update, confirm the new build ID, then disconnect/reopen
   and confirm that the new shell works without clearing site data.
6. Report PASS/failure with observed behavior. Safari and installed app contexts
   may differ; test both. This procedure contains no financial or security tests.
