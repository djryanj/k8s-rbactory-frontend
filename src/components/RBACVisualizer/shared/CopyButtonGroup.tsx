// src/components/RBACVisualizer/shared/CopyButtonGroup.tsx
import React from "react";
import { Copy, FileText, Terminal, Check } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import { announceToScreenReader } from "../../../utils/accessibility";
import type { CopyButtonGroupProps } from "../types";

export const CopyButtonGroup: React.FC<CopyButtonGroupProps> = ({
  name,
  kind,
  namespace,
  yaml,
  onCopy,
  copiedItem,
  resourceLabel,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const successColors = ACCESSIBLE_COLORS.success;

  const kubectlCmd = namespace
    ? `kubectl get ${kind.toLowerCase()} ${name} -n ${namespace} -o yaml`
    : `kubectl get ${kind.toLowerCase()} ${name} -o yaml`;

  const handleCopy = (
    e: React.MouseEvent,
    content: string,
    label: string,
    description: string
  ) => {
    e.stopPropagation();
    onCopy(content, label);
    announceToScreenReader(`${description} copied to clipboard`);
  };

  const buttonBaseClasses = combineClasses(
    "p-1.5 rounded transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    neutralColors.icon,
    neutralColors.hover,
    neutralColors.ring,
    "min-h-[32px] min-w-[32px]", // Touch target size
    "inline-flex items-center justify-center"
  );

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label={`Copy options for ${kind} ${name}`}
    >
      {/* Copy Name Button */}
      <button
        onClick={(e) =>
          handleCopy(e, name, `${resourceLabel}-name`, `${kind} name`)
        }
        className={buttonBaseClasses}
        title={`Copy ${kind} name: ${name}`}
        aria-label={`Copy ${kind} name ${name} to clipboard`}
        type="button"
      >
        {copiedItem === `${resourceLabel}-name` ? (
          <>
            <Check
              size={14}
              className={successColors.icon}
              aria-hidden="true"
            />
            <span className="sr-only">Name copied</span>
          </>
        ) : (
          <>
            <Copy size={14} aria-hidden="true" />
            <span className="sr-only">Copy name</span>
          </>
        )}
      </button>

      {/* Copy YAML Button */}
      <button
        onClick={(e) =>
          handleCopy(e, yaml, `${resourceLabel}-yaml`, `${kind} YAML manifest`)
        }
        className={buttonBaseClasses}
        title={`Copy ${kind} YAML manifest`}
        aria-label={`Copy ${kind} ${name} YAML manifest to clipboard`}
        type="button"
      >
        {copiedItem === `${resourceLabel}-yaml` ? (
          <>
            <Check
              size={14}
              className={successColors.icon}
              aria-hidden="true"
            />
            <span className="sr-only">YAML copied</span>
          </>
        ) : (
          <>
            <FileText size={14} aria-hidden="true" />
            <span className="sr-only">Copy YAML</span>
          </>
        )}
      </button>

      {/* Copy kubectl Command Button */}
      <button
        onClick={(e) =>
          handleCopy(
            e,
            kubectlCmd,
            `${resourceLabel}-kubectl`,
            "kubectl command"
          )
        }
        className={buttonBaseClasses}
        title={`Copy kubectl command: ${kubectlCmd}`}
        aria-label={`Copy kubectl get command for ${kind} ${name} to clipboard`}
        type="button"
      >
        {copiedItem === `${resourceLabel}-kubectl` ? (
          <>
            <Check
              size={14}
              className={successColors.icon}
              aria-hidden="true"
            />
            <span className="sr-only">kubectl command copied</span>
          </>
        ) : (
          <>
            <Terminal size={14} aria-hidden="true" />
            <span className="sr-only">Copy kubectl command</span>
          </>
        )}
      </button>

      {/* Screen reader live region for copy feedback */}
      {copiedItem && (
        <span
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {copiedItem === `${resourceLabel}-name` &&
            `${kind} name copied to clipboard`}
          {copiedItem === `${resourceLabel}-yaml` &&
            `${kind} YAML manifest copied to clipboard`}
          {copiedItem === `${resourceLabel}-kubectl` &&
            `kubectl command copied to clipboard`}
        </span>
      )}
    </div>
  );
};
