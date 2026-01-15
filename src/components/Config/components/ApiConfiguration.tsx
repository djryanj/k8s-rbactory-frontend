// src/components/Config/components/ApiConfiguration.tsx
import React from "react";
import { Server } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

interface ApiConfigurationProps {
  endpoint: string;
  onEndpointChange: (endpoint: string) => void;
}

export const ApiConfiguration: React.FC<ApiConfigurationProps> = ({
  endpoint,
  onEndpointChange,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <section aria-labelledby="api-config-heading">
      <h3
        id="api-config-heading"
        className={combineClasses(
          "text-lg font-semibold mb-4",
          neutralColors.text,
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
              neutralColors.text,
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
              neutralColors.border,
              infoColors.ring,
            )}
            aria-describedby="api-endpoint-description"
          />
          <p
            id="api-endpoint-description"
            className={combineClasses("mt-2 text-xs", neutralColors.icon)}
          >
            The backend API server endpoint for the cluster browser in the
            format http[s]://backend[port]/api/v1
          </p>
        </div>
      </div>
    </section>
  );
};
