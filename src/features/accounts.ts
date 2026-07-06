import type { KanzenClient } from "../client.js";
import type { KanzenAccountPayload, KanzenAccountResponse } from "../types.js";

/**
 * Create a single Account (Client, Group, or Site) in Kanzen
 */
export async function createAccount(
  client: KanzenClient,
  payload: KanzenAccountPayload,
): Promise<KanzenAccountResponse> {
  return client.request<KanzenAccountResponse>("/accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing Account in Kanzen
 */
export async function updateAccount(
  client: KanzenClient,
  id: string,
  payload: KanzenAccountPayload,
): Promise<KanzenAccountResponse> {
  return client.request<KanzenAccountResponse>(`/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete (soft-delete) an Account in Kanzen
 */
export async function deleteAccount(
  client: KanzenClient,
  id: string,
): Promise<void> {
  return client.request<void>(`/accounts/${id}`, {
    method: "DELETE",
  });
}
