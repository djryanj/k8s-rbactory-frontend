// src/components/ResourceSelector/ResourceCard.tsx
import React from "react";
import { type ResourceType } from "../../types/rbac.types";
import { Check, X } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { K8sResourceIcon } from "@/icons";
import { RESOURCE_METADATA } from "../../utils/resourceMetadata";

interface ResourceCardProps {
  resource: ResourceType;
  isSelected: boolean;
  isActive?: boolean;
  onToggle: (resource: ResourceType) => void;
  onClick?: (resource: ResourceType) => void;
  isCustom?: boolean;
  apiGroup?: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  hasNoVerbs?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isSelected,
  isActive = false,
  onToggle,
  onClick,
  isCustom = false,
  apiGroup,
  onRemove,
  showRemoveButton = false,
  hasNoVerbs = false,
}) => {
  const metadata = RESOURCE_METADATA[resource];
  const successColors = ACCESSIBLE_COLORS.success;
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;
  const criticalColors = ACCESSIBLE_COLORS.critical;

  const displayName = metadata?.displayName || resource;
  const description = metadata?.description || "Custom resource definition";

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on deselect or remove button
    const target = e.target as HTMLElement;
    if (
      target.closest('button[aria-label*="Deselect"]') ||
      target.closest('button[aria-label*="remove"]') ||
      target.closest('button[aria-label*="Remove"]')
    ) {
      return;
    }

    if (onClick) {
      onClick(resource);
    }
  };

  const handleDeselectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(resource);
  };

  // Determine which button to show
  // For custom resources: show permanent remove button when showRemoveButton is true
  // For all resources: show deselect button when selected
  const showDeselectButton = isSelected && !showRemoveButton;
  const showPermanentRemoveButton = showRemoveButton && onRemove;

  return (
    <div
      onClick={handleCardClick}
      className={combineClasses(
        "relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer group",
        "hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]",
        "transform-gpu",
        isActive
          ? combineClasses(
              infoColors.border,
              "ring-2",
              infoColors.ring,
              "shadow-md",
              "hover:shadow-xl",
            )
          : isSelected
            ? combineClasses(
                successColors.bg,
                successColors.border,
                "shadow-sm",
                "hover:shadow-lg",
              )
            : hasNoVerbs && isCustom
              ? combineClasses(
                  "border-dashed",
                  neutralColors.bg,
                  neutralColors.border,
                  "opacity-60",
                  "hover:opacity-90",
                  "hover:border-solid",
                )
              : combineClasses(
                  neutralColors.bg,
                  neutralColors.border,
                  neutralColors.hover,
                  "hover:border-gray-400 dark:hover:border-gray-500",
                ),
      )}
      role="button"
      tabIndex={0}
      aria-label={`${displayName}. ${
        isSelected
          ? "Selected. Click to configure permissions."
          : "Not selected. Click to select and configure."
      }`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Selection Indicator - Top Left (Non-interactive) */}
      <div
        className={combineClasses(
          "absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all",
          isSelected
            ? "bg-green-600 shadow-sm scale-100 opacity-100"
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

      {/* Deselect Button - Top Right (Only for selected resources without permanent remove) */}
      {showDeselectButton && (
        <button
          type="button"
          onClick={handleDeselectClick}
          className={combineClasses(
            "absolute top-2 right-2 p-1.5 rounded-full transition-all z-10",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700",
            "opacity-0 group-hover:opacity-100",
            "hover:scale-110 hover:shadow-md hover:border-red-300 dark:hover:border-red-700",
            "active:scale-95",
            "text-gray-600 dark:text-gray-400",
            "hover:text-red-600 dark:hover:text-red-400",
            "hover:bg-red-50 dark:hover:bg-red-900/20",
            criticalColors.ring,
          )}
          aria-label={`Deselect ${displayName}`}
          title="Deselect this resource"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}

      {/* Permanent Remove Button - Top Right (Only for custom resources with showRemoveButton) */}
      {showPermanentRemoveButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={combineClasses(
            "absolute top-2 right-2 p-1.5 rounded-full transition-all z-10",
            "focus:outline-none focus:ring-2",
            "bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700",
            "hover:scale-110 hover:shadow-md",
            "active:scale-95",
            criticalColors.text,
            criticalColors.hover,
            "hover:border-red-300 dark:hover:border-red-700",
            criticalColors.ring,
          )}
          aria-label={`Permanently remove ${displayName}`}
          title="Permanently remove this custom resource"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}

      {/* Icon and Content */}
      <div className="flex items-start gap-3 w-full pl-6">
        <K8sResourceIcon
          kind={isCustom ? "custom" : resource}
          size={40}
          className={combineClasses(
            "transition-all flex-shrink-0 mt-1",
            isActive
              ? combineClasses(infoColors.icon, "scale-110")
              : isSelected
                ? combineClasses(successColors.icon, "scale-105")
                : neutralColors.icon,
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div
              className={combineClasses(
                "font-semibold text-base transition-colors",
                isActive
                  ? infoColors.text
                  : isSelected
                    ? successColors.text
                    : neutralColors.text,
              )}
            >
              {displayName}
            </div>
            {isCustom && (
              <span
                className={combineClasses(
                  "text-xs px-2 py-0.5 rounded-full border transition-all",
                  "bg-gray-100 dark:bg-gray-700",
                  "text-gray-700 dark:text-gray-300",
                  "border-gray-300 dark:border-gray-600",
                )}
                aria-label="Custom resource"
              >
                Custom
              </span>
            )}
            {isActive && (
              <span
                className={combineClasses(
                  "text-xs px-2 py-0.5 rounded-full animate-pulse",
                  infoColors.bg,
                  infoColors.text,
                )}
              >
                Configuring
              </span>
            )}
          </div>
          <div className={combineClasses("text-xs mb-1", neutralColors.icon)}>
            {description}
          </div>
          <div
            className={combineClasses("text-xs font-mono", neutralColors.icon)}
          >
            {apiGroup || resource}
          </div>
          {hasNoVerbs && isCustom && (
            <div
              className={combineClasses(
                "text-xs italic mt-1",
                neutralColors.icon,
              )}
            >
              No permissions configured
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
