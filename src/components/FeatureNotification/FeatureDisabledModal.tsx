// src/components/FeatureNotification/FeatureDisabledModal.tsx
import React, { useEffect, useRef } from "react";
import { AlertCircle, X } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";

interface FeatureDisabledModalProps {
  onDismissOnce: () => void;
  onDismissPermanently: () => void;
}

export const FeatureDisabledModal: React.FC<FeatureDisabledModalProps> = ({
  onDismissOnce,
  onDismissPermanently,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const warningColors = ACCESSIBLE_COLORS.warning;

  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Announce to screen readers
    announceToScreenReader(
      "Important notification: Cluster Browser feature has been disabled"
    );

    // Focus first button
    firstButtonRef.current?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismissOnce();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onDismissOnce]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-[60] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-notification-title"
      aria-describedby="feature-notification-description"
    >
      <div
        ref={modalRef}
        className={combineClasses(
          "rounded-lg shadow-2xl max-w-md w-full",
          neutralColors.bg
        )}
        role="document"
      >
        {/* Header */}
        <div
          className={combineClasses(
            "flex items-start gap-3 p-6 pb-4",
            "border-b",
            neutralColors.border
          )}
        >
          <div
            className={combineClasses(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              warningColors.bg
            )}
            aria-hidden="true"
          >
            <AlertCircle className={warningColors.icon} size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="feature-notification-title"
              className={combineClasses(
                "text-lg font-semibold",
                neutralColors.text
              )}
            >
              Feature Unavailable
            </h2>
          </div>
          <button
            type="button"
            onClick={onDismissOnce}
            className={combineClasses(
              "flex-shrink-0 p-1 rounded-lg transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              neutralColors.icon,
              neutralColors.hover,
              neutralColors.ring
            )}
            aria-label="Close notification"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          <p
            id="feature-notification-description"
            className={combineClasses(
              "text-sm leading-relaxed",
              neutralColors.text
            )}
          >
            The <strong>Cluster Browser</strong> functionality has been disabled
            by an administrator. Only the <strong>Policy Builder</strong> is
            currently available for use.
          </p>
          <p
            className={combineClasses(
              "text-sm leading-relaxed mt-3",
              neutralColors.icon
            )}
          >
            If you believe this is an error, please contact your system
            administrator.
          </p>
        </div>

        {/* Footer */}
        <div
          className={combineClasses(
            "flex flex-col-reverse sm:flex-row gap-3 p-6 pt-4",
            "border-t",
            neutralColors.border
          )}
        >
          <button
            ref={firstButtonRef}
            type="button"
            onClick={onDismissPermanently}
            className={combineClasses(
              "flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              neutralColors.text,
              neutralColors.hover,
              neutralColors.ring
            )}
          >
            Don't Show Again
          </button>
          <button
            type="button"
            onClick={onDismissOnce}
            className={combineClasses(
              "flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all",
              "bg-k8s-blue hover:bg-k8s-blue/90 text-white",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-k8s-blue",
              "dark:bg-k8s-lightblue dark:hover:bg-k8s-lightblue/90"
            )}
          >
            OK, Got It
          </button>
        </div>

        {/* Screen reader status */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Press Escape or click OK to dismiss this notification
        </div>
      </div>
    </div>
  );
};
