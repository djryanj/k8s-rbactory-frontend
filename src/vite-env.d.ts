// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_FEATURE_CLUSTER_BROWSER: string;
  readonly VITE_NETLIFY_DEMO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
