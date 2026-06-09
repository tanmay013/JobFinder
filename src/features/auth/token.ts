import {
  DEFAULT_AUTH_ID,
  DEFAULT_AUTH_PASSWORD,
} from "./constants";

export interface AuthCredentials {
  id: string;
  password: string;
}

/** Hardcoded, env-overridable credentials — the only way to access the app. */
export function getAuthCredentials(): AuthCredentials {
  return {
    id: process.env.AUTH_ID?.trim() || DEFAULT_AUTH_ID,
    password: process.env.AUTH_PASSWORD?.trim() || DEFAULT_AUTH_PASSWORD,
  };
}

/**
 * Derive an opaque session token from the credentials so the password is never
 * stored in the cookie. Runs in both Node and Edge (middleware) runtimes.
 */
export async function computeAuthToken(
  id: string,
  password: string,
): Promise<string> {
  const data = new TextEncoder().encode(`${id}:${password}:job-finder-auth`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getExpectedAuthToken(): Promise<string> {
  const { id, password } = getAuthCredentials();
  return computeAuthToken(id, password);
}
