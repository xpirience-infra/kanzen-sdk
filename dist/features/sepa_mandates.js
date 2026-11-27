"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSepaMandates = listSepaMandates;
exports.createSepaMandate = createSepaMandate;
exports.getSepaMandatePdfUrl = getSepaMandatePdfUrl;
exports.uploadSignedSepaMandate = uploadSignedSepaMandate;
exports.getSignedSepaMandateUrl = getSignedSepaMandateUrl;
exports.updateSepaMandate = updateSepaMandate;
exports.addSepaMandateCoveredAccounts = addSepaMandateCoveredAccounts;
exports.removeSepaMandateCoveredAccount = removeSepaMandateCoveredAccount;
const utils_js_1 = require("./utils.js");
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
        : new Blob([new Uint8Array(file)], { type: (0, utils_js_1.mimeTypeFromFilename)(filename) });
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
 * Get a short-lived URL to download the signed copy of a mandate.
 * With `options.accountId`, a covered account (a site) opens its parent's signed mandate
 * with its own rights; Kanzen returns 422 if the mandate does not cover that account.
 */
async function getSignedSepaMandateUrl(client, mandateId, options) {
    const query = options?.accountId
        ? `?accountId=${encodeURIComponent(options.accountId)}`
        : "";
    return client.request(`/sepa-mandates/${encodeURIComponent(mandateId)}/signed-url${query}`);
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
/**
 * Add descendant accounts to the accounts a mandate covers.
 * On a SIGNED mandate, Kanzen copies the IBAN/BIC to the added accounts.
 */
async function addSepaMandateCoveredAccounts(client, mandateId, accountIds) {
    return client.request(`/sepa-mandates/${encodeURIComponent(mandateId)}/covered-accounts`, {
        method: "POST",
        body: JSON.stringify({ accountIds }),
    });
}
/**
 * Remove an account from the accounts a mandate covers (never the debtor account)
 */
async function removeSepaMandateCoveredAccount(client, mandateId, accountId) {
    return client.request(`/sepa-mandates/${encodeURIComponent(mandateId)}/covered-accounts/${encodeURIComponent(accountId)}`, { method: "DELETE" });
}
