// src/context/config/ConfigProvider.tsx
import React, { useState, useEffect, ReactNode } from "react";
import {
  ConfigContext,
  type ConfigContextType,
  type RetryConfig,
  DEFAULT_RETRY_CONFIG,
} from "./ConfigContext";

const CONFIG_STORAGE_KEY = "k8s-rbac-config";

interface StoredConfig {
  apiEndpoint: string;
  clusterBrowserEnabled: boolean;
  defaultResourceLoadSize: number;
  retryConfig: RetryConfig;
}

const defaultConfig: StoredConfig = {
  apiEndpoint: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  clusterBrowserEnabled: true,
  defaultResourceLoadSize: 20,
  retryConfig: DEFAULT_RETRY_CONFIG,
};

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<StoredConfig>(() => {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          apiEndpoint: parsed.apiEndpoint || defaultConfig.apiEndpoint,
          clusterBrowserEnabled:
            parsed.clusterBrowserEnabled ?? defaultConfig.clusterBrowserEnabled,
          defaultResourceLoadSize:
            parsed.defaultResourceLoadSize ||
            defaultConfig.defaultResourceLoadSize,
          retryConfig: parsed.retryConfig
            ? {
                enabled:
                  parsed.retryConfig.enabled ?? DEFAULT_RETRY_CONFIG.enabled,
                maxAttempts:
                  parsed.retryConfig.maxAttempts ||
                  DEFAULT_RETRY_CONFIG.maxAttempts,
                initialDelaySeconds:
                  parsed.retryConfig.initialDelaySeconds ||
                  DEFAULT_RETRY_CONFIG.initialDelaySeconds,
              }
            : DEFAULT_RETRY_CONFIG,
        };
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const setApiEndpoint = (endpoint: string) => {
    setConfig((prev) => ({ ...prev, apiEndpoint: endpoint }));
  };

  const setClusterBrowserEnabled = (enabled: boolean) => {
    setConfig((prev) => ({ ...prev, clusterBrowserEnabled: enabled }));
  };

  const setdefaultResourceLoadSize = (size: number) => {
    setConfig((prev) => ({ ...prev, defaultResourceLoadSize: size }));
  };

  const setRetryConfig = (retryConfig: RetryConfig) => {
    setConfig((prev) => ({ ...prev, retryConfig }));
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  };

  const value: ConfigContextType = {
    apiEndpoint: config.apiEndpoint,
    setApiEndpoint,
    clusterBrowserEnabled: config.clusterBrowserEnabled,
    setClusterBrowserEnabled,
    defaultResourceLoadSize: config.defaultResourceLoadSize,
    setdefaultResourceLoadSize,
    retryConfig: config.retryConfig,
    setRetryConfig,
    resetConfig,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};
