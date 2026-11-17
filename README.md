# @xpirience-infra/kanzen-sdk

TypeScript SDK for the Kanzen API. Handles outbound entity sync (accounts, contacts, locks) **and** inbound webhook event dispatching — one client object, configured once.

---

## Installation

```bash
# yarn
yarn add @xpirience-infra/kanzen-sdk

# npm
npm install @xpirience-infra/kanzen-sdk
```

> Requires Node.js ≥ 18. Published to GitHub Packages.

---

## Quick Start

```ts
import { KanzenClient } from '@xpirience-infra/kanzen-sdk'

const kanzen = new KanzenClient({
  apiUrl: 'https://api.kanzen.io',
  apiKey: process.env.KANZEN_API_KEY!,
  webhookSecret: process.env.KANZEN_WEBHOOK_SECRET,

  // Inbound event handlers
  onAccountCreated: async (data) => {
    console.log('Account created in Kanzen:', data.id)
    // Map data to your local schema and save
  },
  onContactUpdated: async (data) => {
    console.log('Contact updated:', data.id)
  },
})
```

---

## Constructor Options

```ts
interface KanzenClientOptions {
  /** Base URL of the Kanzen API (e.g. 'https://api.kanzen.io') */
  apiUrl: string

  /** API key for authenticating outbound requests */
  apiKey: string

  /**
   * HMAC-SHA256 shared secret used to verify inbound webhook signatures.
   * Required when using client.handle().
   */
  webhookSecret?: string

  /** Enable logging. true = 'verbose'. Options: 'none' | 'info' | 'verbose' | 'trace' */
  debug?: boolean | 'none' | 'info' | 'verbose' | 'trace'

  /** Custom logger. Defaults to console.log with [kanzen-sdk] prefix. */
  logger?: (level: 'info' | 'verbose' | 'trace', message: string, meta?: any) => void

  // ── Inbound webhook handlers (all optional) ───────────────────────────────
  onAccountCreated?: (data: KanzenAccountEventData) => Promise<void> | void
  onAccountUpdated?: (data: KanzenAccountEventData) => Promise<void> | void
  onAccountDeleted?: (data: KanzenDeletedEventData) => Promise<void> | void
  onContactCreated?: (data: KanzenContactEventData) => Promise<void> | void
  onContactUpdated?: (data: KanzenContactEventData) => Promise<void> | void
  onContactDeleted?: (data: KanzenDeletedEventData) => Promise<void> | void

  /**
   * Fallback for unrecognised event types.
   * Useful for forward-compatibility when Kanzen adds new events.
   */
  onUnknownEvent?: (event: string, data: unknown) => Promise<void> | void
}
```

---

## Inbound Webhooks — `client.handle(req, res)`

The SDK can receive and dispatch webhook events sent by Kanzen to your application.

### How it works

```
Kanzen (sender)                          Your app (receiver)
─────────────────────────────────────    ──────────────────────────────────────
1. Builds JSON body
2. HMAC-SHA256(rawBody, webhookSecret)
3. Sets header:
   x-kanzen-signature: <hex>
4. POST body + header ────────────────►  5. client.handle(req, res) reads body
                                         6. Reads x-kanzen-signature header
                                         7. HMAC-SHA256(rawBody, webhookSecret)
                                         8. timing-safe compare → 401 if mismatch
                                         9. Dispatches to onAccountCreated / …
                                        10. Responds 200 { success: true }
```

The `webhookSecret` is a shared secret configured on both Kanzen's side (dashboard) and your `.env`. It never travels over the wire — only the HMAC digest does.

### Framework Examples

#### Adonis v6

```ts
// app/services/kanzen_service.ts
import { KanzenClient } from '@xpirience-infra/kanzen-sdk'
import env from '#start/env'

export class KanzenService {
  private client = new KanzenClient({
    apiUrl: env.get('KANZEN_API_URL'),
    apiKey: env.get('KANZEN_API_KEY'),
    webhookSecret: env.get('KANZEN_WEBHOOK_SECRET'),

    onAccountCreated: async (data) => {
      // Save to your local DB here
      await Client.create({ kanzenId: data.id, nom: data.name })
    },
    onAccountUpdated: async (data) => { /* ... */ },
    onAccountDeleted: async (data) => { /* ... */ },
    onContactCreated: async (data) => { /* ... */ },
    onContactUpdated: async (data) => { /* ... */ },
    onContactDeleted: async (data) => { /* ... */ },
  })

  getClient() { return this.client }
}

export default new KanzenService()
```

```ts
// app/controllers/kanzen_webhook_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import kanzenService from '#services/kanzen_service'

export default class KanzenWebhookController {
  async handle({ request, response }: HttpContext) {
    await kanzenService.getClient().handle(request.request, response.response)
  }
}
```

```ts
// start/routes.ts
router.post('/api/webhooks/kanzen', [KanzenWebhookController, 'handle'])
// No middleware needed — signature verification is built-in
```

