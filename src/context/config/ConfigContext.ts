// src/context/config/ConfigContext.ts
import { createContext } from "react";

/**
 * Retry configuration for connection attempts
 */
export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  initialDelaySeconds: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  enabled: true,
  maxAttempts: 5,
  initialDelaySeconds: 5,
};

export interface ConfigContextType {
  apiEndpoint: string;
  setApiEndpoint: (endpoint: string) => void;
  clusterBrowserEnabled: boolean;
  setClusterBrowserEnabled: (enabled: boolean) => void;
  defaultResourceLoadSize: number;
  setdefaultResourceLoadSize: (size: number) => void;
  retryConfig: RetryConfig;
  setRetryConfig: (config: RetryConfig) => void;
  resetConfig: () => void;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined,
);
