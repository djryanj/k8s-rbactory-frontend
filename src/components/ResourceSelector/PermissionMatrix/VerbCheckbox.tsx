// src/components/ResourceSelector/PermissionMatrix/VerbCheckbox.tsx
import React from "react";
import { type VerbType } from "../../../types/rbac.types";
import {
  Check,
  XOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Shield,
} from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import { VERB_DESCRIPTIONS } from "../../../utils/resourceMetadata";
import { classifyVerb } from "../../../utils/security";

interface VerbCheckboxProps {
  verb: VerbType;
  isSelected: boolean;
  onToggle: (verb: VerbType) => void;
}

export const VerbCheckbox: React.FC<VerbCheckboxProps> = ({
  verb,
  isSelected,
  onToggle,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const criticalColors = ACCESSIBLE_COLORS.critical;
  const warningColors = ACCESSIBLE_COLORS.warning;
  const infoColors = ACCESSIBLE_COLORS.info;
  const successColors = ACCESSIBLE_COLORS.success;

  const classification = classifyVerb(verb);

  // Determine colors and icon based on risk level
  const getRiskColors = () => {
    switch (classification.risk) {
      case "critical-destructive":
        return {
          colors: criticalColors,
          checkboxBg: "bg-red-600 border-red-600",
          icon: XOctagon,
          label: "Critical",
        };
      case "critical-sensitive":
        return {
          colors: criticalColors,
          checkboxBg: "bg-red-600 border-red-600",
          icon: Shield,
          label: "Critical",
        };
      case "high":
        return {
          colors: {
            ...criticalColors,
            bg: "bg-orange-50 dark:bg-orange-900/20",
            border: "border-orange-300 dark:border-orange-700",
            text: "text-orange-900 dark:text-orange-100",
            icon: "text-orange-700 dark:text-orange-300",
            hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30",
            ring: "focus:ring-orange-500",
          },
          checkboxBg: "bg-orange-600 border-orange-600",
          icon: AlertTriangle,
          label: "High Risk",
        };
      case "medium":
        return {
          colors: warningColors,
          checkboxBg: "bg-amber-600 border-amber-600",
          icon: AlertCircle,
          label: "Medium",
        };
      case "low":
        return {
          colors: infoColors,
          checkboxBg: "bg-blue-600 border-blue-600",
          icon: Info,
          label: "Low Risk",
        };
      case "safe":
      default:
        return {
          colors: successColors,
          checkboxBg: "bg-green-600 border-green-600",
          icon: CheckCircle,
          label: "Safe",
        };
    }
  };

  const { colors, checkboxBg } = getRiskColors();

  return (
    <label
      className={combineClasses(
        "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all border",
        "focus-within:ring-2 focus-within:ring-offset-1",
        isSelected
          ? combineClasses(colors.bg, colors.border, "shadow-sm")
          : combineClasses(neutralColors.hover, "border-transparent"),
        colors.ring
      )}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(verb)}
          className={combineClasses(
            "h-4 w-4 rounded border-2 transition-colors",
            "focus:ring-2 focus:ring-offset-1",
            colors.ring,
            isSelected ? checkboxBg : "border-gray-300 dark:border-gray-600"
          )}
          aria-describedby={`verb-${verb}-description`}
        />
        {isSelected && (
          <Check
            size={12}
            className="absolute text-white pointer-events-none"
            style={{ strokeWidth: 3 }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={combineClasses(
              "font-medium text-sm",
              isSelected ? colors.text : neutralColors.text
            )}
          >
            {verb}
          </span>
        </div>
        <div
          id={`verb-${verb}-description`}
          className={combineClasses("text-xs mt-0.5", neutralColors.icon)}
        >
          {VERB_DESCRIPTIONS[verb] || classification.description}
        </div>
      </div>
    </label>
  );
};
