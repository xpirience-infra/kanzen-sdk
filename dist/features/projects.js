"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPaymentMethods = listPaymentMethods;
exports.listProjectStatuses = listProjectStatuses;
exports.listProjectInvoicingTypes = listProjectInvoicingTypes;
exports.createProject = createProject;
exports.updateProject = updateProject;
exports.getProject = getProject;
const utils_js_1 = require("./utils.js");
const PAGE_SIZE = 100;
/**
 * Kanzen paginates its lists (25 by default): read every page and return one array.
 */
async function listAll(client, path, filter = {}) {
    const items = [];
    let page = 1;
    let lastPage = 1;
    do {
        const params = new URLSearchParams({ $page: String(page), $limit: String(PAGE_SIZE) });
        if (filter.value !== undefined)
            params.set("value", filter.value);
        const response = await client.request(`${path}?${params.toString()}`);
        items.push(...(0, utils_js_1.unwrapList)(response));
        lastPage = Array.isArray(response) ? 1 : (response.meta?.lastPage ?? 1);
        page += 1;
    } while (page <= lastPage);
    return items;
}
/**
 * List the payment methods, optionally filtered by value
 */
async function listPaymentMethods(client, filter) {
    return listAll(client, "/payment-methods", filter);
}
/**
 * List the project statuses, optionally filtered by value
 */
async function listProjectStatuses(client, filter) {
    return listAll(client, "/project-statuses", filter);
}
/**
 * List the project invoicing types
 */
async function listProjectInvoicingTypes(client) {
    return listAll(client, "/project-invoicing-types");
}
/**
 * Create a project
 */
async function createProject(client, payload) {
    return client.request("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
/**
 * Update a project and its milestones (only the fields given are sent)
 */
async function updateProject(client, id, payload) {
    return client.request(`/projects/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}
/**
 * Get a project, with its milestones when it has some
 */
async function getProject(client, id) {
    return client.request(`/projects/${encodeURIComponent(id)}`);
}
