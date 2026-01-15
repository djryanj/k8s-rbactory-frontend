// src/components/RBACBrowser/components/BrowserFooter.tsx
import React from "react";
import { RefreshCw } from "lucide-react";
import type { BrowserFooterProps } from "../types";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

export const BrowserFooter: React.FC<BrowserFooterProps> = ({
  displayItemsCount,
  displayTotal,
  currentCount,
  hasMore,
  selectedResource,
  loading,
  initialLoadComplete,
  onRefresh,
  isLoading,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const successColors = ACCESSIBLE_COLORS.success;
  const warningColors = ACCESSIBLE_COLORS.warning;
  const infoColors = ACCESSIBLE_COLORS.info;

  return (
    <footer
      className={combineClasses(
        "p-3 border-t",
        "bg-gray-50 dark:bg-gray-700/50",
        "border-gray-200 dark:border-gray-700",
      )}
      role="contentinfo"
      aria-label="Resource browser footer"
    >
      <div className="flex items-center justify-between text-sm gap-4">
        {/* Status information */}
        <div
          className={neutralColors.icon}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {loading || !initialLoadComplete ? (
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
              <span>Loading resources...</span>
            </span>
          ) : (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {/* Main count display */}
              <span className={neutralColors.text}>
                Showing{" "}
                <span
                  className="font-semibold"
                  aria-label={`${displayItemsCount} items`}
                >
                  {displayItemsCount}
                </span>
                {" of "}
                <span
                  className="font-semibold"
                  aria-label={`${displayTotal} total`}
                >
                  {displayTotal}
                </span>
                {" total"}
              </span>

              {/* Load status indicators */}
              {currentCount < displayTotal && hasMore && (
                <span
                  className={combineClasses(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
                    successColors.bg,
                    successColors.text,
                    successColors.border,
                  )}
                  role="status"
                  aria-label={`${currentCount} resources loaded, more available to load`}
                >
                  <span aria-hidden="true">•</span>
                  <span>{currentCount} loaded</span>
                  <span className="hidden sm:inline">, more available</span>
                </span>
              )}

              {currentCount < displayTotal && !hasMore && (
                <span
                  className={combineClasses(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
                    warningColors.bg,
                    warningColors.text,
                    warningColors.border,
                  )}
                  role="status"
                  aria-label={`${currentCount} resources loaded, no more available`}
                >
                  <span aria-hidden="true">•</span>
                  <span>{currentCount} loaded</span>
                </span>
              )}

              {/* Selected resource indicator */}
              {selectedResource && (
                <span
                  className={combineClasses(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border",
                    infoColors.bg,
                    infoColors.text,
                    infoColors.border,
                  )}
                  role="status"
                  aria-label={`Selected resource: ${selectedResource.name}`}
                >
                  <span aria-hidden="true">•</span>
                  <span className="font-semibold">{selectedResource.name}</span>
                  <span className="hidden sm:inline">selected</span>
                </span>
              )}
            </span>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={combineClasses(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium",
            "transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            infoColors.text,
            infoColors.hover,
            infoColors.ring,
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[44px] min-w-[44px]", // Touch target size
          )}
          aria-label={isLoading ? "Refreshing resources" : "Refresh resources"}
          aria-busy={isLoading}
        >
          <RefreshCw
            size={16}
            className={combineClasses(
              isLoading && "animate-spin",
              "flex-shrink-0",
            )}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">
            {isLoading ? "Refreshing..." : "Refresh"}
          </span>
          <span className="sr-only">
            {isLoading
              ? "Refreshing resources, please wait"
              : "Click to refresh resource list"}
          </span>
        </button>
      </div>
    </footer>
  );
};
