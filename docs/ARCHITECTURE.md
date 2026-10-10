# Architecture

## Confirmed constraints

- Mobile-first PWA for iPhone and Android, with offline-first operation.
- No required backend, account registration, paid API, or server dependency. Static distribution is compatible with this constraint; its provider and origin remain undecided.
- Local data ownership and secure local storage are required. No production storage or cryptographic implementation is approved yet.
- Portable encrypted Vault is pending POC-03. Ordinary CSV export is planned and is distinct from encrypted backup.
- Product UI belongs to a separate Designer workflow. Development, fixtures, logs, and tests use fictional data only.

## Feasibility references

[POC-01](https://github.com/avahgard/finance-poc-01) is an accepted experiment for IndexedDB persistence and a Service Worker offline shell. Its test plan covers reopening, offline changes, and device restart after initial caching. It has no encryption, PIN, backup, or synchronization. It does not prove indefinite browser storage retention or survival after clearing site data or removing the app. Safari and an installed PWA may have different storage contexts. These mechanisms are evidence for future design, not a selected production stack.

[POC-02](https://github.com/avahgard/finance-poc-02) is an accepted experiment for local encrypted data unlocked through WebAuthn PRF. The owner reports PRF proven on a real iPhone with Apple Passwords; KeePassium did not return a usable PRF result in the tested configuration. Do not generalize that result to every provider, device, or configuration.

Its experimental HKDF/AES-GCM flow is not production approval. There is no approved PIN fallback, backup/recovery, migration, production threat model, or security review. Face ID is not guaranteed; system authentication may use a device passcode or another provider. Credentials are scoped to the site/RP ID; origin changes or credential deletion can make data unrecoverable. Desktop checks with mocked WebAuthn do not prove real-device PRF behavior. A compromised device or malicious application update is outside the experiment's demonstrated protection.

## Decisions still required

Define the threat model, encryption and key lifecycle, provider support, unavailable/canceled-authentication behavior, recovery, and storage durability before implementing secure storage. A six-digit PIN is a desired UX feature, not an approved key derivation or cryptographic scheme.

POC-03 must inform the portable encrypted Vault format and its validation, recovery, and compatibility rules. Select a stable hosting origin with credential scope in mind. Architect must also select the application stack and supported platform matrix; Designer will define the product UI separately.

The POC repositories remain untouched references. No source is imported, rewritten, redeployed, or deleted as part of MoneySZN foundation work.
