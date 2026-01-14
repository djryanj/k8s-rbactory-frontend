// src/utils/featureFlags.ts

/**
 * Feature flags controlled by build-time environment variables
 */
export const FEATURE_FLAGS = {
  /**
   * Controls whether the cluster browser feature is available
   * Set VITE_FEATURE_CLUSTER_BROWSER=false to disable at build time
   */
  CLUSTER_BROWSER: import.meta.env.VITE_FEATURE_CLUSTER_BROWSER !== 'false',
} as const;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};
