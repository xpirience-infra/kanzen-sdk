import type { KanzenClient } from "../client.js";
import type { KanzenSepaSigningRequest, KanzenCreateSepaSigningRequestPayload, KanzenListSepaSigningRequestsFilter } from "../types.js";
/**
 * Send one or more mandates to a contact for signature.
 * The contact gets one e-mail link to a Kanzen-hosted signing page.
 */
export declare function createSepaSigningRequest(client: KanzenClient, payload: KanzenCreateSepaSigningRequestPayload): Promise<KanzenSepaSigningRequest>;
/**
 * List the signing requests of an account or of a mandate
 */
export declare function listSepaSigningRequests(client: KanzenClient, filter: KanzenListSepaSigningRequestsFilter): Promise<KanzenSepaSigningRequest[]>;
/**
 * Send a new link for an open request (the previous link stops working, the expiry is reset)
 */
export declare function resendSepaSigningRequest(client: KanzenClient, requestId: string): Promise<KanzenSepaSigningRequest>;
/**
 * Cancel an open request (its link stops working)
 */
export declare function cancelSepaSigningRequest(client: KanzenClient, requestId: string): Promise<KanzenSepaSigningRequest>;
