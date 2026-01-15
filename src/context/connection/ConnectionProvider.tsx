// src/context/connection/ConnectionProvider.tsx
import React, { useState, useEffect, useCallback } from "react";
import { apiClient, isAPIError } from "../../services/api";
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
        setError(null);
      } else {
        setClusterInfo(null);
        setError("Unable to connect to API server");
      }
    } catch (err) {
      console.error("Connection check failed:", err);

      setConnected(false);
      setClusterInfo(null);

      // Extract detailed error message from APIError
      if (isAPIError(err)) {
        // Use the full error message from the backend
        setError(err.message);

        // Log additional details for debugging
        if (process.env.NODE_ENV === "development") {
          console.error("API Error Details:", {
            statusCode: err.statusCode,
            details: err.details,
            validationErrors: err.validationErrors,
          });
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
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
