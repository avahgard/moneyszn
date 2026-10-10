# Development workflow

The repository is the source of truth. Keep tasks and material decisions here; chats may continue across minor changes and are not a required unit of work.

1. **Architect** defines a task's scope, exclusions, acceptance criteria, and any design decisions required before implementation.
2. **Builder** reads the task and current state, works on a dedicated branch such as `task/TASK-001`, preserves unrelated work, and uses [task-delivery](../.agents/skills/task-delivery/SKILL.md). Run meaningful automated tests where applicable and deliver changes with a concise Builder Report.
3. **Reviewer** examines meaningful changes against the task and constraints, inspects evidence, and verifies behavior where applicable. Record approval or precise findings. Builder self-checks do not substitute for independent review.
4. Merge approved changes into `main` without force-pushing. After an accepted task, update project state and record material decisions in the relevant task or architecture document.
5. **Release** uses [release-check](../.agents/skills/release-check/SKILL.md). Functional releases automatically deploy only after required checks pass. The user performs acceptance testing on the deployed version; record the result and any follow-up task.

## Foundation bootstrap

TASK-000 authorized the initial commit, creation of public `avahgard/moneyszn`,
and push to default branch `main` from the bootstrap task. That exception did
not imply independent Reviewer approval or authorize later unreviewed merges.

TASK-000 is accepted at `a4ad0a612be1b300e07e911819c548545f54f908` and
created no CI or deployment. Its bootstrap exception has ended.

## TASK-001 verification and delivery

Use Node 24 LTS, `npm ci`, and `npx playwright install chromium firefox webkit`,
then `npm run check`. [README](../README.md) documents individual commands,
browser coverage, Pages owner setup, and real iPhone acceptance. The production
build, rather than the dev server, is the offline testing target.

Builder may commit/push `task/TASK-001` and open a PR against main. Independent
Reviewer approval and task acceptance remain separate from Builder self-checks.
Do not merge or deploy from the task branch. Record review/acceptance before an
authorized merge; use release-check when a deployment is proposed or verified.

The CI **Required checks** job clean-installs, typechecks, lints, verifies format,
unit-tests, builds, and tests all configured browsers. No required command uses
continue-on-error or silent skips. Failure artifacts are diagnostic, never proof
of a pass. A main push alone can upload the tested `dist` artifact; the Pages job
depends on successful checks and holds only Pages/OIDC write permissions.
PR jobs hold read-only repository permissions and cannot deploy.

The owner must configure Pages' Actions source, main-only environment deployment,
and branch protection as described in README unless authenticated authorized
tooling has actually configured and verified those settings. Report actual
Actions/deployment state; workflow creation alone proves neither. The technical
preview origin does not approve secure storage or a financial release. Real
iPhone acceptance remains manual; Android emulation and real-device security
verification belong to later tasks. Stop after TASK-001 delivery.