#### Express

```ts
import express from 'express'
import { KanzenClient } from '@xpirience-infra/kanzen-sdk'

const kanzen = new KanzenClient({
  apiUrl: process.env.KANZEN_API_URL!,
  apiKey: process.env.KANZEN_API_KEY!,
  webhookSecret: process.env.KANZEN_WEBHOOK_SECRET,
  onAccountCreated: async (data) => { /* ... */ },
})

const app = express()

// IMPORTANT: Do NOT use express.json() before this route.
// The SDK reads the raw body stream itself for HMAC verification.
app.post('/webhooks/kanzen', (req, res) => {
  kanzen.handle(req, res)
})
```

> ⚠️ **Important**: Do not apply a body-parsing middleware (e.g. `express.json()`) before the webhook route. The SDK reads the raw request stream to compute the HMAC signature. If the body has already been consumed, verification will fail.

### Event Reference

| Event | Handler | `data` type |
|---|---|---|
| `account.created` | `onAccountCreated` | `KanzenAccountEventData` |
| `account.updated` | `onAccountUpdated` | `KanzenAccountEventData` |
| `account.deleted` | `onAccountDeleted` | `KanzenDeletedEventData` |
| `contact.created` | `onContactCreated` | `KanzenContactEventData` |
| `contact.updated` | `onContactUpdated` | `KanzenContactEventData` |
| `contact.deleted` | `onContactDeleted` | `KanzenDeletedEventData` |
| `account.locked` / `account.unlocked` / `account.lock_extended` | `onAccountLocked` / `onAccountUnlocked` / `onAccountLockExtended` | `KanzenLockEventData` |
| `contact.locked` / `contact.unlocked` / `contact.lock_extended` | `onContactLocked` / `onContactUnlocked` / `onContactLockExtended` | `KanzenLockEventData` |
| *(any other)* | `onUnknownEvent` | `unknown` |

Every event arrives in the envelope `KanzenWebhookEnvelope`: `{ event, timestamp, updatedAt, tenantId, actorId, data }`. `actorId` is the Kanzen user who made the change, or `null`. The `data` of create and update events holds only the fields listed in `KanzenAccountEventData` and `KanzenContactEventData` (not the full API response); `originId` is included. Contacts can be created and updated with `originId` too (`KanzenContactPayload.originId`).

### Response Codes

| Code | Meaning |
|---|---|
| `200` | Event handled successfully |
| `400` | Missing/empty body or invalid JSON |
| `401` | Missing or invalid `x-kanzen-signature` |
| `500` | `webhookSecret` not configured, or event handler threw |

---

## Outbound API — Accounts

```ts
// Create an account
const account = await kanzen.createAccount({
  name: 'Acme Corp',
  identificationNumber: '12345678900123',  // SIRET
  phone: '+33 1 23 45 67 89',
  accountType: 'company',
  addresses: [{
    type: 'primary',
    line1: '1 rue de la Paix',
    postalCode: '75001',
    city: 'Paris',
    country: 'France',
    countryCode: 'FR',
  }],
})
console.log(account.id) // Kanzen UUID

// Update
await kanzen.updateAccount(account.id, { phone: '+33 1 99 99 99 99' })

// Delete (soft)
await kanzen.deleteAccount(account.id)
```

---

## Outbound API — Contacts

```ts
// Create a contact
const contact = await kanzen.createContact({
  lastname: 'Dupont',
  firstname: 'Jean',
  emailaddress2: 'jean.dupont@acme.com',
  phone2: '+33 6 12 34 56 78',
  accounts: [{ id: account.id }],
  additionalFields: {
    jobtitle: 'Directeur',
  },
})

// Get a contact
const c = await kanzen.getContact(contact.id)

// Update
await kanzen.updateContact(contact.id, { phone2: '+33 6 99 99 99 99' })

// Detach from an account
await kanzen.detachContact(contact.id, account.id)

// Delete (soft)
await kanzen.deleteContact(contact.id)
```

---

## Outbound API — Locks

Locks prevent simultaneous edits on the same entity from both sides.

```ts
// Acquire a lock (15s TTL)
await kanzen.acquireLock({ entityType: 'account', entityId: account.id, leaseTtl: 15 })

// Extend before expiry
await kanzen.extendLock({ entityType: 'account', entityId: account.id, leaseTtl: 15 })

// Release when done
await kanzen.releaseLock({ entityType: 'account', entityId: account.id })
```

---

## Outbound API — SEPA Mandates

A SEPA mandate belongs to an account; an account can hold several (one per debited bank account). Statuses: `PENDING`, `SENT`, `SIGNED`, `REJECTED`, `REVOKED`. `externalActor` records the name of the person who acted in your app.

