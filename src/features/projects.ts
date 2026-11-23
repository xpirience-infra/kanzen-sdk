import type { KanzenClient } from "../client.js";
import type {
  KanzenPaymentMethod,
  KanzenProjectStatus,
  KanzenProjectInvoicingType,
  KanzenProject,
  KanzenCreateProjectPayload,
  KanzenUpdateProjectPayload,
} from "../types.js";
import { unwrapList } from "./utils.js";

const PAGE_SIZE = 100;

type Page<T> = T[] | { data: T[]; meta?: { lastPage?: number } };

/**
 * Kanzen paginates its lists (25 by default): read every page and return one array.
 */
async function listAll<T>(
  client: KanzenClient,
  path: string,
  filter: { value?: string } = {},
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const params = new URLSearchParams({ $page: String(page), $limit: String(PAGE_SIZE) });
    if (filter.value !== undefined) params.set("value", filter.value);
    const response = await client.request<Page<T>>(`${path}?${params.toString()}`);
    items.push(...unwrapList(response));
    lastPage = Array.isArray(response) ? 1 : (response.meta?.lastPage ?? 1);
    page += 1;
  } while (page <= lastPage);
  return items;
}

/**
 * List the payment methods, optionally filtered by value
 */
export async function listPaymentMethods(
  client: KanzenClient,
  filter?: { value?: string },
): Promise<KanzenPaymentMethod[]> {
  return listAll<KanzenPaymentMethod>(client, "/payment-methods", filter);
}

/**
 * List the project statuses, optionally filtered by value
 */
export async function listProjectStatuses(
  client: KanzenClient,
  filter?: { value?: string },
): Promise<KanzenProjectStatus[]> {
  return listAll<KanzenProjectStatus>(client, "/project-statuses", filter);
}

/**
 * List the project invoicing types
 */
export async function listProjectInvoicingTypes(
  client: KanzenClient,
): Promise<KanzenProjectInvoicingType[]> {
  return listAll<KanzenProjectInvoicingType>(client, "/project-invoicing-types");
}

/**
 * Create a project
 */
export async function createProject(
  client: KanzenClient,
  payload: KanzenCreateProjectPayload,
): Promise<KanzenProject> {
  return client.request<KanzenProject>("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a project and its milestones (only the fields given are sent)
 */
export async function updateProject(
  client: KanzenClient,
  id: string,
  payload: KanzenUpdateProjectPayload,
): Promise<KanzenProject> {
  return client.request<KanzenProject>(`/projects/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Get a project, with its milestones when it has some
 */
export async function getProject(
  client: KanzenClient,
  id: string,
): Promise<KanzenProject> {
  return client.request<KanzenProject>(`/projects/${encodeURIComponent(id)}`);
}
