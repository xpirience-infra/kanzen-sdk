"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAccountDocument = uploadAccountDocument;
exports.listAccountDocuments = listAccountDocuments;
exports.getDocumentUrl = getDocumentUrl;
const utils_js_1 = require("./utils.js");
/**
 * Upload one or more files to the document folder of an account (client, group or site),
 * or to its subfolder `options.folder`. Kanzen refuses (422) a file type outside its list,
 * more than 10 files, or a file over 20 MB; a request over 20 MB in all is a 413.
 */
async function uploadAccountDocument(client, accountId, files, options = {}) {
    const list = Array.isArray(files) ? files : [files];
    if (list.length === 0) {
        throw new Error("uploadAccountDocument needs at least one file");
    }
    const form = new FormData();
    for (const file of list) {
        const blob = file.content instanceof Blob
            ? file.content
            : new Blob([new Uint8Array(file.content)], { type: (0, utils_js_1.mimeTypeFromFilename)(file.filename) });
        form.append("files", blob, file.filename);
    }
    if (options.folder !== undefined) {
        form.append("folder", options.folder);
    }
    return client.request(`/accounts/${encodeURIComponent(accountId)}/documents`, {
        method: "POST",
        body: form,
    });
}
/**
 * List the files of the document folder of an account (all its subfolders), newest first,
 * or only those of its subfolder `options.folder`. An account without documents gives [].
 */
async function listAccountDocuments(client, accountId, options = {}) {
    const query = options.folder !== undefined ? `?folder=${encodeURIComponent(options.folder)}` : "";
    const response = await client.request(`/accounts/${encodeURIComponent(accountId)}/documents${query}`);
    return (0, utils_js_1.unwrapList)(response);
}
/**
 * Get a short-lived (10 minutes) download link of a document of an account.
 * The file downloads under its name; ask again rather than store the link.
 */
async function getDocumentUrl(client, documentId) {
    return client.request(`/documents/${encodeURIComponent(documentId)}/url`);
}
