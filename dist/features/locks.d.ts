import type { KanzenClient } from "../client.js";
import type { KanzenLockPayload, KanzenLockResponse } from "../types.js";
/**
 * Acquire a lock on an entity in Kanzen
 */
export declare function acquireLock(client: KanzenClient, payload: KanzenLockPayload): Promise<KanzenLockResponse>;
/**
 * Extend a lock on an entity in Kanzen
 */
export declare function extendLock(client: KanzenClient, payload: KanzenLockPayload): Promise<KanzenLockResponse>;
/**
 * Release a lock on an entity in Kanzen
 */
export declare function releaseLock(client: KanzenClient, payload: KanzenLockPayload): Promise<KanzenLockResponse>;
