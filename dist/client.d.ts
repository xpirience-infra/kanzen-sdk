import type { IncomingMessage, ServerResponse } from "node:http";
import { getBetterAuthProviderConfig, getNextAuthProviderConfig } from "./features/auth.js";
import type { KanzenClientOptions, KanzenAccountPayload, KanzenAccountResponse, KanzenLockPayload, KanzenLockResponse, KanzenContactPayload, KanzenContactResponse, KanzenSepaMandate, KanzenCreateSepaMandatePayload, KanzenUpdateSepaMandatePayload, KanzenSepaSigningRequest, KanzenCreateSepaSigningRequestPayload, KanzenListSepaSigningRequestsFilter, KanzenSignedUrl, KanzenPaymentMethod, KanzenProjectStatus, KanzenProjectInvoicingType, KanzenProject, KanzenCreateProjectPayload, KanzenUpdateProjectPayload } from "./types.js";
export { getBetterAuthProviderConfig, getNextAuthProviderConfig };
export declare class KanzenClient {
    private apiUrl;
    private apiKey;
    private webhookSecret?;
    private debugLevel;
    private logger;
    private options;
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
     * Returns the full options object (including event handlers).
     * @internal
     */
    getOptions(): KanzenClientOptions;
    /**
     * Logs a message with context according to debug levels.
     * @internal
     */
    log(level: "info" | "verbose" | "trace", message: string, meta?: any): void;
    /**
     * fetch with the client timeout (`timeoutMs`, 30000 by default), combined with the caller's
     * signal if any. A timeout or a network failure throws a KanzenApiError.
     * @internal
     */
    fetchWithTimeout(url: string, init: RequestInit, label: string): Promise<Response>;
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
     * List the SEPA mandates of an account
     */
    listSepaMandates(accountId: string): Promise<KanzenSepaMandate[]>;
    /**
     * Create a SEPA mandate on an account
     */
    createSepaMandate(accountId: string, payload?: KanzenCreateSepaMandatePayload): Promise<KanzenSepaMandate>;
    /**
     * Get a short-lived URL to download the mandate PDF (unsigned)
     */
    getSepaMandatePdfUrl(mandateId: string): Promise<KanzenSignedUrl>;
    /**
     * Upload the signed copy of a mandate (PDF, PNG or JPEG).
     * The mandate becomes SIGNED.
     */
    uploadSignedSepaMandate(mandateId: string, file: Buffer | Blob, filename: string, externalActor?: string): Promise<KanzenSepaMandate>;
    /**
     * Get a short-lived URL to download the signed copy of a mandate.
     * With `options.accountId`, a covered account (a site) opens its parent's signed mandate
     * with its own rights; Kanzen returns 422 if the mandate does not cover that account.
     */
    getSignedSepaMandateUrl(mandateId: string, options?: {
        accountId?: string;
    }): Promise<KanzenSignedUrl>;
    /**
     * Update a mandate (status, bank details, external actor)
     */
    updateSepaMandate(mandateId: string, payload: KanzenUpdateSepaMandatePayload): Promise<KanzenSepaMandate>;
    /**
     * Add descendant accounts to the accounts a mandate covers.
     * A site joining a signed mandate needs no new signature: Kanzen copies the IBAN/BIC.
     */
    addSepaMandateCoveredAccounts(mandateId: string, accountIds: string[]): Promise<KanzenSepaMandate>;
    /**
     * Remove an account from the accounts a mandate covers (never the debtor account)
     */
    removeSepaMandateCoveredAccount(mandateId: string, accountId: string): Promise<KanzenSepaMandate>;
    /**
     * Send one or more mandates to a contact for signature.
     * The contact gets one e-mail link to a Kanzen-hosted signing page.
     */
    createSepaSigningRequest(payload: KanzenCreateSepaSigningRequestPayload): Promise<KanzenSepaSigningRequest>;
    /**
     * List the signing requests of an account or of a mandate
     */
    listSepaSigningRequests(filter: KanzenListSepaSigningRequestsFilter): Promise<KanzenSepaSigningRequest[]>;
    /**
     * Send a new link for an open request (the previous link stops working)
     */
    resendSepaSigningRequest(requestId: string): Promise<KanzenSepaSigningRequest>;
    /**
     * Cancel an open request (its link stops working)
     */
    cancelSepaSigningRequest(requestId: string): Promise<KanzenSepaSigningRequest>;
    /**
     * Verify HMAC-SHA256 signature for incoming webhooks
     */
    verifyWebhookSignature(rawBody: string, signature: string): boolean;
    /**
     * Handle an inbound webhook request from Kanzen.
     *
     * Reads the raw body from the Node.js request stream, verifies the
     * HMAC-SHA256 signature, parses the payload and dispatches to the
     * matching event handler (onAccountCreated, onContactUpdated, etc.).
     *
     * ⚠️ Use this only when the request body stream has NOT been consumed yet
     * (e.g. plain Node.js HTTP server, Express without body-parser before this route).
     * For Adonis v6, use handleRaw() instead.
     *
     * @example — Express (no body-parser before route)
     * ```ts
     * app.post('/webhooks/kanzen', (req, res) => kanzen.handle(req, res))
     * ```
     */
    handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
    /**
     * Handle an inbound webhook request from Kanzen when the body has already
     * been read by a framework (e.g. Adonis v6 body parser).
     *
     * Verifies the HMAC-SHA256 signature against the pre-read raw body string,
     * parses the payload and dispatches to the matching event handler.
     *
     * @param rawBody    The raw request body as a string (from request.raw())
     * @param signature  The value of the x-kanzen-signature header
     * @param res        The Node.js ServerResponse to write the HTTP response to
     *
     * @example — Adonis v6
     * ```ts
     * async handle({ request, response }: HttpContext) {
     *   const rawBody = request.raw() ?? ''
     *   const signature = request.header('x-kanzen-signature') ?? ''
     *   await kanzenService.handleInboundWebhook(rawBody, signature, response.response)
     * }
     * ```
     */
    handleRaw(rawBody: string, signature: string, res: ServerResponse): Promise<void>;
    /**
     * List the payment methods, optionally filtered by value
     */
    listPaymentMethods(filter?: {
        value?: string;
    }): Promise<KanzenPaymentMethod[]>;
    /**
     * List the project statuses, optionally filtered by value
     */
    listProjectStatuses(filter?: {
        value?: string;
    }): Promise<KanzenProjectStatus[]>;
    /**
     * List the project invoicing types
     */
    listProjectInvoicingTypes(): Promise<KanzenProjectInvoicingType[]>;
    /**
     * Create a project
     */
    createProject(payload: KanzenCreateProjectPayload): Promise<KanzenProject>;
    /**
     * Update a project and its milestones (only the fields given are sent)
     */
    updateProject(id: string, payload: KanzenUpdateProjectPayload): Promise<KanzenProject>;
    /**
     * Get a project, with its milestones when it has some
     */
    getProject(id: string): Promise<KanzenProject>;
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
