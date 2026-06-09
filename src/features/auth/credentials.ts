import "server-only";

/**
 * Login credentials — server API routes only. Do not import from middleware.
 */
export interface AuthCredentials {
  id: string;
  password: string;
}

function readEnv(name: string): string {
  const env = process.env as Record<string, string | undefined>;
  return env[name]?.trim() ?? "";
}

export function getAuthCredentials(): AuthCredentials | null {
  const id = readEnv("AUTH_ID");
  const password = readEnv("AUTH_PASSWORD");

  if (!id || !password) {
    return null;
  }

  return { id, password };
}
