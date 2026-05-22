import type { KanzenClientOptions, KanzenAccountPayload, KanzenAccountResponse } from './types.js';
export declare class KanzenClient {
    private apiUrl;
    private apiKey;
    private webhookSecret?;
    constructor(options: KanzenClientOptions);
    /**
     * Helper to make authenticated HTTP requests to Kanzen API
     */
    private request;
    /**
     * Create a single Account (Client, Group, or Site) in Kanzen
     */
    createAccount(payload: KanzenAccountPayload): Promise<KanzenAccountResponse>;
    /**
     * Update an existing Account in Kanzen
     */
    updateAccount(id: string, payload: KanzenAccountPayload): Promise<KanzenAccountResponse>;
    /**
     * Delete (soft-delete) an Account in Kanzen
     */
    deleteAccount(id: string): Promise<void>;
    /**
     * Batch synchronize accounts (creates or updates)
     * Kanzen maps local IDs to Kanzen IDs.
     */
    batchSyncAccounts(accounts: Array<KanzenAccountPayload & {
        localId: string;
    }>): Promise<{
        results: Array<{
            localId: string;
            kanzenId?: string;
            success: boolean;
            error?: string;
        }>;
    }>;
    /**
     * Verify HMAC-SHA256 signature for incoming webhooks
     */
    verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
