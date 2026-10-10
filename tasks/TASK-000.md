# TASK-000: Project Foundation

Role: Foundation Builder. Date: 2026-10-10.

## Scope

Inspect and preserve `D:\Tools\MoneySZN`, the only workspace authorized for modification. Establish concise project documents, repository rules, two reusable Skills, Git hygiene, and MIT licensing. Inspect POC references without importing or modifying them.

The owner authorizes an initial commit and creation/push of the new public GitHub repository `avahgard/moneyszn`, default branch `main`, using the authenticated GitHub CLI. Verify the exact repository is absent before creating it; if it exists, stop creation and report the conflict. Do not modify another repository.

## Acceptance criteria

- `README.md`, `AGENTS.md`, `docs/PROJECT_STATE.md`, `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, and this task document exist and agree on scope and current stage.
- Exactly the requested `task-delivery` and `release-check` Skills exist under `.agents/skills/`, with valid YAML front matter and clear invocation conditions.
- `.gitignore`, `.gitattributes`, and an MIT `LICENSE` are present.
- Architecture records the accepted POCs and their limitations; cryptography, PIN security, Vault format, hosting origin, and UI design remain unresolved.
- Workflow covers Architect, task-branch Builder, meaningful checks, Reviewer, approved merge, gated automatic functional deployment, and user acceptance.
- Validate structure, Markdown links/formatting, Skill manifests, staged content, and repository-rule consistency. Report checks honestly without fake tests.
- Initialize Git if needed, commit, create and push the authorized repository, then confirm remote files, visibility, default branch, and commit SHA.
- Return a concise Builder Report with repository URL, commit SHA, file list, checks, and blockers. Distinguish delivery from user acceptance.

## Exclusions and stop boundary

No finance features, application dependencies, production UI, placeholder deployment, CI, or TASK-001 work. No modification of Downloads or POC repositories. No real financial data, credentials, secrets, or real Vault files in development artifacts. Stop after TASK-000 delivery.
