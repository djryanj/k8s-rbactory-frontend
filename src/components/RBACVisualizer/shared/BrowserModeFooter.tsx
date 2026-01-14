// src/components/RBACVisualizer/shared/BrowserModeFooter.tsx
import React, { useState, useMemo } from "react";
import {
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Download,
  ArrowLeft,
} from "lucide-react";
import type { BrowserModeFooterProps, Subject } from "../types";
import type { SecurityLevel } from "@/types/security.types";
import { SecurityAnalysisPanel } from "./SecurityAnalysisPanel";

import { copyToClipboard } from "../utils/clipboard";
import { downloadYAML } from "../../../utils/yamlGenerator";
import { generateK8sFilename } from "../../../utils/filenameUtils";
import {
  formatMultiDocumentYAML,
  formatSingleRuleYAML,
} from "../utils/yamlFormatters";
import {
  analyzeRoleSecurity,
  analyzeBindingSecurity,
  analyzePrincipalSecurity,
} from "../utils/securityAnalysis";
import { Tooltip } from "../../Tooltip/Tooltip";
import { RiskLevelTooltipContent } from "../../../utils/security";
import { getVerbBadgeClasses, classifyVerb } from "../../../utils/security";
import { K8sResourceIcon } from "@/icons";
import {
  ACCESSIBLE_COLORS,
  getSeverityStyle,
  combineClasses,
  getButtonClasses,
  getCardClasses,
} from "../../../utils/colors";
import { useRBAC } from "../../../context/rbac";
import {
  transformClusterResourceToManifest,
  hasManifestContent,
} from "../../../utils/clusterResourceTransformer";
import { announceToScreenReader } from "../../../utils/accessibility";

