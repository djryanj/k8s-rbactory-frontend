// src/components/RBACBrowser/components/LoadingState.tsx
import React from "react";
import { Loader } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  submessage,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`${message}${submessage ? ` ${submessage}` : ""}`}
    >
      {/* Loading spinner container */}
      <div
        className={combineClasses(
          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
          infoColors.bg,
          infoColors.border,
          "border-2",
        )}
        aria-hidden="true"
      >
        <Loader
          className={combineClasses("animate-spin", infoColors.icon)}
          size={32}
        />
      </div>

      {/* Main loading message */}
      <p
        className={combineClasses("text-sm font-medium", neutralColors.text)}
        id="loading-message"
      >
        {message}
      </p>

      {/* Submessage */}
      {submessage && (
        <p
          className={combineClasses(
            "text-xs mt-2 max-w-md text-center",
            neutralColors.icon,
          )}
          id="loading-submessage"
        >
          {submessage}
        </p>
      )}

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        Loading in progress. {message}
        {submessage && ` ${submessage}`}
        Please wait.
      </div>
    </div>
  );
};
