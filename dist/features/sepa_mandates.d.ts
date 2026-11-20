import type { KanzenClient } from "../client.js";
import type { KanzenSepaMandate, KanzenCreateSepaMandatePayload, KanzenUpdateSepaMandatePayload, KanzenSignedUrl } from "../types.js";
/**
 * List the SEPA mandates of an account
 */
export declare function listSepaMandates(client: KanzenClient, accountId: string): Promise<KanzenSepaMandate[]>;
/**
 * Create a SEPA mandate on an account
 */
export declare function createSepaMandate(client: KanzenClient, accountId: string, payload?: KanzenCreateSepaMandatePayload): Promise<KanzenSepaMandate>;
/**
 * Get a short-lived URL to download the mandate PDF (unsigned)
 */
export declare function getSepaMandatePdfUrl(client: KanzenClient, mandateId: string): Promise<KanzenSignedUrl>;
/**
 * Upload the signed copy of a mandate (PDF, PNG or JPEG)
 */
export declare function uploadSignedSepaMandate(client: KanzenClient, mandateId: string, file: Buffer | Blob, filename: string, externalActor?: string): Promise<KanzenSepaMandate>;
/**
 * Get a short-lived URL to download the signed copy of a mandate.
 * With `options.accountId`, a covered account (a site) opens its parent's signed mandate
 * with its own rights; Kanzen returns 422 if the mandate does not cover that account.
 */
export declare function getSignedSepaMandateUrl(client: KanzenClient, mandateId: string, options?: {
    accountId?: string;
}): Promise<KanzenSignedUrl>;
/**
 * Update a mandate (status, bank details, external actor)
 */
export declare function updateSepaMandate(client: KanzenClient, mandateId: string, payload: KanzenUpdateSepaMandatePayload): Promise<KanzenSepaMandate>;
/**
 * Add descendant accounts to the accounts a mandate covers.
 * On a SIGNED mandate, Kanzen copies the IBAN/BIC to the added accounts.
 */
export declare function addSepaMandateCoveredAccounts(client: KanzenClient, mandateId: string, accountIds: string[]): Promise<KanzenSepaMandate>;
/**
 * Remove an account from the accounts a mandate covers (never the debtor account)
 */
export declare function removeSepaMandateCoveredAccount(client: KanzenClient, mandateId: string, accountId: string): Promise<KanzenSepaMandate>;
