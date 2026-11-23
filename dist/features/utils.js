"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeApiUrl = sanitizeApiUrl;
exports.unwrapList = unwrapList;
/**
 * Strips the trailing slash from an API URL if present.
 */
function sanitizeApiUrl(url) {
    return url.replace(/\/$/, "");
}
/**
 * Kanzen list endpoints answer a page `{ data, meta }`; some may answer a bare array.
 * Always returns the array.
 */
function unwrapList(response) {
    return Array.isArray(response) ? response : response.data;
}