export const BrowserModeFooter: React.FC<BrowserModeFooterProps> = ({
  resource,
  relatedRole,
  relatedRoles = [],
  relatedBindings = [],
  onSwitchToPolicyBuilder,
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);
  const [rulesExpanded, setRulesExpanded] = useState(true);
  const [subjectsExpanded, setSubjectsExpanded] = useState(true);
  const [labelsExpanded, setLabelsExpanded] = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);

  const rbacContext = useRBAC();

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text, label);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleDownload = (content: string, filename: string, label: string) => {
    downloadYAML(content, filename);
    setDownloadedItem(label);
    setTimeout(() => setDownloadedItem(null), 2000);
  };

  const handleCopyToPolicyBuilder = () => {
    const hasContent = hasManifestContent(rbacContext.manifest);

    if (hasContent) {
      setShowCopyConfirm(true);
    } else {
      performCopyToPolicyBuilder();
    }
  };

  const performCopyToPolicyBuilder = () => {
    try {
      const transformedManifest = transformClusterResourceToManifest(
        resource,
        relatedRole,
        relatedBindings
      );

      rbacContext.updateRoleName(transformedManifest.role.name);
      rbacContext.updateBindingName(transformedManifest.binding.name);

      if (transformedManifest.role.isClusterRole) {
        if (!rbacContext.manifest.role.isClusterRole) {
          rbacContext.toggleClusterRole();
        }
      } else {
        if (rbacContext.manifest.role.isClusterRole) {
          rbacContext.toggleClusterRole();
        }
        rbacContext.updateNamespace(transformedManifest.role.namespace);
      }

      rbacContext.manifest.role.permissions.forEach((perm) => {
        rbacContext.removePermission(perm.resource);
      });

      transformedManifest.role.permissions.forEach((permission) => {
        rbacContext.addPermission(permission);
      });

      const subjectCount = rbacContext.manifest.binding.subjects.length;
      for (let i = subjectCount - 1; i >= 0; i--) {
        rbacContext.removeSubject(i);
      }

      transformedManifest.binding.subjects.forEach((subject) => {
        rbacContext.addSubject(subject);
      });

      setShowCopyConfirm(false);

      announceToScreenReader(
        `Copied ${resource.kind} ${resource.name} to Policy Builder`
      );

      if (onSwitchToPolicyBuilder) {
        setTimeout(() => {
          onSwitchToPolicyBuilder();
        }, 100);
      }
    } catch (error) {
      console.error("Failed to copy to policy builder:", error);
      announceToScreenReader("Failed to copy resource. Please try again.");
    }
  };

  const isRole = resource.kind === "Role" || resource.kind === "ClusterRole";
  const isBinding =
    resource.kind === "RoleBinding" || resource.kind === "ClusterRoleBinding";
  const isPrincipal =
    resource.kind === "User" ||
    resource.kind === "Group" ||
    resource.kind === "ServiceAccount";

  const subjects = resource.subjects || [];

  const securityIssues = useMemo(() => {
    if (isRole) {
      return analyzeRoleSecurity(resource);
    } else if (isBinding) {
      return analyzeBindingSecurity(resource, relatedRole);
    } else if (isPrincipal) {
      return analyzePrincipalSecurity(resource, relatedRoles);
    }
    return [];
  }, [resource, relatedRole, relatedRoles, isRole, isBinding, isPrincipal]);

  const ruleIssues = useMemo(() => {
    if (!isRole || !resource.rules) return [];

    // Import analyzeRule locally to avoid circular dependency
    const analyzeRule = (rule: {
      apiGroups?: string[];
      resources?: string[];
      verbs?: string[];
      resourceNames?: string[];
    }): { severity: SecurityLevel; type: string; label: string } | null => {
      // Check for wildcard all
      const hasWildcardAll =
        rule.resources?.includes("*") &&
        rule.verbs?.includes("*") &&
        (rule.apiGroups?.includes("*") || rule.apiGroups?.includes(""));

      if (hasWildcardAll) {
        return {
          severity: "critical-destructive",
          type: "wildcard-all",
          label: "Full Access (*/*/*)",
        };
      }

      // Check for sensitive resources
      const sensitiveResources = ["secrets", "configmaps", "serviceaccounts"];
      const hasSensitiveResources = rule.resources?.some((r) =>
        sensitiveResources.includes(r)
      );

      if (hasSensitiveResources) {
        const dangerousVerbs = [
          "get",
          "list",
          "watch",
          "create",
          "update",
          "patch",
          "delete",
        ];
        const hasDangerousAccess = rule.verbs?.some((v) =>
          dangerousVerbs.includes(v)
        );

        if (hasDangerousAccess) {
          return {
            severity: "critical-sensitive",
            type: "sensitive-resources",
            label: "Sensitive Resources",
          };
        }
      }

      // Check for destructive permissions
      const dangerousVerbs = ["delete", "deletecollection"];
      const hasDestructiveVerbs = rule.verbs?.some((v) =>
        dangerousVerbs.includes(v)
      );

      if (hasDestructiveVerbs) {
        return {
          severity: "critical-destructive",
          type: "destructive",
          label: "Destructive Permissions",
        };
      }

      // Check for privilege escalation
      const rbacResources = [
        "roles",
        "clusterroles",
        "rolebindings",
        "clusterrolebindings",
      ];
      const hasRbacResources = rule.resources?.some((r) =>
        rbacResources.includes(r)
      );

      if (hasRbacResources) {
        const canModify = rule.verbs?.some((v) =>
          ["create", "update", "patch", "delete", "bind", "escalate"].includes(
            v
          )
        );

        if (canModify) {
          return {
            severity: "high",
            type: "privilege-escalation",
            label: "Privilege Escalation",
          };
        }
      }

      // Check for wildcard verbs
      const hasWildcardVerbs = rule.verbs?.includes("*");
      if (hasWildcardVerbs) {
        return {
          severity: "medium",
          type: "wildcard-verbs",
          label: "Wildcard Verbs",
        };
      }

      // Check for wildcard resources
      const hasWildcardResources = rule.resources?.includes("*");
      if (hasWildcardResources) {
        return {
          severity: "medium",
          type: "wildcard-resources",
          label: "Wildcard Resources",
        };
      }

      return null;
    };

    return resource.rules.map((rule) => analyzeRule(rule));
  }, [isRole, resource.rules]);

  const hasAnyRuleIssues = ruleIssues.some((issue) => issue !== null);

  const infoColors = ACCESSIBLE_COLORS.info;
  const warningColors = ACCESSIBLE_COLORS.warning;
  const successColors = ACCESSIBLE_COLORS.success;
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const purpleColors = ACCESSIBLE_COLORS.purple;
  const indigoColors = ACCESSIBLE_COLORS.indigo;
  const slateColors = ACCESSIBLE_COLORS.slate;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Copy to Policy Builder Section */}
        <div className={getCardClasses("accent", "slate")}>
          <div className="flex flex-col gap-3">
            <div>
              <h4
                className={combineClasses(
                  "text-sm font-semibold mb-1 flex items-center gap-2",
                  neutralColors.text
                )}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Copy to Policy Builder
              </h4>
              <p className={combineClasses("text-xs", neutralColors.icon)}>
                Use as template for creating a new policy
              </p>
            </div>
            <button
              onClick={handleCopyToPolicyBuilder}
              disabled={!onSwitchToPolicyBuilder}
              title="Copy this resource to the Policy Builder tab"
              className={combineClasses(
                getButtonClasses("primary", "slate", "md"),
                "w-full"
              )}
              aria-label="Copy this resource to the Policy Builder tab"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Copy to Builder</span>
            </button>
          </div>
        </div>

        {/* Export Configuration Section */}
        {(() => {
          const allSubjects: Subject[] = [];

          if (subjects.length > 0) {
            allSubjects.push(...subjects);
          }

          if (relatedBindings && relatedBindings.length > 0) {
            relatedBindings.forEach((binding) => {
              if (binding.subjects) {
                allSubjects.push(...binding.subjects);
              }
            });
          }

          if (isPrincipal && resource.kind === "ServiceAccount") {
            allSubjects.push({
              kind: "ServiceAccount",
              name: resource.name,
              ...(resource.namespace && { namespace: resource.namespace }),
            });
          }

          let totalDocs = 1;

          if (resource.kind === "User" || resource.kind === "Group") {
            totalDocs = 0;
          }

          if (isRole && relatedBindings && relatedBindings.length > 0) {
            totalDocs += relatedBindings.length;
          }

          if (relatedRole) {
            totalDocs += 1;
          }

          if (relatedRoles && relatedRoles.length > 0) {
            totalDocs += relatedRoles.length;
          }

          if (isPrincipal && relatedBindings && relatedBindings.length > 0) {
            totalDocs += relatedBindings.length;
          }

          const uniqueServiceAccounts = allSubjects
            .filter((s) => s.kind === "ServiceAccount")
            .filter(
              (sa, index, self) =>
                index ===
                self.findIndex(
                  (s) => s.name === sa.name && s.namespace === sa.namespace
                )
            );
          totalDocs += uniqueServiceAccounts.length;

          return (
            <div className={getCardClasses("accent", "slate")}>
              <div className="flex flex-col gap-3">
                <div>
                  <h4
                    className={combineClasses(
                      "text-sm font-semibold mb-1 flex items-center gap-2",
                      neutralColors.text
                    )}
                  >
                    <Download
                      size={16}
                      className={slateColors.icon}
                      aria-hidden="true"
                    />
                    Export Configuration
                  </h4>
                  <p className={combineClasses("text-xs", neutralColors.icon)}>
                    Download or copy all {totalDocs} related resources
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const allResources = [];

                      if (
                        resource.kind !== "User" &&
                        resource.kind !== "Group"
                      ) {
                        allResources.push(resource);
                      }

                      if (
                        isRole &&
                        relatedBindings &&
                        relatedBindings.length > 0
                      ) {
                        allResources.push(...relatedBindings);
                      }

                      if (relatedRole) {
                        allResources.push(relatedRole);
                      }

                      if (relatedRoles && relatedRoles.length > 0) {
                        allResources.push(...relatedRoles);
                      }

                      if (
                        isPrincipal &&
                        relatedBindings &&
                        relatedBindings.length > 0
                      ) {
                        allResources.push(...relatedBindings);
                      }

                      const yaml = formatMultiDocumentYAML(
                        allResources,
                        uniqueServiceAccounts
                      );
                      handleCopy(yaml, "all-yaml");
                    }}
                    title={`Copy complete multi-document YAML with all ${totalDocs} related resource(s)`}
                    className={combineClasses(
                      getButtonClasses("secondary", "slate", "md"),
                      "w-full"
                    )}
                    aria-label={`Copy complete multi-document YAML with all ${totalDocs} related resources`}
                  >
                    {copiedItem === "all-yaml" ? (
                      <>
                        <Check
                          size={14}
                          className={successColors.icon}
                          aria-hidden="true"
                        />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">
                          Copy ({totalDocs})
                        </span>
                        <span className="sm:hidden">Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      const allResources = [];

                      if (
                        resource.kind !== "User" &&
                        resource.kind !== "Group"
                      ) {
                        allResources.push(resource);
                      }

                      if (
                        isRole &&
                        relatedBindings &&
                        relatedBindings.length > 0
                      ) {
                        allResources.push(...relatedBindings);
                      }

                      if (relatedRole) {
                        allResources.push(relatedRole);
                      }

                      if (relatedRoles && relatedRoles.length > 0) {
                        allResources.push(...relatedRoles);
                      }

                      if (
                        isPrincipal &&
                        relatedBindings &&
                        relatedBindings.length > 0
                      ) {
                        allResources.push(...relatedBindings);
                      }

                      const yaml = formatMultiDocumentYAML(
                        allResources,
                        uniqueServiceAccounts
                      );
                      const filename = generateK8sFilename(
                        resource.kind,
                        resource.name,
                        "complete"
                      );
                      handleDownload(yaml, filename, "all-yaml");
                    }}
                    title={`Download complete multi-document YAML with all ${totalDocs} related resource(s)`}
                    className={combineClasses(
                      getButtonClasses("primary", "slate", "md"),
                      "w-full"
                    )}
                    aria-label={`Download complete multi-document YAML with all ${totalDocs} related resources`}
                  >
                    {downloadedItem === "all-yaml" ? (
                      <>
                        <Check
                          size={14}
                          className={successColors.icon}
                          aria-hidden="true"
                        />
                        <span>Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">
                          Download ({totalDocs})
                        </span>
                        <span className="sm:hidden">Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Rules and Bindings Section */}
      {(isRole || isBinding) && (
        <>
          {/* Rules Section */}
          {isRole && resource.rules && resource.rules.length > 0 && (
            <div
              className={combineClasses(
                "p-4 rounded-lg border",
                successColors.bg,
                successColors.border
              )}
            >
              <button
                onClick={() => setRulesExpanded(!rulesExpanded)}
                className={combineClasses(
                  "w-full flex items-center justify-between mb-3",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
                  successColors.ring
                )}
                aria-expanded={rulesExpanded}
                aria-controls="rules-content"
              >
                <h4
                  className={combineClasses(
                    "text-sm font-semibold flex items-center gap-2",
                    successColors.text
                  )}
                >
                  <K8sResourceIcon
                    kind="Role"
                    size={16}
                    className={successColors.icon}
                    aria-hidden="true"
                  />
                  Rules ({resource.rules.length})
                </h4>
                {rulesExpanded ? (
                  <ChevronUp
                    size={16}
                    className={successColors.icon}
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className={successColors.icon}
                    aria-hidden="true"
                  />
                )}
              </button>

              {hasAnyRuleIssues && (
                <div
                  className={combineClasses(
                    "mb-3 p-2 rounded border",
                    warningColors.bg,
                    warningColors.border
                  )}
                  role="alert"
                >
                  <div className="flex items-start gap-2 text-xs">
                    {(() => {
                      const WarningIcon = getSeverityStyle("medium").icon;
                      return (
                        <WarningIcon
                          size={14}
                          className={combineClasses(
                            warningColors.icon,
                            "flex-shrink-0 mt-0.5"
                          )}
                          aria-hidden="true"
                        />
                      );
                    })()}
                    <div className={warningColors.text}>
                      <span className="font-medium">Security Notice:</span> Some
                      rules have been flagged with security concerns. Hover over
                      the risk badges for detailed explanations.
                    </div>
                  </div>
                </div>
              )}

              {rulesExpanded && (
                <div className="space-y-3" id="rules-content">
                  {resource.rules.map((rule, ruleIndex) => {
                    const ruleIssue = ruleIssues[ruleIndex];
                    const hasIssue = ruleIssue !== null;

                    const severityStyle =
                      hasIssue && ruleIssue
                        ? getSeverityStyle(ruleIssue.severity)
                        : null;

                    const colors = severityStyle?.colors || neutralColors;
                    const SeverityIcon = severityStyle?.icon;

                    return (
                      <div
                        key={ruleIndex}
                        className={combineClasses(
                          "rounded-lg p-3 border relative",
                          colors.bg,
                          colors.border
                        )}
                        role={hasIssue ? "alert" : undefined}
                        aria-label={
                          hasIssue && ruleIssue && severityStyle
                            ? `Rule ${ruleIndex + 1} with ${
                                severityStyle.label
                              } security issue: ${ruleIssue.label}`
                            : `Rule ${ruleIndex + 1}`
                        }
                      >
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          {hasIssue &&
                            ruleIssue &&
                            severityStyle &&
                            SeverityIcon && (
                              <div className="flex items-center gap-1">
                                {/* Badge with icon and text */}
                                <div
                                  className={combineClasses(
                                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border",
                                    colors.bg,
                                    colors.text,
                                    colors.border
                                  )}
                                >
                                  <SeverityIcon size={12} aria-hidden="true" />
                                  <span className="uppercase tracking-wide">
                                    {severityStyle.label}
                                  </span>
                                  <span className="ml-1">
                                    • {ruleIssue.label}
                                  </span>
                                </div>
                                {/* Tooltip - separate from badge */}
                                <Tooltip
                                  content={
                                    <RiskLevelTooltipContent
                                      level={ruleIssue.severity}
                                    />
                                  }
                                  side="left"
                                  iconSize={12}
                                  iconClassName={colors.icon}
                                />
                              </div>
                            )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const yaml = formatSingleRuleYAML(
                                rule,
                                ruleIndex
                              );
                              handleCopy(yaml, `rule-${ruleIndex}`);
                            }}
                            className={combineClasses(
                              "p-1.5 rounded transition-colors",
                              "focus:outline-none focus:ring-2 focus:ring-offset-1",
                              colors.icon,
                              colors.hover,
                              colors.ring
                            )}
                            title={`Copy rule ${ruleIndex + 1} YAML`}
                            aria-label={`Copy rule ${ruleIndex + 1} YAML`}
                          >
                            {copiedItem === `rule-${ruleIndex}` ? (
                              <span
                                className={combineClasses(
                                  "text-xs font-bold",
                                  successColors.icon
                                )}
                                aria-label="Copied"
                              >
                                ✓
                              </span>
                            ) : (
                              <Copy size={14} aria-hidden="true" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const yaml = formatSingleRuleYAML(
                                rule,
                                ruleIndex
                              );
                              const filename = generateK8sFilename(
                                resource.kind,
                                resource.name,
                                `rule-${ruleIndex}`
                              );
                              handleDownload(
                                yaml,
                                filename,
                                `rule-${ruleIndex}`
                              );
                            }}
                            className={combineClasses(
                              "p-1.5 rounded transition-colors",
                              "focus:outline-none focus:ring-2 focus:ring-offset-1",
                              colors.icon,
                              colors.hover,
                              colors.ring
                            )}
                            title={`Download rule ${ruleIndex + 1} YAML`}
                            aria-label={`Download rule ${ruleIndex + 1} YAML`}
                          >
                            {downloadedItem === `rule-${ruleIndex}` ? (
                              <span
                                className={combineClasses(
                                  "text-xs font-bold",
                                  successColors.icon
                                )}
                                aria-label="Downloaded"
                              >
                                ✓
                              </span>
                            ) : (
                              <Download size={14} aria-hidden="true" />
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm pr-20">
                          <div>
                            <span
                              className={combineClasses(
                                "font-medium block mb-1",
                                neutralColors.text
                              )}
                            >
                              Resources:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {rule.resources?.map((res, i) => (
                                <span
                                  key={i}
                                  className={combineClasses(
                                    "px-2 py-0.5 rounded text-xs font-mono border",
                                    infoColors.bg,
                                    infoColors.text,
                                    infoColors.border
                                  )}
                                >
                                  {res}
                                </span>
                              )) || (
                                <span
                                  className={combineClasses(
                                    "text-xs",
                                    neutralColors.icon
                                  )}
                                >
                                  None
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span
                              className={combineClasses(
                                "font-medium block mb-1",
                                neutralColors.text
                              )}
                            >
                              Verbs:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {rule.verbs?.map((verb, i) => {
                                const verbClasses = getVerbBadgeClasses(verb);
                                const verbClassification = classifyVerb(verb);

                                return (
                                  <span
                                    key={i}
                                    className={combineClasses(
                                      "px-2 py-0.5 rounded text-xs font-mono border",
                                      verbClasses
                                    )}
                                    title={verbClassification.description}
                                  >
                                    {verb}
                                  </span>
                                );
                              }) || (
                                <span
                                  className={combineClasses(
                                    "text-xs",
                                    neutralColors.icon
                                  )}
                                >
                                  None
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span
                              className={combineClasses(
                                "font-medium block mb-1",
                                neutralColors.text
                              )}
                            >
                              API Groups:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {rule.apiGroups?.map((group, i) => (
                                <span
                                  key={i}
                                  className={combineClasses(
                                    "px-2 py-0.5 rounded text-xs font-mono border",
                                    purpleColors.bg,
                                    purpleColors.text,
                                    purpleColors.border
                                  )}
                                >
                                  {group || '""'}
                                </span>
                              )) || (
                                <span
                                  className={combineClasses(
                                    "text-xs",
                                    neutralColors.icon
                                  )}
                                >
                                  None
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {rule.resourceNames &&
                          rule.resourceNames.length > 0 && (
                            <div
                              className={combineClasses(
                                "mt-2 pt-2 border-t",
                                colors.border
                              )}
                            >
                              <span
                                className={combineClasses(
                                  "font-medium text-sm block mb-1",
                                  neutralColors.text
                                )}
                              >
                                Resource Names:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {rule.resourceNames.map((name, i) => (
                                  <span
                                    key={i}
                                    className={combineClasses(
                                      "px-2 py-0.5 rounded text-xs font-mono border",
                                      neutralColors.bg,
                                      neutralColors.text,
                                      neutralColors.border
                                    )}
                                  >
                                    {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Subjects Section (for Bindings) */}
          {isBinding && resource.subjects && resource.subjects.length > 0 && (
            <div
              className={combineClasses(
                "p-4 rounded-lg border",
                purpleColors.bg,
                purpleColors.border
              )}
            >
              <button
                onClick={() => setSubjectsExpanded(!subjectsExpanded)}
                className={combineClasses(
                  "w-full flex items-center justify-between mb-3",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
                  purpleColors.ring
                )}
                aria-expanded={subjectsExpanded}
                aria-controls="subjects-content"
              >
                <h4
                  className={combineClasses(
                    "text-sm font-semibold flex items-center gap-2",
                    purpleColors.text
                  )}
                >
                  <K8sResourceIcon
                    kind="User"
                    size={16}
                    className={purpleColors.icon}
                    aria-hidden="true"
                  />
                  Subjects ({resource.subjects.length})
                </h4>
                {subjectsExpanded ? (
                  <ChevronUp
                    size={16}
                    className={purpleColors.icon}
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className={purpleColors.icon}
                    aria-hidden="true"
                  />
                )}
              </button>

              {subjectsExpanded && (
                <div className="space-y-2" id="subjects-content">
                  {resource.subjects.map((subject, subIndex) => (
                    <div
                      key={subIndex}
                      className={combineClasses(
                        "rounded-lg p-3 border",
                        neutralColors.bg,
                        purpleColors.border
                      )}
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <K8sResourceIcon
                          kind={subject.kind}
                          size={14}
                          className={combineClasses(
                            purpleColors.icon,
                            "flex-shrink-0"
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={combineClasses(
                            "px-2 py-1 rounded font-medium text-xs border",
                            purpleColors.bg,
                            purpleColors.text,
                            purpleColors.border
                          )}
                        >
                          {subject.kind}
                        </span>
                        <span
                          className={combineClasses(
                            "font-medium",
                            neutralColors.text
                          )}
                        >
                          {subject.name}
                        </span>
                        {subject.namespace && (
                          <span
                            className={combineClasses(
                              "px-2 py-0.5 rounded text-xs border",
                              infoColors.bg,
                              infoColors.text,
                              infoColors.border
                            )}
                          >
                            {subject.namespace}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Reference Section (for Bindings) */}
          {isBinding && resource.roleRef && (
            <div
              className={combineClasses(
                "p-4 rounded-lg border",
                indigoColors.bg,
                indigoColors.border
              )}
            >
              <h4
                className={combineClasses(
                  "text-sm font-semibold mb-3 flex items-center gap-2",
                  indigoColors.text
                )}
              >
                <K8sResourceIcon
                  kind={resource.roleRef.kind}
                  size={16}
                  className={indigoColors.icon}
                  aria-hidden="true"
                />
                Role Reference
              </h4>
              <div
                className={combineClasses(
                  "rounded-lg p-3 border",
                  neutralColors.bg,
                  indigoColors.border
                )}
              >
                <div className="flex items-center gap-3 text-sm">
                  <K8sResourceIcon
                    kind={resource.roleRef.kind}
                    size={14}
                    className={combineClasses(
                      indigoColors.icon,
                      "flex-shrink-0"
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={combineClasses(
                      "px-2 py-1 rounded font-medium text-xs border",
                      indigoColors.bg,
                      indigoColors.text,
                      indigoColors.border
                    )}
                  >
                    {resource.roleRef.kind}
                  </span>
                  <span
                    className={combineClasses(
                      "font-medium font-mono",
                      neutralColors.text
                    )}
                  >
                    {resource.roleRef.name}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Security Analysis */}
      <SecurityAnalysisPanel
        securityIssues={securityIssues}
        context="resource-browser"
        title="Security Insights"
        showNote={false}
      />

      {/* Metadata Section */}
      <div
        className={combineClasses(
          "p-4 rounded-lg border",
          neutralColors.bg,
          neutralColors.border
        )}
      >
        <h4
          className={combineClasses(
            "text-sm font-semibold mb-3",
            neutralColors.text
          )}
        >
          Metadata
        </h4>

        {/* Basic metadata in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className={combineClasses("font-medium", neutralColors.icon)}>
              Created:
            </span>
            <div
              className={combineClasses(
                "mt-1 font-mono text-xs",
                neutralColors.text
              )}
            >
              {new Date(resource.createdAt).toLocaleString()}
            </div>
            <div
              className={combineClasses("text-xs mt-0.5", neutralColors.icon)}
            >
              (
              {Math.floor(
                (Date.now() - new Date(resource.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days ago)
            </div>
          </div>

          {resource.namespace && (
            <div>
              <span
                className={combineClasses("font-medium", neutralColors.icon)}
              >
                Namespace:
              </span>
              <div
                className={combineClasses(
                  "mt-1 font-mono text-xs",
                  neutralColors.text
                )}
              >
                {resource.namespace}
              </div>
            </div>
          )}
        </div>

        {/* Labels section - full width */}
        {resource.labels && Object.keys(resource.labels).length > 0 ? (
          <div
            className={combineClasses("pt-4 border-t", neutralColors.border)}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={combineClasses(
                  "font-medium text-sm",
                  neutralColors.text
                )}
              >
                Labels
                <span className="sr-only">
                  {" "}
                  - {Object.keys(resource.labels).length} total
                </span>
                <span
                  aria-hidden="true"
                  className={combineClasses("ml-1 text-xs", neutralColors.icon)}
                >
                  ({Object.keys(resource.labels).length})
                </span>
              </span>
              {Object.keys(resource.labels).length > 6 && (
                <button
                  onClick={() => setLabelsExpanded(!labelsExpanded)}
                  className={combineClasses(
                    "text-xs px-2 py-1 rounded transition-colors",
                    neutralColors.icon,
                    neutralColors.hover,
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    neutralColors.ring,
                    "flex items-center gap-1"
                  )}
                  aria-expanded={labelsExpanded}
                  aria-controls="labels-list"
                  aria-label={
                    labelsExpanded ? "Show fewer labels" : "Show all labels"
                  }
                >
                  {labelsExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp size={14} aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <span>Show all</span>
                      <ChevronDown size={14} aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </div>
            <div id="labels-list" className="flex flex-wrap gap-2" role="list">
              {Object.entries(resource.labels)
                .slice(0, labelsExpanded ? undefined : 6)
                .map(([key, value]) => (
                  <div
                    key={key}
                    className={combineClasses(
                      "inline-flex items-center text-xs font-mono px-2 py-1 rounded border",
                      neutralColors.bg,
                      neutralColors.border
                    )}
                    role="listitem"
                    aria-label={`Label: ${key} equals ${value}`}
                  >
                    <span
                      className={combineClasses(
                        "font-semibold",
                        infoColors.icon
                      )}
                    >
                      {key}
                    </span>
                    <span
                      className={combineClasses("mx-1", neutralColors.icon)}
                    >
                      =
                    </span>
                    <span className={neutralColors.text}>{value}</span>
                  </div>
                ))}
            </div>
            {!labelsExpanded && Object.keys(resource.labels).length > 6 && (
              <button
                onClick={() => setLabelsExpanded(true)}
                className={combineClasses(
                  "text-xs mt-2 underline decoration-dotted underline-offset-2",
                  "transition-colors cursor-pointer",
                  neutralColors.icon,
                  "hover:text-blue-600 dark:hover:text-blue-400",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded"
                )}
                aria-label={`Show ${
                  Object.keys(resource.labels).length - 6
                } more labels`}
              >
                +{Object.keys(resource.labels).length - 6} more labels
              </button>
            )}
          </div>
        ) : (
          <div
            className={combineClasses("pt-4 border-t", neutralColors.border)}
          >
            <span
              className={combineClasses(
                "font-medium text-sm",
                neutralColors.text
              )}
            >
              Labels:
            </span>
            <div
              className={combineClasses(
                "mt-1 text-xs italic",
                neutralColors.icon
              )}
            >
              No labels
            </div>
          </div>
        )}
      </div>

      {/* Copy to Policy Builder Confirmation Modal */}
      {showCopyConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="copy-dialog-title"
          aria-describedby="copy-dialog-description"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCopyConfirm(false);
            }
          }}
        >
          <div
            className={combineClasses(
              "rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200",
              neutralColors.bg
            )}
            role="document"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={combineClasses("p-2 rounded-full", warningColors.bg)}
                aria-hidden="true"
              >
                <ArrowLeft className={warningColors.icon} size={24} />
              </div>
              <h3
                id="copy-dialog-title"
                className={combineClasses(
                  "text-lg font-semibold",
                  neutralColors.text
                )}
              >
                Copy to Policy Builder?
              </h3>
            </div>

            <div
              id="copy-dialog-description"
              className={combineClasses("mb-6", neutralColors.text)}
            >
              <p className="mb-4">
                This will replace your current Policy Builder configuration
                with:
              </p>

              <div
                className={combineClasses(
                  "rounded-lg p-3 border space-y-2 text-sm",
                  neutralColors.bg,
                  neutralColors.border
                )}
              >
                <div className="flex items-center gap-2">
                  <K8sResourceIcon
                    kind={resource.kind}
                    size={16}
                    className={infoColors.icon}
                    aria-hidden="true"
                  />
                  <span
                    className={combineClasses(
                      "font-medium",
                      neutralColors.text
                    )}
                  >
                    {resource.kind}: {resource.name}-copy
                  </span>
                </div>

                {resource.namespace && (
                  <div
                    className={combineClasses("text-xs", neutralColors.icon)}
                  >
                    Namespace: {resource.namespace}
                  </div>
                )}

                {resource.rules && resource.rules.length > 0 && (
                  <div
                    className={combineClasses("text-xs", neutralColors.icon)}
                  >
                    • {resource.rules.length} rule
                    {resource.rules.length === 1 ? "" : "s"}
                  </div>
                )}

                {(() => {
                  const firstBinding = relatedBindings?.[0];
                  const subjectCount = firstBinding?.subjects?.length ?? 0;

                  if (subjectCount > 0) {
                    return (
                      <div
                        className={combineClasses(
                          "text-xs",
                          neutralColors.icon
                        )}
                      >
                        • {subjectCount} subject{subjectCount === 1 ? "" : "s"}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <p className={combineClasses("mt-4 text-sm", warningColors.text)}>
                Your current configuration will be lost. This action cannot be
                undone.
              </p>
            </div>

            <div
              className="flex gap-3"
              role="group"
              aria-label="Copy confirmation actions"
            >
              <button
                type="button"
                onClick={() => {
                  setShowCopyConfirm(false);
                  announceToScreenReader("Copy cancelled");
                }}
                className={combineClasses(
                  "flex-1 px-4 py-2 border rounded-lg transition-all font-medium transform-gpu",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  "hover:scale-105 active:scale-95",
                  neutralColors.text,
                  neutralColors.border,
                  neutralColors.hover,
                  neutralColors.ring
                )}
                aria-label="Cancel copy operation"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performCopyToPolicyBuilder}
                className={combineClasses(
                  "flex-1 px-4 py-2 rounded-lg transition-all font-medium transform-gpu",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  "hover:scale-105 active:scale-95",
                  "bg-purple-600 dark:bg-purple-700 text-white",
                  "hover:bg-purple-700 dark:hover:bg-purple-600",
                  purpleColors.ring
                )}
                aria-label="Confirm copy to Policy Builder"
              >
                Copy to Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
