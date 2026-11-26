/**
 * Strips the trailing slash from an API URL if present.
 */
export declare function sanitizeApiUrl(url: string): string;
/**
 * Kanzen list endpoints answer a page `{ data, meta }`; some may answer a bare array.
 * Always returns the array.
 */
export declare function unwrapList<T>(response: T[] | {
    data: T[];
}): T[];
/**
 * The MIME type of a file from its extension (case ignored), `application/octet-stream` when unknown.
 */
export declare function mimeTypeFromFilename(filename: string): string;
