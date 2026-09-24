/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Canonical public URL of the deployed site ("main link"). */
  readonly VITE_SITE_URL?: string;
  /** Secret salt used to sign/verify course-completion tokens. */
  readonly VITE_VERIFICATION_SALT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
