import type { KanzenClient } from "../client.js";
import type {
  KanzenSepaSigningRequest,
  KanzenCreateSepaSigningRequestPayload,
  KanzenListSepaSigningRequestsFilter,
} from "../types.js";

/**
 * Send one or more mandates to a contact for signature.
 * The contact gets one e-mail link to a Kanzen-hosted signing page.
 */
export async function createSepaSigningRequest(
  client: KanzenClient,
  payload: KanzenCreateSepaSigningRequestPayload,
): Promise<KanzenSepaSigningRequest> {
  return client.request<KanzenSepaSigningRequest>(`/sepa-signing-requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * List the signing requests of an account or of a mandate
 */
export async function listSepaSigningRequests(
  client: KanzenClient,
  filter: KanzenListSepaSigningRequestsFilter,
): Promise<KanzenSepaSigningRequest[]> {
  const params = new URLSearchParams();
  if (filter.accountId) params.set("accountId", filter.accountId);
  if (filter.mandateId) params.set("mandateId", filter.mandateId);
  const query = params.toString();

  return client.request<KanzenSepaSigningRequest[]>(
    `/sepa-signing-requests${query ? `?${query}` : ""}`,
  );
}

/**
 * Send a new link for an open request (the previous link stops working, the expiry is reset)
 */
export async function resendSepaSigningRequest(
  client: KanzenClient,
  requestId: string,
): Promise<KanzenSepaSigningRequest> {
  return client.request<KanzenSepaSigningRequest>(
    `/sepa-signing-requests/${encodeURIComponent(requestId)}/resend`,
    { method: "POST" },
  );
}

/**
 * Cancel an open request (its link stops working)
 */
export async function cancelSepaSigningRequest(
  client: KanzenClient,
  requestId: string,
): Promise<KanzenSepaSigningRequest> {
  return client.request<KanzenSepaSigningRequest>(
    `/sepa-signing-requests/${encodeURIComponent(requestId)}/cancel`,
    { method: "POST" },
  );
}
