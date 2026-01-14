// src/components/ResourceSelector/SelectedResourcesSection.tsx
import React from "react";
import {
  type ResourcePermission,
  type ResourceType,
} from "../../types/rbac.types";
import { RESOURCE_METADATA } from "../../utils/resourceMetadata";
import { PermissionMatrix } from "./PermissionMatrix/PermissionMatrix";
import { Check } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { K8sResourceIcon } from "@/icons";

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

interface SelectedResourcesSectionProps {
  permissions: ResourcePermission[];
  onRemove: (resource: ResourceType) => void;
}

export const SelectedResourcesSection: React.FC<
  SelectedResourcesSectionProps
> = ({ permissions, onRemove }) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const criticalColors = ACCESSIBLE_COLORS.critical;

  if (permissions.length === 0) {
    return (
      <div
        className={combineClasses(
          "text-center py-12 rounded-lg border-2 border-dashed",
          "bg-gray-50 dark:bg-gray-800",
          "border-gray-300 dark:border-gray-600"
        )}
        role="status"
      >
        <p className={combineClasses("font-medium mb-1", neutralColors.text)}>
          No resources selected yet
        </p>
        <p className={combineClasses("text-sm", neutralColors.icon)}>
          Select resources above to configure their permissions
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="selected-resources-heading"
      aria-live="polite"
      aria-atomic="false"
    >
      <h3 id="selected-resources-heading" className="sr-only">
        Configure Selected Resources ({permissions.length})
      </h3>

      <div className="space-y-4">
        {permissions.map((permission) => {
          const metadata =
            RESOURCE_METADATA[permission.resource as ResourceType];
          const isCustom = !metadata;

          return (
            <div
              key={permission.resource}
              className={combineClasses(
                "border-2 rounded-lg overflow-hidden transition-colors",
                neutralColors.bg,
                neutralColors.border,
                "hover:border-blue-500 dark:hover:border-blue-400"
              )}
            >
              {/* Header - REMOVED GRADIENT */}
              <div
                className={combineClasses(
                  "p-4 border-b",
                  "bg-gray-50 dark:bg-gray-800", // Solid background instead of gradient
                  neutralColors.border
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <K8sResourceIcon
                        kind={isCustom ? "custom" : permission.resource}
                        size={32}
                        className={neutralColors.icon}
                      />
                      <h4
                        className={combineClasses(
                          "text-lg font-semibold",
                          neutralColors.text
                        )}
                      >
                        {metadata?.displayName || permission.resource}
                      </h4>
                      {isCustom && (
                        <span
                          className={combineClasses(
                            "text-xs px-2 py-1 rounded-full border",
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
                    <p
                      className={combineClasses("text-sm", neutralColors.icon)}
                    >
                      {metadata?.description || "Custom resource definition"}
                    </p>
                    <dl
                      className={combineClasses(
                        "mt-2 flex items-center gap-3 text-xs flex-wrap",
                        neutralColors.icon
                      )}
                    >
                      <div>
                        <dt className="inline font-medium">Resource: </dt>
                        <dd className="inline">{permission.resource}</dd>
                      </div>
                      <span aria-hidden="true">•</span>
                      <div>
                        <dt className="inline font-medium">API Group: </dt>
                        <dd className="inline">
                          {permission.apiGroup || "core"}
                        </dd>
                      </div>
                      <span aria-hidden="true">•</span>
                      <div>
                        <dt className="inline font-medium">Verbs: </dt>
                        <dd className="inline">
                          {permission.verbs.length > 0
                            ? `${permission.verbs.length} selected`
                            : "None selected"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onRemove(permission.resource as ResourceType)
                    }
                    className={combineClasses(
                      "p-2 rounded transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-offset-1",
                      criticalColors.text,
                      criticalColors.hover,
                      criticalColors.ring
                    )}
                    aria-label={`Remove ${
                      metadata?.displayName || permission.resource
                    } resource from role`}
                  >
                    <Check size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Permission Matrix */}
              <div className={combineClasses("p-4", neutralColors.bg)}>
                <PermissionMatrix
                  resource={permission.resource}
                  selectedVerbs={permission.verbs}
                  availableVerbs={metadata?.commonVerbs || ALL_VERBS}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
