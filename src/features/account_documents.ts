import type { KanzenClient } from "../client.js";
import type {
  KanzenAccountDocument,
  KanzenDocumentUrl,
  KanzenListAccountDocumentsOptions,
  KanzenUploadAccountDocumentOptions,
  KanzenUploadFile,
} from "../types.js";
import { mimeTypeFromFilename, unwrapList } from "./utils.js";

/**
 * Upload one or more files to the document folder of an account (client, group or site),
 * or to its subfolder `options.folder`. Kanzen refuses (422) a file type outside its list,
 * more than 10 files, or a file over 20 MB; a request over 20 MB in all is a 413.
 */
export async function uploadAccountDocument(
  client: KanzenClient,
  accountId: string,
  files: KanzenUploadFile | KanzenUploadFile[],
  options: KanzenUploadAccountDocumentOptions = {},
): Promise<KanzenAccountDocument[]> {
  const list = Array.isArray(files) ? files : [files];
  if (list.length === 0) {
    throw new Error("uploadAccountDocument needs at least one file");
  }

  const form = new FormData();
  for (const file of list) {
    const blob =
      file.content instanceof Blob
        ? file.content
        : new Blob([new Uint8Array(file.content)], { type: mimeTypeFromFilename(file.filename) });
    form.append("files", blob, file.filename);
  }
  if (options.folder !== undefined) {
    form.append("folder", options.folder);
  }

  return client.request<KanzenAccountDocument[]>(
    `/accounts/${encodeURIComponent(accountId)}/documents`,
    {
      method: "POST",
      body: form,
    },
  );
}

/**
 * List the files of the document folder of an account (all its subfolders), newest first,
 * or only those of its subfolder `options.folder`. An account without documents gives [].
 */
export async function listAccountDocuments(
  client: KanzenClient,
  accountId: string,
  options: KanzenListAccountDocumentsOptions = {},
): Promise<KanzenAccountDocument[]> {
  const query =
    options.folder !== undefined ? `?folder=${encodeURIComponent(options.folder)}` : "";
  const response = await client.request<
    KanzenAccountDocument[] | { data: KanzenAccountDocument[] }
  >(`/accounts/${encodeURIComponent(accountId)}/documents${query}`);
  return unwrapList(response);
}

/**
 * Get a short-lived (10 minutes) download link of a document of an account.
 * The file downloads under its name; ask again rather than store the link.
 */
export async function getDocumentUrl(
  client: KanzenClient,
  documentId: string,
): Promise<KanzenDocumentUrl> {
  return client.request<KanzenDocumentUrl>(
    `/documents/${encodeURIComponent(documentId)}/url`,
  );
}
