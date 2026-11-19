# SEPA signing — Kanzen SDK design

Date: 2026-11-19. App: **`@xpirience-infra/kanzen-sdk`** (current 2.1.0, SEPA mandates). Release **2.2.0**.

Sister designs, same project:
- Kanzen: `kanzen/docs/superpowers/specs/2026-11-19-sepa-mandate-signing-design.md` (source of the API)
- RFA portal: `rfa-portail/docs/superpowers/specs/2026-11-19-mandats-sepa-signature-design.md` (the consumer)

## Intent

The RFA portal starts SEPA mandates for a whole client and sends them to the debtor for signature on a Kanzen-hosted page. The SDK is how the portal reaches Kanzen: it exposes the new mandate fields and the signing requests, nothing more.

## Goals

1. Mandate type gains `label: string | null` and `coveredAccountIds: string[]`.
2. `createSepaMandate(accountId, { ..., label?, coveredAccountIds? })`.
3. `updateSepaMandate(id, { ..., label?: string | null })` (IBAN/BIC already supported).
4. Signing requests:
   - `createSepaSigningRequest({ contactId, mandateIds })` → request
   - `listSepaSigningRequests({ accountId?, mandateId? })` → request[]
   - `resendSepaSigningRequest(id)` → request
   - `cancelSepaSigningRequest(id)` → request
   - Request type: `id`, `contactId`, `mandateIds`, `status: 'OPEN' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'`, `expiresAt`, `sentAt`, `completedAt`. No token (it never leaves Kanzen except by e-mail).
5. Covered accounts: `addSepaMandateCoveredAccounts(mandateId, accountIds)` and `removeSepaMandateCoveredAccount(mandateId, accountId)` (a site joining a signed mandate needs no new signature; Kanzen copies the IBAN/BIC).
6. Webhook payload type for `sepa_mandate.signed` (mandate id, debtor account id, covered account ids, signed at).

## Non-goals

- No call to the public (token) endpoints: only the signer's browser uses them.
- No grouping logic: the portal decides which mandates to create.

## Constraints

- Same error convention as 2.1.0: `Error("Kanzen API Error (<status>): <body>")`.
- Additive only: 2.1.0 callers keep working (minor version).
- The repo has no test suite: verification is `yarn build` (the type check) plus a scratch file using every new method that compiles against `dist/`. README section updated.
- Published to GitHub Packages after the Kanzen API is merged into `develop`.

## Left to the builder

Method placement in the client, test file layout, README wording.
