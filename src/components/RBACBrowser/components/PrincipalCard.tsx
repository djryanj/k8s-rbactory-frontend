// src/components/RBACBrowser/components/PrincipalCard.tsx
import React from "react";
import { Check } from "lucide-react";
import { K8sResourceIcon } from "@/icons";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import type { PrincipalCardProps } from "../types";

export const PrincipalCard: React.FC<PrincipalCardProps> = ({
  principal,
  isSelected,
  onSelect,
}) => {
  const purpleColors = ACCESSIBLE_COLORS.purple;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div
      onClick={onSelect}
      className={combineClasses(
        "relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all group",
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
      aria-label={`${principal.kind} ${principal.name}${
        principal.namespace ? ` in namespace ${principal.namespace}` : ""
      }. ${principal.bindingCount || 0} binding${
        principal.bindingCount !== 1 ? "s" : ""
      }. ${isSelected ? "Selected" : "Not selected"}. Click to ${
        isSelected ? "deselect" : "select"
      }.`}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Selection Indicator - Top Left */}
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
          kind={principal.kind}
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
              {principal.name}
            </div>

            {/* Kind badge */}
            <span
              className={combineClasses(
                "inline-flex items-center px-2 py-0.5 text-xs rounded font-medium border flex-shrink-0",
                purpleColors.bg,
                purpleColors.text,
                purpleColors.border
              )}
              aria-label={`Type: ${principal.kind}`}
            >
              {principal.kind}
            </span>

            {/* Namespace badge */}
            {principal.namespace && (
              <span
                className={combineClasses(
                  "inline-flex items-center px-2 py-0.5 text-xs rounded font-medium border flex-shrink-0",
                  "bg-gray-100 dark:bg-gray-700",
                  "text-gray-700 dark:text-gray-300",
                  "border-gray-300 dark:border-gray-600"
                )}
                aria-label={`Namespace: ${principal.namespace}`}
              >
                {principal.namespace}
              </span>
            )}
          </div>

          <div className={combineClasses("text-xs", neutralColors.icon)}>
            <span className="font-medium">{principal.bindingCount || 0}</span>{" "}
            binding{principal.bindingCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
};
