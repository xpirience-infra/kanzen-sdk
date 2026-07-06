"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeApiUrl = sanitizeApiUrl;
/**
 * Strips the trailing slash from an API URL if present.
 */
function sanitizeApiUrl(url) {
    return url.replace(/\/$/, "");
}
