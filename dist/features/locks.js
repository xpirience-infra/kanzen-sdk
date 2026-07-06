"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireLock = acquireLock;
exports.extendLock = extendLock;
exports.releaseLock = releaseLock;
/**
 * Acquire a lock on an entity in Kanzen
 */
async function acquireLock(client, payload) {
    return client.request("/locks", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
/**
 * Extend a lock on an entity in Kanzen
 */
async function extendLock(client, payload) {
    return client.request("/locks", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}
/**
 * Release a lock on an entity in Kanzen
 */
async function releaseLock(client, payload) {
    return client.request("/locks", {
        method: "DELETE",
        body: JSON.stringify(payload),
    });
}
