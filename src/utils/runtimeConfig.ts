// src/utils/runtimeConfig.ts

/**
 * Extend the Window interface to include our runtime config
 */
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      API_URL: string;
      FEATURE_CLUSTER_BROWSER: string;
      NETLIFY_DEMO: string;
    };
  }
}

/**
 * Runtime configuration loaded from config.js
 * Falls back to build-time environment variables for development
 */
interface RuntimeConfig {
  API_URL: string;
  FEATURE_CLUSTER_BROWSER: string;
  NETLIFY_DEMO: string;
}

/**
 * Gets runtime configuration
 * In production (Docker), this comes from config.js generated at container startup
 * In development, this comes from Vite environment variables
 */
export const getRuntimeConfig = (): RuntimeConfig => {
  let config: RuntimeConfig;

  // Check if runtime config exists (production/Docker)
  if (typeof window !== "undefined" && window.__RUNTIME_CONFIG__) {
    const runtimeConfig = window.__RUNTIME_CONFIG__;

    console.log(
      "[RuntimeConfig] Loading from window.__RUNTIME_CONFIG__:",
      runtimeConfig,
    );

    config = {
      API_URL:
        runtimeConfig.API_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:8080/api/v1",
      FEATURE_CLUSTER_BROWSER:
        runtimeConfig.FEATURE_CLUSTER_BROWSER ||
        import.meta.env.VITE_FEATURE_CLUSTER_BROWSER ||
        "",
      NETLIFY_DEMO:
        runtimeConfig.NETLIFY_DEMO || import.meta.env.VITE_NETLIFY_DEMO || "",
    };
  } else {
    // Development fallback to Vite env vars
    console.log(
      "[RuntimeConfig] No window.__RUNTIME_CONFIG__ found, using Vite env vars",
    );

    config = {
      API_URL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
      FEATURE_CLUSTER_BROWSER:
        import.meta.env.VITE_FEATURE_CLUSTER_BROWSER || "",
      NETLIFY_DEMO: import.meta.env.VITE_NETLIFY_DEMO || "",
    };
  }

  return config;
};

/**
 * Typed access to runtime configuration values
 */
export const runtimeConfig = {
  get apiUrl(): string {
    return getRuntimeConfig().API_URL;
  },

  get featureClusterBrowser(): string {
    return getRuntimeConfig().FEATURE_CLUSTER_BROWSER;
  },

  get netlifyDemo(): string {
    return getRuntimeConfig().NETLIFY_DEMO;
  },
};
