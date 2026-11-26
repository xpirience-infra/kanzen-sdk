"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanzenClient = exports.getNextAuthProviderConfig = exports.getBetterAuthProviderConfig = void 0;
const utils_js_1 = require("./features/utils.js");
const accounts_js_1 = require("./features/accounts.js");
const locks_js_1 = require("./features/locks.js");
const contacts_js_1 = require("./features/contacts.js");
const sepa_mandates_js_1 = require("./features/sepa_mandates.js");
const sepa_signing_requests_js_1 = require("./features/sepa_signing_requests.js");
const account_documents_js_1 = require("./features/account_documents.js");
const projects_js_1 = require("./features/projects.js");
const errors_js_1 = require("./errors.js");
const webhook_js_1 = require("./features/webhook.js");
const webhook_handler_js_1 = require("./features/webhook_handler.js");
const auth_js_1 = require("./features/auth.js");
Object.defineProperty(exports, "getBetterAuthProviderConfig", { enumerable: true, get: function () { return auth_js_1.getBetterAuthProviderConfig; } });
Object.defineProperty(exports, "getNextAuthProviderConfig", { enumerable: true, get: function () { return auth_js_1.getNextAuthProviderConfig; } });
class KanzenClient {
    apiUrl;
    apiKey;
    webhookSecret;
    debugLevel = "none";
    logger;
    options;
    constructor(options) {
        this.options = options;
        this.apiUrl = (0, utils_js_1.sanitizeApiUrl)(options.apiUrl);
        this.apiKey = options.apiKey;
        this.webhookSecret = options.webhookSecret;
        this.debugLevel = options.debug === true ? "verbose" : (options.debug || "none");
        this.logger = options.logger || ((level, message, meta) => {
            const prefix = `[kanzen-sdk] [${level.toUpperCase()}]`;
            if (meta !== undefined) {
                console.log(prefix, message, meta);
            }
            else {
                console.log(prefix, message);
            }
        });
        this.log("info", "Client initialized", { apiUrl: this.apiUrl });
    }
    /**
     * Returns the API URL.
     * @internal
     */
    getApiUrl() {
        return this.apiUrl;
    }
    /**
     * Returns the configured webhook secret.
     * @internal
     */
    getWebhookSecret() {
        return this.webhookSecret;
    }
    /**
     * Returns the full options object (including event handlers).
     * @internal
     */
    getOptions() {
        return this.options;
    }
    /**
     * Logs a message with context according to debug levels.
     * @internal
     */
    log(level, message, meta) {
        if (this.debugLevel === "none")
            return;
        const levels = { none: 0, info: 1, verbose: 2, trace: 3 };
        const currentWeight = levels[this.debugLevel];
        const messageWeight = levels[level];
        if (messageWeight <= currentWeight) {
            this.logger(level, message, meta);
        }
    }
    /**
     * fetch with the client timeout (`timeoutMs`, 30000 by default), combined with the caller's
     * signal if any. A timeout or a network failure throws a KanzenApiError.
     * @internal
     */
    async fetchWithTimeout(url, init, label) {
        const timeoutMs = this.options.timeoutMs ?? 30000;
        const timeoutSignal = AbortSignal.timeout(timeoutMs);
        const signal = init.signal
            ? AbortSignal.any([init.signal, timeoutSignal])
            : timeoutSignal;
        try {
            return await fetch(url, { ...init, signal });
        }
        catch (e) {
            this.log("info", `Request failed: ${label} - Error: ${e?.message}`);
            if (timeoutSignal.aborted) {
                throw new errors_js_1.KanzenApiError(`Kanzen API timeout after ${timeoutMs} ms (${label})`, {
                    status: null,
                    code: "TIMEOUT",
                });
            }
            // Aborted by the caller's own signal: not a network failure, pass it through
            if (init.signal?.aborted)
                throw e;
            throw new errors_js_1.KanzenApiError(`Kanzen API network error (${label}): ${e?.message}`, {
                status: null,
                code: "NETWORK",
            });
        }
    }
    /**
     * Helper to make authenticated HTTP requests to Kanzen API
     * @internal
     */
    async request(path, options = {}) {
        const url = `${this.apiUrl}${path}`;
        // For FormData bodies, fetch sets multipart/form-data with the boundary itself.
        const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
        const headers = {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            "x-api-key": this.apiKey,
            ...options.headers,
        };
        const method = options.method || "GET";
        this.log("info", `Request start: ${method} ${path}`);
        this.log("verbose", `Request headers & body metadata`, {
            headers,
            bodyLength: isFormData ? "multipart" : options.body ? String(options.body).length : 0,
        });
        this.log("trace", `Request body payload`, { body: options.body });
        const response = await this.fetchWithTimeout(url, { ...options, headers }, `${method} ${path}`);
        this.log("info", `Response status: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            this.log("verbose", `Response error body`, { body: errorText });
            throw new errors_js_1.KanzenApiError(`Kanzen API Error (${response.status}): ${errorText}`, {
                status: response.status,
                body: (0, errors_js_1.parseErrorBody)(errorText),
            });
        }
        if (response.status === 204) {
            this.log("verbose", `Response body: (204 No Content)`);
            return null;
        }
        const responseText = await response.text();
        this.log("verbose", `Response body size: ${responseText.length} bytes`);
        this.log("trace", `Response body payload`, { body: responseText });
        try {
            return JSON.parse(responseText);
        }
        catch (e) {
            throw new Error(`Failed to parse JSON response: ${e.message}`);
        }
    }
    /**
     * Create a single Account (Client, Group, or Site) in Kanzen
     */
    async createAccount(payload) {
        return (0, accounts_js_1.createAccount)(this, payload);
    }
    /**
     * Update an existing Account in Kanzen
     */
    async updateAccount(id, payload) {
        return (0, accounts_js_1.updateAccount)(this, id, payload);
    }
    /**
     * Delete (soft-delete) an Account in Kanzen
     */
    async deleteAccount(id) {
        return (0, accounts_js_1.deleteAccount)(this, id);
    }
    /**
     * Acquire a lock on an entity in Kanzen
     */
    async acquireLock(payload) {
        return (0, locks_js_1.acquireLock)(this, payload);
    }
    /**
     * Extend a lock on an entity in Kanzen
     */
    async extendLock(payload) {
        return (0, locks_js_1.extendLock)(this, payload);
    }
    /**
     * Release a lock on an entity in Kanzen
     */
    async releaseLock(payload) {
        return (0, locks_js_1.releaseLock)(this, payload);
    }
    /**
     * Get a Contact from Kanzen
     */
    async getContact(id) {
        return (0, contacts_js_1.getContact)(this, id);
    }
    /**
     * Create a Contact in Kanzen
     */
    async createContact(payload) {
        return (0, contacts_js_1.createContact)(this, payload);
    }
    /**
     * Update an existing Contact in Kanzen
     */
    async updateContact(id, payload) {
        return (0, contacts_js_1.updateContact)(this, id, payload);
    }
    /**
     * Delete a Contact in Kanzen
     */
    async deleteContact(id) {
        return (0, contacts_js_1.deleteContact)(this, id);
    }
    /**
     * Detach a Contact from an Account in Kanzen
     */
    async detachContact(id, accountId) {
        return (0, contacts_js_1.detachContact)(this, id, accountId);
    }
    /**
     * List the SEPA mandates of an account
     */
    async listSepaMandates(accountId) {
        return (0, sepa_mandates_js_1.listSepaMandates)(this, accountId);
    }
    /**
     * Create a SEPA mandate on an account
     */
    async createSepaMandate(accountId, payload) {
        return (0, sepa_mandates_js_1.createSepaMandate)(this, accountId, payload);
    }
    /**
     * Get a short-lived URL to download the mandate PDF (unsigned)
     */
    async getSepaMandatePdfUrl(mandateId) {
        return (0, sepa_mandates_js_1.getSepaMandatePdfUrl)(this, mandateId);
    }
    /**
     * Upload the signed copy of a mandate (PDF, PNG or JPEG).
     * The mandate becomes SIGNED.
     */
    async uploadSignedSepaMandate(mandateId, file, filename, externalActor) {
        return (0, sepa_mandates_js_1.uploadSignedSepaMandate)(this, mandateId, file, filename, externalActor);
    }
    /**
     * Get a short-lived URL to download the signed copy of a mandate.
     * With `options.accountId`, a covered account (a site) opens its parent's signed mandate
     * with its own rights; Kanzen returns 422 if the mandate does not cover that account.
     */
    async getSignedSepaMandateUrl(mandateId, options) {
        return (0, sepa_mandates_js_1.getSignedSepaMandateUrl)(this, mandateId, options);
    }
    /**
     * Update a mandate (status, bank details, external actor)
     */
    async updateSepaMandate(mandateId, payload) {
        return (0, sepa_mandates_js_1.updateSepaMandate)(this, mandateId, payload);
    }
    /**
     * Add descendant accounts to the accounts a mandate covers.
     * A site joining a signed mandate needs no new signature: Kanzen copies the IBAN/BIC.
     */
    async addSepaMandateCoveredAccounts(mandateId, accountIds) {
        return (0, sepa_mandates_js_1.addSepaMandateCoveredAccounts)(this, mandateId, accountIds);
    }
    /**
     * Remove an account from the accounts a mandate covers (never the debtor account)
     */
    async removeSepaMandateCoveredAccount(mandateId, accountId) {
        return (0, sepa_mandates_js_1.removeSepaMandateCoveredAccount)(this, mandateId, accountId);
    }
    /**
     * Upload one or more files to the document folder of an account (client, group or site),
     * or to its subfolder `options.folder` (created on first use).
     * Kanzen refuses (422) a file type outside its list, more than 10 files, or a file over 20 MB.
     */
    async uploadAccountDocument(accountId, files, options) {
        return (0, account_documents_js_1.uploadAccountDocument)(this, accountId, files, options);
    }
    /**
     * List the files of the document folder of an account, newest first,
     * or only those of its subfolder `options.folder`
     */
    async listAccountDocuments(accountId, options) {
        return (0, account_documents_js_1.listAccountDocuments)(this, accountId, options);
    }
    /**
     * Get a short-lived (10 minutes) download link of a document of an account
     */
    async getDocumentUrl(documentId) {
        return (0, account_documents_js_1.getDocumentUrl)(this, documentId);
    }
    /**
     * Send one or more mandates to a contact for signature.
     * The contact gets one e-mail link to a Kanzen-hosted signing page.
     */
    async createSepaSigningRequest(payload) {
        return (0, sepa_signing_requests_js_1.createSepaSigningRequest)(this, payload);
    }
    /**
     * List the signing requests of an account or of a mandate
     */
    async listSepaSigningRequests(filter) {
        return (0, sepa_signing_requests_js_1.listSepaSigningRequests)(this, filter);
    }
    /**
     * Send a new link for an open request (the previous link stops working)
     */
    async resendSepaSigningRequest(requestId) {
        return (0, sepa_signing_requests_js_1.resendSepaSigningRequest)(this, requestId);
    }
    /**
     * Cancel an open request (its link stops working)
     */
    async cancelSepaSigningRequest(requestId) {
        return (0, sepa_signing_requests_js_1.cancelSepaSigningRequest)(this, requestId);
    }
    /**
     * Verify HMAC-SHA256 signature for incoming webhooks
     */
    verifyWebhookSignature(rawBody, signature) {
        return (0, webhook_js_1.verifyWebhookSignature)(this, rawBody, signature);
    }
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
    async handle(req, res) {
        if (!this.webhookSecret) {
            throw new Error("[KanzenClient] webhookSecret must be configured to use handle(). " +
                "Pass it in KanzenClientOptions when creating the client.");
        }
        return (0, webhook_handler_js_1.handleIncomingWebhook)(this, req, res);
    }
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
    async handleRaw(rawBody, signature, res) {
        if (!this.webhookSecret) {
            throw new Error("[KanzenClient] webhookSecret must be configured to use handleRaw(). " +
                "Pass it in KanzenClientOptions when creating the client.");
        }
        return (0, webhook_handler_js_1.handleIncomingWebhookRaw)(this, rawBody, signature, res);
    }
    /**
     * List the payment methods, optionally filtered by value
     */
    async listPaymentMethods(filter) {
        return (0, projects_js_1.listPaymentMethods)(this, filter);
    }
    /**
     * List the project statuses, optionally filtered by value
     */
    async listProjectStatuses(filter) {
        return (0, projects_js_1.listProjectStatuses)(this, filter);
    }
    /**
     * List the project invoicing types
     */
    async listProjectInvoicingTypes() {
        return (0, projects_js_1.listProjectInvoicingTypes)(this);
    }
    /**
     * Create a project
     */
    async createProject(payload) {
        return (0, projects_js_1.createProject)(this, payload);
    }
    /**
     * Update a project and its milestones (only the fields given are sent)
     */
    async updateProject(id, payload) {
        return (0, projects_js_1.updateProject)(this, id, payload);
    }
    /**
     * Get a project, with its milestones when it has some
     */
    async getProject(id) {
        return (0, projects_js_1.getProject)(this, id);
    }
    /**
     * Generates the URL to redirect users to in order to start the OAuth flow.
     */
    getOAuthAuthorizationUrl(params) {
        return (0, auth_js_1.getOAuthAuthorizationUrl)(this, params);
    }
    /**
     * Exchanges the code received in the redirect callback for the user's profile.
     */
    async exchangeOAuthCodeForProfile(params) {
        return (0, auth_js_1.exchangeOAuthCodeForProfile)(this, params);
    }
}
exports.KanzenClient = KanzenClient;
