// src/components/ResourceSelector/PermissionMatrix/CategorySelector.tsx
import React from "react";
import { type VerbType } from "../../../types/rbac.types";
import { BookOpen, Edit3, Check } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

interface CategorySelectorProps {
  category: "read" | "write";
  verbs: VerbType[];
  allSelected: boolean;
  onToggle: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  category,
  verbs,
  allSelected,
  onToggle,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const warningColors = ACCESSIBLE_COLORS.warning;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const colors = category === "read" ? infoColors : warningColors;
  const Icon = category === "read" ? BookOpen : Edit3;
  const label = category === "read" ? "Read-Only" : "Write";

  return (
    <button
      onClick={onToggle}
      className={combineClasses(
        "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border-2",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        "flex items-center justify-center gap-2",
        allSelected
          ? combineClasses(colors.bg, colors.text, colors.border, "shadow-sm")
          : combineClasses(
              neutralColors.bg,
              neutralColors.text,
              neutralColors.border,
              neutralColors.hover
            ),
        colors.ring
      )}
      aria-label={`${
        allSelected ? "Deselect" : "Select"
      } all ${category} permissions: ${verbs.join(", ")}`}
      aria-pressed={allSelected}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
      {allSelected && (
        <Check size={14} className={colors.icon} aria-hidden="true" />
      )}
    </button>
  );
};
