import type { GenericOAuthConfig } from "better-auth/plugins/generic-oauth";
import type { KanzenClient } from "../client.js";
import type { KanzenOAuthConfigOptions, NextAuthCustomProviderConfig } from "../types.js";
/**
 * Generates the URL to redirect users to in order to start the OAuth flow.
 */
export declare function getOAuthAuthorizationUrl(client: KanzenClient, params: {
    redirectUri: string;
    clientId: string;
    state?: string;
    scopes?: string[];
}): string;
/**
 * Exchanges the code received in the redirect callback for the user's profile.
 */
export declare function exchangeOAuthCodeForProfile(client: KanzenClient, params: {
    code: string;
    redirectUri: string;
    clientId: string;
    clientSecret?: string;
}): Promise<any>;
/**
 * Helper to generate a Better Auth custom provider configuration using GenericOAuthConfig.
 */
export declare function getBetterAuthProviderConfig(options: KanzenOAuthConfigOptions): GenericOAuthConfig;
/**
 * Helper to generate a NextAuth / Auth.js custom OAuth provider configuration.
 */
export declare function getNextAuthProviderConfig(options: KanzenOAuthConfigOptions): NextAuthCustomProviderConfig;
