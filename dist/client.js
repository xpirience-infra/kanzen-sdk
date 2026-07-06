"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanzenClient = exports.getNextAuthProviderConfig = exports.getBetterAuthProviderConfig = void 0;
const utils_js_1 = require("./features/utils.js");
const accounts_js_1 = require("./features/accounts.js");
const locks_js_1 = require("./features/locks.js");
const contacts_js_1 = require("./features/contacts.js");
const webhook_js_1 = require("./features/webhook.js");
const auth_js_1 = require("./features/auth.js");
Object.defineProperty(exports, "getBetterAuthProviderConfig", { enumerable: true, get: function () { return auth_js_1.getBetterAuthProviderConfig; } });
Object.defineProperty(exports, "getNextAuthProviderConfig", { enumerable: true, get: function () { return auth_js_1.getNextAuthProviderConfig; } });
class KanzenClient {
    apiUrl;
    apiKey;
    webhookSecret;
    debugLevel = "none";
    logger;
    constructor(options) {
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
     * Helper to make authenticated HTTP requests to Kanzen API
     * @internal
     */
    async request(path, options = {}) {
        const url = `${this.apiUrl}${path}`;
        const headers = {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            ...options.headers,
        };
        const method = options.method || "GET";
        this.log("info", `Request start: ${method} ${path}`);
        this.log("verbose", `Request headers & body metadata`, { headers, bodyLength: options.body ? String(options.body).length : 0 });
        this.log("trace", `Request body payload`, { body: options.body });
        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers,
            });
        }
        catch (e) {
            this.log("info", `Request failed: ${method} ${path} - Error: ${e.message}`);
            throw e;
        }
        this.log("info", `Response status: ${response.status}`);
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Unknown error");
            this.log("verbose", `Response error body`, { body: errorText });
            throw new Error(`Kanzen API Error (${response.status}): ${errorText}`);
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
     * Verify HMAC-SHA256 signature for incoming webhooks
     */
    verifyWebhookSignature(rawBody, signature) {
        return (0, webhook_js_1.verifyWebhookSignature)(this, rawBody, signature);
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
