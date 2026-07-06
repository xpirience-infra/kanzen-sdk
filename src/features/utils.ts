/**
 * Strips the trailing slash from an API URL if present.
 */
export function sanitizeApiUrl(url: string): string {
  return url.replace(/\/$/, "");
}
