/**
 * Session secret used by middleware only — never import auth credentials here.
 * Uses bracket access so Next.js does not inline the value at build time.
 */
export function getSessionSecret(): string | null {
  const env = process.env as Record<string, string | undefined>;
  const secret = env["AUTH_SESSION_SECRET"]?.trim();
  return secret || null;
}
