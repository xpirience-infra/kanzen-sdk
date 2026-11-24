import type { GenericOAuthConfig } from "better-auth/plugins/generic-oauth";
import type { KanzenClient } from "../client.js";
import { KanzenApiError, parseErrorBody } from "../errors.js";
import type {
  KanzenOAuthConfigOptions,
  NextAuthCustomProviderConfig,
} from "../types.js";

/**
 * Generates the URL to redirect users to in order to start the OAuth flow.
 */
export function getOAuthAuthorizationUrl(
  client: KanzenClient,
  params: {
    redirectUri: string;
    clientId: string;
    state?: string;
    scopes?: string[];
  },
): string {
  const url = new URL(`${client.getApiUrl()}/api/auth/oauth2/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  if (params.state) {
    url.searchParams.set("state", params.state);
  }
  const scopes = params.scopes || ["openid", "profile", "email"];
  url.searchParams.set("scope", scopes.join(" "));
  return url.toString();
}

/**
 * Exchanges the code received in the redirect callback for the user's profile.
 */
export async function exchangeOAuthCodeForProfile(
  client: KanzenClient,
  params: {
    code: string;
    redirectUri: string;
    clientId: string;
    clientSecret?: string;
  },
): Promise<any> {
  client.log("info", "Exchanging OAuth authorization code for profile");

  const tokenUrl = `${client.getApiUrl()}/api/auth/oauth2/token`;
  const searchParams = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
  });
  if (params.clientSecret) {
    searchParams.set("client_secret", params.clientSecret);
  }

  client.log("verbose", "Exchanging code at token endpoint", { tokenUrl });
  const tokenResponse = await client.fetchWithTimeout(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: searchParams.toString(),
  }, "POST /api/auth/oauth2/token");

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text().catch(() => "Unknown error");
    client.log("info", `OAuth token exchange failed - Status: ${tokenResponse.status}`);
    throw new KanzenApiError(`OAuth token exchange failed (${tokenResponse.status}): ${errText}`, {
      status: tokenResponse.status,
      body: parseErrorBody(errText),
    });
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    client.log("info", "OAuth token response did not contain access_token");
    throw new Error("OAuth token response did not contain access_token");
  }

  // Now fetch user info
  const userInfoUrl = `${client.getApiUrl()}/api/auth/oauth2/userinfo`;
  client.log("verbose", "Fetching profile from userinfo endpoint", { userInfoUrl });
  const userInfoResponse = await client.fetchWithTimeout(userInfoUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }, "GET /api/auth/oauth2/userinfo");

  if (!userInfoResponse.ok) {
    const errText = await userInfoResponse.text().catch(() => "Unknown error");
    client.log("info", `Failed to fetch userinfo - Status: ${userInfoResponse.status}`);
    throw new KanzenApiError(`Failed to fetch userinfo (${userInfoResponse.status}): ${errText}`, {
      status: userInfoResponse.status,
      body: parseErrorBody(errText),
    });
  }

  const profile = await userInfoResponse.json();
  client.log("verbose", "Successfully retrieved and parsed user profile", { email: profile.email });
  return profile;
}

/**
 * Helper to generate a Better Auth custom provider configuration using GenericOAuthConfig.
 */
export function getBetterAuthProviderConfig(
  options: KanzenOAuthConfigOptions,
): GenericOAuthConfig {
  const baseUrl = options.apiUrl.replace(/\/$/, "");
  return {
    providerId: "kanzen",
    authorizationUrl: `${baseUrl}/api/auth/oauth2/authorize`,
    tokenUrl: `${baseUrl}/api/auth/oauth2/token`,
    userInfoUrl: `${baseUrl}/api/auth/oauth2/userinfo`,
    clientId: options.clientId,
    ...(options.clientSecret ? { clientSecret: options.clientSecret } : {}),
    scopes: options.scopes || ["openid", "profile", "email"],
    mapProfileToUser(profile) {
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        image: profile.image || profile.picture,
        roles: profile.roles || [],
        groups: profile.groups || [],
      } as any;
    },
  };
}

/**
 * Helper to generate a NextAuth / Auth.js custom OAuth provider configuration.
 */
export function getNextAuthProviderConfig(
  options: KanzenOAuthConfigOptions,
): NextAuthCustomProviderConfig {
  const baseUrl = options.apiUrl.replace(/\/$/, "");
  return {
    id: "kanzen",
    name: "KANZen",
    type: "oauth",
    authorization: `${baseUrl}/api/auth/oauth2/authorize`,
    token: `${baseUrl}/api/auth/oauth2/token`,
    userinfo: `${baseUrl}/api/auth/oauth2/userinfo`,
    profile(profile: any) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.image || profile.picture,
        roles: profile.roles || [],
        groups: profile.groups || [],
      };
    },
    clientId: options.clientId,
    ...(options.clientSecret ? { clientSecret: options.clientSecret } : {}),
  };
}
