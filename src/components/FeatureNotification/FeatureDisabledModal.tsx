// src/components/FeatureNotification/FeatureDisabledModal.tsx
import React, { useEffect, useRef } from "react";
import { AlertCircle, X, ExternalLink } from "lucide-react";
import {
  ACCESSIBLE_COLORS,
  combineClasses,
  getButtonClasses,
} from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";

interface FeatureDisabledModalProps {
  onDismissOnce: () => void;
  onDismissPermanently: () => void;
  isNetlifyDemo: boolean;
}

export const FeatureDisabledModal: React.FC<FeatureDisabledModalProps> = ({
  onDismissOnce,
  onDismissPermanently,
  isNetlifyDemo,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const warningColors = ACCESSIBLE_COLORS.warning;
  const infoColors = ACCESSIBLE_COLORS.info;

  const modalRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Announce to screen readers
    const message = isNetlifyDemo
      ? "Important notification: This is a demo site with limited functionality"
      : "Important notification: Cluster Browser feature has been disabled";
    announceToScreenReader(message);

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
  }, [onDismissOnce, isNetlifyDemo]);

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
          neutralColors.bg,
        )}
        role="document"
      >
        {/* Header */}
        <div
          className={combineClasses(
            "flex items-start gap-3 p-6 pb-4",
            "border-b",
            neutralColors.border,
          )}
        >
          <div
            className={combineClasses(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              isNetlifyDemo ? infoColors.bg : warningColors.bg,
            )}
            aria-hidden="true"
          >
            <AlertCircle
              className={isNetlifyDemo ? infoColors.icon : warningColors.icon}
              size={24}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="feature-notification-title"
              className={combineClasses(
                "text-lg font-semibold",
                neutralColors.text,
              )}
            >
              {isNetlifyDemo ? "Demo Site Notice" : "Feature Unavailable"}
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
              neutralColors.ring,
            )}
            aria-label="Close notification"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          {isNetlifyDemo ? (
            <>
              <p
                id="feature-notification-description"
                className={combineClasses(
                  "text-sm leading-relaxed",
                  neutralColors.text,
                )}
              >
                Welcome to the <strong>K8s RBACtory demo site</strong>! This is
                a preview-only deployment where the{" "}
                <strong>Cluster Browser</strong> functionality has been
                disabled.
              </p>
              <p
                className={combineClasses(
                  "text-sm leading-relaxed mt-3",
                  neutralColors.text,
                )}
              >
                The <strong>Policy Builder</strong> is fully functional and you
                can explore all its features for creating Kubernetes RBAC
                policies.
              </p>
              <div
                className={combineClasses(
                  "mt-4 p-3 rounded-lg border",
                  infoColors.bg,
                  infoColors.border,
                )}
              >
                <p
                  className={combineClasses(
                    "text-sm font-medium mb-2",
                    neutralColors.text,
                  )}
                >
                  Want the full experience?
                </p>
                <p className={combineClasses("text-sm", neutralColors.icon)}>
                  Deploy your own instance to enable cluster browsing and
                  connect to your Kubernetes clusters.
                </p>
                <a
                  href="https://github.com/djryanj/k8s-rbactory-frontend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={combineClasses(
                    "inline-flex items-center gap-1 mt-2 text-sm font-medium",
                    "text-k8s-blue dark:text-k8s-lightblue hover:underline",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:rounded",
                    infoColors.ring,
                  )}
                >
                  View on GitHub
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            </>
          ) : (
            <>
              <p
                id="feature-notification-description"
                className={combineClasses(
                  "text-sm leading-relaxed",
                  neutralColors.text,
                )}
              >
                The <strong>Cluster Browser</strong> functionality has been
                disabled by an administrator. Only the{" "}
                <strong>Policy Builder</strong> is currently available for use.
              </p>
              <p
                className={combineClasses(
                  "text-sm leading-relaxed mt-3",
                  neutralColors.icon,
                )}
              >
                If you believe this is an error, please contact your system
                administrator.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className={combineClasses(
            "flex flex-col-reverse sm:flex-row gap-3 p-6 pt-4",
            "border-t",
            neutralColors.border,
          )}
        >
          <button
            ref={firstButtonRef}
            type="button"
            onClick={onDismissPermanently}
            className={combineClasses(
              "flex-1 px-4 py-2.5",
              getButtonClasses("secondary", "slate", "md"),
              neutralColors.text,
              neutralColors.hover,
              neutralColors.ring,
            )}
          >
            Don't Show Again
          </button>
          <button
            type="button"
            onClick={onDismissOnce}
            className={combineClasses(
              "flex-1 px-4 py-2.5",
              getButtonClasses("primary", "slate", "md"),
            )}
          >
            {isNetlifyDemo ? "Got It, Thanks!" : "OK, Got It"}
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
