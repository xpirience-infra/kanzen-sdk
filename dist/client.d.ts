import type { KanzenClientOptions, KanzenAccountPayload, KanzenAccountResponse, KanzenLockPayload, KanzenLockResponse, KanzenContactPayload, KanzenContactResponse } from "./types.js";
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
     * Acquire a lock on an entity in Kanzen
     */
    acquireLock(payload: KanzenLockPayload): Promise<KanzenLockResponse>;
    /**
     * Extend a lock on an entity in Kanzen
     */
    extendLock(payload: KanzenLockPayload): Promise<KanzenLockResponse>;
    /**
     * Release a lock on an entity in Kanzen
     */
    releaseLock(payload: KanzenLockPayload): Promise<KanzenLockResponse>;
    /**
     * Get a Contact from Kanzen
     */
    getContact(id: string): Promise<KanzenContactResponse>;
    /**
     * Create a Contact in Kanzen
     */
    createContact(payload: KanzenContactPayload): Promise<KanzenContactResponse>;
    /**
     * Update an existing Contact in Kanzen
     */
    updateContact(id: string, payload: KanzenContactPayload): Promise<KanzenContactResponse>;
    /**
     * Delete a Contact in Kanzen
     */
    deleteContact(id: string): Promise<void>;
    /**
     * Detach a Contact from an Account in Kanzen
     */
    detachContact(id: string, accountId: string): Promise<void>;
    /**
     * Verify HMAC-SHA256 signature for incoming webhooks
     */
    verifyWebhookSignature(rawBody: string, signature: string): boolean;
    /**
     * Decodes and verifies a JWT SSO token issued by KANZen using RS256 JWKS
     */
    verifySsoToken(token: string, expectedAudience: string): Promise<any>;
}
