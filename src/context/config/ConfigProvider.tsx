// src/context/config/ConfigProvider.tsx
import React, { useState, useEffect } from "react";
import { ConfigContext, type ConfigContextType } from "./ConfigContext";

const CONFIG_STORAGE_KEY = "k8s-rbac-config";

interface StoredConfig {
  apiEndpoint: string;
  clusterBrowserEnabled: boolean;
  defaultResourceLoadSize: number;
}

const defaultConfig: StoredConfig = {
  apiEndpoint: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  clusterBrowserEnabled: true,
  defaultResourceLoadSize: 20,
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
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
    resetConfig,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};
