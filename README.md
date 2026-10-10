# MoneySZN

A free, open-source personal finance PWA for iPhone and Android, designed for mobile use, offline operation, and local data ownership. No required backend, account registration, paid API, or server dependency.

## Current stage

TASK-000 establishes repository documentation and a lightweight development workflow. There is no runnable application, dependency installation, CI, or deployment yet. TASK-001 will establish runnable application code, automated CI, and deployment; it has not started.

Local workspace: `D:\Tools\MoneySZN`. Repository: [avahgard/moneyszn](https://github.com/avahgard/moneyszn). License: [MIT](LICENSE).

## Scope

Secure local storage is required. Its implementation, PIN security, portable encrypted Vault format, hosting origin, and product UI remain undecided. Ordinary CSV export is planned. Development uses fictional data only.

## Accepted experiments

- [POC-01: offline storage](https://github.com/avahgard/finance-poc-01) established feasibility of local IndexedDB and a cached PWA shell. It does not establish encryption, backup, or indefinite storage durability.
- [POC-02: Passkey PRF](https://github.com/avahgard/finance-poc-02) proved PRF on a real iPhone with Apple Passwords. KeePassium did not return a usable PRF result in the tested configuration. This is bounded feasibility evidence, not production security approval.

The experiments remain separate references; their code is not imported. See [architecture](docs/ARCHITECTURE.md) for limitations and unresolved decisions.

Start with [project state](docs/PROJECT_STATE.md), [repository rules](AGENTS.md), and [workflow](docs/WORKFLOW.md). The foundation scope is recorded in [TASK-000](tasks/TASK-000.md).
