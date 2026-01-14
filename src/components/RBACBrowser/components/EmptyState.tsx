// src/components/RBACBrowser/components/EmptyState.tsx
import React from "react";
import { CloudOff, AlertCircle, RefreshCw } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

interface EmptyStateProps {
  type: "disconnected" | "error";
  message: string;
  submessage?: string;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  submessage,
  onRetry,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const criticalColors = ACCESSIBLE_COLORS.critical;
  const warningColors = ACCESSIBLE_COLORS.warning;

  const isError = type === "error";
  const colors = isError ? criticalColors : warningColors;
  const Icon = isError ? AlertCircle : CloudOff;

  return (
    <div
      className="text-center py-12 px-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      <div
        className={combineClasses(
          "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
          colors.bg,
          colors.border,
          "border-2"
        )}
        aria-hidden="true"
      >
        <Icon className={colors.icon} size={32} />
      </div>

      {/* Main message */}
      <h3
        className={combineClasses("text-lg font-semibold mb-2", colors.text)}
        id="empty-state-title"
      >
        {message}
      </h3>

      {/* Submessage */}
      {submessage && (
        <p
          className={combineClasses(
            "text-sm max-w-md mx-auto",
            neutralColors.icon
          )}
          id="empty-state-description"
        >
          {submessage}
        </p>
      )}

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className={combineClasses(
            "mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium",
            "transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "bg-blue-600 dark:bg-blue-500 text-white",
            "hover:bg-blue-700 dark:hover:bg-blue-600",
            "focus:ring-blue-500",
            "min-h-[44px]" // Touch target size
          )}
          aria-label="Retry loading resources"
          aria-describedby={
            submessage ? "empty-state-description" : "empty-state-title"
          }
        >
          <RefreshCw size={16} aria-hidden="true" />
          <span>Retry</span>
        </button>
      )}

      {/* Additional context for screen readers */}
      <div className="sr-only">
        {isError ? (
          <p>
            An error occurred while loading resources. {message}
            {submessage && ` ${submessage}`}
            {onRetry && " You can retry the operation."}
          </p>
        ) : (
          <p>
            Not connected to cluster. {message}
            {submessage && ` ${submessage}`}
          </p>
        )}
      </div>
    </div>
  );
};
