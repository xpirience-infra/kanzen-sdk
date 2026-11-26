"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeApiUrl = sanitizeApiUrl;
exports.unwrapList = unwrapList;
exports.mimeTypeFromFilename = mimeTypeFromFilename;
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
const MIME_BY_EXTENSION = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    odt: "application/vnd.oasis.opendocument.text",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    csv: "text/csv",
    txt: "text/plain",
};
/**
 * The MIME type of a file from its extension (case ignored), `application/octet-stream` when unknown.
 */
function mimeTypeFromFilename(filename) {
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}
