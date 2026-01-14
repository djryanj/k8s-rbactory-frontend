// src/components/ClusterConnection/ErrorDisplay.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { ErrorType } from "./types";
import type { ErrorDisplayProps } from "./types";

/**
 * Get appropriate color scheme based on error type
 */
const getErrorColors = (type: ErrorType) => {
  const warningColors = ACCESSIBLE_COLORS.warning;
  const criticalColors = ACCESSIBLE_COLORS.critical;

  switch (type) {
    case ErrorType.RBAC:
    case ErrorType.AUTHENTICATION:
      return warningColors;
    case ErrorType.NETWORK:
    case ErrorType.SERVER:
    case ErrorType.UNKNOWN:
    default:
      return criticalColors;
  }
};

/**
 * ErrorDisplay Component
 * Displays parsed error information with suggestions and expandable details
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onOpenSettings,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const errorColors = getErrorColors(error.type);
  const ErrorIcon = error.icon;

  return (
    <div
      className={combineClasses(
        "mt-3 rounded-lg border",
        errorColors.bg,
        errorColors.border
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Error header */}
      <div className="p-3 flex items-start gap-3">
        <ErrorIcon
          className={combineClasses("flex-shrink-0 mt-0.5", errorColors.icon)}
          size={20}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <h3
            className={combineClasses(
              "text-sm font-semibold mb-1",
              errorColors.text
            )}
          >
            {error.title}
          </h3>
          <p className={combineClasses("text-sm mb-2", errorColors.icon)}>
            {error.message}
          </p>

          {/* Suggestions */}
          <div className="mt-3">
            <p
              className={combineClasses(
                "text-xs font-medium mb-2",
                errorColors.text
              )}
            >
              Suggested Actions:
            </p>
            <ul className="space-y-1.5">
              {error.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={combineClasses(
                    "text-xs flex items-start gap-2",
                    errorColors.icon
                  )}
                >
                  <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    •
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Settings link for RBAC errors */}
          {error.type === ErrorType.RBAC && (
            <button
              onClick={onOpenSettings}
              className={combineClasses(
                "mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 rounded px-2 py-1",
                errorColors.text,
                "hover:underline",
                errorColors.ring
              )}
              aria-label="Open settings to configure permissions"
            >
              <Settings size={12} aria-hidden="true" />
              <span>Configure Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable error details */}
      {error.details && (
        <>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={combineClasses(
              "w-full px-3 py-2 flex items-center justify-between gap-2",
              "border-t text-xs font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-inset",
              errorColors.border,
              errorColors.text,
              errorColors.hover,
              errorColors.ring
            )}
            aria-expanded={showDetails}
            aria-controls="error-details"
          >
            <span>{showDetails ? "Hide" : "Show"} Technical Details</span>
            {showDetails ? (
              <ChevronUp size={14} aria-hidden="true" />
            ) : (
              <ChevronDown size={14} aria-hidden="true" />
            )}
          </button>

          {showDetails && (
            <div
              id="error-details"
              className={combineClasses(
                "px-3 py-2 border-t",
                errorColors.border
              )}
            >
              <pre
                className={combineClasses(
                  "text-xs font-mono whitespace-pre-wrap break-words",
                  errorColors.icon
                )}
              >
                {error.details}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};
