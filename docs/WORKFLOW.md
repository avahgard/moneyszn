# Development workflow

The repository is the source of truth. Keep tasks and material decisions here; chats may continue across minor changes and are not a required unit of work.

1. **Architect** defines a task's scope, exclusions, acceptance criteria, and any design decisions required before implementation.
2. **Builder** reads the task and current state, works on a dedicated branch such as `task/TASK-001`, preserves unrelated work, and uses [task-delivery](../.agents/skills/task-delivery/SKILL.md). Run meaningful automated tests where applicable and deliver changes with a concise Builder Report.
3. **Reviewer** examines meaningful changes against the task and constraints, inspects evidence, and verifies behavior where applicable. Record approval or precise findings. Builder self-checks do not substitute for independent review.
4. Merge approved changes into `main` without force-pushing. After an accepted task, update project state and record material decisions in the relevant task or architecture document.
5. **Release** uses [release-check](../.agents/skills/release-check/SKILL.md). Functional releases automatically deploy only after required checks pass. The user performs acceptance testing on the deployed version; record the result and any follow-up task.

## Foundation bootstrap

TASK-000 explicitly authorizes the initial commit, creation of public `avahgard/moneyszn`, and push to default branch `main`. Prepare it on `task/TASK-000` and publish that initial commit as `main`. Report Builder checks and pending user acceptance honestly; this exception does not imply independent Reviewer approval or authorize later unreviewed merges.

No CI or deployment is created in TASK-000. TASK-001 must establish runnable code, meaningful required checks, and automated deployment gated on those checks. Until then, there is no functional release path; a documentation-only push is not a deployed app.
