"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSepaMandates = listSepaMandates;
exports.createSepaMandate = createSepaMandate;
exports.getSepaMandatePdfUrl = getSepaMandatePdfUrl;
exports.uploadSignedSepaMandate = uploadSignedSepaMandate;
exports.getSignedSepaMandateUrl = getSignedSepaMandateUrl;
exports.updateSepaMandate = updateSepaMandate;
const MIME_BY_EXTENSION = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
};
function mimeTypeFromFilename(filename) {
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}
/**
 * List the SEPA mandates of an account
 */
async function listSepaMandates(client, accountId) {
    return client.request(`/accounts/${encodeURIComponent(accountId)}/sepa-mandates`);
}
/**
 * Create a SEPA mandate on an account
 */
async function createSepaMandate(client, accountId, payload = {}) {
    return client.request(`/accounts/${encodeURIComponent(accountId)}/sepa-mandates`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
/**
 * Get a short-lived URL to download the mandate PDF (unsigned)
 */
async function getSepaMandatePdfUrl(client, mandateId) {
    return client.request(`/sepa-mandates/${encodeURIComponent(mandateId)}/pdf-url`);
}
/**
 * Upload the signed copy of a mandate (PDF, PNG or JPEG)
 */
async function uploadSignedSepaMandate(client, mandateId, file, filename, externalActor) {
    const blob = file instanceof Blob
        ? file
        : new Blob([new Uint8Array(file)], { type: mimeTypeFromFilename(filename) });
    const form = new FormData();
    form.append("file", blob, filename);
    if (externalActor !== undefined) {
        form.append("externalActor", externalActor);
    }
    return client.request(`/sepa-mandates/${encodeURIComponent(mandateId)}/signed`, {
        method: "POST",
        body: form,
    });
}
/**
 * Get a short-lived URL to download the signed copy of a mandate
 */
async function getSignedSepaMandateUrl(client, mandateId) {
    return client.request(`/sepa-mandates/${encodeURIComponent(mandateId)}/signed-url`);
}
/**
 * Update a mandate (status, bank details, external actor)
 */
async function updateSepaMandate(client, mandateId, payload) {
    return client.request(`/sepa-mandates/${encodeURIComponent(mandateId)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}
