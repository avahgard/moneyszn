---
name: task-delivery
description: Deliver an assigned MoneySZN Builder task from scoped implementation through validation and a Builder Report. Use when starting or completing a repository task; does not authorize release or unrelated work.
---

# Task delivery

Read [repository rules](../../../AGENTS.md), [project state](../../../docs/PROJECT_STATE.md), [architecture](../../../docs/ARCHITECTURE.md), [workflow](../../../docs/WORKFLOW.md), and the assigned task. Identify acceptance criteria, exclusions, and decisions that block implementation.

Inspect files and Git status before edits. Preserve unrelated work. Use a dedicated task branch; do not silently move or discard another task's changes. Implement only the assigned scope and validate meaningful behavior where runnable code exists. For documentation-only tasks, check structure, links, manifests, and consistency; do not invent passing application tests.

Inspect the actual diff and explicit staged file list for scope and sensitive content. Commit/push only within existing authorization. Submit meaningful changes for Reviewer examination under the workflow; report self-review separately. After an accepted task, update state and material decisions in the repository.

Deliver a concise Builder Report: outcome, branch/commit and repository link when available, changed files, checks with results and skips, blockers, and review/acceptance status. Stop at the task boundary.
