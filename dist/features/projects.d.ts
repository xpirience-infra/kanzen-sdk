import type { KanzenClient } from "../client.js";
import type { KanzenPaymentMethod, KanzenProjectStatus, KanzenProjectInvoicingType, KanzenProject, KanzenCreateProjectPayload, KanzenUpdateProjectPayload } from "../types.js";
/**
 * List the payment methods, optionally filtered by value
 */
export declare function listPaymentMethods(client: KanzenClient, filter?: {
    value?: string;
}): Promise<KanzenPaymentMethod[]>;
/**
 * List the project statuses, optionally filtered by value
 */
export declare function listProjectStatuses(client: KanzenClient, filter?: {
    value?: string;
}): Promise<KanzenProjectStatus[]>;
/**
 * List the project invoicing types
 */
export declare function listProjectInvoicingTypes(client: KanzenClient): Promise<KanzenProjectInvoicingType[]>;
/**
 * Create a project
 */
export declare function createProject(client: KanzenClient, payload: KanzenCreateProjectPayload): Promise<KanzenProject>;
/**
 * Update a project and its milestones (only the fields given are sent)
 */
export declare function updateProject(client: KanzenClient, id: string, payload: KanzenUpdateProjectPayload): Promise<KanzenProject>;
/**
 * Get a project, with its milestones when it has some
 */
export declare function getProject(client: KanzenClient, id: string): Promise<KanzenProject>;
