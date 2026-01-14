// src/components/Config/components/ModalFooter.tsx
import React from "react";
import { Save, RotateCcw } from "lucide-react";
import {
  ACCESSIBLE_COLORS,
  combineClasses,
  getButtonClasses,
  getDisabledButtonClasses,
} from "../../../utils/colors";

interface ModalFooterProps {
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  hasChanges,
  onSave,
  onCancel,
  onReset,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div
      className={combineClasses(
        "sticky bottom-0 border-t px-6 py-4 flex items-center justify-between flex-wrap gap-3",
        "bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm",
        neutralColors.border
      )}
    >
      {/* Reset Button - Ghost variant for less emphasis */}
      <button
        type="button"
        onClick={onReset}
        className={getButtonClasses("ghost", "neutral", "md")}
        aria-label="Reset all settings to default values"
      >
        <RotateCcw size={18} aria-hidden="true" />
        <span>Reset to Defaults</span>
      </button>

      {/* Action Buttons Group */}
      <div className="flex gap-3" role="group" aria-label="Dialog actions">
        {/* Cancel Button - Secondary variant */}
        <button
          type="button"
          onClick={onCancel}
          className={getButtonClasses("secondary", "neutral", "md")}
          aria-label="Cancel and close without saving changes"
        >
          Cancel
        </button>

        {/* Save Button - Primary variant with disabled state */}
        <button
          type="button"
          onClick={onSave}
          disabled={!hasChanges}
          className={combineClasses(
            hasChanges
              ? getButtonClasses("primary", "slate", "md")
              : getDisabledButtonClasses("md")
          )}
          aria-label={hasChanges ? "Save all changes" : "No changes to save"}
        >
          <Save size={18} aria-hidden="true" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};
