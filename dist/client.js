"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanzenClient = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
class KanzenClient {
    apiUrl;
    apiKey;
    webhookSecret;
    constructor(options) {
        this.apiUrl = options.apiUrl.replace(/\/$/, '');
        this.apiKey = options.apiKey;
        this.webhookSecret = options.webhookSecret;
    }
    /**
     * Helper to make authenticated HTTP requests to Kanzen API
     */
    async request(path, options = {}) {
        const url = `${this.apiUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            ...options.headers,
        };
        const response = await fetch(url, {
            ...options,
            headers,
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Kanzen API Error (${response.status}): ${errorText}`);
        }
        if (response.status === 204) {
            return null;
        }
        return response.json();
    }
    /**
     * Create a single Account (Client, Group, or Site) in Kanzen
     */
    async createAccount(payload) {
        return this.request('/accounts', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    /**
     * Update an existing Account in Kanzen
     */
    async updateAccount(id, payload) {
        return this.request(`/accounts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }
    /**
     * Delete (soft-delete) an Account in Kanzen
     */
    async deleteAccount(id) {
        return this.request(`/accounts/${id}`, {
            method: 'DELETE',
        });
    }
    /**
     * Acquire a lock on an entity in Kanzen
     */
    async acquireLock(payload) {
        return this.request('/locks', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    /**
     * Extend a lock on an entity in Kanzen
     */
    async extendLock(payload) {
        return this.request('/locks', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }
    /**
     * Release a lock on an entity in Kanzen
     */
    async releaseLock(payload) {
        return this.request('/locks', {
            method: 'DELETE',
            body: JSON.stringify(payload),
        });
    }
    /**
     * Get a Contact from Kanzen
     */
    async getContact(id) {
        return this.request(`/contacts/${id}`, {
            method: 'GET',
        });
    }
    /**
     * Create a Contact in Kanzen
     */
    async createContact(payload) {
        return this.request('/contacts', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    /**
     * Update an existing Contact in Kanzen
     */
    async updateContact(id, payload) {
        return this.request(`/contacts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }
    /**
     * Delete a Contact in Kanzen
     */
    async deleteContact(id) {
        return this.request(`/contacts/${id}`, {
            method: 'DELETE',
        });
    }
    /**
     * Detach a Contact from an Account in Kanzen
     */
    async detachContact(id, accountId) {
        return this.request(`/contacts/${id}/detach`, {
            method: 'DELETE',
            body: JSON.stringify({ accountId }),
        });
    }
    /**
     * Verify HMAC-SHA256 signature for incoming webhooks
     */
    verifyWebhookSignature(rawBody, signature) {
        if (!this.webhookSecret) {
            throw new Error('Webhook secret is not configured in KanzenClient options');
        }
        const computedSignature = node_crypto_1.default
            .createHmac('sha256', this.webhookSecret)
            .update(rawBody)
            .digest('hex');
        if (computedSignature.length !== signature.length) {
            return false;
        }
        return node_crypto_1.default.timingSafeEqual(Buffer.from(computedSignature, 'utf-8'), Buffer.from(signature, 'utf-8'));
    }
}
exports.KanzenClient = KanzenClient;
