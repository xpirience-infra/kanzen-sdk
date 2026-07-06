"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccount = createAccount;
exports.updateAccount = updateAccount;
exports.deleteAccount = deleteAccount;
/**
 * Create a single Account (Client, Group, or Site) in Kanzen
 */
async function createAccount(client, payload) {
    return client.request("/accounts", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
/**
 * Update an existing Account in Kanzen
 */
async function updateAccount(client, id, payload) {
    return client.request(`/accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}
/**
 * Delete (soft-delete) an Account in Kanzen
 */
async function deleteAccount(client, id) {
    return client.request(`/accounts/${id}`, {
        method: "DELETE",
    });
}
