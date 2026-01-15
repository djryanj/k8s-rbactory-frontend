// src/components/ResourceSelector/PermissionMatrix/PermissionMatrix.tsx
import React, { useMemo } from "react";
import { type VerbType, type ResourceType } from "../../../types/rbac.types";
import { useRBAC } from "../../../context/rbac";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import { announceToScreenReader } from "../../../utils/accessibility";
import { VerbCheckbox } from "./VerbCheckbox";
import { PermissionSummary } from "./PermissionSummary";
import { Tooltip } from "../../Tooltip/Tooltip";
import { RiskLevelTooltipContent } from "../../../utils/security";
import {
  CheckSquare,
  XSquare,
  ShieldAlert,
  ShieldCheck,
  XOctagon,
  AlertTriangle,
} from "lucide-react";
import { classifyVerb, isHighRiskVerb } from "../../../utils/security";

interface PermissionMatrixProps {
  resource: ResourceType;
  selectedVerbs: VerbType[];
  availableVerbs: VerbType[];
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  resource,
  selectedVerbs,
  availableVerbs,
}) => {
  const { updatePermissionVerbs } = useRBAC();
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const successColors = ACCESSIBLE_COLORS.success;

  // Categorize verbs by risk level - now handles all 6 levels
  const categorizedVerbs = useMemo(() => {
    const critical: VerbType[] = [];
    const high: VerbType[] = [];
    const medium: VerbType[] = [];
    const low: VerbType[] = [];

    availableVerbs.forEach((verb) => {
      const classification = classifyVerb(verb);
      switch (classification.risk) {
        case "critical-destructive":
        case "critical-sensitive":
          critical.push(verb);
          break;
        case "high":
          high.push(verb);
          break;
        case "medium":
          medium.push(verb);
          break;
        case "low":
        case "safe":
        default:
          low.push(verb);
          break;
      }
    });

    return { critical, high, medium, low };
  }, [availableVerbs]);

  // Check if any high-risk verbs are selected using the helper function
  const hasHighRiskVerbs = useMemo(() => {
    return selectedVerbs.some((verb) => isHighRiskVerb(verb));
  }, [selectedVerbs]);

  const handleVerbToggle = (verb: VerbType) => {
    const newVerbs = selectedVerbs.includes(verb)
      ? selectedVerbs.filter((v) => v !== verb)
      : [...selectedVerbs, verb];

    updatePermissionVerbs(resource, newVerbs);

    const classification = classifyVerb(verb);
    const action = selectedVerbs.includes(verb) ? "removed" : "added";
    announceToScreenReader(
      `${verb} permission ${action} for ${resource}. Risk level: ${classification.risk}`,
    );
  };

  const handleSelectAll = () => {
    updatePermissionVerbs(resource, availableVerbs);
    announceToScreenReader(
      `All ${availableVerbs.length} permissions selected for ${resource}`,
    );
  };

  const handleClearAll = () => {
    updatePermissionVerbs(resource, []);
    announceToScreenReader(`All permissions cleared for ${resource}`);
  };

  const allSelected = selectedVerbs.length === availableVerbs.length;
  const noneSelected = selectedVerbs.length === 0;

  return (
    <div
      className="permission-matrix"
      role="region"
      aria-labelledby={`permission-matrix-${resource}`}
    >
      {/* Header */}
      <div className="mb-3">
        <h4
          id={`permission-matrix-${resource}`}
          className={combineClasses(
            "text-sm font-semibold mb-1 flex items-center gap-2",
            neutralColors.text,
          )}
        >
          <ShieldCheck size={16} aria-hidden="true" />
          Permissions for {resource}
        </h4>
        <p className={combineClasses("text-xs", neutralColors.icon)}>
          Select permissions below. Colors indicate security risk level.
        </p>
      </div>

      {/* High Risk Warning */}
      {hasHighRiskVerbs && (
        <div
          className={combineClasses(
            "mb-3 p-2 rounded-lg border flex items-start gap-2",
            "bg-red-50 dark:bg-red-900/20",
            "border-red-300 dark:border-red-700",
          )}
          role="alert"
        >
          <AlertTriangle
            size={16}
            className="text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-xs text-red-800 dark:text-red-200">
            <strong>High-risk permissions selected.</strong> Review security
            implications in the Security Analysis section below.
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div
        className="grid grid-cols-2 gap-2 mb-4"
        role="group"
        aria-label="Quick permission actions"
      >
        {/* All Permissions Button */}
        <button
          onClick={handleSelectAll}
          className={combineClasses(
            "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-2",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            allSelected
              ? combineClasses(
                  successColors.bg,
                  successColors.text,
                  successColors.border,
                  "shadow-sm",
                )
              : combineClasses(
                  neutralColors.bg,
                  neutralColors.text,
                  neutralColors.border,
                  neutralColors.hover,
                ),
            successColors.ring,
          )}
          aria-label={`Select all ${availableVerbs.length} permissions for ${resource}`}
          aria-pressed={allSelected}
        >
          <CheckSquare size={16} aria-hidden="true" />
          <span>All Permissions</span>
        </button>

        {/* Clear All Button */}
        <button
          onClick={handleClearAll}
          disabled={noneSelected}
          className={combineClasses(
            "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-2",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            noneSelected
              ? combineClasses(
                  neutralColors.bg,
                  neutralColors.text,
                  neutralColors.border,
                )
              : combineClasses(
                  "bg-red-50 dark:bg-red-900/20",
                  "text-red-700 dark:text-red-300",
                  "border-red-300 dark:border-red-700",
                  "hover:bg-red-100 dark:hover:bg-red-900/30",
                ),
            "focus:ring-red-500",
          )}
          aria-label={`Clear all permissions for ${resource}`}
          aria-pressed={noneSelected}
        >
          <XSquare size={16} aria-hidden="true" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Critical Risk Permissions */}
      {categorizedVerbs.critical.length > 0 && (
        <fieldset className="mb-3">
          <legend
            className={combineClasses(
              "text-xs font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5",
              "text-red-700 dark:text-red-300",
            )}
          >
            <XOctagon size={14} aria-hidden="true" />
            <span>Critical Risk Permissions</span>
            <Tooltip
              content={<RiskLevelTooltipContent level="critical-destructive" />}
              side="right"
              iconSize={12}
              iconClassName="text-red-600 dark:text-red-400"
            />
          </legend>
          <div
            className="space-y-1"
            role="group"
            aria-label="Critical risk permissions"
          >
            {categorizedVerbs.critical.map((verb) => (
              <VerbCheckbox
                key={verb}
                verb={verb}
                isSelected={selectedVerbs.includes(verb)}
                onToggle={handleVerbToggle}
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* High Risk Permissions */}
      {categorizedVerbs.high.length > 0 && (
        <fieldset className="mb-3">
          <legend
            className={combineClasses(
              "text-xs font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5",
              "text-orange-700 dark:text-orange-300",
            )}
          >
            <ShieldAlert size={14} aria-hidden="true" />
            <span>High Risk Permissions</span>
            <Tooltip
              content={<RiskLevelTooltipContent level="high" />}
              side="right"
              iconSize={12}
              iconClassName="text-orange-600 dark:text-orange-400"
            />
          </legend>
          <div
            className="space-y-1"
            role="group"
            aria-label="High risk permissions"
          >
            {categorizedVerbs.high.map((verb) => (
              <VerbCheckbox
                key={verb}
                verb={verb}
                isSelected={selectedVerbs.includes(verb)}
                onToggle={handleVerbToggle}
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* Medium Risk Permissions */}
      {categorizedVerbs.medium.length > 0 && (
        <fieldset className="mb-3">
          <legend
            className={combineClasses(
              "text-xs font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5",
              neutralColors.icon,
            )}
          >
            <ShieldAlert size={14} aria-hidden="true" />
            <span>Medium Risk Permissions</span>
            <Tooltip
              content={<RiskLevelTooltipContent level="medium" />}
              side="right"
              iconSize={12}
            />
          </legend>
          <div
            className="space-y-1"
            role="group"
            aria-label="Medium risk permissions"
          >
            {categorizedVerbs.medium.map((verb) => (
              <VerbCheckbox
                key={verb}
                verb={verb}
                isSelected={selectedVerbs.includes(verb)}
                onToggle={handleVerbToggle}
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* Low Risk Permissions */}
      {categorizedVerbs.low.length > 0 && (
        <fieldset>
          <legend
            className={combineClasses(
              "text-xs font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5",
              neutralColors.icon,
            )}
          >
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Low Risk Permissions</span>
            <Tooltip
              content={<RiskLevelTooltipContent level="low" />}
              side="right"
              iconSize={12}
            />
          </legend>
          <div
            className="space-y-1"
            role="group"
            aria-label="Low risk permissions"
          >
            {categorizedVerbs.low.map((verb) => (
              <VerbCheckbox
                key={verb}
                verb={verb}
                isSelected={selectedVerbs.includes(verb)}
                onToggle={handleVerbToggle}
              />
            ))}
          </div>
        </fieldset>
      )}

      {/* Permission Summary */}
      <PermissionSummary
        selectedVerbs={selectedVerbs}
        availableVerbs={availableVerbs}
        onRemoveVerb={handleVerbToggle}
      />

      {/* Screen reader summary */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectedVerbs.length} of {availableVerbs.length} permissions selected
        for {resource}.
        {hasHighRiskVerbs && " Warning: High-risk permissions are selected."}
      </div>
    </div>
  );
};
