// src/components/RBACBrowser/components/BrowserHeader.tsx
import React from "react";
import { Loader } from "lucide-react";
import type { BrowserHeaderProps } from "../types";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

export const BrowserHeader: React.FC<BrowserHeaderProps> = ({
  displayTotal,
  autoLoading,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const successColors = ACCESSIBLE_COLORS.success;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <header
      className="flex items-center justify-between mb-3 gap-4"
      role="banner"
      aria-label="Resource browser header"
    >
      {/* Main heading */}
      <h2
        className={combineClasses("text-lg font-semibold", neutralColors.text)}
        id="browser-heading"
      >
        Browse Cluster RBAC
      </h2>

      {/* Status badges */}
      <div
        className="flex items-center gap-2 text-sm flex-wrap justify-end"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Total count badge */}
        <span
          className={combineClasses(
            "inline-flex items-center px-3 py-1 rounded-full font-medium border",
            infoColors.bg,
            infoColors.text,
            infoColors.border,
          )}
          aria-label={`${displayTotal} total resources in cluster`}
        >
          <span className="font-semibold">{displayTotal}</span>
          <span className="ml-1">total</span>
        </span>

        {/* Auto-loading indicator */}
        {autoLoading && (
          <span
            className={combineClasses(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              successColors.bg,
              successColors.text,
              successColors.border,
            )}
            role="status"
            aria-label="Automatically loading more resources"
            aria-busy="true"
          >
            <Loader
              className="animate-spin flex-shrink-0"
              size={12}
              aria-hidden="true"
            />
            <span>Loading more...</span>
            <span className="sr-only">
              Additional resources are being loaded automatically
            </span>
          </span>
        )}
      </div>
    </header>
  );
};
