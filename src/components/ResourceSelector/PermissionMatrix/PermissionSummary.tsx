// src/components/ResourceSelector/PermissionMatrix/PermissionSummary.tsx
import React from "react";
import { type VerbType } from "../../../types/rbac.types";
import { X } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

interface PermissionSummaryProps {
  selectedVerbs: VerbType[];
  availableVerbs: VerbType[];
  onRemoveVerb: (verb: VerbType) => void;
}

export const PermissionSummary: React.FC<PermissionSummaryProps> = ({
  selectedVerbs,
  availableVerbs,
  onRemoveVerb,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div
      className={combineClasses("mt-3 pt-3 border-t", neutralColors.border)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between text-xs mb-2">
        <span className={neutralColors.icon}>Selected permissions:</span>
        <span className={combineClasses("font-semibold", neutralColors.text)}>
          {selectedVerbs.length} of {availableVerbs.length}
        </span>
      </div>
      {selectedVerbs.length > 0 ? (
        <div>
          <p className="sr-only">
            Currently selected: {selectedVerbs.join(", ")}
          </p>
          <div
            className="flex flex-wrap gap-1"
            role="list"
            aria-label="Selected permissions"
          >
            {selectedVerbs.map((verb) => (
              <span
                key={verb}
                className={combineClasses(
                  "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
                  neutralColors.bg,
                  neutralColors.text,
                  neutralColors.border,
                )}
                role="listitem"
              >
                <span>{verb}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRemoveVerb(verb);
                  }}
                  className={combineClasses(
                    "hover:text-red-600 dark:hover:text-red-400 transition-colors",
                    "focus:outline-none focus:ring-1 focus:ring-red-500 rounded",
                    "p-0.5",
                  )}
                  aria-label={`Remove ${verb} permission`}
                  title={`Remove ${verb}`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className={combineClasses("text-xs italic", neutralColors.icon)}>
          No permissions selected
        </p>
      )}
    </div>
  );
};
