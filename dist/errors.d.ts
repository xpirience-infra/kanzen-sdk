/**
 * Error thrown by the client for every non-2xx response and every network failure.
 * `status` is the HTTP status, or null when no response came back (`code` says why).
 */
export declare class KanzenApiError extends Error {
    readonly status: number | null;
    readonly code?: "TIMEOUT" | "NETWORK";
    readonly body?: unknown;
    constructor(message: string, details: {
        status: number | null;
        code?: "TIMEOUT" | "NETWORK";
        body?: unknown;
    });
}
/** Parsed JSON when the text is JSON, the raw text otherwise */
export declare function parseErrorBody(text: string): unknown;
