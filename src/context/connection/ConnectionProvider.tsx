// src/context/connection/ConnectionProvider.tsx
import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../services/api";
import { useConfig } from "../config";
import {
  ConnectionContext,
  type ConnectionContextType,
} from "./ConnectionContext";

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { apiEndpoint } = useConfig();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clusterInfo, setClusterInfo] =
    useState<ConnectionContextType["clusterInfo"]>(null);
  const [error, setError] = useState<string | null>(null);

  // Update API client when endpoint changes
  useEffect(() => {
    apiClient.setBaseURL(apiEndpoint);
  }, [apiEndpoint]);

  const checkConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const isConnected = await apiClient.checkConnection();
      setConnected(isConnected);

      if (isConnected) {
        const info = await apiClient.getClusterInfo();
        setClusterInfo(info);
      } else {
        setClusterInfo(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to API server";
      console.error("Connection check failed:", errorMessage);
      setError(errorMessage);
      setConnected(false);
      setClusterInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check connection when endpoint changes
  useEffect(() => {
    void checkConnection();
  }, [checkConnection]);

  const value: ConnectionContextType = {
    connected,
    loading,
    clusterInfo,
    error,
    checkConnection,
    apiClientInstance: apiClient,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};
