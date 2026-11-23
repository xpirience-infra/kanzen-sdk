/**
 * Strips the trailing slash from an API URL if present.
 */
export function sanitizeApiUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * Kanzen list endpoints answer a page `{ data, meta }`; some may answer a bare array.
 * Always returns the array.
 */
export function unwrapList<T>(response: T[] | { data: T[] }): T[] {
  return Array.isArray(response) ? response : response.data;
}
