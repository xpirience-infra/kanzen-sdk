import type { KanzenClient } from "../client.js";
import type { KanzenContactPayload, KanzenContactResponse } from "../types.js";

/**
 * Get a Contact from Kanzen
 */
export async function getContact(
  client: KanzenClient,
  id: string,
): Promise<KanzenContactResponse> {
  return client.request<KanzenContactResponse>(`/contacts/${id}`, {
    method: "GET",
  });
}

/**
 * Create a Contact in Kanzen
 */
export async function createContact(
  client: KanzenClient,
  payload: KanzenContactPayload,
): Promise<KanzenContactResponse> {
  return client.request<KanzenContactResponse>("/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing Contact in Kanzen
 */
export async function updateContact(
  client: KanzenClient,
  id: string,
  payload: KanzenContactPayload,
): Promise<KanzenContactResponse> {
  return client.request<KanzenContactResponse>(`/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a Contact in Kanzen
 */
export async function deleteContact(
  client: KanzenClient,
  id: string,
): Promise<void> {
  return client.request<void>(`/contacts/${id}`, {
    method: "DELETE",
  });
}

/**
 * Detach a Contact from an Account in Kanzen
 */
export async function detachContact(
  client: KanzenClient,
  id: string,
  accountId: string,
): Promise<void> {
  return client.request<void>(`/contacts/${id}/detach`, {
    method: "DELETE",
    body: JSON.stringify({ accountId }),
  });
}
