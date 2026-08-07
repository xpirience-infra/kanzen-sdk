"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIncomingWebhook = handleIncomingWebhook;
exports.handleIncomingWebhookRaw = handleIncomingWebhookRaw;
const node_crypto_1 = __importDefault(require("node:crypto"));
// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
/**
 * Reads the full raw body from an IncomingMessage stream and returns it as a
 * UTF-8 string. This must be done before any body-parsing middleware runs, so
 * that the original bytes are available for HMAC verification.
 */
function collectRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        req.on('error', reject);
    });
}
/**
 * Sends a JSON response and ends the stream.
 */
function sendJson(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
    });
    res.end(payload);
}
// ──────────────────────────────────────────────────────────────────────────────
// Core handler
// ──────────────────────────────────────────────────────────────────────────────
/**
 * Handles a single inbound webhook request from Kanzen.
 *
 * Flow:
 *  1. Reads raw body from the request stream
 *  2. Reads the `x-kanzen-signature` header
 *  3. Verifies the HMAC-SHA256 signature against the configured webhookSecret
 *  4. Parses the JSON body into a KanzenWebhookPayload discriminated union
 *  5. Dispatches to the matching event handler configured in KanzenClientOptions
 *  6. Responds 200 on success, 401 on bad signature, 500 on handler error
 *
 * @internal — called by KanzenClient.handle()
 */
async function handleIncomingWebhook(client, req, res) {
    // ── 1. Read raw body ──────────────────────────────────────────────────────
    let rawBody;
    try {
        rawBody = await collectRawBody(req);
    }
    catch (err) {
        client.log('info', `[webhook] Failed to read request body: ${err.message}`);
        sendJson(res, 400, { error: 'Failed to read request body' });
        return;
    }
    if (!rawBody) {
        sendJson(res, 400, { error: 'Empty request body' });
        return;
    }
    // ── 2. Read signature header ──────────────────────────────────────────────
    const signature = Array.isArray(req.headers['x-kanzen-signature'])
        ? req.headers['x-kanzen-signature'][0]
        : req.headers['x-kanzen-signature'];
    if (!signature) {
        client.log('info', '[webhook] Missing x-kanzen-signature header');
        sendJson(res, 401, { error: 'Missing Kanzen signature header (x-kanzen-signature)' });
        return;
    }
    // ── 3. Verify HMAC-SHA256 signature ──────────────────────────────────────
    const webhookSecret = client.getWebhookSecret();
    if (!webhookSecret) {
        client.log('info', '[webhook] webhookSecret not configured — cannot verify signature');
        sendJson(res, 500, { error: 'Webhook secret not configured on KanzenClient' });
        return;
    }
    const computedSignature = node_crypto_1.default
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
    let signatureValid;
    try {
        signatureValid =
            computedSignature.length === signature.length &&
                node_crypto_1.default.timingSafeEqual(Buffer.from(computedSignature, 'utf-8'), Buffer.from(signature, 'utf-8'));
    }
    catch {
        signatureValid = false;
    }
    if (!signatureValid) {
        client.log('info', '[webhook] Invalid signature — rejecting request');
        sendJson(res, 401, { error: 'Invalid Kanzen signature' });
        return;
    }
    client.log('verbose', '[webhook] Signature verified ✓');
    // ── 4. Parse JSON payload ─────────────────────────────────────────────────
    let payload;
    try {
        payload = JSON.parse(rawBody);
    }
    catch (err) {
        client.log('info', `[webhook] Failed to parse JSON body: ${err.message}`);
        sendJson(res, 400, { error: 'Invalid JSON body' });
        return;
    }
    if (!payload.event || !('data' in payload)) {
        sendJson(res, 400, { error: 'Invalid webhook payload structure' });
        return;
    }
    client.log('verbose', `[webhook] Received event: ${payload.event}`);
    client.log('trace', `[webhook] Payload`, { payload });
    // ── 5. Dispatch to handler ────────────────────────────────────────────────
    const options = client.getOptions();
    try {
        switch (payload.event) {
            case 'account.created':
                if (options.onAccountCreated) {
                    await options.onAccountCreated(payload.data);
                }
                break;
            case 'account.updated':
                if (options.onAccountUpdated) {
                    await options.onAccountUpdated(payload.data);
                }
                break;
            case 'account.deleted':
                if (options.onAccountDeleted) {
                    await options.onAccountDeleted(payload.data);
                }
                break;
            case 'account.locked':
                if (options.onAccountLocked) {
                    await options.onAccountLocked(payload.data);
                }
                break;
            case 'account.unlocked':
                if (options.onAccountUnlocked) {
                    await options.onAccountUnlocked(payload.data);
                }
                break;
            case 'account.lock_extended':
                if (options.onAccountLockExtended) {
                    await options.onAccountLockExtended(payload.data);
                }
                break;
            case 'contact.created':
                if (options.onContactCreated) {
                    await options.onContactCreated(payload.data);
                }
                break;
            case 'contact.updated':
                if (options.onContactUpdated) {
                    await options.onContactUpdated(payload.data);
                }
                break;
            case 'contact.deleted':
                if (options.onContactDeleted) {
                    await options.onContactDeleted(payload.data);
                }
                break;
            case 'contact.locked':
                if (options.onContactLocked) {
                    await options.onContactLocked(payload.data);
                }
                break;
            case 'contact.unlocked':
                if (options.onContactUnlocked) {
                    await options.onContactUnlocked(payload.data);
                }
                break;
            case 'contact.lock_extended':
                if (options.onContactLockExtended) {
                    await options.onContactLockExtended(payload.data);
                }
                break;
            default: {
                const unknownEvent = payload.event;
                client.log('info', `[webhook] Unknown event type: ${unknownEvent}`);
                if (options.onUnknownEvent) {
                    await options.onUnknownEvent(unknownEvent, payload.data);
                }
                break;
            }
        }
        // ── 6. Success ──────────────────────────────────────────────────────────
        client.log('verbose', `[webhook] Event ${payload.event} handled successfully`);
        sendJson(res, 200, { success: true });
    }
    catch (err) {
        client.log('info', `[webhook] Handler error for event ${payload.event}: ${err.message}`);
        sendJson(res, 500, { error: err.message || 'Internal Server Error' });
    }
}
// ──────────────────────────────────────────────────────────────────────────────
// Framework-aware variant (body pre-read by Adonis / Fastify / Hapi etc.)
// ──────────────────────────────────────────────────────────────────────────────
/**
 * Handles a Kanzen webhook when the body has already been read by the
 * framework's body parser (e.g. Adonis v6).
 *
 * Skips the stream-reading step and works directly with the raw string.
 *
 * @internal — called by KanzenClient.handleRaw()
 */
