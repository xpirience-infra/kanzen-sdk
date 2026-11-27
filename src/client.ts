import { sanitizeApiUrl } from "./features/utils.js";
import { createAccount, updateAccount, deleteAccount } from "./features/accounts.js";
import { acquireLock, extendLock, releaseLock } from "./features/locks.js";
import { getContact, createContact, updateContact, deleteContact, detachContact } from "./features/contacts.js";
import {
  listSepaMandates,
  createSepaMandate,
  getSepaMandatePdfUrl,
  uploadSignedSepaMandate,
  getSignedSepaMandateUrl,
  updateSepaMandate,
  addSepaMandateCoveredAccounts,
  removeSepaMandateCoveredAccount,
} from "./features/sepa_mandates.js";
import {
  createSepaSigningRequest,
  listSepaSigningRequests,
  resendSepaSigningRequest,
  cancelSepaSigningRequest,
} from "./features/sepa_signing_requests.js";
import {
  uploadAccountDocument,
  listAccountDocuments,
  getDocumentUrl,
} from "./features/account_documents.js";
import {
  listPaymentMethods,
  listProjectStatuses,
  listProjectInvoicingTypes,
  createProject,
  updateProject,
  getProject,
} from "./features/projects.js";
import { KanzenApiError, parseErrorBody } from "./errors.js";
import { verifyWebhookSignature } from "./features/webhook.js";
import { handleIncomingWebhook, handleIncomingWebhookRaw } from "./features/webhook_handler.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getOAuthAuthorizationUrl,
  exchangeOAuthCodeForProfile,
  getBetterAuthProviderConfig,
  getNextAuthProviderConfig,
} from "./features/auth.js";
import type {
  KanzenClientOptions,
  KanzenDebugLevel,
  KanzenAccountPayload,
  KanzenAccountResponse,
  KanzenLockPayload,
  KanzenLockResponse,
  KanzenContactPayload,
  KanzenContactResponse,
  KanzenSepaMandate,
  KanzenCreateSepaMandatePayload,
  KanzenUpdateSepaMandatePayload,
  KanzenSepaSigningRequest,
  KanzenCreateSepaSigningRequestPayload,
  KanzenListSepaSigningRequestsFilter,
  KanzenSignedUrl,
  KanzenUploadFile,
  KanzenUploadAccountDocumentOptions,
  KanzenListAccountDocumentsOptions,
  KanzenAccountDocument,
  KanzenDocumentUrl,
  KanzenPaymentMethod,
  KanzenProjectStatus,
  KanzenProjectInvoicingType,
  KanzenProject,
  KanzenCreateProjectPayload,
  KanzenUpdateProjectPayload,
} from "./types.js";

// Re-export standalone configuration helper functions
export { getBetterAuthProviderConfig, getNextAuthProviderConfig };

export class KanzenClient {
  private apiUrl: string;
  private apiKey: string;
  private webhookSecret?: string;
  private debugLevel: KanzenDebugLevel = "none";
  private logger: (level: "info" | "verbose" | "trace", message: string, meta?: any) => void;
  private options: KanzenClientOptions;

  constructor(options: KanzenClientOptions) {
    this.options = options;
    this.apiUrl = sanitizeApiUrl(options.apiUrl);
    this.apiKey = options.apiKey;
    this.webhookSecret = options.webhookSecret;
    this.debugLevel = options.debug === true ? "verbose" : (options.debug || "none");
    this.logger = options.logger || ((level, message, meta) => {
      const prefix = `[kanzen-sdk] [${level.toUpperCase()}]`;
      if (meta !== undefined) {
        console.log(prefix, message, meta);
      } else {
        console.log(prefix, message);
      }
    });

    this.log("info", "Client initialized", { apiUrl: this.apiUrl });
  }

  /**
   * Returns the API URL.
   * @internal
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Returns the configured webhook secret.
   * @internal
   */
  getWebhookSecret(): string | undefined {
    return this.webhookSecret;
  }

