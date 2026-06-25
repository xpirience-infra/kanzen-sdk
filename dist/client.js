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
    debugLevel = "none";
    logger;
    constructor(options) {
        this.apiUrl = options.apiUrl.replace(/\/$/, "");
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
        return this.request("/accounts", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
    /**
     * Update an existing Account in Kanzen
     */
    async updateAccount(id, payload) {
        return this.request(`/accounts/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    }
    /**
     * Delete (soft-delete) an Account in Kanzen
     */
    async deleteAccount(id) {
        return this.request(`/accounts/${id}`, {
            method: "DELETE",
        });
    }
    /**
     * Acquire a lock on an entity in Kanzen
     */
    async acquireLock(payload) {
        return this.request("/locks", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
    /**
     * Extend a lock on an entity in Kanzen
     */
    async extendLock(payload) {
        return this.request("/locks", {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    }
    /**
     * Release a lock on an entity in Kanzen
     */
    async releaseLock(payload) {
        return this.request("/locks", {
            method: "DELETE",
            body: JSON.stringify(payload),
        });
    }
    /**
     * Get a Contact from Kanzen
     */
    async getContact(id) {
        return this.request(`/contacts/${id}`, {
            method: "GET",
        });
    }
    /**
     * Create a Contact in Kanzen
     */
    async createContact(payload) {
        return this.request("/contacts", {
            method: "POST",
            body: JSON.stringify(payload),
        });
    }
    /**
     * Update an existing Contact in Kanzen
     */
    async updateContact(id, payload) {
        return this.request(`/contacts/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    }
    /**
     * Delete a Contact in Kanzen
     */
    async deleteContact(id) {
        return this.request(`/contacts/${id}`, {
            method: "DELETE",
        });
    }
    /**
     * Detach a Contact from an Account in Kanzen
     */
    async detachContact(id, accountId) {
        return this.request(`/contacts/${id}/detach`, {
            method: "DELETE",
            body: JSON.stringify({ accountId }),
        });
    }
    /**
     * Verify HMAC-SHA256 signature for incoming webhooks
     */
    verifyWebhookSignature(rawBody, signature) {
        if (!this.webhookSecret) {
            throw new Error("Webhook secret is not configured in KanzenClient options");
        }
        const computedSignature = node_crypto_1.default
            .createHmac("sha256", this.webhookSecret)
            .update(rawBody)
            .digest("hex");
        if (computedSignature.length !== signature.length) {
            return false;
        }
        return node_crypto_1.default.timingSafeEqual(Buffer.from(computedSignature, "utf-8"), Buffer.from(signature, "utf-8"));
    }
    /**
     * Decodes and verifies a JWT SSO token issued by KANZen using RS256 JWKS
     */
    async verifySsoToken(token, expectedAudience) {
        this.log("info", "SSO token verification initiated", { expectedAudience });
        if (!token || typeof token !== "string") {
            this.log("info", "SSO verification failed: Invalid token format");
            throw new Error("Invalid token format");
        }
        const parts = token.split(".");
        if (parts.length !== 3) {
            this.log("info", "SSO verification failed: Invalid JWT format");
            throw new Error("Invalid JWT format");
        }
        const [headerB64, payloadB64, signatureB64] = parts;
        // 1. Decode header to find Key ID (kid)
        let header;
        try {
            header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
            this.log("trace", "Decoded JWT header", { header });
        }
        catch (e) {
            this.log("info", `SSO verification failed: Failed to parse JWT header - ${e.message}`);
            throw new Error(`Failed to parse JWT header: ${e.message}`);
        }
        const kid = header.kid;
        if (!kid) {
            this.log("info", "SSO verification failed: JWT header missing Key ID (kid)");
            throw new Error("JWT header is missing key ID (kid)");
        }
        // 2. Fetch JWKS public key from KANZen instance
        let jwks;
        try {
            this.log("verbose", `Fetching JWKS to locate kid: ${kid}`);
            jwks = await this.request("/integrations/privateApplications/jwks", {
                method: "POST",
            });
            this.log("trace", "Fetched JWKS keys", { keys: jwks?.keys });
        }
        catch (e) {
            this.log("info", `SSO verification failed: Failed to retrieve JWKS - ${e.message}`);
            throw new Error(`Failed to retrieve JWKS from KANZen: ${e.message}`);
        }
        if (!jwks?.keys || !Array.isArray(jwks.keys)) {
            this.log("info", "SSO verification failed: Invalid JWKS response structure");
            throw new Error("Invalid JWKS response from KANZen");
        }
        const keyObj = jwks.keys.find((k) => k.kid === kid);
        if (!keyObj || !keyObj.pem) {
            this.log("info", `SSO verification failed: Public key for kid "${kid}" not found in JWKS`);
            throw new Error(`Public key for kid "${kid}" not found in JWKS`);
        }
        const publicKey = keyObj.pem;
        this.log("trace", `Matching JWK PEM found`, { kid, pem: publicKey });
        // 3. Verify signature using RS256
        const verifyInput = `${headerB64}.${payloadB64}`;
        const signature = Buffer.from(signatureB64, "base64url");
        this.log("trace", "Verifying signature via crypto.verify");
        const isValid = node_crypto_1.default.verify("SHA256", Buffer.from(verifyInput), publicKey, signature);
        if (!isValid) {
            this.log("info", "SSO verification failed: Invalid JWT signature");
            throw new Error("Invalid JWT signature");
        }
        // 4. Decode and check claims
        let payload;
        try {
            payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
            this.log("trace", "Decoded JWT payload", { payload });
        }
        catch (e) {
            this.log("info", `SSO verification failed: Failed to parse JWT payload - ${e.message}`);
            throw new Error(`Failed to parse JWT payload: ${e.message}`);
        }
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && now > payload.exp) {
            this.log("info", `SSO verification failed: Token expired (exp: ${payload.exp}, current: ${now})`);
            throw new Error("JWT token is expired");
        }
        if (payload.iss !== "kanzen-sso") {
            this.log("info", `SSO verification failed: Issuer mismatch (iss: ${payload.iss}, expected: kanzen-sso)`);
            throw new Error(`Invalid token issuer: ${payload.iss}`);
        }
        if (expectedAudience && payload.aud !== expectedAudience) {
            this.log("info", `SSO verification failed: Audience mismatch (aud: ${payload.aud}, expected: ${expectedAudience})`);
            throw new Error(`Audience mismatch: expected "${expectedAudience}", got "${payload.aud}"`);
        }
        this.log("verbose", "SSO token verification succeeded", { iss: payload.iss, aud: payload.aud, email: payload.email });
        return payload;
    }
}
exports.KanzenClient = KanzenClient;
