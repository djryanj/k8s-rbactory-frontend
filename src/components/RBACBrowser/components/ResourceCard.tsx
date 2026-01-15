// src/components/RBACBrowser/components/ResourceCard.tsx
import React from "react";
import { Check } from "lucide-react";
import { K8sResourceIcon } from "@/icons";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import type { ResourceCardProps } from "../types";

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isSelected,
  onSelect,
}) => {
  const successColors = ACCESSIBLE_COLORS.success;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  // Determine if this is a Role/ClusterRole or Binding
  const isRole = resource.kind === "Role" || resource.kind === "ClusterRole";
  const isBinding =
    resource.kind === "RoleBinding" || resource.kind === "ClusterRoleBinding";

  // Get appropriate color scheme for kind badge
  const kindBadgeColors = isRole
    ? successColors
    : isBinding
      ? ACCESSIBLE_COLORS.purple
      : neutralColors;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on import button
    const target = e.target as HTMLElement;
    if (target.closest('button[aria-label*="Import"]')) {
      return;
    }
    onSelect();
  };

  return (
    <div
      onClick={handleCardClick}
      className={combineClasses(
        "relative flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer group",
        "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
        "transform-gpu",
        isSelected
          ? combineClasses(
              neutralColors.border,
              "bg-gray-100 dark:bg-gray-700",
              "shadow-sm",
            )
          : combineClasses(
              neutralColors.bg,
              neutralColors.border,
              "hover:border-gray-400 dark:hover:border-gray-500",
            ),
      )}
      role="button"
      tabIndex={0}
      aria-label={`${resource.kind} ${resource.name}${
        resource.namespace ? ` in namespace ${resource.namespace}` : ""
      }. ${
        resource.rules
          ? `${resource.rules.length} rule${
              resource.rules.length !== 1 ? "s" : ""
            }`
          : ""
      }${
        resource.subjects
          ? `${resource.subjects.length} subject${
              resource.subjects.length !== 1 ? "s" : ""
            }`
          : ""
      }. ${isSelected ? "Selected" : "Not selected"}. Click to ${
        isSelected ? "deselect" : "select"
      }.`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Selection Indicator - Top Left */}
      <div
        className={combineClasses(
          "absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
          isSelected
            ? "bg-green-600 dark:bg-green-500 shadow-sm scale-100 opacity-100"
            : "bg-gray-200 dark:bg-gray-700 scale-90 opacity-50 group-hover:scale-100 group-hover:opacity-70",
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
            neutralColors.icon,
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div
              className={combineClasses(
                "font-semibold text-base transition-colors",
                neutralColors.text,
              )}
            >
              {resource.name}
            </div>

            {/* Kind badge */}
            <span
              className={combineClasses(
                "inline-flex items-center px-2 py-0.5 text-xs rounded font-medium border flex-shrink-0",
                kindBadgeColors.bg,
                kindBadgeColors.text,
                kindBadgeColors.border,
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
                  "border-gray-300 dark:border-gray-600",
                )}
                aria-label={`Namespace: ${resource.namespace}`}
              >
                {resource.namespace}
              </span>
            )}
          </div>

          <div className={combineClasses("text-xs mb-1", neutralColors.icon)}>
            {resource.rules && (
              <span>
                <span className="font-medium">{resource.rules.length}</span>{" "}
                rule{resource.rules.length !== 1 ? "s" : ""}
              </span>
            )}
            {resource.subjects && (
              <span>
                <span className="font-medium">{resource.subjects.length}</span>{" "}
                subject{resource.subjects.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
