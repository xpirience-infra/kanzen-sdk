"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOAuthAuthorizationUrl = getOAuthAuthorizationUrl;
exports.exchangeOAuthCodeForProfile = exchangeOAuthCodeForProfile;
exports.getBetterAuthProviderConfig = getBetterAuthProviderConfig;
exports.getNextAuthProviderConfig = getNextAuthProviderConfig;
/**
 * Generates the URL to redirect users to in order to start the OAuth flow.
 */
function getOAuthAuthorizationUrl(client, params) {
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
async function exchangeOAuthCodeForProfile(client, params) {
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
    const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: searchParams.toString(),
    });
    if (!tokenResponse.ok) {
        const errText = await tokenResponse.text().catch(() => "Unknown error");
        client.log("info", `OAuth token exchange failed - Status: ${tokenResponse.status}`);
        throw new Error(`OAuth token exchange failed (${tokenResponse.status}): ${errText}`);
    }
    const tokenData = (await tokenResponse.json());
    const accessToken = tokenData.access_token;
    if (!accessToken) {
        client.log("info", "OAuth token response did not contain access_token");
        throw new Error("OAuth token response did not contain access_token");
    }
    // Now fetch user info
    const userInfoUrl = `${client.getApiUrl()}/api/auth/oauth2/userinfo`;
    client.log("verbose", "Fetching profile from userinfo endpoint", { userInfoUrl });
    const userInfoResponse = await fetch(userInfoUrl, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (!userInfoResponse.ok) {
        const errText = await userInfoResponse.text().catch(() => "Unknown error");
        client.log("info", `Failed to fetch userinfo - Status: ${userInfoResponse.status}`);
        throw new Error(`Failed to fetch userinfo (${userInfoResponse.status}): ${errText}`);
    }
    const profile = await userInfoResponse.json();
    client.log("verbose", "Successfully retrieved and parsed user profile", { email: profile.email });
    return profile;
}
/**
 * Helper to generate a Better Auth custom provider configuration using GenericOAuthConfig.
 */
function getBetterAuthProviderConfig(options) {
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
            };
        },
    };
}
/**
 * Helper to generate a NextAuth / Auth.js custom OAuth provider configuration.
 */
function getNextAuthProviderConfig(options) {
    const baseUrl = options.apiUrl.replace(/\/$/, "");
    return {
        id: "kanzen",
        name: "KANZen",
        type: "oauth",
        authorization: `${baseUrl}/api/auth/oauth2/authorize`,
        token: `${baseUrl}/api/auth/oauth2/token`,
        userinfo: `${baseUrl}/api/auth/oauth2/userinfo`,
        profile(profile) {
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
