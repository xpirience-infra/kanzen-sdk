export type KanzenDebugLevel = 'none' | 'info' | 'verbose' | 'trace'

export interface KanzenClientOptions {
  apiUrl: string
  apiKey: string
  webhookSecret?: string
  debug?: boolean | KanzenDebugLevel
  logger?: (level: 'info' | 'verbose' | 'trace', message: string, meta?: any) => void

  // ──────────────────────────────────────────
  // Inbound webhook event handlers (optional)
  // Configure these to receive events pushed
  // by Kanzen to your application.
  // ──────────────────────────────────────────

  /** Called when an account is created in Kanzen */
  onAccountCreated?: (data: KanzenAccountResponse) => Promise<void> | void
  /** Called when an account is updated in Kanzen */
  onAccountUpdated?: (data: KanzenAccountResponse) => Promise<void> | void
  /** Called when an account is deleted in Kanzen */
  onAccountDeleted?: (data: KanzenAccountResponse) => Promise<void> | void

  /** Called when a Kanzen account is locked for editing */
  onAccountLocked?: (data: KanzenLockEventData) => Promise<void> | void
  /** Called when a Kanzen account lock is released */
  onAccountUnlocked?: (data: KanzenLockEventData) => Promise<void> | void
  /** Called when a Kanzen account lock TTL is extended */
  onAccountLockExtended?: (data: KanzenLockEventData) => Promise<void> | void

  /** Called when a contact is created in Kanzen */
  onContactCreated?: (data: KanzenContactResponse) => Promise<void> | void
  /** Called when a contact is updated in Kanzen */
  onContactUpdated?: (data: KanzenContactResponse) => Promise<void> | void
  /** Called when a contact is deleted in Kanzen */
  onContactDeleted?: (data: KanzenContactResponse) => Promise<void> | void

  /** Called when a Kanzen contact is locked for editing */
  onContactLocked?: (data: KanzenLockEventData) => Promise<void> | void
  /** Called when a Kanzen contact lock is released */
  onContactUnlocked?: (data: KanzenLockEventData) => Promise<void> | void
  /** Called when a Kanzen contact lock TTL is extended */
  onContactLockExtended?: (data: KanzenLockEventData) => Promise<void> | void

  /**
   * Fallback called for unrecognised event types.
   * Useful for forward-compatibility with new Kanzen events.
   */
  onUnknownEvent?: (event: string, data: unknown) => Promise<void> | void
}

export interface KanzenAddress {
  type: string
  line1: string
  postalCode: string
  city: string
  country: string
  countryCode?: string
}

export interface KanzenAccountPayload {
  name: string
  notes?: string | null
  identificationNumber?: string | null
  phone?: string | null
  parentId?: string | null
  accountType?: string
  invoicingType?: boolean
  originId?: string | null
  addresses?: KanzenAddress[]
  accountRelationTypes?: string[]
}

export interface KanzenAddressResponse {
  id: string
  type: string
  line1: string
  postalCode: string
  city: string
  country: string
  countryCode: string
}

export interface KanzenAccountResponse {
  id: string
  name: string
  notes: string | null
  identificationNumber: string | null
  phone: string | null
  parentId: string | null
  accountType: string
  invoicingType: boolean
  originId: string | null
  addresses: KanzenAddressResponse[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface KanzenAccountWebhookPayload {
  event: 'account.created' | 'account.updated' | 'account.deleted'
  timestamp: string
  data: KanzenAccountResponse
}

export interface KanzenContactWebhookPayload {
  event: 'contact.created' | 'contact.updated' | 'contact.deleted'
  timestamp: string
  data: KanzenContactResponse
}

/**
 * Discriminated union of all webhook payloads sent by Kanzen.
 * Use the `event` field to narrow the type of `data`.
 *
 * @example
 * if (payload.event === 'account.created') {
 *   // payload.data is KanzenAccountResponse
 * }
 */
export type KanzenWebhookPayload =
  | { event: 'account.created'; timestamp: string; data: KanzenAccountResponse }
  | { event: 'account.updated'; timestamp: string; data: KanzenAccountResponse }
  | { event: 'account.deleted'; timestamp: string; data: KanzenAccountResponse }
  | { event: 'account.locked'; timestamp: string; data: KanzenLockEventData }
  | { event: 'account.unlocked'; timestamp: string; data: KanzenLockEventData }
  | { event: 'account.lock_extended'; timestamp: string; data: KanzenLockEventData }
  | { event: 'contact.created'; timestamp: string; data: KanzenContactResponse }
  | { event: 'contact.updated'; timestamp: string; data: KanzenContactResponse }
  | { event: 'contact.deleted'; timestamp: string; data: KanzenContactResponse }
  | { event: 'contact.locked'; timestamp: string; data: KanzenLockEventData }
  | { event: 'contact.unlocked'; timestamp: string; data: KanzenLockEventData }
  | { event: 'contact.lock_extended'; timestamp: string; data: KanzenLockEventData }

export interface KanzenLockPayload {
  entityType: string
  entityId: string | number
  leaseTtl?: number
}

export interface KanzenLockResponse {
  success: boolean
  ttl?: number
  error?: string
}

/**
 * Data shape carried by lock webhook events (account.locked, contact.unlocked, etc.).
 */
export interface KanzenLockEventData {
  /** Entity type in Kanzen — 'account' or 'contact' */
  entityType: string
  /** Kanzen ID of the locked entity */
  entityId: string
  /** Lease TTL in seconds — present on lock / extend, absent on unlock */
  leaseTtl?: number
}

export interface KanzenContactPayload {
  civilityId?: string | null
  lastname?: string | null
  firstname?: string | null
  accountId?: string | null
  emailaddress2?: string | null
  phone2?: string | null
  contactRelationType?: string | null
  mainCommunicationLanguage?: string | null
  accounts?: { id: string; relationType?: string }[]
  additionalFields?: {
    jobtitle?: string | null
    emailaddress1?: string | null
    phone1?: string | null
    accountId?: string | null
  }
}

export interface KanzenContactResponse {
  id: string
  civilityId: string | null
  lastname: string
  firstname: string
  emailaddress2: string | null
  phone2: string | null
  mainCommunicationLanguage: string | null
  accounts: {
    id: string
    name: string
    $extras?: {
      pivot_contact_relation_type_id?: string
      pivot_contact_relation_type_name?: string
    }
  }[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface KanzenOAuthConfigOptions {
  /** Base URL of the KANZen API (e.g., 'https://kanzen.mycompany.com') */
  apiUrl: string
  /** OAuth Client ID */
  clientId: string
  /** OAuth Client Secret (Optional for public/PKCE clients) */
  clientSecret?: string
  /** Requested scopes (defaults to ['openid', 'profile', 'email']) */
  scopes?: string[]
}

export interface NextAuthCustomProviderConfig {
  id: string
  name: string
  type: 'oauth'
  authorization: string
  token: string
  userinfo: string
  profile: (profile: any) => {
    id: string
    name: string
    email: string
    image: string
    roles: string[]
    groups: string[]
  }
  clientId: string
  clientSecret?: string
}
