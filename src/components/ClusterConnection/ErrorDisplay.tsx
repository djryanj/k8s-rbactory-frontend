// src/components/ClusterConnection/ErrorDisplay.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { ErrorType } from "./types";
import type { ErrorDisplayProps } from "./types";
import { parseTextWithLinks } from "./linkParser";

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
    case ErrorType.CORS:
      return warningColors;
    case ErrorType.ENDPOINT_CONFIG:
      return warningColors;
    case ErrorType.NETWORK:
    case ErrorType.SERVER:
    case ErrorType.UNKNOWN:
    default:
      return criticalColors;
  }
};

/**
 * Determines if the settings button should be shown for this error type
 * Settings button is only useful when the issue can be fixed through app configuration
 */
const shouldShowSettingsButton = (type: ErrorType): boolean => {
  switch (type) {
    case ErrorType.NETWORK:
      // Network errors might be due to wrong API endpoint
      return true;
    case ErrorType.AUTHENTICATION:
      // Authentication errors might be due to wrong credentials/token
      return true;
    case ErrorType.CORS:
      // CORS errors require backend configuration, but user might need to change endpoint
      return true;
    case ErrorType.ENDPOINT_CONFIG:
      // Definitely show settings for endpoint config issues
      return true;
    case ErrorType.RBAC:
      // RBAC errors require cluster-level configuration, not app settings
      return false;
    case ErrorType.SERVER:
      // Server errors are not fixable through settings
      return false;
    case ErrorType.UNKNOWN:
      // Unknown errors might benefit from checking settings
      return true;
    default:
      return false;
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
  const showSettings = shouldShowSettingsButton(error.type);

  return (
    <div
      className={combineClasses(
        "mt-3 rounded-lg border",
        errorColors.bg,
        errorColors.border,
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
              errorColors.text,
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
                errorColors.text,
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
                    errorColors.icon,
                  )}
                >
                  <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    •
                  </span>
                  <span className="flex-1">
                    {parseTextWithLinks(suggestion)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Settings link - only for errors fixable through app settings */}
          {showSettings && (
            <button
              onClick={onOpenSettings}
              className={combineClasses(
                "mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 rounded px-2 py-1",
                errorColors.text,
                "hover:underline",
                errorColors.ring,
              )}
              aria-label="Open settings to check configuration"
            >
              <Settings size={12} aria-hidden="true" />
              <span>Check Settings</span>
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
              errorColors.ring,
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
                errorColors.border,
              )}
            >
              <pre
                className={combineClasses(
                  "text-xs font-mono whitespace-pre-wrap break-words",
                  errorColors.icon,
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
