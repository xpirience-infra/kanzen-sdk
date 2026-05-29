import crypto from 'node:crypto'
import type {
  KanzenClientOptions,
  KanzenAccountPayload,
  KanzenAccountResponse,
  KanzenLockPayload,
  KanzenLockResponse,
} from './types.js'

export class KanzenClient {
  private apiUrl: string
  private apiKey: string
  private webhookSecret?: string

  constructor(options: KanzenClientOptions) {
    this.apiUrl = options.apiUrl.replace(/\/$/, '')
    this.apiKey = options.apiKey
    this.webhookSecret = options.webhookSecret
  }

  /**
   * Helper to make authenticated HTTP requests to Kanzen API
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiUrl}${path}`
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`Kanzen API Error (${response.status}): ${errorText}`)
    }

    if (response.status === 204) {
      return null as T
    }

    return response.json() as Promise<T>
  }

  /**
   * Create a single Account (Client, Group, or Site) in Kanzen
   */
  async createAccount(payload: KanzenAccountPayload): Promise<KanzenAccountResponse> {
    return this.request<KanzenAccountResponse>('/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Update an existing Account in Kanzen
   */
  async updateAccount(id: string, payload: KanzenAccountPayload): Promise<KanzenAccountResponse> {
    return this.request<KanzenAccountResponse>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Delete (soft-delete) an Account in Kanzen
   */
  async deleteAccount(id: string): Promise<void> {
    return this.request<void>(`/accounts/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Acquire a lock on an entity in Kanzen
   */
  async acquireLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return this.request<KanzenLockResponse>('/locks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Extend a lock on an entity in Kanzen
   */
  async extendLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return this.request<KanzenLockResponse>('/locks', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Release a lock on an entity in Kanzen
   */
  async releaseLock(payload: KanzenLockPayload): Promise<KanzenLockResponse> {
    return this.request<KanzenLockResponse>('/locks', {
      method: 'DELETE',
      body: JSON.stringify(payload),
    })
  }



  /**
   * Verify HMAC-SHA256 signature for incoming webhooks
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) {
      throw new Error('Webhook secret is not configured in KanzenClient options')
    }

    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (computedSignature.length !== signature.length) {
      return false
    }

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    )
  }
}
