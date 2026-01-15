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
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef(true);
  const checkConnectionRef = useRef<
    ((attempt: number) => Promise<void>) | undefined
  >(undefined);

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
      console.log("ConnectionProvider unmounting, cleaning up...");

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear timers
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
    ],
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
   * Uses checkConnectionRef to avoid circular dependency
   */
  const scheduleRetry = useCallback(
    (attempt: number) => {
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
        } in ${delayMs}ms`,
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

      // Schedule the actual retry - call through ref to avoid circular dependency
      retryTimeoutRef.current = setTimeout(() => {
        if (checkConnectionRef.current) {
          void checkConnectionRef.current(attempt + 1);
        }
      }, delayMs);
    },
    [retryConfig.maxAttempts, calculateNextDelay],
  );

  /**
   * Checks connection to the cluster
   */
  const checkConnection = useCallback(
    async (attempt: number = 0) => {
      console.log(`Starting connection check, attempt ${attempt}`);

      // Cancel any existing retry
      if (attempt === 0) {
        cancelRetry();
      }

      // Cancel any previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setLoading(true);
      setError(null);

      try {
        // Step 1: Check health endpoint
        console.log("Checking health endpoint...");

        // This will now throw an error instead of returning false
        await apiClient.checkConnection();

        console.log("Health check passed");

        // Check if this request was aborted
        if (abortController.signal.aborted) {
          console.log("Request was aborted, stopping");
          return;
        }

        // Step 2: Fetch cluster info
        console.log("Fetching cluster info...");

        try {
          const info = await apiClient.getClusterInfo();
          console.log("Cluster info retrieved successfully:", info);

          // Check if aborted before updating state
          if (abortController.signal.aborted) {
            console.log(
              "Request was aborted after cluster info fetch, stopping",
            );
            return;
          }

          // Success!
          setConnected(true);
          setClusterInfo(info);
          setError(null);
          setRetrying(false);
          setRetryCount(0);
          setNextRetryIn(null);

          console.log("Connection successful");
        } catch (clusterInfoError) {
          // Check if aborted
          if (abortController.signal.aborted) {
            console.log("Request was aborted during error handling");
            return;
          }

          // Health check passed but cluster info failed
          console.error("Failed to get cluster info:", clusterInfoError);

          setConnected(false);
          setClusterInfo(null);

          let errorMessage = "Failed to retrieve cluster information";
          if (isAPIError(clusterInfoError)) {
            errorMessage = clusterInfoError.message;

            console.log("[ConnectionProvider] Cluster info APIError:", {
              message: clusterInfoError.message,
              statusCode: clusterInfoError.statusCode,
            });
          } else if (clusterInfoError instanceof Error) {
            errorMessage = clusterInfoError.message;
          }

          setError(errorMessage);

          // Schedule retry if enabled
          if (userRetryConfig.enabled && attempt < retryConfig.maxAttempts) {
            scheduleRetry(attempt);
          } else {
            setRetrying(false);
            setRetryCount(0);
            setNextRetryIn(null);
          }
        }
      } catch (err) {
        // Check if aborted
        if (abortController.signal.aborted) {
          console.log("Request was aborted during error handling");
          return;
        }

        // Health check failed - this is where CORS errors will land
        console.error("Health check failed:", err);

        setConnected(false);
        setClusterInfo(null);

        // Extract detailed error message
        let errorMessage = "An unknown error occurred";
        if (isAPIError(err)) {
          // Use the detailed error message from APIError
          errorMessage = err.message;

          console.log("[ConnectionProvider] Health check APIError:", {
            message: err.message,
            statusCode: err.statusCode,
            details: err.details,
          });

          if (process.env.NODE_ENV === "development") {
            console.error("API Error Details:", {
              statusCode: err.statusCode,
              details: err.details,
              validationErrors: err.validationErrors,
            });
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
          console.log(
            "[ConnectionProvider] Health check standard Error:",
            err.message,
          );
        } else {
          console.log(
            "[ConnectionProvider] Health check unknown error type:",
            err,
          );
        }

        console.log(
          "[ConnectionProvider] Setting error state to:",
          errorMessage,
        );
        setError(errorMessage);

        // Schedule retry if enabled and not exceeded max attempts
        if (userRetryConfig.enabled && attempt < retryConfig.maxAttempts) {
          scheduleRetry(attempt);
        } else {
          setRetrying(false);
          setRetryCount(0);
          setNextRetryIn(null);
        }
      } finally {
        // Only clear loading if this request wasn't aborted
        if (!abortController.signal.aborted) {
          console.log("Clearing loading state");
          setLoading(false);
        }
      }
    },
    [
      cancelRetry,
      scheduleRetry,
      retryConfig.maxAttempts,
      userRetryConfig.enabled,
    ],
  );

  // Update the ref whenever checkConnection changes
  useEffect(() => {
    checkConnectionRef.current = checkConnection;
  }, [checkConnection]);

  // Initial connection check - runs when apiEndpoint changes
  useEffect(() => {
    // Skip the first mount in Strict Mode (development only)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      console.log("Initial mount, scheduling connection check");
      // Small delay to allow component to fully mount
      const timer = setTimeout(() => {
        console.log("Running initial connection check");
        if (checkConnectionRef.current) {
          void checkConnectionRef.current(0);
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    console.log("API endpoint changed, running connection check");
    if (checkConnectionRef.current) {
      void checkConnectionRef.current(0);
    }
  }, [apiEndpoint]); // Intentionally only depend on apiEndpoint

  const value: ConnectionContextType = {
    connected,
    loading,
    clusterInfo,
    error,
    retrying,
    retryCount,
    nextRetryIn,
    checkConnection: () => {
      if (checkConnectionRef.current) {
        return checkConnectionRef.current(0);
      }
      return Promise.resolve();
    },
    cancelRetry,
    apiClientInstance: apiClient,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};
