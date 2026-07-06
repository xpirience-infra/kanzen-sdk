import type { KanzenClient } from "../client.js";
import type { KanzenAccountPayload, KanzenAccountResponse } from "../types.js";
/**
 * Create a single Account (Client, Group, or Site) in Kanzen
 */
export declare function createAccount(client: KanzenClient, payload: KanzenAccountPayload): Promise<KanzenAccountResponse>;
/**
 * Update an existing Account in Kanzen
 */
export declare function updateAccount(client: KanzenClient, id: string, payload: KanzenAccountPayload): Promise<KanzenAccountResponse>;
/**
 * Delete (soft-delete) an Account in Kanzen
 */
export declare function deleteAccount(client: KanzenClient, id: string): Promise<void>;
