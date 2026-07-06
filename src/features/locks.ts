import type { KanzenClient } from "../client.js";
import type { KanzenLockPayload, KanzenLockResponse } from "../types.js";

/**
 * Acquire a lock on an entity in Kanzen
 */
export async function acquireLock(
  client: KanzenClient,
  payload: KanzenLockPayload,
): Promise<KanzenLockResponse> {
  return client.request<KanzenLockResponse>("/locks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Extend a lock on an entity in Kanzen
 */
export async function extendLock(
  client: KanzenClient,
  payload: KanzenLockPayload,
): Promise<KanzenLockResponse> {
  return client.request<KanzenLockResponse>("/locks", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Release a lock on an entity in Kanzen
 */
export async function releaseLock(
  client: KanzenClient,
  payload: KanzenLockPayload,
): Promise<KanzenLockResponse> {
  return client.request<KanzenLockResponse>("/locks", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}
