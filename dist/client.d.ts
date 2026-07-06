import { getBetterAuthProviderConfig, getNextAuthProviderConfig } from "./features/auth.js";
import type { KanzenClientOptions, KanzenAccountPayload, KanzenAccountResponse, KanzenLockPayload, KanzenLockResponse, KanzenContactPayload, KanzenContactResponse } from "./types.js";
export { getBetterAuthProviderConfig, getNextAuthProviderConfig };
export declare class KanzenClient {
    private apiUrl;
    private apiKey;
    private webhookSecret?;
    private debugLevel;
    private logger;
    constructor(options: KanzenClientOptions);
    /**
     * Returns the API URL.
     * @internal
     */
    getApiUrl(): string;
    /**
     * Returns the configured webhook secret.
     * @internal
     */
    getWebhookSecret(): string | undefined;
    /**
     * Logs a message with context according to debug levels.
     * @internal
     */
    log(level: "info" | "verbose" | "trace", message: string, meta?: any): void;
    /**
     * Helper to make authenticated HTTP requests to Kanzen API
     * @internal
     */
    request<T>(path: string, options?: RequestInit): Promise<T>;
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
     * Generates the URL to redirect users to in order to start the OAuth flow.
     */
    getOAuthAuthorizationUrl(params: {
        redirectUri: string;
        clientId: string;
        state?: string;
        scopes?: string[];
    }): string;
    /**
     * Exchanges the code received in the redirect callback for the user's profile.
     */
    exchangeOAuthCodeForProfile(params: {
        code: string;
        redirectUri: string;
        clientId: string;
        clientSecret?: string;
    }): Promise<any>;
}
