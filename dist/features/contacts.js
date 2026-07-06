"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContact = getContact;
exports.createContact = createContact;
exports.updateContact = updateContact;
exports.deleteContact = deleteContact;
exports.detachContact = detachContact;
/**
 * Get a Contact from Kanzen
 */
async function getContact(client, id) {
    return client.request(`/contacts/${id}`, {
        method: "GET",
    });
}
/**
 * Create a Contact in Kanzen
 */
async function createContact(client, payload) {
    return client.request("/contacts", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
/**
 * Update an existing Contact in Kanzen
 */
async function updateContact(client, id, payload) {
    return client.request(`/contacts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}
/**
 * Delete a Contact in Kanzen
 */
async function deleteContact(client, id) {
    return client.request(`/contacts/${id}`, {
        method: "DELETE",
    });
}
/**
 * Detach a Contact from an Account in Kanzen
 */
async function detachContact(client, id, accountId) {
    return client.request(`/contacts/${id}/detach`, {
        method: "DELETE",
        body: JSON.stringify({ accountId }),
    });
}
