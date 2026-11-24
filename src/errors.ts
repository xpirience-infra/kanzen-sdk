/**
 * Error thrown by the client for every non-2xx response and every network failure.
 * `status` is the HTTP status, or null when no response came back (`code` says why).
 */
export class KanzenApiError extends Error {
  readonly status: number | null;
  readonly code?: "TIMEOUT" | "NETWORK";
  readonly body?: unknown;

  constructor(
    message: string,
    details: { status: number | null; code?: "TIMEOUT" | "NETWORK"; body?: unknown },
  ) {
    super(message);
    this.name = "KanzenApiError";
    this.status = details.status;
    this.code = details.code;
    this.body = details.body;
    Object.setPrototypeOf(this, KanzenApiError.prototype);
  }
}

/** Parsed JSON when the text is JSON, the raw text otherwise */
export function parseErrorBody(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
