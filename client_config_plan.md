# Technical Specification: Implementing OAuth/OIDC Client Helpers in `kanzen-sdk`

This specification describes how to add client configuration helpers to the `kanzen-sdk` package. This allows external applications to authenticate with the KANZen platform using standard OAuth 2.1 / OpenID Connect (OIDC).

---

## 1. Goal
Provide zero-dependency helpers inside `kanzen-sdk` to generate configuration objects for popular authentication libraries (NextAuth/Auth.js, Better Auth, and standard OAuth clients) that target KANZen's new Better Auth OAuth endpoints.

---

## 2. Directory Structure of `kanzen-sdk`
```
kanzen-sdk/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        # Exports public classes/helpers
│   ├── client.ts       # Main KanzenClient class
│   └── types.ts        # Type declarations
```

---

## 3. Implementation Details

### A. Define TS Types in `src/types.ts`
Add the following interfaces to `src/types.ts`:

```typescript
export interface KanzenOAuthConfigOptions {
  /** Base URL of the KANZen API (e.g., 'https://kanzen.mycompany.com') */
  apiUrl: string;
  /** OAuth Client ID */
  clientId: string;
  /** OAuth Client Secret (Optional for public/PKCE clients) */
  clientSecret?: string;
  /** Requested scopes (defaults to ['openid', 'profile', 'email']) */
  scopes?: string[];
}

export interface BetterAuthCustomProviderConfig {
  id: string;
  name: string;
  authorizationUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  clientId: string;
  clientSecret?: string;
  scopes: string[];
  mapping: {
    id: string;
    email: string;
    name: string;
    image: string;
    roles?: string;
    groups?: string;
  };
}

export interface NextAuthCustomProviderConfig {
  id: string;
  name: string;
  type: "oauth";
  authorization: string;
  token: string;
  userinfo: string;
  profile: (profile: any) => {
    id: string;
    name: string;
    email: string;
    image: string;
    roles: string[];
    groups: string[];
  };
  clientId: string;
  clientSecret?: string;
}
```

### B. Implement Config Helpers in `src/client.ts`
Implement and export the following functions/methods:

#### 1. Better Auth Client Config
Generates configuration for [Better Auth's custom social provider](https://www.better-auth.com/docs/concepts/oauth#custom-provider):
```typescript
/**
 * Helper to generate a Better Auth custom provider configuration.
 */
export function getBetterAuthProviderConfig(
  options: KanzenOAuthConfigOptions
): BetterAuthCustomProviderConfig {
  const baseUrl = options.apiUrl.replace(/\/$/, "");
  return {
    id: "kanzen",
    name: "KANZen",
    authorizationUrl: `${baseUrl}/api/auth/oauth2/authorize`,
    tokenUrl: `${baseUrl}/api/auth/oauth2/token`,
    userinfoUrl: `${baseUrl}/api/auth/oauth2/userinfo`,
    clientId: options.clientId,
    ...(options.clientSecret ? { clientSecret: options.clientSecret } : {}),
    scopes: options.scopes || ["openid", "profile", "email"],
    mapping: {
      id: "id",
      email: "email",
      name: "name",
      image: "image",
      roles: "roles",
      groups: "groups",
    },
  };
}
```

#### 2. NextAuth (Auth.js) Config
Generates configuration for [NextAuth custom OAuth provider](https://next-auth.js.org/configuration/providers/oauth):
```typescript
/**
 * Helper to generate a NextAuth / Auth.js custom OAuth provider configuration.
 */
export function getNextAuthProviderConfig(
  options: KanzenOAuthConfigOptions
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
```

### C. Export Helpers in `src/index.ts`
Ensure the new types and functions are exported in `src/index.ts`:
```typescript
export * from "./types.js";
export { KanzenClient } from "./client.js";
export { getBetterAuthProviderConfig, getNextAuthProviderConfig } from "./client.js";
```

---

## 4. Verification & Build
After implementing:
1. Run `yarn build` inside the SDK project directory to ensure type check compiles and target JS files are compiled correctly in `dist/`.
2. Ensure no dependencies on external auth libraries are added to the package's dependencies list in `package.json` to remain fully agnostic.