async function handleIncomingWebhookRaw(client, rawBody, signature, res) {
    if (!rawBody) {
        sendJson(res, 400, { error: 'Empty request body' });
        return;
    }
    if (!signature) {
        client.log('info', '[webhook] Missing x-kanzen-signature header');
        sendJson(res, 401, { error: 'Missing Kanzen signature header (x-kanzen-signature)' });
        return;
    }
    const webhookSecret = client.getWebhookSecret();
    if (!webhookSecret) {
        client.log('info', '[webhook] webhookSecret not configured — cannot verify signature');
        sendJson(res, 500, { error: 'Webhook secret not configured on KanzenClient' });
        return;
    }
    const computedSignature = node_crypto_1.default
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
    let signatureValid;
    try {
        signatureValid =
            computedSignature.length === signature.length &&
                node_crypto_1.default.timingSafeEqual(Buffer.from(computedSignature, 'utf-8'), Buffer.from(signature, 'utf-8'));
    }
    catch {
        signatureValid = false;
    }
    if (!signatureValid) {
        client.log('info', '[webhook] Invalid signature — rejecting request');
        sendJson(res, 401, { error: 'Invalid Kanzen signature' });
        return;
    }
    client.log('verbose', '[webhook] Signature verified ✓');
    let payload;
    try {
        payload = JSON.parse(rawBody);
    }
    catch (err) {
        client.log('info', `[webhook] Failed to parse JSON body: ${err.message}`);
        sendJson(res, 400, { error: 'Invalid JSON body' });
        return;
    }
    if (!payload.event || !('data' in payload)) {
        sendJson(res, 400, { error: 'Invalid webhook payload structure' });
        return;
    }
    client.log('verbose', `[webhook] Received event: ${payload.event}`);
    client.log('trace', `[webhook] Payload`, { payload });
    const options = client.getOptions();
    try {
        switch (payload.event) {
            case 'account.created':
                if (options.onAccountCreated)
                    await options.onAccountCreated(payload.data);
                break;
            case 'account.updated':
                if (options.onAccountUpdated)
                    await options.onAccountUpdated(payload.data);
                break;
            case 'account.deleted':
                if (options.onAccountDeleted)
                    await options.onAccountDeleted(payload.data);
                break;
            case 'account.locked':
                if (options.onAccountLocked)
                    await options.onAccountLocked(payload.data);
                break;
            case 'account.unlocked':
                if (options.onAccountUnlocked)
                    await options.onAccountUnlocked(payload.data);
                break;
            case 'account.lock_extended':
                if (options.onAccountLockExtended)
                    await options.onAccountLockExtended(payload.data);
                break;
            case 'contact.created':
                if (options.onContactCreated)
                    await options.onContactCreated(payload.data);
                break;
            case 'contact.updated':
                if (options.onContactUpdated)
                    await options.onContactUpdated(payload.data);
                break;
            case 'contact.deleted':
                if (options.onContactDeleted)
                    await options.onContactDeleted(payload.data);
                break;
            case 'contact.locked':
                if (options.onContactLocked)
                    await options.onContactLocked(payload.data);
                break;
            case 'contact.unlocked':
                if (options.onContactUnlocked)
                    await options.onContactUnlocked(payload.data);
                break;
            case 'contact.lock_extended':
                if (options.onContactLockExtended)
                    await options.onContactLockExtended(payload.data);
                break;
            default: {
                const unknownEvent = payload.event;
                client.log('info', `[webhook] Unknown event type: ${unknownEvent}`);
                if (options.onUnknownEvent)
                    await options.onUnknownEvent(unknownEvent, payload.data);
                break;
            }
        }
        client.log('verbose', `[webhook] Event ${payload.event} handled successfully`);
        sendJson(res, 200, { success: true });
    }
    catch (err) {
        client.log('info', `[webhook] Handler error for event ${payload.event}: ${err.message}`);
        sendJson(res, 500, { error: err.message || 'Internal Server Error' });
    }
}
