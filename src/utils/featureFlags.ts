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
  
  /**
   * Indicates if this is a Netlify/demo deployment
   * Set VITE_NETLIFY_DEMO=true for preview deployments
   */
  IS_NETLIFY_DEMO: import.meta.env.VITE_NETLIFY_DEMO === 'true',
} as const;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

/**
 * Determine the reason cluster browser is disabled
 */
export const getClusterBrowserDisabledReason = (): 'admin' | 'netlify' | null => {
  if (FEATURE_FLAGS.IS_NETLIFY_DEMO) {
    return 'netlify';
  }
  if (!FEATURE_FLAGS.CLUSTER_BROWSER) {
    return 'admin';
  }
  return null;
};
