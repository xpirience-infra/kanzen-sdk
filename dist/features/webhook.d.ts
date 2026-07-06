import type { KanzenClient } from "../client.js";
/**
 * Verify HMAC-SHA256 signature for incoming webhooks
 */
export declare function verifyWebhookSignature(client: KanzenClient, rawBody: string, signature: string): boolean;
