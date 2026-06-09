/**
 * Session secret used by middleware only — never import auth credentials here.
 * Keeps AUTH_PASSWORD out of the Edge middleware bundle.
 */
export function getSessionSecret(): string | null {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  return secret || null;
}