  /**
   * Returns the full options object (including event handlers).
   * @internal
   */
  getOptions(): KanzenClientOptions {
    return this.options;
  }

  /**
   * Logs a message with context according to debug levels.
   * @internal
   */
  log(level: "info" | "verbose" | "trace", message: string, meta?: any) {
    if (this.debugLevel === "none") return;

    const levels: Record<KanzenDebugLevel, number> = { none: 0, info: 1, verbose: 2, trace: 3 };
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
  async fetchWithTimeout(
    url: string,
    init: RequestInit,
    label: string,
  ): Promise<Response> {
    const timeoutMs = this.options.timeoutMs ?? 30000;
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const signal = init.signal
      ? AbortSignal.any([init.signal, timeoutSignal])
      : timeoutSignal;
    try {
      return await fetch(url, { ...init, signal });
    } catch (e: any) {
      this.log("info", `Request failed: ${label} - Error: ${e?.message}`);
      if (timeoutSignal.aborted) {
        throw new KanzenApiError(`Kanzen API timeout after ${timeoutMs} ms (${label})`, {
          status: null,
          code: "TIMEOUT",
        });
      }
      // Aborted by the caller's own signal: not a network failure, pass it through
      if (init.signal?.aborted) throw e;
      throw new KanzenApiError(`Kanzen API network error (${label}): ${e?.message}`, {
        status: null,
        code: "NETWORK",
      });
    }
  }

  /**
   * Helper to make authenticated HTTP requests to Kanzen API
   * @internal
   */
  async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
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

    const response = await this.fetchWithTimeout(
      url,
      { ...options, headers },
      `${method} ${path}`,
    );

    this.log("info", `Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      this.log("verbose", `Response error body`, { body: errorText });
      throw new KanzenApiError(`Kanzen API Error (${response.status}): ${errorText}`, {
        status: response.status,
        body: parseErrorBody(errorText),
      });
    }

    if (response.status === 204) {
      this.log("verbose", `Response body: (204 No Content)`);
      return null as T;
    }

    const responseText = await response.text();
    this.log("verbose", `Response body size: ${responseText.length} bytes`);
    this.log("trace", `Response body payload`, { body: responseText });

    try {
      return JSON.parse(responseText) as T;
    } catch (e: any) {
      throw new Error(`Failed to parse JSON response: ${e.message}`);
    }
  }

  /**
   * Create a single Account (Client, Group, or Site) in Kanzen
   */
  async createAccount(
    payload: KanzenAccountPayload,
  ): Promise<KanzenAccountResponse> {
    return createAccount(this, payload);
  }

  /**
   * Update an existing Account in Kanzen
   */
  async updateAccount(
    id: string,
    payload: KanzenAccountPayload,
  ): Promise<KanzenAccountResponse> {
    return updateAccount(this, id, payload);
  }

  /**
   * Delete (soft-delete) an Account in Kanzen
   */
  async deleteAccount(id: string): Promise<void> {
    return deleteAccount(this, id);
  }

  /**
   * Acquire a lock on an entity in Kanzen
   */
  async acquireLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return acquireLock(this, payload);
  }

  /**
   * Extend a lock on an entity in Kanzen
   */
  async extendLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return extendLock(this, payload);
  }

  /**
   * Release a lock on an entity in Kanzen
   */
  async releaseLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return releaseLock(this, payload);
  }

  /**
   * Get a Contact from Kanzen
   */
  async getContact(id: string): Promise<KanzenContactResponse> {
    return getContact(this, id);
  }

  /**
   * Create a Contact in Kanzen
   */
  async createContact(
    payload: KanzenContactPayload,
  ): Promise<KanzenContactResponse> {
    return createContact(this, payload);
  }

  /**
   * Update an existing Contact in Kanzen
   */
  async updateContact(
    id: string,
    payload: KanzenContactPayload,
  ): Promise<KanzenContactResponse> {
    return updateContact(this, id, payload);
  }

  /**
   * Delete a Contact in Kanzen
   */
  async deleteContact(id: string): Promise<void> {
    return deleteContact(this, id);
  }

  /**
   * Detach a Contact from an Account in Kanzen
   */
  async detachContact(id: string, accountId: string): Promise<void> {
    return detachContact(this, id, accountId);
  }

  /**
   * List the SEPA mandates of an account
   */
  async listSepaMandates(accountId: string): Promise<KanzenSepaMandate[]> {
    return listSepaMandates(this, accountId);
  }

  /**
   * Create a SEPA mandate on an account
   */
  async createSepaMandate(
    accountId: string,
    payload?: KanzenCreateSepaMandatePayload,
  ): Promise<KanzenSepaMandate> {
    return createSepaMandate(this, accountId, payload);
  }

  /**
   * Get a short-lived URL to download the mandate PDF (unsigned)
   */
  async getSepaMandatePdfUrl(mandateId: string): Promise<KanzenSignedUrl> {
    return getSepaMandatePdfUrl(this, mandateId);
  }

  /**
   * Upload the signed copy of a mandate (PDF, PNG or JPEG).
   * The mandate becomes SIGNED.
   */
  async uploadSignedSepaMandate(
    mandateId: string,
    file: Buffer | Blob,
    filename: string,
    externalActor?: string,
  ): Promise<KanzenSepaMandate> {
    return uploadSignedSepaMandate(this, mandateId, file, filename, externalActor);
  }

  /**
   * Get a short-lived URL to download the signed copy of a mandate.
   * With `options.accountId`, a covered account (a site) opens its parent's signed mandate
   * with its own rights; Kanzen returns 422 if the mandate does not cover that account.
   */
  async getSignedSepaMandateUrl(
    mandateId: string,
    options?: { accountId?: string },
  ): Promise<KanzenSignedUrl> {
    return getSignedSepaMandateUrl(this, mandateId, options);
  }

  /**
   * Update a mandate (status, bank details, external actor)
   */
  async updateSepaMandate(
    mandateId: string,
    payload: KanzenUpdateSepaMandatePayload,
  ): Promise<KanzenSepaMandate> {
    return updateSepaMandate(this, mandateId, payload);
  }

  /**
   * Add descendant accounts to the accounts a mandate covers.
   * A site joining a signed mandate needs no new signature: Kanzen copies the IBAN/BIC.
   */
  async addSepaMandateCoveredAccounts(
    mandateId: string,
    accountIds: string[],
  ): Promise<KanzenSepaMandate> {
    return addSepaMandateCoveredAccounts(this, mandateId, accountIds);
  }

  /**
   * Remove an account from the accounts a mandate covers (never the debtor account)
   */
  async removeSepaMandateCoveredAccount(
    mandateId: string,
    accountId: string,
  ): Promise<KanzenSepaMandate> {
    return removeSepaMandateCoveredAccount(this, mandateId, accountId);
  }

  /**
   * Upload one or more files to the document folder of an account (client, group or site),
   * or to its subfolder `options.folder` (created on first use).
   * Kanzen refuses (422) a file type outside its list, more than 10 files, or a file over 20 MB.
   */
  async uploadAccountDocument(
    accountId: string,
    files: KanzenUploadFile | KanzenUploadFile[],
    options?: KanzenUploadAccountDocumentOptions,
  ): Promise<KanzenAccountDocument[]> {
    return uploadAccountDocument(this, accountId, files, options);
  }

  /**
   * List the files of the document folder of an account, newest first,
   * or only those of its subfolder `options.folder`
   */
  async listAccountDocuments(
    accountId: string,
    options?: KanzenListAccountDocumentsOptions,
  ): Promise<KanzenAccountDocument[]> {
    return listAccountDocuments(this, accountId, options);
  }

  /**
   * Get a short-lived (10 minutes) download link of a document of an account
   */
  async getDocumentUrl(documentId: string): Promise<KanzenDocumentUrl> {
    return getDocumentUrl(this, documentId);
  }

  /**
   * Send one or more mandates to a contact for signature.
   * The contact gets one e-mail link to a Kanzen-hosted signing page.
   */
  async createSepaSigningRequest(
    payload: KanzenCreateSepaSigningRequestPayload,
  ): Promise<KanzenSepaSigningRequest> {
    return createSepaSigningRequest(this, payload);
  }

  /**
   * List the signing requests of an account or of a mandate
   */
  async listSepaSigningRequests(
    filter: KanzenListSepaSigningRequestsFilter,
  ): Promise<KanzenSepaSigningRequest[]> {
    return listSepaSigningRequests(this, filter);
  }

  /**
   * Send a new link for an open request (the previous link stops working)
   */
  async resendSepaSigningRequest(requestId: string): Promise<KanzenSepaSigningRequest> {
    return resendSepaSigningRequest(this, requestId);
  }

  /**
   * Cancel an open request (its link stops working)
   */
  async cancelSepaSigningRequest(requestId: string): Promise<KanzenSepaSigningRequest> {
    return cancelSepaSigningRequest(this, requestId);
  }

  /**
   * Verify HMAC-SHA256 signature for incoming webhooks
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    return verifyWebhookSignature(this, rawBody, signature);
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
  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.webhookSecret) {
      throw new Error(
        "[KanzenClient] webhookSecret must be configured to use handle(). " +
        "Pass it in KanzenClientOptions when creating the client."
      );
    }
    return handleIncomingWebhook(this, req, res);
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
  async handleRaw(rawBody: string, signature: string, res: ServerResponse): Promise<void> {
    if (!this.webhookSecret) {
      throw new Error(
        "[KanzenClient] webhookSecret must be configured to use handleRaw(). " +
        "Pass it in KanzenClientOptions when creating the client."
      );
    }
    return handleIncomingWebhookRaw(this, rawBody, signature, res);
  }

  /**
   * List the payment methods, optionally filtered by value
   */
  async listPaymentMethods(filter?: { value?: string }): Promise<KanzenPaymentMethod[]> {
    return listPaymentMethods(this, filter);
  }

  /**
   * List the project statuses, optionally filtered by value
   */
  async listProjectStatuses(filter?: { value?: string }): Promise<KanzenProjectStatus[]> {
    return listProjectStatuses(this, filter);
  }

  /**
   * List the project invoicing types
   */
  async listProjectInvoicingTypes(): Promise<KanzenProjectInvoicingType[]> {
    return listProjectInvoicingTypes(this);
  }

  /**
   * Create a project
   */
  async createProject(payload: KanzenCreateProjectPayload): Promise<KanzenProject> {
    return createProject(this, payload);
  }

  /**
   * Update a project and its milestones (only the fields given are sent)
   */
  async updateProject(id: string, payload: KanzenUpdateProjectPayload): Promise<KanzenProject> {
    return updateProject(this, id, payload);
  }

  /**
   * Get a project, with its milestones when it has some
   */
  async getProject(id: string): Promise<KanzenProject> {
    return getProject(this, id);
  }

  /**
   * Generates the URL to redirect users to in order to start the OAuth flow.
   */
  getOAuthAuthorizationUrl(params: {
    redirectUri: string;
    clientId: string;
    state?: string;
    scopes?: string[];
  }): string {
    return getOAuthAuthorizationUrl(this, params);
  }

  /**
   * Exchanges the code received in the redirect callback for the user's profile.
   */
  async exchangeOAuthCodeForProfile(params: {
    code: string;
    redirectUri: string;
    clientId: string;
    clientSecret?: string;
  }): Promise<any> {
    return exchangeOAuthCodeForProfile(this, params);
  }
}
