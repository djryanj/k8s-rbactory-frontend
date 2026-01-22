// src/components/RBACVisualizer/shared/SecurityIssueCard.tsx

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Users } from "lucide-react";
import type { SecurityIssue, SecurityLevel } from "@/types/security.types";
import { getSeverityStyle, combineClasses } from "../../../utils/colors";

interface SecurityIssueCardProps {
  issue: SecurityIssue;
  index: number;
}

export const SecurityIssueCard: React.FC<SecurityIssueCardProps> = ({
  issue,
  index,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const severityStyle = getSeverityStyle(issue.severity as SecurityLevel);
  const IconComponent = severityStyle.icon;
  const colors = severityStyle.colors;

  const hasDetails = issue.details && Object.keys(issue.details).length > 1;
  const detailsId = `security-issue-${index}-details`;

  // Check if we have principals to display
  const hasPrincipals =
    issue.details &&
    "principals" in issue.details &&
    issue.details.principals !== undefined &&
    Array.isArray(issue.details.principals) &&
    issue.details.principals.length > 0;

  // Extract principals safely with type assertion
  const principals =
    hasPrincipals && "principals" in issue.details
      ? (issue.details.principals as string[])
      : [];

  return (
    <article
      className={combineClasses(
        "p-3 rounded-lg border",
        colors.bg,
        colors.border
      )}
      role="alert"
      aria-labelledby={`security-issue-${index}-title`}
      aria-describedby={`security-issue-${index}-description`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Severity badge with icon + title on same line */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={combineClasses(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border flex-shrink-0",
                    colors.bg,
                    colors.text,
                    colors.border
                  )}
                  aria-label={severityStyle.ariaLabel}
                >
                  <IconComponent size={10} aria-hidden="true" />
                  {severityStyle.label}
                </span>
                <div
                  id={`security-issue-${index}-title`}
                  className={combineClasses(
                    "font-semibold text-sm",
                    colors.text
                  )}
                >
                  {issue.title}
                </div>
              </div>
              <div
                id={`security-issue-${index}-description`}
                className={combineClasses("text-xs mt-1", colors.icon)}
              >
                {issue.description}
              </div>
            </div>
            {hasDetails && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={combineClasses(
                  "p-1 rounded transition-colors flex-shrink-0",
                  colors.hover,
                  colors.text,
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  colors.ring
                )}
                aria-expanded={isExpanded}
                aria-controls={detailsId}
                aria-label={isExpanded ? "Hide details" : "Show details"}
              >
                {isExpanded ? (
                  <ChevronUp size={16} aria-hidden="true" />
                ) : (
                  <ChevronDown size={16} aria-hidden="true" />
                )}
              </button>
            )}
          </div>

          {isExpanded && issue.details && (
            <div id={detailsId} className="mt-3 space-y-2">
              {/* Principals List */}
              {hasPrincipals && principals.length > 0 && (
                <div>
                  <div
                    className={combineClasses(
                      "text-xs font-medium mb-1.5 flex items-center gap-1",
                      colors.text
                    )}
                  >
                    <Users size={12} aria-hidden="true" />
                    <span>Affected Principals:</span>
                  </div>
                  <div className="flex flex-wrap gap-1" role="list">
                    {principals.map((principal, idx) => (
                      <span
                        key={idx}
                        className={combineClasses(
                          "inline-flex items-center px-2 py-1 rounded text-xs font-mono border",
                          colors.bg,
                          colors.text,
                          colors.border
                        )}
                        role="listitem"
                        aria-label={`Principal: ${principal}`}
                      >
                        {principal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resource-Verb Mapping (primary display method) */}
              {"resourceVerbMap" in issue.details &&
                issue.details.resourceVerbMap && (
                  <div>
                    <div
                      className={combineClasses(
                        "text-xs font-medium mb-1",
                        colors.text
                      )}
                    >
                      Affected Resources & Verbs:
                    </div>
                    <div className="flex flex-wrap gap-1" role="list">
                      {Object.entries(issue.details.resourceVerbMap).map(
                        ([resource, verbs]) => (
                          <div
                            key={resource}
                            className={combineClasses(
                              "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono border",
                              colors.bg,
                              colors.text,
                              colors.border
                            )}
                            role="listitem"
                            aria-label={`Resource: ${resource} with verbs ${
                              Array.isArray(verbs) ? verbs.join(", ") : verbs
                            }`}
                          >
                            <span className="font-semibold">{resource}</span>
                            <span className="opacity-60" aria-hidden="true">
                              →
                            </span>
                            <span className="sr-only">grants verbs</span>
                            <span>
                              {Array.isArray(verbs) ? verbs.join(", ") : verbs}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* API Groups */}
              {"apiGroups" in issue.details && issue.details.apiGroups && (
                <div>
                  <div
                    className={combineClasses(
                      "text-xs font-medium mb-1",
                      colors.text
                    )}
                  >
                    API Groups:
                  </div>
                  <div className="flex flex-wrap gap-1" role="list">
                    {issue.details.apiGroups.map((group, idx) => (
                      <span
                        key={idx}
                        className={combineClasses(
                          "px-2 py-1 rounded text-xs font-mono border",
                          colors.bg,
                          colors.text,
                          colors.border
                        )}
                        role="listitem"
                      >
                        {group || '""'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects (for binding-related issues) */}
              {"subjects" in issue.details && issue.details.subjects && (
                <div>
                  <div
                    className={combineClasses(
                      "text-xs font-medium mb-1",
                      colors.text
                    )}
                  >
                    Subjects:
                  </div>
                  <div className="flex flex-wrap gap-1" role="list">
                    {issue.details.subjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className={combineClasses(
                          "px-2 py-1 rounded text-xs font-mono border",
                          colors.bg,
                          colors.text,
                          colors.border
                        )}
                        role="listitem"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Group Name (for specific group-related issues) */}
              {"groupName" in issue.details && issue.details.groupName && (
                <div className={combineClasses("text-xs mt-2", colors.icon)}>
                  <span className="font-medium">Group:</span>{" "}
                  <span className="font-mono font-semibold">
                    {issue.details.groupName}
                  </span>
                </div>
              )}

              {/* Affected Rules Count */}
              {"affectedRules" in issue.details &&
                issue.details.affectedRules !== undefined && (
                  <div className={combineClasses("text-xs mt-2", colors.icon)}>
                    <span className="font-medium">Affected Rules:</span>{" "}
                    {issue.details.affectedRules}
                  </div>
                )}

              {/* Role Name */}
              {"roleName" in issue.details && issue.details.roleName && (
                <div className={combineClasses("text-xs mt-2", colors.icon)}>
                  <span className="font-medium">Role:</span>{" "}
                  <span className="font-mono font-semibold">
                    {issue.details.roleName}
                  </span>
                </div>
              )}

              {/* Subject Count */}
              {"subjectCount" in issue.details &&
                issue.details.subjectCount !== undefined && (
                  <div className={combineClasses("text-xs mt-2", colors.icon)}>
                    <span className="font-medium">Granted to:</span>{" "}
                    {issue.details.subjectCount} subject(s)
                  </div>
                )}

              {/* Namespace Count (for cluster-scope issues) */}
              {"namespaceCount" in issue.details &&
                issue.details.namespaceCount && (
                  <div className={combineClasses("text-xs mt-2", colors.icon)}>
                    <span className="font-medium">Namespace Scope:</span>{" "}
                    <span className="font-mono font-semibold">
                      {issue.details.namespaceCount}
                    </span>
                  </div>
                )}

              {/* Service Account Name (for SA-specific issues) */}
              {issue.details.type === "service-account" &&
                "name" in issue.details &&
                issue.details.name && (
                  <div className={combineClasses("text-xs mt-2", colors.icon)}>
                    <span className="font-medium">Name:</span>{" "}
                    <span className="font-mono font-semibold">
                      {issue.details.name}
                    </span>
                    {"namespace" in issue.details &&
                      issue.details.namespace && (
                        <>
                          {" in namespace "}
                          <span className="font-mono font-semibold">
                            {issue.details.namespace}
                          </span>
                        </>
                      )}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
