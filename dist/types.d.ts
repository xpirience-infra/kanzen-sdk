export interface KanzenClientOptions {
    apiUrl: string;
    apiKey: string;
    webhookSecret?: string;
}
export interface KanzenAccountPayload {
    name: string;
    parentId?: string | null;
    siret?: string | null;
    telephone?: string | null;
    address?: string | null;
    zipCode?: string | null;
    city?: string | null;
    country?: string | null;
    notes?: string | null;
    externalId?: string | null;
}
export interface KanzenAccountResponse {
    id: string;
    name: string;
    parentId: string | null;
    siret: string | null;
    telephone: string | null;
    address: string | null;
    zipCode: string | null;
    city: string | null;
    country: string | null;
    notes: string | null;
    externalId: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
export interface KanzenWebhookPayload {
    event: 'account.created' | 'account.updated' | 'account.deleted';
    timestamp: string;
    data: KanzenAccountResponse;
}
