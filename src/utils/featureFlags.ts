// src/utils/featureFlags.ts
import { runtimeConfig } from "./runtimeConfig";

/**
 * Feature flags controlled by runtime environment variables
 * In Docker: Set via environment variables at container startup
 * In Development: Set via Vite environment variables
 */
export const FEATURE_FLAGS = {
  /**
   * Controls whether the cluster browser feature is available
   * Set VITE_FEATURE_CLUSTER_BROWSER=false to disable
   * Default: true (enabled unless explicitly set to 'false')
   */
  get CLUSTER_BROWSER(): boolean {
    return runtimeConfig.featureClusterBrowser !== "false";
  },

  /**
   * Indicates if this is a Netlify/demo deployment
   * Set VITE_NETLIFY_DEMO=true for preview deployments
   * Default: false (disabled unless explicitly set to 'true')
   */
  get IS_NETLIFY_DEMO(): boolean {
    return runtimeConfig.netlifyDemo === "true";
  },
} as const;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (
  feature: keyof typeof FEATURE_FLAGS,
): boolean => {
  return FEATURE_FLAGS[feature];
};

/**
 * Determine the reason cluster browser is disabled
 */
export const getClusterBrowserDisabledReason = ():
  | "admin"
  | "netlify"
  | null => {
  if (FEATURE_FLAGS.IS_NETLIFY_DEMO) {
    return "netlify";
  }
  if (!FEATURE_FLAGS.CLUSTER_BROWSER) {
    return "admin";
  }
  return null;
};
