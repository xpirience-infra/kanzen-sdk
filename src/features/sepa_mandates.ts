import type { KanzenClient } from "../client.js";
import type {
  KanzenSepaMandate,
  KanzenCreateSepaMandatePayload,
  KanzenUpdateSepaMandatePayload,
  KanzenSignedUrl,
} from "../types.js";

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

function mimeTypeFromFilename(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

/**
 * List the SEPA mandates of an account
 */
export async function listSepaMandates(
  client: KanzenClient,
  accountId: string,
): Promise<KanzenSepaMandate[]> {
  return client.request<KanzenSepaMandate[]>(
    `/accounts/${encodeURIComponent(accountId)}/sepa-mandates`,
  );
}

/**
 * Create a SEPA mandate on an account
 */
export async function createSepaMandate(
  client: KanzenClient,
  accountId: string,
  payload: KanzenCreateSepaMandatePayload = {},
): Promise<KanzenSepaMandate> {
  return client.request<KanzenSepaMandate>(
    `/accounts/${encodeURIComponent(accountId)}/sepa-mandates`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Get a short-lived URL to download the mandate PDF (unsigned)
 */
export async function getSepaMandatePdfUrl(
  client: KanzenClient,
  mandateId: string,
): Promise<KanzenSignedUrl> {
  return client.request<KanzenSignedUrl>(
    `/sepa-mandates/${encodeURIComponent(mandateId)}/pdf-url`,
  );
}

/**
 * Upload the signed copy of a mandate (PDF, PNG or JPEG)
 */
export async function uploadSignedSepaMandate(
  client: KanzenClient,
  mandateId: string,
  file: Buffer | Blob,
  filename: string,
  externalActor?: string,
): Promise<KanzenSepaMandate> {
  const blob =
    file instanceof Blob
      ? file
      : new Blob([new Uint8Array(file)], { type: mimeTypeFromFilename(filename) });

  const form = new FormData();
  form.append("file", blob, filename);
  if (externalActor !== undefined) {
    form.append("externalActor", externalActor);
  }

  return client.request<KanzenSepaMandate>(
    `/sepa-mandates/${encodeURIComponent(mandateId)}/signed`,
    {
      method: "POST",
      body: form,
    },
  );
}

/**
 * Get a short-lived URL to download the signed copy of a mandate
 */
export async function getSignedSepaMandateUrl(
  client: KanzenClient,
  mandateId: string,
): Promise<KanzenSignedUrl> {
  return client.request<KanzenSignedUrl>(
    `/sepa-mandates/${encodeURIComponent(mandateId)}/signed-url`,
  );
}

/**
 * Update a mandate (status, bank details, external actor)
 */
export async function updateSepaMandate(
  client: KanzenClient,
  mandateId: string,
  payload: KanzenUpdateSepaMandatePayload,
): Promise<KanzenSepaMandate> {
  return client.request<KanzenSepaMandate>(
    `/sepa-mandates/${encodeURIComponent(mandateId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Add descendant accounts to the accounts a mandate covers.
 * On a SIGNED mandate, Kanzen copies the IBAN/BIC to the added accounts.
 */
export async function addSepaMandateCoveredAccounts(
  client: KanzenClient,
  mandateId: string,
  accountIds: string[],
): Promise<KanzenSepaMandate> {
  return client.request<KanzenSepaMandate>(
    `/sepa-mandates/${encodeURIComponent(mandateId)}/covered-accounts`,
    {
      method: "POST",
      body: JSON.stringify({ accountIds }),
    },
  );
}

/**
 * Remove an account from the accounts a mandate covers (never the debtor account)
 */
export async function removeSepaMandateCoveredAccount(
  client: KanzenClient,
  mandateId: string,
  accountId: string,
): Promise<KanzenSepaMandate> {
  return client.request<KanzenSepaMandate>(
    `/sepa-mandates/${encodeURIComponent(mandateId)}/covered-accounts/${encodeURIComponent(accountId)}`,
    { method: "DELETE" },
  );
}
