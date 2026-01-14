// src/components/ResourceSelector/PermissionConfigPanel.tsx
import React from "react";
import {
  type ResourcePermission,
  type ResourceType,
} from "../../types/rbac.types";
import { RESOURCE_METADATA } from "../../utils/resourceMetadata";
import { PermissionMatrix } from "./PermissionMatrix/PermissionMatrix";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { K8sResourceIcon } from "@/icons";
import { announceToScreenReader } from "../../utils/accessibility";

const ALL_VERBS = [
  "get",
  "list",
  "watch",
  "create",
  "update",
  "patch",
  "delete",
  "deletecollection",
] as const;

interface PermissionConfigPanelProps {
  permissions: ResourcePermission[];
  activeResource: ResourceType | null;
  onResourceChange: (resource: ResourceType | null) => void;
  onRemove: (resource: ResourceType) => void;
}

export const PermissionConfigPanel: React.FC<PermissionConfigPanelProps> = ({
  permissions,
  activeResource,
  onResourceChange,
  onRemove,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;
  const criticalColors = ACCESSIBLE_COLORS.critical;

  const currentPermission =
    permissions.find((p) => p.resource === activeResource) || permissions[0];

  if (!currentPermission) {
    return null;
  }

  const currentIndex = permissions.findIndex(
    (p) => p.resource === currentPermission.resource
  );
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < permissions.length - 1;

  const handlePrevious = () => {
    if (!hasPrevious) return;

    const prevPermission = permissions[currentIndex - 1];
    if (!prevPermission) return;

    const prevResource = prevPermission.resource as ResourceType;
    onResourceChange(prevResource);
    announceToScreenReader(`Switched to ${prevResource} permissions`);
  };

  const handleNext = () => {
    if (!hasNext) return;

    const nextPermission = permissions[currentIndex + 1];
    if (!nextPermission) return;

    const nextResource = nextPermission.resource as ResourceType;
    onResourceChange(nextResource);
    announceToScreenReader(`Switched to ${nextResource} permissions`);
  };

  const handleRemove = () => {
    const resourceToRemove = currentPermission.resource as ResourceType;
    const metadata = RESOURCE_METADATA[resourceToRemove];
    const displayName = metadata?.displayName || resourceToRemove;

    // Navigate to next/previous resource before removing
    if (hasNext) {
      const nextPermission = permissions[currentIndex + 1];
      if (nextPermission) {
        onResourceChange(nextPermission.resource as ResourceType);
      }
    } else if (hasPrevious) {
      const prevPermission = permissions[currentIndex - 1];
      if (prevPermission) {
        onResourceChange(prevPermission.resource as ResourceType);
      }
    } else {
      onResourceChange(null);
    }

    // Remove the resource
    setTimeout(() => {
      onRemove(resourceToRemove);
      announceToScreenReader(`${displayName} removed from role`);
    }, 0);
  };

  const metadata =
    RESOURCE_METADATA[currentPermission.resource as ResourceType];
  const isCustom = !metadata;

  const displayName = metadata?.displayName || currentPermission.resource;
  const description = metadata?.description || "Custom resource definition";
  const availableVerbs = metadata?.commonVerbs || ALL_VERBS;

  return (
    <div className="flex flex-col h-full">
      {/* Header - Panel Title Only */}
      <div
        className={combineClasses(
          "px-4 pt-4 pb-3 border-b",
          neutralColors.bg,
          neutralColors.border
        )}
      >
        <h3
          className={combineClasses(
            "text-lg font-semibold",
            neutralColors.text
          )}
        >
          Configure Permissions
        </h3>
        <p className={combineClasses("text-xs mt-1", neutralColors.icon)}>
          {permissions.length === 1
            ? "Configure permissions for this resource"
            : `Configuring ${currentIndex + 1} of ${
                permissions.length
              } resources`}
        </p>
      </div>

      {/* Resource Info Card with Remove Button */}
      <div
        className={combineClasses(
          "p-4 border-b",
          "bg-gray-50 dark:bg-gray-800",
          neutralColors.border
        )}
      >
        <div className="flex items-start gap-3">
          <K8sResourceIcon
            kind={isCustom ? "custom" : currentPermission.resource}
            size={40}
            className={combineClasses(neutralColors.icon, "flex-shrink-0 mt-1")}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className={combineClasses(
                    "text-base font-semibold",
                    neutralColors.text
                  )}
                >
                  {displayName}
                </h4>
                {isCustom && (
                  <span
                    className={combineClasses(
                      "text-xs px-2 py-0.5 rounded-full border",
                      "bg-gray-100 dark:bg-gray-700",
                      "text-gray-700 dark:text-gray-300",
                      "border-gray-300 dark:border-gray-600"
                    )}
                    aria-label="Custom resource"
                  >
                    Custom
                  </span>
                )}
              </div>

              {/* Remove Button - Now associated with the resource */}
              <button
                type="button"
                onClick={handleRemove}
                className={combineClasses(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all border flex-shrink-0",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  criticalColors.text,
                  criticalColors.hover,
                  criticalColors.border,
                  criticalColors.ring
                )}
                aria-label={`Remove ${displayName} from role`}
                title={`Remove ${displayName}`}
              >
                <Trash2 size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>

            <p
              className={combineClasses(
                "text-xs mt-0.5 mb-2",
                neutralColors.icon
              )}
            >
              {description}
            </p>

            <div
              className={combineClasses(
                "text-xs flex items-center gap-2 flex-wrap",
                neutralColors.icon
              )}
            >
              <span className="font-mono">{currentPermission.resource}</span>
              <span>•</span>
              <span>{currentPermission.apiGroup || "core"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {permissions.length > 1 && (
        <div
          className={combineClasses(
            "px-4 py-3 border-b",
            "bg-gray-50 dark:bg-gray-800",
            neutralColors.border
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className={combineClasses(
                "flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                hasPrevious
                  ? combineClasses(
                      infoColors.text,
                      infoColors.hover,
                      infoColors.ring
                    )
                  : neutralColors.icon
              )}
              aria-label="Previous resource"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              <span>Previous</span>
            </button>

            <span className={combineClasses("text-sm", neutralColors.icon)}>
              {currentIndex + 1} of {permissions.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              disabled={!hasNext}
              className={combineClasses(
                "flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                hasNext
                  ? combineClasses(
                      infoColors.text,
                      infoColors.hover,
                      infoColors.ring
                    )
                  : neutralColors.icon
              )}
              aria-label="Next resource"
            >
              <span>Next</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Quick Resource Selector */}
          {permissions.length > 3 && (
            <div>
              <label
                htmlFor="resource-quick-select"
                className={combineClasses(
                  "text-xs font-medium mb-1 block",
                  neutralColors.text
                )}
              >
                Jump to resource:
              </label>
              <select
                id="resource-quick-select"
                value={currentPermission.resource}
                onChange={(e) =>
                  onResourceChange(e.target.value as ResourceType)
                }
                className={combineClasses(
                  "w-full px-2 py-1.5 text-sm border rounded transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  neutralColors.bg,
                  neutralColors.text,
                  neutralColors.border,
                  infoColors.ring
                )}
              >
                {permissions.map((p) => {
                  const meta = RESOURCE_METADATA[p.resource as ResourceType];
                  const name = meta?.displayName || p.resource;
                  return (
                    <option key={p.resource} value={p.resource}>
                      {name} ({p.verbs.length} verbs)
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Permission Matrix */}
      <div
        className={combineClasses(
          "p-4 flex-1 overflow-y-auto",
          neutralColors.bg
        )}
      >
        <PermissionMatrix
          resource={currentPermission.resource}
          selectedVerbs={currentPermission.verbs}
          availableVerbs={availableVerbs}
        />
      </div>

      {/* Footer with Summary */}
      <div
        className={combineClasses(
          "p-3 border-t text-xs",
          neutralColors.border,
          infoColors.bg
        )}
      >
        <div className="flex items-center justify-between">
          <span className={infoColors.text}>
            {currentPermission.verbs.length > 0
              ? `${currentPermission.verbs.length} permission${
                  currentPermission.verbs.length === 1 ? "" : "s"
                } configured`
              : "No permissions configured"}
          </span>
          {currentPermission.verbs.length === 0 && (
            <span className={combineClasses("italic", neutralColors.icon)}>
              This resource will not be included in the YAML
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
