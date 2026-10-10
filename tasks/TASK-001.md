# TASK-001: PWA Development Foundation, Automated Testing & CI

Role: Builder. Assigned: 2026-10-10. Base: accepted TASK-000 commit
`a4ad0a612be1b300e07e911819c548545f54f908` on `main`.
Working branch: `task/TASK-001`.

## Scope and acceptance

- Establish a small strict TypeScript + Vite app without a UI framework, backend,
  runtime CDN, telemetry, paid APIs, or required login. Use stable tools on Node 24
  LTS, an npm lockfile, lint/format configuration, and reproducible commands.
- Show an accessible temporary MoneySZN Technical Preview, version/build ID,
  connectivity status, and notice that no financial functionality exists.
- Supply a manifest, temporary install icons, and a production Service Worker.
  After initial installation, the shell must reload offline under `/moneyszn/`.
  New builds must replace the shell without manual site-data clearing; cleanup
  must preserve caches belonging to other apps on the origin.
- Run typecheck, lint, focused Vitest tests, build, and Playwright production tests
  for desktop Chromium, mobile Chromium, iPhone-profile WebKit, and Firefox.
  Check startup, fatal errors, title, mobile overflow, connectivity, worker
  registration, offline reload, subpath resources, repeat navigation, and updates.
- PRs to main and main pushes run required GitHub Actions checks. Only main may
  deploy the checked production artifact to Pages; deployment depends on every
  required check. Use minimal job permissions and retain browser failure evidence.
- Document setup, commands, coverage/limitations, CI, Pages owner configuration,
  and real iPhone acceptance. Record TASK-000 as ACCEPTED and preserve POC and
  unresolved security decisions. Review the diff and staged content for scope,
  secrets, private data, and unintended POC imports.

## Exclusions and review boundary

Modify only MoneySZN. Do not alter Downloads, POCs, or other repositories. No
finance features, financial storage/data, authentication, Passkeys, PIN, encryption,
Vault, final UI, Android Studio, or heavyweight mobile emulators. Secure storage,
final origin, platform support, and design still require accepted decisions.

Prepare `https://avahgard.github.io/moneyszn/` solely as a provisional technical
preview origin. Do not claim deployment before it occurs. Configure Pages only
with sufficient authenticated authorization; otherwise give exact owner steps.

Commit and push this task branch and open a PR if authenticated tooling permits.
Do not merge, push changes into main, deploy the task branch, bypass independent
review, or start TASK-002. Builder checks are not Reviewer approval. Deliver the
Builder Report and stop; READY FOR REVIEW requires completed implementation and
required local checks, with CI/deployment evidence reported separately.
