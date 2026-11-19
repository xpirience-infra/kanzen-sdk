# SEPA signing — Kanzen SDK 2.2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the new Kanzen SEPA API (mandate label and covered accounts, signing requests, `sepa_mandate.signed` webhook) in `@xpirience-infra/kanzen-sdk` 2.2.0.

**Architecture:** Same shape as 2.1.0: free functions in `src/features/sepa_mandates.ts` (and a new `src/features/sepa_signing_requests.ts`), thin `KanzenClient` wrappers, public types in `src/types.ts`, webhook event added in the four places listed in `CLAUDE.md`.

**Tech Stack:** TypeScript (ESM, NodeNext), Yarn 1, `tsc` build, changelogen release.

**Spec:** `docs/superpowers/specs/2026-11-19-sepa-signing-sdk-design.md` (approved 2026-11-19). API source of truth: Kanzen plan `kanzen/docs/superpowers/plans/2026-11-19-sepa-mandate-signing-kanzen.md`, Tasks 3, 6 and 9 (Interfaces blocks).

## Global Constraints

- Additive only: every 2.1.0 call keeps compiling and behaving the same (minor version).
- Errors: `client.request` already throws `Kanzen API Error (<status>): <body>`; no new error type.
- Relative imports end in `.js`; Conventional Commits with a scope (`feat(sepa-mandates): ...`, `feat(sepa-signing): ...`, `feat(webhooks): ...`).
- `dist/` is committed; run `yarn build` before committing.
- No token, hash or IBAN-bearing webhook field in any type: the signing link never leaves Kanzen except by e-mail.
- Build only on the API contract below; **publish (`yarn release`) only after the Kanzen API is merged into `develop`** and the user says so.
- The repo has no test suite: verification is `yarn build` (the type check) plus the README examples compiling in a scratch file.

## API contract (from the Kanzen plan)

- Mandate JSON gains `label: string | null`, `coveredAccountIds: string[]`.
- `POST /accounts/:id/sepa-mandates` body gains `label?: string`, `coveredAccountIds?: string[]`.
- `PATCH /sepa-mandates/:id` body gains `label?: string | null`.
- `POST /sepa-mandates/:id/covered-accounts` `{ accountIds: string[] }` → mandate.
- `DELETE /sepa-mandates/:id/covered-accounts/:accountId` → mandate.
- `POST /sepa-signing-requests` `{ contactId, mandateIds }` → request.
- `GET /sepa-signing-requests?accountId=` | `?mandateId=` → request[].
- `POST /sepa-signing-requests/:id/resend` → request; `POST /sepa-signing-requests/:id/cancel` → request.
- Request JSON: `id, contactId, mandateIds: string[], status: 'OPEN'|'COMPLETED'|'EXPIRED'|'CANCELLED', expiresAt, sentAt, completedAt` (ISO strings or null).
- Webhook `sepa_mandate.signed`, data: `{ id, rum, debtorAccountId, coveredAccountIds, signedAt }`.
- Error codes the portal will meet (in the body): `SEPA_MANDATE_NOT_DESCENDANT`, `SEPA_MANDATE_ACCOUNT_ALREADY_COVERED`, `SEPA_SIGNING_CONTACT_NOT_ATTACHED`, `SEPA_SIGNING_ALREADY_OPEN`.

---

### Task 1: Mandate label and covered accounts

**Files:** Modify `src/types.ts`, `src/features/sepa_mandates.ts`, `src/client.ts`, `README.md`.

**Interfaces (produces):**
- `KanzenSepaMandate.label: string | null`, `KanzenSepaMandate.coveredAccountIds: string[]`.
- `KanzenCreateSepaMandatePayload.label?: string`, `.coveredAccountIds?: string[]`.
- `KanzenUpdateSepaMandatePayload.label?: string | null`.
- `client.addSepaMandateCoveredAccounts(mandateId: string, accountIds: string[]): Promise<KanzenSepaMandate>`.
- `client.removeSepaMandateCoveredAccount(mandateId: string, accountId: string): Promise<KanzenSepaMandate>`.

- [ ] **Step 1:** add the types and the two functions (ids through `encodeURIComponent`, as in 2.1.0).
- [ ] **Step 2:** `yarn build` — passes; `dist/` updated.
- [ ] **Step 3:** README SEPA section: label, covered accounts, "a site joining a signed mandate needs no new signature; Kanzen copies the IBAN/BIC".
- [ ] **Step 4: Commit** `feat(sepa-mandates): label and covered accounts`.

### Task 2: Signing requests

**Files:** Create `src/features/sepa_signing_requests.ts`; modify `src/types.ts`, `src/client.ts`, `README.md`.

**Interfaces (produces):**
- `type KanzenSepaSigningRequestStatus = 'OPEN' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'`.
- `interface KanzenSepaSigningRequest { id: string; contactId: string; mandateIds: string[]; status: KanzenSepaSigningRequestStatus; expiresAt: string; sentAt: string | null; completedAt: string | null }`.
- `client.createSepaSigningRequest(payload: { contactId: string; mandateIds: string[] }): Promise<KanzenSepaSigningRequest>`.
- `client.listSepaSigningRequests(filter: { accountId?: string; mandateId?: string }): Promise<KanzenSepaSigningRequest[]>` (query string built with `URLSearchParams`, empty keys omitted).
- `client.resendSepaSigningRequest(id: string)`, `client.cancelSepaSigningRequest(id: string)`: `Promise<KanzenSepaSigningRequest>`.

- [ ] **Step 1:** implement. **Step 2:** `yarn build` — passes.
- [ ] **Step 3:** README: the flow (create mandates → one request per signer → the contact gets one e-mail link → Kanzen hosts the page), resend/cancel, the error codes above.
- [ ] **Step 4: Commit** `feat(sepa-signing): signing requests`.

### Task 3: `sepa_mandate.signed` webhook

**Files:** `src/types.ts` (payload variant + `KanzenSepaMandateSignedEventData { id; rum; debtorAccountId; coveredAccountIds: string[]; signedAt: string }` + option `onSepaMandateSigned`), `src/features/webhook_handler.ts` (a `case` in **both** switches), `README.md` (event table).

- [ ] **Step 1:** implement the four places from `CLAUDE.md`. **Step 2:** `yarn build` — passes.
- [ ] **Step 3:** scratch check (not committed): a file using every new method and `onSepaMandateSigned` compiles against `dist/`.
- [ ] **Step 4: Commit** `feat(webhooks): sepa_mandate.signed event`.

### Task 4: Release (only when told)

- [ ] Wait for the user's go (Kanzen API merged into `develop`).
- [ ] `yarn release` → `v2.2.0` tag, publish workflow green on GitHub Actions.
- [ ] Tell the orchestrator the published version.
