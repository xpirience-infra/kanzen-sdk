"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSepaSigningRequest = createSepaSigningRequest;
exports.listSepaSigningRequests = listSepaSigningRequests;
exports.resendSepaSigningRequest = resendSepaSigningRequest;
exports.cancelSepaSigningRequest = cancelSepaSigningRequest;
/**
 * Send one or more mandates to a contact for signature.
 * The contact gets one e-mail link to a Kanzen-hosted signing page.
 */
async function createSepaSigningRequest(client, payload) {
    return client.request(`/sepa-signing-requests`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
/**
 * List the signing requests of an account or of a mandate
 */
async function listSepaSigningRequests(client, filter) {
    const params = new URLSearchParams();
    if (filter.accountId)
        params.set("accountId", filter.accountId);
    if (filter.mandateId)
        params.set("mandateId", filter.mandateId);
    if (filter.status)
        params.set("status", filter.status);
    const query = params.toString();
    return client.request(`/sepa-signing-requests${query ? `?${query}` : ""}`);
}
/**
 * Send a new link for an open request (the previous link stops working, the expiry is reset)
 */
async function resendSepaSigningRequest(client, requestId) {
    return client.request(`/sepa-signing-requests/${encodeURIComponent(requestId)}/resend`, { method: "POST" });
}
/**
 * Cancel an open request (its link stops working)
 */
async function cancelSepaSigningRequest(client, requestId) {
    return client.request(`/sepa-signing-requests/${encodeURIComponent(requestId)}/cancel`, { method: "POST" });
}
