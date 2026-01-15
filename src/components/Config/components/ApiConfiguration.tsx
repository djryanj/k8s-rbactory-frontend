// src/components/Config/components/ApiConfiguration.tsx
import React, { useMemo } from "react";
import { Server, AlertTriangle } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

interface ApiConfigurationProps {
  endpoint: string;
  onEndpointChange: (endpoint: string) => void;
}

/**
 * Validates if the endpoint has the correct /api/v1 suffix
 */
const validateEndpoint = (
  endpoint: string
): { isValid: boolean; message?: string } => {
  if (!endpoint || endpoint.trim() === "") {
    return { isValid: false, message: "Endpoint cannot be empty" };
  }

  // Check if it ends with /api/v1
  const trimmedEndpoint = endpoint.trim();

  if (!trimmedEndpoint.endsWith("/api/v1")) {
    // Check if it ends with just /api or /api/
    if (trimmedEndpoint.endsWith("/api") || trimmedEndpoint.endsWith("/api/")) {
      return {
        isValid: false,
        message: "Endpoint should end with /api/v1 (not just /api)",
      };
    }

    // Check if it has /api/v1 but with trailing content
    if (trimmedEndpoint.includes("/api/v1/")) {
      return {
        isValid: false,
        message: "Endpoint should end with /api/v1 (remove trailing path)",
      };
    }

    return {
      isValid: false,
      message: "Endpoint must end with /api/v1",
    };
  }

  // Check for valid URL format
  try {
    new URL(trimmedEndpoint);
  } catch {
    return {
      isValid: false,
      message: "Invalid URL format",
    };
  }

  return { isValid: true };
};

export const ApiConfiguration: React.FC<ApiConfigurationProps> = ({
  endpoint,
  onEndpointChange,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const warningColors = ACCESSIBLE_COLORS.warning;

  // Validate endpoint
  const validation = useMemo(() => validateEndpoint(endpoint), [endpoint]);

  return (
    <section aria-labelledby="api-config-heading">
      <h3
        id="api-config-heading"
        className={combineClasses(
          "text-lg font-semibold mb-4",
          neutralColors.text
        )}
      >
        API Configuration
      </h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="api-endpoint"
            className={combineClasses(
              "block text-sm font-medium mb-2",
              neutralColors.text
            )}
          >
            <Server className="inline mr-2" size={16} aria-hidden="true" />
            Backend API Endpoint
          </label>
          <input
            id="api-endpoint"
            type="url"
            value={endpoint}
            onChange={(e) => onEndpointChange(e.target.value)}
            placeholder="http://localhost:8080/api/v1"
            className={combineClasses(
              "w-full px-3 py-2 border rounded-lg transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              neutralColors.bg,
              neutralColors.text,
              validation.isValid ? neutralColors.border : warningColors.border,
              validation.isValid ? infoColors.ring : warningColors.ring
            )}
            aria-describedby="api-endpoint-description api-endpoint-validation"
            aria-invalid={!validation.isValid}
          />

          {/* Validation message */}
          {!validation.isValid && validation.message && (
            <div
              id="api-endpoint-validation"
              className={combineClasses(
                "mt-2 flex items-start gap-2 text-sm",
                warningColors.text
              )}
              role="alert"
            >
              <AlertTriangle
                size={16}
                className={combineClasses(
                  "flex-shrink-0 mt-0.5",
                  warningColors.icon
                )}
                aria-hidden="true"
              />
              <span>{validation.message}</span>
            </div>
          )}

          <p
            id="api-endpoint-description"
            className={combineClasses("mt-2 text-xs", neutralColors.icon)}
          >
            The backend API server endpoint for cluster operations. Must end
            with{" "}
            <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
              /api/v1
            </code>
          </p>

          {/* Example */}
          <div className={combineClasses("mt-2 text-xs", neutralColors.icon)}>
            <span className="font-medium">Examples:</span>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>
                <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                  http://localhost:8080/api/v1
                </code>
              </li>
              <li>
                <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                  https://api.example.com/api/v1
                </code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
