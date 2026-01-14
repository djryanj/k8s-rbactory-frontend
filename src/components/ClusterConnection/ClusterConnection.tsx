// src/components/ClusterConnection/ClusterConnection.tsx
import React from "react";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Settings,
  CheckCircle,
} from "lucide-react";
import { useConnection } from "../../context/connection";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { parseError } from "./errorParser";
import { ErrorDisplay } from "./ErrorDisplay";
import type { ClusterConnectionProps } from "./types";

export const ClusterConnection: React.FC<ClusterConnectionProps> = ({
  onOpenSettings,
}) => {
  const { connected, loading, clusterInfo, error, checkConnection } =
    useConnection();

  const successColors = ACCESSIBLE_COLORS.success;
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;

  const handleRefresh = () => {
    void checkConnection();
  };

  // Parse error if present
  const parsedError = error ? parseError(error) : null;

  return (
    <section
      className={combineClasses(
        "rounded-lg border p-4",
        neutralColors.bg,
        neutralColors.border
      )}
      role="region"
      aria-label="Cluster connection status"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Status indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={combineClasses(
                "flex items-center justify-center w-10 h-10 rounded-full border-2",
                connected ? successColors.bg : neutralColors.bg,
                connected ? successColors.border : neutralColors.border
              )}
              aria-hidden="true"
            >
              {connected ? (
                <Cloud className={successColors.icon} size={20} />
              ) : (
                <CloudOff className={neutralColors.icon} size={20} />
              )}
            </div>
            <h2
              className={combineClasses(
                "text-sm font-semibold",
                neutralColors.text
              )}
              id="cluster-status-heading"
            >
              Cluster Status
            </h2>
          </div>

          {/* Connected state with cluster info */}
          {connected && clusterInfo && (
            <div
              className="flex items-center gap-3 text-sm flex-wrap"
              role="status"
              aria-live="polite"
              aria-labelledby="cluster-status-heading"
            >
              <span
                className={combineClasses(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border text-xs",
                  successColors.bg,
                  successColors.text,
                  successColors.border
                )}
                role="status"
              >
                <CheckCircle size={14} aria-hidden="true" />
                <span>Connected</span>
              </span>

              <span
                className={combineClasses(
                  "inline-flex items-center px-2 py-1 rounded border text-xs font-medium",
                  infoColors.bg,
                  infoColors.text,
                  infoColors.border
                )}
                aria-label={`Kubernetes version ${clusterInfo.version}`}
              >
                {clusterInfo.version}
              </span>

              <span className={neutralColors.icon} aria-hidden="true">
                •
              </span>

              <span
                className={neutralColors.icon}
                aria-label={`${clusterInfo.namespaces.length} namespaces`}
              >
                <span className="font-medium">
                  {clusterInfo.namespaces.length}
                </span>{" "}
                namespace{clusterInfo.namespaces.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Disconnected state */}
          {!connected && !loading && !error && (
            <div
              className={combineClasses("text-sm", neutralColors.icon)}
              role="status"
              aria-live="polite"
            >
              <span>Not connected. </span>
              <button
                onClick={onOpenSettings}
                className={combineClasses(
                  "inline-flex items-center gap-1 font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 rounded",
                  infoColors.text,
                  "hover:underline",
                  infoColors.ring
                )}
                aria-label="Open settings to configure cluster connection"
              >
                <Settings size={14} aria-hidden="true" />
                <span>Check Settings</span>
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div
              className={combineClasses(
                "flex items-center gap-2 text-sm",
                neutralColors.icon
              )}
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <RefreshCw
                size={16}
                className="animate-spin"
                aria-hidden="true"
              />
              <span>Checking connection...</span>
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={combineClasses(
            "p-2 rounded-lg transition-colors flex-shrink-0",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            neutralColors.hover,
            neutralColors.ring,
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[40px] min-w-[40px]" // Touch target
          )}
          title={loading ? "Refreshing..." : "Refresh connection status"}
          aria-label={
            loading
              ? "Refreshing connection status"
              : "Refresh cluster connection status"
          }
          aria-busy={loading}
        >
          <RefreshCw
            size={18}
            className={combineClasses(
              loading && "animate-spin",
              neutralColors.icon
            )}
            aria-hidden="true"
          />
          <span className="sr-only">
            {loading ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {/* Error display */}
      {parsedError && (
        <ErrorDisplay error={parsedError} onOpenSettings={onOpenSettings} />
      )}

      {/* Screen reader summary */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {connected && clusterInfo
          ? `Connected to Kubernetes cluster version ${clusterInfo.version} with ${clusterInfo.namespaces.length} namespaces and ${clusterInfo.nodeCount} nodes.`
          : loading
          ? "Checking cluster connection status."
          : parsedError
          ? `${parsedError.title}: ${parsedError.message}`
          : "Not connected to cluster. Please check settings."}
      </div>
    </section>
  );
};
