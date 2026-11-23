# Changelog

## v2.3.0

### 🚀 Enhancements

- **projects:** `listPaymentMethods`, `listProjectStatuses`, `listProjectInvoicingTypes`, `createProject`, `updateProject`, `getProject`, with milestones


## v2.2.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v2.1.0...v2.2.0)

### 🚀 Enhancements

- **sepa-mandates:** Label and covered accounts ([db69ff8](https://github.com/xpirience-infra/kanzen-sdk/commit/db69ff8))
- **sepa-signing:** Signing requests ([42f279a](https://github.com/xpirience-infra/kanzen-sdk/commit/42f279a))
- **webhooks:** Sepa_mandate.signed event ([affd2d9](https://github.com/xpirience-infra/kanzen-sdk/commit/affd2d9))
- **sepa:** AccountId on signed-url, status filter on signing requests ([c9e567a](https://github.com/xpirience-infra/kanzen-sdk/commit/c9e567a))

### 📖 Documentation

- **sepa-signing:** Design and plan for SDK 2.2.0 ([a965f87](https://github.com/xpirience-infra/kanzen-sdk/commit/a965f87))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v2.1.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v2.0.0...v2.1.0)

### 🚀 Enhancements

- **sepa-mandates:** Types and multipart requests ([219548e](https://github.com/xpirience-infra/kanzen-sdk/commit/219548e))
- **sepa-mandates:** Client methods for SEPA mandates ([9d6bd2a](https://github.com/xpirience-infra/kanzen-sdk/commit/9d6bd2a))
- **sepa-mandates:** Update payload status limited to SENT, REJECTED, REVOKED ([9fc17fe](https://github.com/xpirience-infra/kanzen-sdk/commit/9fc17fe))

### 📖 Documentation

- CLAUDE.md ([69aca76](https://github.com/xpirience-infra/kanzen-sdk/commit/69aca76))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v2.0.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.9.0...v2.0.0)

### 🚀 Enhancements

- **sdk:** ⚠️  Contact originId, webhook payload types match Kanzen ([20c28b0](https://github.com/xpirience-infra/kanzen-sdk/commit/20c28b0))

### 🩹 Fixes

- **sdk:** Contact originId is a string ([29a1334](https://github.com/xpirience-infra/kanzen-sdk/commit/29a1334))

#### ⚠️ Breaking Changes

- **sdk:** ⚠️  Contact originId, webhook payload types match Kanzen ([20c28b0](https://github.com/xpirience-infra/kanzen-sdk/commit/20c28b0))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.9.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.8.0...v1.9.0)

### 🚀 Enhancements

- **webhooks:** Add lock event types and handlers ([2a34c44](https://github.com/xpirience-infra/kanzen-sdk/commit/2a34c44))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.8.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.7.0...v1.8.0)

### 🚀 Enhancements

- **types:** Add discriminated union KanzenWebhookPayload + event handler callbacks ([db86aac](https://github.com/xpirience-infra/kanzen-sdk/commit/db86aac))
- **webhook:** Add handleIncomingWebhook + handleIncomingWebhookRaw ([b6d7cb3](https://github.com/xpirience-infra/kanzen-sdk/commit/b6d7cb3))
- **client:** Add handle() + handleRaw() inbound webhook methods ([800768c](https://github.com/xpirience-infra/kanzen-sdk/commit/800768c))

### 📖 Documentation

- **sdk:** Add full README ([3b337f2](https://github.com/xpirience-infra/kanzen-sdk/commit/3b337f2))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.7.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.6.0...v1.7.0)

### 🚀 Enhancements

- **sdk:** Move to folder architecture ([9db0f0e](https://github.com/xpirience-infra/kanzen-sdk/commit/9db0f0e))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.6.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.5.0...v1.6.0)

### 🚀 Enhancements

- Add logger ([a7c37bd](https://github.com/xpirience-infra/kanzen-sdk/commit/a7c37bd))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.5.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.4.0...v1.5.0)

### 🚀 Enhancements

- **client:** Add verifySsoToken ([742470d](https://github.com/xpirience-infra/kanzen-sdk/commit/742470d))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.4.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.3.0...v1.4.0)

### 🚀 Enhancements

- Add lock method ([a8d9506](https://github.com/xpirience-infra/kanzen-sdk/commit/a8d9506))
- Add contact method ([3786583](https://github.com/xpirience-infra/kanzen-sdk/commit/3786583))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.3.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.1.0...v1.3.0)

### 🚀 Enhancements

- **client:** Update account interface ([04e78b9](https://github.com/xpirience-infra/kanzen-sdk/commit/04e78b9))

### 🏡 Chore

- Fix github actions ([aa46458](https://github.com/xpirience-infra/kanzen-sdk/commit/aa46458))
- **release:** V1.1.0 ([8e20674](https://github.com/xpirience-infra/kanzen-sdk/commit/8e20674))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.2.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.1.0...v1.2.0)

### 🚀 Enhancements

- **client:** Update account interface ([04e78b9](https://github.com/xpirience-infra/kanzen-sdk/commit/04e78b9))

### 🏡 Chore

- Fix github actions ([aa46458](https://github.com/xpirience-infra/kanzen-sdk/commit/aa46458))
- **release:** V1.1.0 ([8e20674](https://github.com/xpirience-infra/kanzen-sdk/commit/8e20674))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.1.0

[compare changes](https://github.com/xpirience-infra/kanzen-sdk/compare/v1.1.0...v1.1.0)

### 🚀 Enhancements

- **client:** Update account interface ([04e78b9](https://github.com/xpirience-infra/kanzen-sdk/commit/04e78b9))

### 🏡 Chore

- Fix github actions ([aa46458](https://github.com/xpirience-infra/kanzen-sdk/commit/aa46458))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

## v1.1.0


### 🚀 Enhancements

- Init commit ([27667a5](https://github.com/xpirience-infra/kanzen-sdk/commit/27667a5))

### ❤️ Contributors

- Tristan SCHWENK <tristan.schwenk@ezyostudio.com>

