export type KanzenDebugLevel = 'none' | 'info' | 'verbose' | 'trace';
export interface KanzenClientOptions {
    apiUrl: string;
    apiKey: string;
    webhookSecret?: string;
    debug?: boolean | KanzenDebugLevel;
    logger?: (level: 'info' | 'verbose' | 'trace', message: string, meta?: any) => void;
    /** Called when an account is created in Kanzen */
    onAccountCreated?: (data: KanzenAccountEventData) => Promise<void> | void;
    /** Called when an account is updated in Kanzen */
    onAccountUpdated?: (data: KanzenAccountEventData) => Promise<void> | void;
    /** Called when an account is deleted in Kanzen */
    onAccountDeleted?: (data: KanzenDeletedEventData) => Promise<void> | void;
    /** Called when a Kanzen account is locked for editing */
    onAccountLocked?: (data: KanzenLockEventData) => Promise<void> | void;
    /** Called when a Kanzen account lock is released */
    onAccountUnlocked?: (data: KanzenLockEventData) => Promise<void> | void;
    /** Called when a Kanzen account lock TTL is extended */
    onAccountLockExtended?: (data: KanzenLockEventData) => Promise<void> | void;
    /** Called when a contact is created in Kanzen */
    onContactCreated?: (data: KanzenContactEventData) => Promise<void> | void;
    /** Called when a contact is updated in Kanzen */
    onContactUpdated?: (data: KanzenContactEventData) => Promise<void> | void;
    /** Called when a contact is deleted in Kanzen */
    onContactDeleted?: (data: KanzenDeletedEventData) => Promise<void> | void;
    /** Called when a Kanzen contact is locked for editing */
    onContactLocked?: (data: KanzenLockEventData) => Promise<void> | void;
    /** Called when a Kanzen contact lock is released */
    onContactUnlocked?: (data: KanzenLockEventData) => Promise<void> | void;
    /** Called when a Kanzen contact lock TTL is extended */
    onContactLockExtended?: (data: KanzenLockEventData) => Promise<void> | void;
    /**
     * Fallback called for unrecognised event types.
     * Useful for forward-compatibility with new Kanzen events.
     */
    onUnknownEvent?: (event: string, data: unknown) => Promise<void> | void;
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
/**
 * Envelope of every webhook sent by Kanzen.
 * Mirrors `WebhookPayload` in Kanzen (`webhook_events.ts`).
 */
export interface KanzenWebhookEnvelope<E extends string = string, D = unknown> {
    event: E;
    timestamp: string;
    updatedAt: string;
    tenantId: string;
    /** User who made the change in Kanzen, null when unknown */
    actorId: string | null;
    data: D;
}
/** `data` of `account.created` and `account.updated`. */
export interface KanzenAccountEventData {
    id: string;
    name: string;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
    phone: string | null;
    originId: string | null;
    /** Value of the first account relation type, null when the account has none */
    accountType: string | null;
}
/** `data` of `contact.created` and `contact.updated`. */
export interface KanzenContactEventData {
    id: string;
    firstname: string | null;
    lastname: string | null;
    fullname: string;
    civilityId: string | null;
    emailaddress2: string | null;
    phone2: string | null;
    mainCommunicationLanguage: string | null;
    originId: string | null;
}
/** `data` of `account.deleted` and `contact.deleted`. */
export interface KanzenDeletedEventData {
    id: string;
    originId: string | null;
}
export type KanzenAccountWebhookPayload = KanzenWebhookEnvelope<'account.created' | 'account.updated', KanzenAccountEventData> | KanzenWebhookEnvelope<'account.deleted', KanzenDeletedEventData>;
export type KanzenContactWebhookPayload = KanzenWebhookEnvelope<'contact.created' | 'contact.updated', KanzenContactEventData> | KanzenWebhookEnvelope<'contact.deleted', KanzenDeletedEventData>;
/**
 * Discriminated union of all webhook payloads sent by Kanzen.
 * Use the `event` field to narrow the type of `data`.
 *
 * @example
 * if (payload.event === 'account.created') {
 *   // payload.data is KanzenAccountEventData
 * }
 */
export type KanzenWebhookPayload = KanzenWebhookEnvelope<'account.created', KanzenAccountEventData> | KanzenWebhookEnvelope<'account.updated', KanzenAccountEventData> | KanzenWebhookEnvelope<'account.deleted', KanzenDeletedEventData> | KanzenWebhookEnvelope<'account.locked', KanzenLockEventData> | KanzenWebhookEnvelope<'account.unlocked', KanzenLockEventData> | KanzenWebhookEnvelope<'account.lock_extended', KanzenLockEventData> | KanzenWebhookEnvelope<'contact.created', KanzenContactEventData> | KanzenWebhookEnvelope<'contact.updated', KanzenContactEventData> | KanzenWebhookEnvelope<'contact.deleted', KanzenDeletedEventData> | KanzenWebhookEnvelope<'contact.locked', KanzenLockEventData> | KanzenWebhookEnvelope<'contact.unlocked', KanzenLockEventData> | KanzenWebhookEnvelope<'contact.lock_extended', KanzenLockEventData>;
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
/**
 * Data shape carried by lock webhook events (account.locked, contact.unlocked, etc.).
 */
export interface KanzenLockEventData {
    /** Entity type in Kanzen — 'account' or 'contact' */
    entityType: string;
    /** Kanzen ID of the locked entity */
    entityId: string;
    /** Lease TTL in seconds — present on lock / extend, absent on unlock */
    leaseTtl?: number;
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
    originId?: string;
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
    originId?: string | null;
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
export interface KanzenOAuthConfigOptions {
    /** Base URL of the KANZen API (e.g., 'https://kanzen.mycompany.com') */
    apiUrl: string;
    /** OAuth Client ID */
    clientId: string;
    /** OAuth Client Secret (Optional for public/PKCE clients) */
    clientSecret?: string;
    /** Requested scopes (defaults to ['openid', 'profile', 'email']) */
    scopes?: string[];
}
export interface NextAuthCustomProviderConfig {
    id: string;
    name: string;
    type: 'oauth';
    authorization: string;
    token: string;
    userinfo: string;
    profile: (profile: any) => {
        id: string;
        name: string;
        email: string;
        image: string;
        roles: string[];
        groups: string[];
    };
    clientId: string;
    clientSecret?: string;
}
export type KanzenSepaMandateStatus = 'PENDING' | 'SENT' | 'SIGNED' | 'REJECTED' | 'REVOKED';
/** `B2B` = SEPA Interentreprises, `CORE` = SEPA Core (individuals) */
export type KanzenSepaMandateScheme = 'B2B' | 'CORE';
export interface KanzenSepaMandate {
    id: string;
    accountId: string;
    projectId: string | null;
    /** Unique mandate reference (Référence Unique de Mandat) */
    rum: string;
    /** Free label shown on the mandate, null when none */
    label: string | null;
    status: KanzenSepaMandateStatus;
    scheme: KanzenSepaMandateScheme;
    iban: string | null;
    bic: string | null;
    signedAt: string | null;
    /** Accounts the mandate covers: the debtor account and the descendants added to it */
    coveredAccountIds: string[];
    /** Name of the person who acted in the external app */
    externalActor: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface KanzenCreateSepaMandatePayload {
    projectId?: string;
    iban?: string;
    bic?: string;
    /** Defaults to `CORE` for individual accounts, `B2B` otherwise */
    scheme?: KanzenSepaMandateScheme;
    externalActor?: string;
    label?: string;
    /** Descendants of the debtor account to cover as well (the debtor is always covered) */
    coveredAccountIds?: string[];
}
export interface KanzenUpdateSepaMandatePayload {
    /** `SIGNED` is reached only through `uploadSignedSepaMandate`; `PENDING` never */
    status?: 'SENT' | 'REJECTED' | 'REVOKED';
    iban?: string | null;
    bic?: string | null;
    externalActor?: string;
    label?: string | null;
}
export type KanzenSepaSigningRequestStatus = 'OPEN' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
/**
 * A request sent to a contact to sign one or more mandates on a Kanzen-hosted page.
 * The signing link is sent only by e-mail and never returned by the API.
 */
export interface KanzenSepaSigningRequest {
    id: string;
    contactId: string;
    mandateIds: string[];
    status: KanzenSepaSigningRequestStatus;
    expiresAt: string;
    sentAt: string | null;
    completedAt: string | null;
}
export interface KanzenCreateSepaSigningRequestPayload {
    /** Contact who signs; must be attached to each mandate's debtor account */
    contactId: string;
    mandateIds: string[];
}
export interface KanzenListSepaSigningRequestsFilter {
    accountId?: string;
    mandateId?: string;
}
/** Short-lived signed download URL */
export interface KanzenSignedUrl {
    url: string;
}
