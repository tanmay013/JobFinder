/**
 * Login credentials — server API routes only. Do not import from middleware.
 */
export interface AuthCredentials {
  id: string;
  password: string;
}

export function getAuthCredentials(): AuthCredentials | null {
  const id = process.env.AUTH_ID?.trim();
  const password = process.env.AUTH_PASSWORD?.trim();

  if (!id || !password) {
    return null;
  }

  return { id, password };
}
