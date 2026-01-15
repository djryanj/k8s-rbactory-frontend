// src/components/ResourceSelector/ResourceSummary.tsx
import React from "react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";

interface ResourceSummaryProps {
  totalResources: number;
  customResourcesCount: number;
  totalPermissions: number;
}

export const ResourceSummary: React.FC<ResourceSummaryProps> = ({
  totalResources,
  customResourcesCount,
  totalPermissions,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;

  return (
    <aside
      className={combineClasses(
        "p-4 border rounded-lg",
        infoColors.bg,
        infoColors.border,
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className={combineClasses("text-sm font-medium", infoColors.text)}>
            Total Resources: {totalResources}
            {customResourcesCount > 0 && ` (${customResourcesCount} custom)`}
          </p>
          <p className={combineClasses("text-xs mt-1", infoColors.text)}>
            Total Permissions: {totalPermissions}
          </p>
        </div>
        <div className="text-right">
          <p className={combineClasses("text-xs", infoColors.text)}>
            Resources with no verbs will not be included in the final YAML
          </p>
        </div>
      </div>
    </aside>
  );
};
