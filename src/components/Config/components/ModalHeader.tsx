// src/components/Config/components/ModalHeader.tsx
import React from "react";
import { X } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import type { FocusableRef } from "../types";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  firstFocusableRef?: FocusableRef;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  firstFocusableRef,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div
      className={combineClasses(
        "sticky top-0 border-b px-6 py-4 flex items-center justify-between z-10",
        neutralColors.bg,
        neutralColors.border,
      )}
    >
      <h2
        id="settings-dialog-title"
        className={combineClasses("text-xl font-bold", neutralColors.text)}
      >
        {title}
      </h2>
      <button
        ref={firstFocusableRef}
        type="button"
        onClick={onClose}
        className={combineClasses(
          "p-2 rounded transition-all",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          neutralColors.icon,
          neutralColors.hover,
          neutralColors.ring,
        )}
        aria-label="Close settings dialog"
      >
        <X size={24} aria-hidden="true" />
      </button>
    </div>
  );
};
