// src/components/Config/components/ClusterBrowserSettings.tsx
import React from "react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import { announceToScreenReader } from "../../../utils/accessibility";

interface ClusterBrowserSettingsProps {
  enabled: boolean;
  pageSize: number;
  onEnabledChange: (enabled: boolean) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;

export const ClusterBrowserSettings: React.FC<ClusterBrowserSettingsProps> = ({
  enabled,
  pageSize,
  onEnabledChange,
  onPageSizeChange,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const handlePageSizeChange = (newSize: number) => {
    onPageSizeChange(newSize);
    announceToScreenReader(`Page load size changed to ${newSize} items`);
  };

  return (
    <section aria-labelledby="cluster-browser-heading">
      <h3
        id="cluster-browser-heading"
        className={combineClasses(
          "text-lg font-semibold mb-4",
          neutralColors.text
        )}
      >
        Cluster Browser
      </h3>

      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div
          className={combineClasses(
            "flex items-center justify-between p-4 rounded-lg",
            "bg-gray-50 dark:bg-gray-700/50"
          )}
        >
          <div className="flex-1">
            <div
              id="cluster-browser-toggle-label"
              className={combineClasses("font-medium", neutralColors.text)}
            >
              Enable Cluster Browser
            </div>
            <div className={combineClasses("text-sm", neutralColors.icon)}>
              Show the cluster browser tab
            </div>
          </div>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onEnabledChange(e.target.checked)}
                className="sr-only peer"
                aria-labelledby="cluster-browser-toggle-label"
                aria-describedby="cluster-browser-toggle-description"
              />
              <div
                className={combineClasses(
                  "w-11 h-6 rounded-full peer transition-colors",
                  "peer-focus:outline-none peer-focus:ring-4",
                  "peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800",
                  "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                  "after:bg-white after:border-gray-300 after:border",
                  "after:rounded-full after:h-5 after:w-5 after:transition-all",
                  "peer-checked:after:translate-x-full peer-checked:after:border-white",
                  enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
                )}
                role="presentation"
              />
              <span className="sr-only">
                {enabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        </div>
        <span id="cluster-browser-toggle-description" className="sr-only">
          Toggle to enable or disable the cluster browser feature
        </span>

        {/* Page Size Selector */}
        {enabled && (
          <div>
            <label
              htmlFor="resource-load-size"
              className={combineClasses(
                "block text-sm font-medium mb-2",
                neutralColors.text
              )}
            >
              Cluster Resource Page Load Size
            </label>
            <select
              id="resource-load-size"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                infoColors.ring
              )}
              aria-describedby="resource-load-size-description"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} items per request
                </option>
              ))}
            </select>
            <p
              id="resource-load-size-description"
              className={combineClasses("mt-2 text-xs", neutralColors.icon)}
            >
              Number of items (page size) to load per request to the backend API
              (to prevent throttling)
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
