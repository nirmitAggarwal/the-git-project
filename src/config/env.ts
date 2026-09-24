/**
 * Central runtime configuration sourced from environment variables.
 *
 * Vite statically inlines `import.meta.env.VITE_*` at build time, so the
 * values live in `.env` locally (gitignored) and in the hosting provider's
 * build secrets in production.
 */

interface AppEnv {
  /** Canonical public URL of the deployed site ("main link"), no trailing slash. */
  siteUrl: string;
  /** Secret salt used to sign/verify course-completion tokens. */
  verificationSalt: string;
}

const rawEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

const configuredSiteUrl = (rawEnv.VITE_SITE_URL ?? '').trim();
const configuredSalt = (rawEnv.VITE_VERIFICATION_SALT ?? '').trim();

/**
 * The "main link" for the deployment. Empty/unset values fall back to the
 * current browser origin so the app still works when served from any host.
 */
export const SITE_URL: string = configuredSiteUrl
  ? normalizeBaseUrl(configuredSiteUrl)
  : typeof window !== 'undefined'
    ? normalizeBaseUrl(window.location.origin)
    : 'https://git-github-game.local';

/**
 * Secret salt for the SHA-256 token signature. This mirrors the previous
 * hardcoded value so any tokens issued before the migration keep working.
 */
export const VERIFICATION_SALT: string = configuredSalt || 'GIT_GITHUB_GAME_PROD_VERIFY_SALT_2026';

export const APP_ENV: AppEnv = {
  siteUrl: SITE_URL,
  verificationSalt: VERIFICATION_SALT,
};

/**
 * Public deep link to the verification portal for a given token.
 * Uses the hash route so the link works no matter which path the app is
 * served from.
 */
export function buildVerifyUrl(token: string, baseUrl: string = SITE_URL): string {
  const base = normalizeBaseUrl(baseUrl);
  return `${base}/#/verify?token=${encodeURIComponent(token)}`;
}
