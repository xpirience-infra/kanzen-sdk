import type { KanzenClient } from "../client.js";
import type { KanzenContactPayload, KanzenContactResponse } from "../types.js";
/**
 * Get a Contact from Kanzen
 */
export declare function getContact(client: KanzenClient, id: string): Promise<KanzenContactResponse>;
/**
 * Create a Contact in Kanzen
 */
export declare function createContact(client: KanzenClient, payload: KanzenContactPayload): Promise<KanzenContactResponse>;
/**
 * Update an existing Contact in Kanzen
 */
export declare function updateContact(client: KanzenClient, id: string, payload: KanzenContactPayload): Promise<KanzenContactResponse>;
/**
 * Delete a Contact in Kanzen
 */
export declare function deleteContact(client: KanzenClient, id: string): Promise<void>;
/**
 * Detach a Contact from an Account in Kanzen
 */
export declare function detachContact(client: KanzenClient, id: string, accountId: string): Promise<void>;
