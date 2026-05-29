export interface KanzenClientOptions {
  apiUrl: string
  apiKey: string
  webhookSecret?: string
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

export interface KanzenWebhookPayload {
  event: 'account.created' | 'account.updated' | 'account.deleted'
  timestamp: string
  data: KanzenAccountResponse
}

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
