// src/components/ClusterConnection/ConnectionDebug.tsx
import React from "react";
import { useConnection } from "../../context/connection";

/**
 * Debug component to help troubleshoot connection issues
 * Only renders in development mode
 */
export const ConnectionDebug: React.FC = () => {
  const { connected, loading, clusterInfo, error } = useConnection();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <details className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
      <summary className="cursor-pointer font-semibold mb-2">
        🐛 Debug Info (Dev Only)
      </summary>
      <div className="font-mono space-y-2 mt-2">
        <div>
          <strong>Connected:</strong> {String(connected)}
        </div>
        <div>
          <strong>Loading:</strong> {String(loading)}
        </div>
        <div>
          <strong>Error:</strong>
          <pre className="mt-1 p-2 bg-white dark:bg-gray-900 rounded overflow-x-auto">
            {error || "null"}
          </pre>
        </div>
        <div>
          <strong>Cluster Info:</strong>
          <pre className="mt-1 p-2 bg-white dark:bg-gray-900 rounded overflow-x-auto">
            {JSON.stringify(clusterInfo, null, 2)}
          </pre>
        </div>
      </div>
    </details>
  );
};
