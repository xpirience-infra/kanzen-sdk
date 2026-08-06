import type { IncomingMessage, ServerResponse } from 'node:http';
import type { KanzenClient } from '../client.js';
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
export declare function handleIncomingWebhook(client: KanzenClient, req: IncomingMessage, res: ServerResponse): Promise<void>;
/**
 * Handles a Kanzen webhook when the body has already been read by the
 * framework's body parser (e.g. Adonis v6).
 *
 * Skips the stream-reading step and works directly with the raw string.
 *
 * @internal — called by KanzenClient.handleRaw()
 */
export declare function handleIncomingWebhookRaw(client: KanzenClient, rawBody: string, signature: string, res: ServerResponse): Promise<void>;
