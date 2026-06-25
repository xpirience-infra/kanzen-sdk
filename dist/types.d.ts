export type KanzenDebugLevel = 'none' | 'info' | 'verbose' | 'trace';
export interface KanzenClientOptions {
    apiUrl: string;
    apiKey: string;
    webhookSecret?: string;
    debug?: boolean | KanzenDebugLevel;
    logger?: (level: 'info' | 'verbose' | 'trace', message: string, meta?: any) => void;
}
export interface KanzenAddress {
    type: string;
    line1: string;
    postalCode: string;
    city: string;
    country: string;
    countryCode?: string;
}
export interface KanzenAccountPayload {
    name: string;
    notes?: string | null;
    identificationNumber?: string | null;
    phone?: string | null;
    parentId?: string | null;
    accountType?: string;
    invoicingType?: boolean;
    originId?: string | null;
    addresses?: KanzenAddress[];
    accountRelationTypes?: string[];
}
export interface KanzenAddressResponse {
    id: string;
    type: string;
    line1: string;
    postalCode: string;
    city: string;
    country: string;
    countryCode: string;
}
export interface KanzenAccountResponse {
    id: string;
    name: string;
    notes: string | null;
    identificationNumber: string | null;
    phone: string | null;
    parentId: string | null;
    accountType: string;
    invoicingType: boolean;
    originId: string | null;
    addresses: KanzenAddressResponse[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
export interface KanzenWebhookPayload {
    event: 'account.created' | 'account.updated' | 'account.deleted';
    timestamp: string;
    data: KanzenAccountResponse;
}
export interface KanzenLockPayload {
    entityType: string;
    entityId: string | number;
    leaseTtl?: number;
}
export interface KanzenLockResponse {
    success: boolean;
    ttl?: number;
    error?: string;
}
export interface KanzenContactPayload {
    civilityId?: string | null;
    lastname?: string | null;
    firstname?: string | null;
    accountId?: string | null;
    emailaddress2?: string | null;
    phone2?: string | null;
    contactRelationType?: string | null;
    mainCommunicationLanguage?: string | null;
    accounts?: {
        id: string;
        relationType?: string;
    }[];
    additionalFields?: {
        jobtitle?: string | null;
        emailaddress1?: string | null;
        phone1?: string | null;
        accountId?: string | null;
    };
}
export interface KanzenContactResponse {
    id: string;
    civilityId: string | null;
    lastname: string;
    firstname: string;
    emailaddress2: string | null;
    phone2: string | null;
    mainCommunicationLanguage: string | null;
    accounts: {
        id: string;
        name: string;
        $extras?: {
            pivot_contact_relation_type_id?: string;
            pivot_contact_relation_type_name?: string;
        };
    }[];
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