```ts
// List the mandates of an account
const mandates = await kanzen.listSepaMandates(account.id)

// Create a mandate (all fields optional; scheme defaults to CORE for individuals, B2B otherwise)
const mandate = await kanzen.createSepaMandate(account.id, {
  iban: 'FR7630006000011234567890189',
  bic: 'AGRIFRPP',
  externalActor: 'Jane Doe',
})
// mandate.rum, mandate.status === 'PENDING'

// Download the PDF to sign (short-lived URL)
const { url: pdfUrl } = await kanzen.getSepaMandatePdfUrl(mandate.id)

// Upload the signed copy (Buffer or Blob; PDF, PNG or JPEG). The mandate becomes SIGNED.
const signed = await kanzen.uploadSignedSepaMandate(mandate.id, fileBuffer, 'mandate.pdf', 'Jane Doe')

// Download the signed copy (short-lived URL)
const { url: signedUrl } = await kanzen.getSignedSepaMandateUrl(mandate.id)

// Update status or bank details
await kanzen.updateSepaMandate(mandate.id, { status: 'REVOKED', externalActor: 'Jane Doe' })
```

A refused status change throws `Kanzen API Error (409): ...E_SEPA_MANDATE_TRANSITION...`; an unknown mandate or account throws `Kanzen API Error (404): ...`.

---

## OAuth Helpers

For integrating Kanzen as an OAuth / OIDC provider.

### BetterAuth

```ts
import { getBetterAuthProviderConfig } from '@xpirience-infra/kanzen-sdk'
import { betterAuth } from 'better-auth'

const auth = betterAuth({
  socialProviders: {
    kanzen: getBetterAuthProviderConfig({
      apiUrl: process.env.KANZEN_API_URL!,
      clientId: process.env.KANZEN_CLIENT_ID!,
      clientSecret: process.env.KANZEN_CLIENT_SECRET,
    }),
  },
})
```

### NextAuth

```ts
import { getNextAuthProviderConfig } from '@xpirience-infra/kanzen-sdk'
import NextAuth from 'next-auth'

export default NextAuth({
  providers: [
    getNextAuthProviderConfig({
      apiUrl: process.env.KANZEN_API_URL!,
      clientId: process.env.KANZEN_CLIENT_ID!,
      clientSecret: process.env.KANZEN_CLIENT_SECRET,
    }),
  ],
})
```

---

## Signature Verification (standalone)

If you need to verify a webhook signature manually (outside of `handle()`):

```ts
const isValid = kanzen.verifyWebhookSignature(rawBodyString, signatureHeader)
if (!isValid) {
  throw new Error('Invalid signature')
}
```

---

## Types Reference

| Type | Description |
|---|---|
| `KanzenClientOptions` | Constructor options |
| `KanzenWebhookPayload` | Discriminated union of all webhook payloads |
| `KanzenWebhookEnvelope` | Envelope of every webhook (`event`, `timestamp`, `updatedAt`, `tenantId`, `actorId`, `data`) |
| `KanzenAccountEventData` | `data` of `account.created` / `account.updated` |
| `KanzenContactEventData` | `data` of `contact.created` / `contact.updated` |
| `KanzenDeletedEventData` | `data` of `account.deleted` / `contact.deleted` |
| `KanzenLockEventData` | `data` of lock events |
| `KanzenAccountResponse` | Account data shape from the REST API |
| `KanzenAccountPayload` | Payload for creating/updating an account |
| `KanzenContactResponse` | Contact data shape from the REST API |
| `KanzenContactPayload` | Payload for creating/updating a contact |
| `KanzenAddress` | Address sub-object |
| `KanzenAddressResponse` | Address sub-object (response) |
| `KanzenLockPayload` | Lock operation payload |
| `KanzenLockResponse` | Lock operation response |
| `KanzenSepaMandate` | SEPA mandate data shape from the REST API |
| `KanzenSepaMandateStatus` | `'PENDING' \| 'SENT' \| 'SIGNED' \| 'REJECTED' \| 'REVOKED'` |
| `KanzenSepaMandateScheme` | `'B2B' \| 'CORE'` |
| `KanzenCreateSepaMandatePayload` | Payload for creating a SEPA mandate |
| `KanzenUpdateSepaMandatePayload` | Payload for updating a SEPA mandate |
| `KanzenSignedUrl` | `{ url }` short-lived download URL |
| `KanzenOAuthConfigOptions` | OAuth helper configuration |
| `KanzenDebugLevel` | `'none' \| 'info' \| 'verbose' \| 'trace'` |

---

## Debug Logging

```ts
const kanzen = new KanzenClient({
  // ...
  debug: 'verbose', // or true (= verbose), 'trace' (= all)
})
// Outputs: [kanzen-sdk] [INFO] Client initialized { apiUrl: '...' }
// Outputs: [kanzen-sdk] [VERBOSE] [webhook] Signature verified ✓
```

Custom logger:

```ts
const kanzen = new KanzenClient({
  // ...
  logger: (level, message, meta) => {
    myLogger[level]({ msg: message, ...meta })
  },
})
```
