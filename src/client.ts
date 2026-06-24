import crypto from "node:crypto";
import type {
  KanzenClientOptions,
  KanzenAccountPayload,
  KanzenAccountResponse,
  KanzenLockPayload,
  KanzenLockResponse,
  KanzenContactPayload,
  KanzenContactResponse,
} from "./types.js";

export class KanzenClient {
  private apiUrl: string;
  private apiKey: string;
  private webhookSecret?: string;

  constructor(options: KanzenClientOptions) {
    this.apiUrl = options.apiUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.webhookSecret = options.webhookSecret;
  }

  /**
   * Helper to make authenticated HTTP requests to Kanzen API
   */
  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.apiUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Kanzen API Error (${response.status}): ${errorText}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Create a single Account (Client, Group, or Site) in Kanzen
   */
  async createAccount(
    payload: KanzenAccountPayload,
  ): Promise<KanzenAccountResponse> {
    return this.request<KanzenAccountResponse>("/accounts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Update an existing Account in Kanzen
   */
  async updateAccount(
    id: string,
    payload: KanzenAccountPayload,
  ): Promise<KanzenAccountResponse> {
    return this.request<KanzenAccountResponse>(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Delete (soft-delete) an Account in Kanzen
   */
  async deleteAccount(id: string): Promise<void> {
    return this.request<void>(`/accounts/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Acquire a lock on an entity in Kanzen
   */
  async acquireLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return this.request<KanzenLockResponse>("/locks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Extend a lock on an entity in Kanzen
   */
  async extendLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return this.request<KanzenLockResponse>("/locks", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Release a lock on an entity in Kanzen
   */
  async releaseLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return this.request<KanzenLockResponse>("/locks", {
      method: "DELETE",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get a Contact from Kanzen
   */
  async getContact(id: string): Promise<KanzenContactResponse> {
    return this.request<KanzenContactResponse>(`/contacts/${id}`, {
      method: "GET",
    });
  }

  /**
   * Create a Contact in Kanzen
   */
  async createContact(
    payload: KanzenContactPayload,
  ): Promise<KanzenContactResponse> {
    return this.request<KanzenContactResponse>("/contacts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Update an existing Contact in Kanzen
   */
  async updateContact(
    id: string,
    payload: KanzenContactPayload,
  ): Promise<KanzenContactResponse> {
    return this.request<KanzenContactResponse>(`/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Delete a Contact in Kanzen
   */
  async deleteContact(id: string): Promise<void> {
    return this.request<void>(`/contacts/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Detach a Contact from an Account in Kanzen
   */
  async detachContact(id: string, accountId: string): Promise<void> {
    return this.request<void>(`/contacts/${id}/detach`, {
      method: "DELETE",
      body: JSON.stringify({ accountId }),
    });
  }

  /**
   * Verify HMAC-SHA256 signature for incoming webhooks
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) {
      throw new Error(
        "Webhook secret is not configured in KanzenClient options",
      );
    }

    const computedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (computedSignature.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, "utf-8"),
      Buffer.from(signature, "utf-8"),
    );
  }

  /**
   * Decodes and verifies a JWT SSO token issued by KANZen using RS256 JWKS
   */
  async verifySsoToken(token: string, expectedAudience: string): Promise<any> {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token format");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Decode header to find Key ID (kid)
    let header: any;
    try {
      header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
    } catch (e: any) {
      throw new Error(`Failed to parse JWT header: ${e.message}`);
    }

    const kid = header.kid;
    if (!kid) {
      throw new Error("JWT header is missing key ID (kid)");
    }

    // 2. Fetch JWKS public key from KANZen instance
    let jwks: any;
    try {
      jwks = await this.request<any>("/integrations/privateApplications/jwks", {
        method: "POST",
      });
    } catch (e: any) {
      throw new Error(`Failed to retrieve JWKS from KANZen: ${e.message}`);
    }

    if (!jwks?.keys || !Array.isArray(jwks.keys)) {
      throw new Error("Invalid JWKS response from KANZen");
    }

    const keyObj = jwks.keys.find((k: any) => k.kid === kid);
    if (!keyObj || !keyObj.pem) {
      throw new Error(`Public key for kid "${kid}" not found in JWKS`);
    }

    const publicKey = keyObj.pem;

    // 3. Verify signature using RS256
    const verifyInput = `${headerB64}.${payloadB64}`;
    const signature = Buffer.from(signatureB64, "base64url");

    const isValid = crypto.verify(
      "SHA256",
      Buffer.from(verifyInput),
      publicKey,
      signature,
    );

    if (!isValid) {
      throw new Error("Invalid JWT signature");
    }

    // 4. Decode and check claims
    let payload: any;
    try {
      payload = JSON.parse(
        Buffer.from(payloadB64, "base64url").toString("utf8"),
      );
    } catch (e: any) {
      throw new Error(`Failed to parse JWT payload: ${e.message}`);
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && now > payload.exp) {
      throw new Error("JWT token is expired");
    }

    if (payload.iss !== "kanzen-sso") {
      throw new Error(`Invalid token issuer: ${payload.iss}`);
    }

    if (expectedAudience && payload.aud !== expectedAudience) {
      throw new Error(
        `Audience mismatch: expected "${expectedAudience}", got "${payload.aud}"`,
      );
    }

    return payload;
  }
}
