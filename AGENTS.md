# Repository rules

- Read `docs/PROJECT_STATE.md`, `docs/ARCHITECTURE.md`, and the assigned task before changing files. Follow `docs/WORKFLOW.md`; the repository is the source of truth.
- Work within the assigned scope on a dedicated task branch. Preserve existing user files and unrelated work. Never force-push or delete unrelated content.
- Modify only the assigned MoneySZN workspace. Keep Downloads and POC repositories untouched; do not import POC source. Install dependencies and prepare deployment only within the assigned task's authorization.
- Never place credentials, local secrets, real financial data, or real Vault files in source control, fixtures, logs, or tests. Use fictional data only; inspect staged content before committing.
- Treat secure storage as required but unapproved. Do not finalize cryptography, six-digit PIN security, Vault format, hosting origin, or UI design without an accepted design decision.
- Run meaningful applicable checks and report failures or skipped checks honestly. Review meaningful changes before merging; do not label Builder self-checks as independent Reviewer approval.
- After an accepted task, record material decisions and update project state. Stop at the task boundary. Use `task-delivery` for Builder delivery and `release-check` for release readiness; neither grants extra authorization.
