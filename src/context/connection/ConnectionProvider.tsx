// src/context/connection/ConnectionProvider.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiClient, isAPIError } from "../../services/api";
import { useConfig } from "../config";
import {
  ConnectionContext,
  type ConnectionContextType,
} from "./ConnectionContext";

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { apiEndpoint, retryConfig: userRetryConfig } = useConfig();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clusterInfo, setClusterInfo] =
    useState<ConnectionContextType["clusterInfo"]>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | null>(null);

  // Refs for cleanup and preventing duplicate checks
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const hasInitialCheckRef = useRef(false);

  // Convert user config to internal format
  const retryConfig = {
    maxAttempts: userRetryConfig.enabled ? userRetryConfig.maxAttempts : 0,
    initialDelayMs: userRetryConfig.initialDelaySeconds * 1000,
    maxDelayMs: 60000, // 60 seconds max
    backoffMultiplier: 2,
  };

  // Update API client when endpoint changes
  useEffect(() => {
    apiClient.setBaseURL(apiEndpoint);
  }, [apiEndpoint]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  /**
   * Calculates the next delay using exponential backoff
   */
  const calculateNextDelay = useCallback(
    (attempt: number): number => {
      const delay =
        retryConfig.initialDelayMs *
        Math.pow(retryConfig.backoffMultiplier, attempt);
      return Math.min(delay, retryConfig.maxDelayMs);
    },
    [
      retryConfig.initialDelayMs,
      retryConfig.backoffMultiplier,
      retryConfig.maxDelayMs,
    ]
  );

  /**
   * Cancels any pending retry
   */
  const cancelRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setRetrying(false);
    setRetryCount(0);
    setNextRetryIn(null);
  }, []);

  /**
   * Schedules a retry with exponential backoff
   */
  const scheduleRetry = useCallback(
    (
      attempt: number,
      checkConnectionFn: (attempt: number) => Promise<void>
    ) => {
      if (attempt >= retryConfig.maxAttempts) {
        console.log("Max retry attempts reached");
        setRetrying(false);
        setRetryCount(0);
        setNextRetryIn(null);
        return;
      }

      const delayMs = calculateNextDelay(attempt);
      setRetrying(true);
      setRetryCount(attempt + 1);
      setNextRetryIn(delayMs);

      console.log(
        `Scheduling retry ${attempt + 1}/${
          retryConfig.maxAttempts
        } in ${delayMs}ms`
      );

      // Update countdown every second
      let remainingMs = delayMs;
      countdownIntervalRef.current = setInterval(() => {
        remainingMs -= 1000;
        if (remainingMs <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setNextRetryIn(null);
        } else {
          setNextRetryIn(remainingMs);
        }
      }, 1000);

      // Schedule the actual retry
      retryTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          void checkConnectionFn(attempt + 1);
        }
      }, delayMs);
    },
    [retryConfig.maxAttempts, calculateNextDelay]
  );

  /**
   * Checks connection to the cluster
   */
  const checkConnection = useCallback(
    async (attempt: number = 0) => {
      // Cancel any existing retry
      if (attempt === 0) {
        cancelRetry();
      }

      setLoading(true);
      setError(null);

      try {
        const isConnected = await apiClient.checkConnection();

        if (!isMountedRef.current) return;

        if (isConnected) {
          // Success - fetch cluster info
          try {
            const info = await apiClient.getClusterInfo();

            if (!isMountedRef.current) return;

            setConnected(true);
            setClusterInfo(info);
            setError(null);
            setRetrying(false);
            setRetryCount(0);
            setNextRetryIn(null);
            setLoading(false);

            console.log("Successfully connected to cluster");
          } catch (clusterInfoError) {
            // Health check passed but cluster info failed
            console.error("Failed to get cluster info:", clusterInfoError);

            if (!isMountedRef.current) return;

            setConnected(false);
            setClusterInfo(null);

            let errorMessage = "Failed to retrieve cluster information";
            if (isAPIError(clusterInfoError)) {
              errorMessage = clusterInfoError.message;
            } else if (clusterInfoError instanceof Error) {
              errorMessage = clusterInfoError.message;
            }

            setError(errorMessage);
            setLoading(false);

            // Schedule retry if enabled
            if (userRetryConfig.enabled && attempt < retryConfig.maxAttempts) {
              scheduleRetry(attempt, checkConnection);
            } else {
              setRetrying(false);
              setRetryCount(0);
              setNextRetryIn(null);
            }
          }
        } else {
          // Connection check returned false
          if (!isMountedRef.current) return;

          setConnected(false);
          setClusterInfo(null);
          setError("Unable to connect to API server");
          setLoading(false);

          // Schedule retry if enabled and not exceeded max attempts
          if (userRetryConfig.enabled && attempt < retryConfig.maxAttempts) {
            scheduleRetry(attempt, checkConnection);
          } else {
            setRetrying(false);
            setRetryCount(0);
            setNextRetryIn(null);
          }
        }
      } catch (err) {
        console.error("Connection check failed:", err);

        if (!isMountedRef.current) return;

        setConnected(false);
        setClusterInfo(null);

        // Extract detailed error message
        let errorMessage = "An unknown error occurred";
        if (isAPIError(err)) {
          errorMessage = err.message;

          if (process.env.NODE_ENV === "development") {
            console.error("API Error Details:", {
              statusCode: err.statusCode,
              details: err.details,
              validationErrors: err.validationErrors,
            });
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setLoading(false);

        // Schedule retry if enabled and not exceeded max attempts
        if (userRetryConfig.enabled && attempt < retryConfig.maxAttempts) {
          scheduleRetry(attempt, checkConnection);
        } else {
          setRetrying(false);
          setRetryCount(0);
          setNextRetryIn(null);
        }
      }
    },
    [
      cancelRetry,
      scheduleRetry,
      retryConfig.maxAttempts,
      userRetryConfig.enabled,
    ]
  );

  // Initial connection check - only runs once on mount or when endpoint changes
  useEffect(() => {
    // Reset the initial check flag when endpoint changes
    hasInitialCheckRef.current = false;
  }, [apiEndpoint]);

  useEffect(() => {
    // Only run if we haven't done the initial check yet
    if (!hasInitialCheckRef.current) {
      hasInitialCheckRef.current = true;
      console.log("Running initial connection check");
      void checkConnection(0);
    }
  }, [apiEndpoint]); // Only depend on apiEndpoint, not checkConnection

  const value: ConnectionContextType = {
    connected,
    loading,
    clusterInfo,
    error,
    retrying,
    retryCount,
    nextRetryIn,
    checkConnection: () => checkConnection(0),
    cancelRetry,
    apiClientInstance: apiClient,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};
