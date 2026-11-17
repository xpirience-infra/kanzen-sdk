# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@xpirience-infra/kanzen-sdk` is a TypeScript SDK for the Kanzen API, published to GitHub Packages (`npm.pkg.github.com`). One `KanzenClient` object handles outbound entity sync (accounts, contacts, locks), inbound webhook dispatch, and OAuth/OIDC helpers. The only optional peer dependency is `better-auth`. Do not add auth libraries as runtime dependencies.

## Commands

- `yarn build` — compile `src/` to `dist/` with `tsc`. This is also the only type check.
- `yarn release` — runs `bin/release.js`: `changelogen --bump` (bumps the version and updates `CHANGELOG.md` from conventional commits), then commits `chore(release): vX.Y.Z`, tags, and pushes with `--follow-tags`. The pushed `v*` tag triggers `.github/workflows/publish.yml`, which builds and runs `npm publish`.
- No test suite, linter or formatter is configured.

Node version: `.nvmrc` pins 22.20.0. CI uses Node 20. The package manager is Yarn 1.

## Architecture

- `src/client.ts` — `KanzenClient`. Every public method is a thin wrapper that delegates to a free function in `src/features/*.ts` and passes `this` as the first argument. The client exposes `@internal` accessors (`request`, `log`, `getApiUrl`, `getWebhookSecret`, `getOptions`) for those feature functions to use.
- `client.request<T>()` is the single HTTP path: it adds the `x-api-key` header, logs according to `debug` level, throws `Kanzen API Error (<status>): <body>` on non-2xx responses, and returns `null` on 204.
- `src/features/` holds one file per domain: `accounts`, `contacts`, `locks`, `auth` (OAuth URL/code exchange, plus the standalone `getBetterAuthProviderConfig` / `getNextAuthProviderConfig`, re-exported through `client.ts`), `webhook` (standalone signature verification), and `webhook_handler`.
- `src/types.ts` holds all public types. `KanzenWebhookPayload` is a discriminated union on `event`, and each event maps to an optional `on<Entity><Action>` callback in `KanzenClientOptions`.
- `src/index.ts` re-exports `KanzenClient`, the OAuth helpers and `types.ts`.

### Webhooks

`webhook_handler.ts` has two parallel implementations: `handleIncomingWebhook` (reads the raw stream from `IncomingMessage`, used by `client.handle()`) and `handleIncomingWebhookRaw` (body already read by a framework such as Adonis v6, used by `client.handleRaw()`). Both verify `x-kanzen-signature` (HMAC-SHA256 hex of the raw body, timing-safe compare), parse the payload, run the event `switch`, and write a JSON response (200/400/401/500) directly to the `ServerResponse`.

To add a webhook event, update all of these places:
1. Add a variant to `KanzenWebhookPayload` in `types.ts`.
2. Add the callback to `KanzenClientOptions`.
3. Add a `case` to **both** switch statements in `webhook_handler.ts`.
4. Update the README event table.

## Conventions

- ESM source with `module: NodeNext`: relative imports must use the `.js` extension (`./features/accounts.js`).
- `dist/` is committed to git. Run `yarn build` before a release so `dist/` matches `src/`.
- Commit messages use Conventional Commits with a scope (`feat(webhooks): ...`), because `changelogen` generates `CHANGELOG.md` from them.
- OAuth endpoints are under `<apiUrl>/api/auth/oauth2/{authorize,token,userinfo}` on the Kanzen side. `client_config_plan.md` is the original spec for the OAuth helpers.
