import type { KanzenClient } from "../client.js";
import type { KanzenAccountDocument, KanzenDocumentUrl, KanzenListAccountDocumentsOptions, KanzenUploadAccountDocumentOptions, KanzenUploadFile } from "../types.js";
/**
 * Upload one or more files to the document folder of an account (client, group or site),
 * or to its subfolder `options.folder`. Kanzen refuses (422) a file type outside its list,
 * more than 10 files, or a file over 20 MB; a request over 20 MB in all is a 413.
 */
export declare function uploadAccountDocument(client: KanzenClient, accountId: string, files: KanzenUploadFile | KanzenUploadFile[], options?: KanzenUploadAccountDocumentOptions): Promise<KanzenAccountDocument[]>;
/**
 * List the files of the document folder of an account (all its subfolders), newest first,
 * or only those of its subfolder `options.folder`. An account without documents gives [].
 */
export declare function listAccountDocuments(client: KanzenClient, accountId: string, options?: KanzenListAccountDocumentsOptions): Promise<KanzenAccountDocument[]>;
/**
 * Get a short-lived (10 minutes) download link of a document of an account.
 * The file downloads under its name; ask again rather than store the link.
 */
export declare function getDocumentUrl(client: KanzenClient, documentId: string): Promise<KanzenDocumentUrl>;
