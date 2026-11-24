"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanzenApiError = void 0;
exports.parseErrorBody = parseErrorBody;
/**
 * Error thrown by the client for every non-2xx response and every network failure.
 * `status` is the HTTP status, or null when no response came back (`code` says why).
 */
class KanzenApiError extends Error {
    status;
    code;
    body;
    constructor(message, details) {
        super(message);
        this.name = "KanzenApiError";
        this.status = details.status;
        this.code = details.code;
        this.body = details.body;
        Object.setPrototypeOf(this, KanzenApiError.prototype);
    }
}
exports.KanzenApiError = KanzenApiError;
/** Parsed JSON when the text is JSON, the raw text otherwise */
function parseErrorBody(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
