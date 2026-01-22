// src/components/RBACBrowser/components/KubernetesResourceCard.tsx
import React from "react";
import { Check, Shield, Lock } from "lucide-react";
import { K8sResourceIcon } from "@/icons";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import type { KubernetesResourceCardProps } from "../types";

export const KubernetesResourceCard: React.FC<KubernetesResourceCardProps> = ({
  resource,
  isSelected,
  onSelect,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const successColors = ACCESSIBLE_COLORS.success;
  const warningColors = ACCESSIBLE_COLORS.warning;

  // Check if there's any access info at all
  const directAccessCount = resource.accessInfo?.directAccess?.length ?? 0;
  const inheritedAccessCount =
    resource.accessInfo?.inheritedAccess?.length ?? 0;
  const hasAnyAccess = directAccessCount > 0 || inheritedAccessCount > 0;
  //   const hasAccessInfo = resource.accessInfo !== undefined;

  return (
    <div
      onClick={onSelect}
      className={combineClasses(
        "relative flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer group",
        "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
        "transform-gpu",
        isSelected
          ? combineClasses(
              neutralColors.border,
              "bg-gray-100 dark:bg-gray-700",
              "shadow-sm"
            )
          : combineClasses(
              neutralColors.bg,
              neutralColors.border,
              "hover:border-gray-400 dark:hover:border-gray-500"
            )
      )}
      role="button"
      tabIndex={0}
      aria-label={`${resource.kind} ${resource.name}${
        resource.namespace ? ` in namespace ${resource.namespace}` : ""
      }. ${hasAnyAccess ? "Has RBAC access configured" : "No RBAC access configured"}. ${
        isSelected ? "Selected" : "Not selected"
      }. Click to ${isSelected ? "deselect" : "select"} and view details.`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Selection Indicator */}
      <div
        className={combineClasses(
          "absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
          isSelected
            ? "bg-green-600 dark:bg-green-500 shadow-sm scale-100 opacity-100"
            : "bg-gray-200 dark:bg-gray-700 scale-90 opacity-50 group-hover:scale-100 group-hover:opacity-70"
        )}
        aria-hidden="true"
      >
        {isSelected ? (
          <Check size={16} className="text-white" style={{ strokeWidth: 3 }} />
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
        )}
      </div>

      {/* Icon and Content */}
      <div className="flex items-start gap-3 w-full pl-6">
        <K8sResourceIcon
          kind={resource.kind}
          size={40}
          className={combineClasses(
            "transition-all flex-shrink-0 mt-1",
            neutralColors.icon
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div
              className={combineClasses(
                "font-semibold text-base transition-colors",
                neutralColors.text
              )}
            >
              {resource.name}
            </div>

            {/* Kind badge */}
            <span
              className={combineClasses(
                "inline-flex items-center px-2 py-0.5 text-xs rounded font-medium border flex-shrink-0",
                infoColors.bg,
                infoColors.text,
                infoColors.border
              )}
              aria-label={`Type: ${resource.kind}`}
            >
              {resource.kind}
            </span>

            {/* Namespace badge */}
            {resource.namespace && (
              <span
                className={combineClasses(
                  "inline-flex items-center px-2 py-0.5 text-xs rounded font-medium border flex-shrink-0",
                  "bg-gray-100 dark:bg-gray-700",
                  "text-gray-700 dark:text-gray-300",
                  "border-gray-300 dark:border-gray-600"
                )}
                aria-label={`Namespace: ${resource.namespace}`}
              >
                {resource.namespace}
              </span>
            )}
          </div>

          {/* Access information - NO COUNT, just indicator */}
          <div className="flex items-center gap-2 text-xs">
            {hasAnyAccess ? (
              <div
                className={combineClasses(
                  "inline-flex items-center gap-1.5",
                  successColors.text
                )}
              >
                <Lock size={14} aria-hidden="true" className="flex-shrink-0" />
                <span className="font-medium">Has RBAC access</span>
                <span
                  className={combineClasses(
                    "text-[11px] italic ml-1",
                    neutralColors.icon,
                    "opacity-0 group-hover:opacity-100 transition-opacity"
                  )}
                >
                  (click for details)
                </span>
              </div>
            ) : (
              <span
                className={combineClasses(
                  "inline-flex items-center gap-1",
                  warningColors.text
                )}
              >
                <Shield size={12} aria-hidden="true" />
                <span>No RBAC access</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
