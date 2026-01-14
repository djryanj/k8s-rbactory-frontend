// src/components/RBACVisualizer/shared/SecurityAnalysisPanel.tsx
import React from "react";
import { Shield, CheckCircle } from "lucide-react";
import { SecurityIssueCard } from "./SecurityIssueCard";
import type { SecurityIssue } from "@/types/security.types";
import { isCriticalIssue } from "@/types/security.types";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";

interface SecurityAnalysisPanelProps {
  /**
   * Array of security issues to display
   */
  securityIssues: SecurityIssue[];

  /**
   * Context for the analysis - affects messaging
   * - "policy-builder": Shows "your policy configuration" messaging
   * - "resource-browser": Shows "this resource" messaging
   */
  context: "policy-builder" | "resource-browser";

  /**
   * Optional custom title for the panel
   */
  title?: string;

  /**
   * Whether to show the informational note at the bottom
   * @default true
   */
  showNote?: boolean;

  /**
   * Optional custom class name for the container
   */
  className?: string;
}

/**
 * Unified security analysis panel component
 * Displays security issues with severity counts and detailed cards
 * Used in both Policy Builder and Cluster Browser contexts
 *
 * @example
 * ```tsx
 * // In Policy Builder
 * <SecurityAnalysisPanel
 *   securityIssues={issues}
 *   context="policy-builder"
 * />
 *
 * // In Cluster Browser
 * <SecurityAnalysisPanel
 *   securityIssues={issues}
 *   context="resource-browser"
 * />
 * ```
 */
export const SecurityAnalysisPanel: React.FC<SecurityAnalysisPanelProps> = ({
  securityIssues,
  context,
  title = "Security Analysis",
  showNote = true,
  className,
}) => {
  const purpleColors = ACCESSIBLE_COLORS.purple;
  const successColors = ACCESSIBLE_COLORS.success;

  // Count severity levels - now handles both critical variants
  const criticalSeverityCount = securityIssues.filter((issue) =>
    isCriticalIssue(issue)
  ).length;

  const highSeverityCount = securityIssues.filter(
    (issue) => issue.severity === "high"
  ).length;

  const mediumSeverityCount = securityIssues.filter(
    (issue) => issue.severity === "medium"
  ).length;

  const lowSeverityCount = securityIssues.filter(
    (issue) => issue.severity === "low"
  ).length;

  // Context-specific messaging
  const getContextMessage = () => {
    if (context === "policy-builder") {
      return "Review these security considerations for your policy configuration:";
    }
    return "This resource has the following security considerations:";
  };

  const getNoIssuesMessage = () => {
    if (context === "policy-builder") {
      return "Your current policy configuration follows security best practices based on automated analysis.";
    }
    return "This resource follows security best practices based on automated analysis.";
  };

  const getNoteMessage = () => {
    if (context === "policy-builder") {
      return (
        <>
          <strong>Note:</strong> These are recommendations based on common
          security patterns. Consider your specific use case and environment
          when evaluating these suggestions.
        </>
      );
    }
    return (
      <>
        <strong>Note:</strong> This analysis identifies potential security risks
        based on industry best practices and common attack patterns.
      </>
    );
  };

  // If no issues, show success state
  if (securityIssues.length === 0) {
    return (
      <div
        className={combineClasses(
          "p-4 rounded-lg border",
          successColors.bg,
          successColors.border,
          className
        )}
        role="status"
        aria-label="No security issues detected"
      >
        <div className="flex items-center gap-2">
          <CheckCircle
            size={18}
            className={successColors.icon}
            aria-hidden="true"
          />
          <div>
            <div
              className={combineClasses(
                "font-semibold text-sm",
                successColors.text
              )}
            >
              No Security Issues Detected
            </div>
            <div className={combineClasses("text-xs mt-1", successColors.icon)}>
              {getNoIssuesMessage()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show issues with severity counts
  return (
    <section
      className={combineClasses(
        "p-4 rounded-lg border",
        purpleColors.bg,
        purpleColors.border,
        className
      )}
      role="region"
      aria-labelledby="security-analysis-heading"
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          id="security-analysis-heading"
          className={combineClasses(
            "text-sm font-semibold flex items-center gap-2",
            purpleColors.text
          )}
        >
          <Shield size={16} aria-hidden="true" />
          {title}
        </h3>
        {/* Severity count badges - ordered by severity (highest first) */}
        <div
          className="flex items-center gap-2 text-xs"
          role="group"
          aria-label="Security issue counts by severity"
        >
          {criticalSeverityCount > 0 && (
            <span
              className={combineClasses(
                "px-2 py-0.5 rounded-full font-medium border",
                "bg-red-100 dark:bg-red-900/30",
                "text-red-900 dark:text-red-100",
                "border-red-300 dark:border-red-700"
              )}
              role="status"
              aria-label={`${criticalSeverityCount} critical severity ${
                criticalSeverityCount === 1 ? "issue" : "issues"
              }`}
            >
              {criticalSeverityCount} Critical
            </span>
          )}
          {highSeverityCount > 0 && (
            <span
              className={combineClasses(
                "px-2 py-0.5 rounded-full font-medium border",
                "bg-orange-100 dark:bg-orange-900/30",
                "text-orange-900 dark:text-orange-100",
                "border-orange-300 dark:border-orange-700"
              )}
              role="status"
              aria-label={`${highSeverityCount} high severity ${
                highSeverityCount === 1 ? "issue" : "issues"
              }`}
            >
              {highSeverityCount} High
            </span>
          )}
          {mediumSeverityCount > 0 && (
            <span
              className={combineClasses(
                "px-2 py-0.5 rounded-full font-medium border",
                "bg-amber-100 dark:bg-amber-900/30",
                "text-amber-900 dark:text-amber-100",
                "border-amber-300 dark:border-amber-700"
              )}
              role="status"
              aria-label={`${mediumSeverityCount} medium severity ${
                mediumSeverityCount === 1 ? "issue" : "issues"
              }`}
            >
              {mediumSeverityCount} Medium
            </span>
          )}
          {lowSeverityCount > 0 && (
            <span
              className={combineClasses(
                "px-2 py-0.5 rounded-full font-medium border",
                "bg-blue-100 dark:bg-blue-900/30",
                "text-blue-900 dark:text-blue-100",
                "border-blue-300 dark:border-blue-700"
              )}
              role="status"
              aria-label={`${lowSeverityCount} low severity ${
                lowSeverityCount === 1 ? "issue" : "issues"
              }`}
            >
              {lowSeverityCount} Low
            </span>
          )}
        </div>
      </div>

      <p className={combineClasses("text-xs mb-3", purpleColors.text)}>
        {getContextMessage()}
      </p>

      <div className="space-y-2" role="list" aria-label="Security issues">
        {securityIssues.map((issue, idx) => (
          <SecurityIssueCard key={idx} issue={issue} index={idx} />
        ))}
      </div>

      {showNote && (
        <div
          className={combineClasses(
            "mt-3 p-3 rounded-lg border text-xs",
            "bg-blue-50 dark:bg-blue-900/20",
            "border-blue-200 dark:border-blue-800"
          )}
          role="note"
        >
          <p className="text-blue-900 dark:text-blue-100">{getNoteMessage()}</p>
        </div>
      )}
    </section>
  );
};
