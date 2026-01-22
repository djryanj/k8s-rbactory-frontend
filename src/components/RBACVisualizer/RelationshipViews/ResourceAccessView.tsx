// src/components/RBACVisualizer/RelationshipViews/ResourceAccessView.tsx
import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Shield,
  Lock,
  Globe,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { K8sResourceIcon } from "@/icons";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import type { KubernetesResource, AccessGrant } from "../../../services/api";
import { CollapsibleList } from "../shared/CollapsibleList";
import { SecurityAnalysisPanel } from "../shared/SecurityAnalysisPanel";
import { ResourceAccessFooter } from "../shared/ResourceAccessFooter";
import { analyzeResourceAccessSecurity } from "../utils/securityAnalysis";
import { getVerbBadgeClasses, classifyVerb } from "../../../utils/security";

interface ResourceAccessViewProps {
  resource: KubernetesResource;
  accessGrants: AccessGrant[];
  onSwitchToPolicyBuilder?: () => void;
}

export const ResourceAccessView: React.FC<ResourceAccessViewProps> = ({
  resource,
  accessGrants,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;
  const successColors = ACCESSIBLE_COLORS.success;
  const warningColors = ACCESSIBLE_COLORS.warning;
  const purpleColors = ACCESSIBLE_COLORS.purple;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["principals"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Group access grants by principal
  const principalAccess = useMemo(() => {
    const grouped = new Map<
      string,
      {
        principal: AccessGrant["principal"];
        grants: AccessGrant[];
        allVerbs: Set<string>;
      }
    >();

    accessGrants.forEach((grant) => {
      const key = `${grant.principal.kind}:${grant.principal.name}:${grant.principal.namespace || ""}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          principal: grant.principal,
          grants: [],
          allVerbs: new Set(),
        });
      }

      const entry = grouped.get(key)!;
      entry.grants.push(grant);
      grant.verbs.forEach((verb) => entry.allVerbs.add(verb));
    });

    return Array.from(grouped.values());
  }, [accessGrants]);

  // Group by scope (namespace vs cluster) with UNIQUE PRINCIPAL COUNTS
  const accessByScope = useMemo(() => {
    const namespaceAccess = accessGrants.filter((g) => g.scope === "namespace");
    const clusterAccess = accessGrants.filter((g) => g.scope === "cluster");

    // Calculate unique principals per scope
    const namespacePrincipals = new Set<string>();
    namespaceAccess.forEach((grant) => {
      const key = `${grant.principal.kind}:${grant.principal.name}:${grant.principal.namespace || ""}`;
      namespacePrincipals.add(key);
    });

    const clusterPrincipals = new Set<string>();
    clusterAccess.forEach((grant) => {
      const key = `${grant.principal.kind}:${grant.principal.name}:${grant.principal.namespace || ""}`;
      clusterPrincipals.add(key);
    });

    return {
      namespaceAccess,
      clusterAccess,
      namespacePrincipalCount: namespacePrincipals.size,
      clusterPrincipalCount: clusterPrincipals.size,
    };
  }, [accessGrants]);

  // Get unique verbs across all grants
  const allVerbs = useMemo(() => {
    const verbs = new Set<string>();
    accessGrants.forEach((grant) => {
      grant.verbs.forEach((verb) => verbs.add(verb));
    });
    return Array.from(verbs).sort();
  }, [accessGrants]);

  // Calculate verb statistics for the stats display
  const verbStats = useMemo(() => {
    const highRiskVerbs = new Set([
      "delete",
      "deletecollection",
      "create",
      "update",
      "patch",
      "*",
    ]);
    const readOnlyVerbs = new Set(["get", "list", "watch"]);

    const stats = {
      highRisk: 0,
      readOnly: 0,
      other: 0,
    };

    allVerbs.forEach((verb) => {
      if (highRiskVerbs.has(verb)) {
        stats.highRisk++;
      } else if (readOnlyVerbs.has(verb)) {
        stats.readOnly++;
      } else {
        stats.other++;
      }
    });

    return stats;
  }, [allVerbs]);

  const hasAccess = accessGrants.length > 0;

  // Security analysis using unified system
  const securityIssues = useMemo(() => {
    return analyzeResourceAccessSecurity(resource, accessGrants);
  }, [resource, accessGrants]);

  return (
    <div className="space-y-6">
      {/* Resource Header */}
      <section
        className={combineClasses(
          "rounded-lg p-4 border-2",
          infoColors.bg,
          infoColors.border
        )}
        aria-labelledby="resource-header"
      >
        <div className="flex items-start gap-3">
          <K8sResourceIcon
            kind={resource.kind}
            size={48}
            className={combineClasses("flex-shrink-0", infoColors.icon)}
            aria-hidden="true"
          />

          <div className="flex-1 min-w-0">
            <h3
              id="resource-header"
              className={combineClasses(
                "text-xl font-bold mb-1",
                infoColors.text
              )}
            >
              {resource.name}
            </h3>

            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span
                className={combineClasses(
                  "inline-flex items-center px-2 py-1 rounded font-medium border",
                  neutralColors.bg,
                  infoColors.text,
                  infoColors.border
                )}
              >
                {resource.kind}
              </span>

              {resource.namespace && (
                <span
                  className={combineClasses(
                    "inline-flex items-center px-2 py-1 rounded font-medium border",
                    neutralColors.bg,
                    neutralColors.text,
                    neutralColors.border
                  )}
                >
                  Namespace: {resource.namespace}
                </span>
              )}
            </div>

            {/* Access Summary */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div
                  className={combineClasses(
                    "flex items-center gap-1.5",
                    successColors.text
                  )}
                >
                  <Users size={16} aria-hidden="true" />
                  <span className="font-semibold">
                    {principalAccess.length}
                  </span>
                  <span className={neutralColors.icon}>
                    unique principal{principalAccess.length !== 1 ? "s" : ""}{" "}
                    have access
                  </span>
                </div>
              </div>

              {/* Scope breakdown with clarification */}
              {(accessByScope.namespacePrincipalCount > 0 ||
                accessByScope.clusterPrincipalCount > 0) && (
                <div className="flex items-center gap-4 text-xs flex-wrap">
                  {accessByScope.namespacePrincipalCount > 0 && (
                    <div
                      className={combineClasses(
                        "flex items-center gap-1.5",
                        neutralColors.icon
                      )}
                    >
                      <Lock size={12} aria-hidden="true" />
                      <span className="font-semibold">
                        {accessByScope.namespacePrincipalCount}
                      </span>
                      <span>via namespace-scoped roles</span>
                    </div>
                  )}

                  {accessByScope.clusterPrincipalCount > 0 && (
                    <div
                      className={combineClasses(
                        "flex items-center gap-1.5",
                        neutralColors.icon
                      )}
                    >
                      <Globe size={12} aria-hidden="true" />
                      <span className="font-semibold">
                        {accessByScope.clusterPrincipalCount}
                      </span>
                      <span>via cluster-scoped roles</span>
                    </div>
                  )}

                  {/* Show overlap indicator if counts don't add up */}
                  {accessByScope.namespacePrincipalCount +
                    accessByScope.clusterPrincipalCount >
                    principalAccess.length && (
                    <div
                      className={combineClasses(
                        "flex items-center gap-1.5 text-xs italic",
                        neutralColors.icon
                      )}
                      title="Some principals have access through both namespace and cluster-scoped roles"
                    >
                      <span>
                        (
                        {accessByScope.namespacePrincipalCount +
                          accessByScope.clusterPrincipalCount -
                          principalAccess.length}{" "}
                        with both)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {!hasAccess ? (
        <div
          className={combineClasses(
            "rounded-lg p-8 text-center border-2 border-dashed",
            warningColors.bg,
            warningColors.border
          )}
        >
          <Shield
            className={combineClasses("mx-auto mb-3", warningColors.icon)}
            size={48}
          />
          <h3
            className={combineClasses(
              "text-lg font-semibold mb-2",
              warningColors.text
            )}
          >
            No RBAC Access Configured
          </h3>
          <p className={neutralColors.icon}>
            No roles or bindings currently grant access to this resource
          </p>
        </div>
      ) : (
        <>
          {/* Permission Statistics */}
          <section
            className={combineClasses(
              "p-4 rounded-lg border",
              neutralColors.bg,
              neutralColors.border
            )}
            aria-labelledby="permission-stats-heading"
          >
            <h3
              id="permission-stats-heading"
              className={combineClasses(
                "text-sm font-semibold mb-3 flex items-center gap-2",
                neutralColors.text
              )}
            >
              <BarChart3 size={16} aria-hidden="true" />
              Permission Statistics
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div
                className={combineClasses(
                  "p-3 rounded-lg border",
                  neutralColors.bg,
                  neutralColors.border
                )}
              >
                <div
                  className={combineClasses("text-xs mb-1", neutralColors.icon)}
                >
                  Read-Only
                </div>
                <div
                  className={combineClasses(
                    "text-2xl font-bold",
                    successColors.text
                  )}
                >
                  {verbStats.readOnly}
                </div>
              </div>
              <div
                className={combineClasses(
                  "p-3 rounded-lg border",
                  neutralColors.bg,
                  neutralColors.border
                )}
              >
                <div
                  className={combineClasses("text-xs mb-1", neutralColors.icon)}
                >
                  Write
                </div>
                <div
                  className={combineClasses(
                    "text-2xl font-bold",
                    warningColors.text
                  )}
                >
                  {verbStats.other}
                </div>
              </div>
              <div
                className={combineClasses(
                  "p-3 rounded-lg border",
                  neutralColors.bg,
                  neutralColors.border
                )}
              >
                <div
                  className={combineClasses("text-xs mb-1", neutralColors.icon)}
                >
                  High-Risk
                </div>
                <div
                  className={combineClasses(
                    "text-2xl font-bold",
                    ACCESSIBLE_COLORS.critical.text
                  )}
                >
                  {verbStats.highRisk}
                </div>
              </div>
            </div>
          </section>

          {/* Security Analysis - Using Unified Component */}
          <SecurityAnalysisPanel
            securityIssues={securityIssues}
            context="resource-browser"
            title="Access Security Analysis"
            showNote={true}
          />

          {/* Principals with Access */}
          <section
            aria-labelledby="principals-heading"
            className={combineClasses(
              "rounded-lg border-2",
              neutralColors.bg,
              neutralColors.border
            )}
          >
            <button
              type="button"
              onClick={() => toggleSection("principals")}
              className={combineClasses(
                "w-full flex items-center justify-between p-4 transition-all",
                "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                "rounded-t-lg",
                expandedSections.has("principals") ? "" : "rounded-b-lg"
              )}
              aria-expanded={expandedSections.has("principals")}
              aria-controls="principals-content"
            >
              <div className="flex items-center gap-2">
                <Users
                  size={20}
                  className={purpleColors.icon}
                  aria-hidden="true"
                />
                <h3
                  id="principals-heading"
                  className={combineClasses(
                    "font-semibold",
                    neutralColors.text
                  )}
                >
                  Principals with Access
                </h3>
                <span className={combineClasses("text-sm", neutralColors.icon)}>
                  ({principalAccess.length})
                </span>
              </div>
              {expandedSections.has("principals") ? (
                <ChevronUp size={20} className={neutralColors.icon} />
              ) : (
                <ChevronDown size={20} className={neutralColors.icon} />
              )}
            </button>

            {expandedSections.has("principals") && (
              <div
                id="principals-content"
                className={combineClasses(
                  "p-4 pt-0 space-y-2",
                  "border-t",
                  neutralColors.border
                )}
              >
                <CollapsibleList
                  items={principalAccess}
                  initialShowCount={5}
                  renderItem={(item, idx) => (
                    <div
                      key={idx}
                      className={combineClasses(
                        "p-4 rounded-lg border",
                        "bg-white dark:bg-gray-900",
                        neutralColors.border
                      )}
                    >
                      {/* Principal Info */}
                      <div className="flex items-start gap-3 mb-3">
                        <K8sResourceIcon
                          kind={item.principal.kind}
                          size={32}
                          className={neutralColors.icon}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={combineClasses(
                                "font-semibold",
                                neutralColors.text
                              )}
                            >
                              {item.principal.name}
                            </span>
                            <span
                              className={combineClasses(
                                "px-2 py-0.5 text-xs rounded border",
                                purpleColors.bg,
                                purpleColors.text,
                                purpleColors.border
                              )}
                            >
                              {item.principal.kind}
                            </span>
                            {item.principal.namespace && (
                              <span
                                className={combineClasses(
                                  "text-xs",
                                  neutralColors.icon
                                )}
                              >
                                in {item.principal.namespace}
                              </span>
                            )}
                          </div>

                          {/* Verbs */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Array.from(item.allVerbs).map((verb) => {
                              const verbClasses = getVerbBadgeClasses(verb);
                              const verbClassification = classifyVerb(verb);

                              return (
                                <span
                                  key={verb}
                                  className={combineClasses(
                                    "px-2 py-0.5 text-xs font-mono rounded border",
                                    verbClasses
                                  )}
                                  title={verbClassification.description}
                                  aria-label={`${verb}: ${verbClassification.description}`}
                                >
                                  {verb}
                                </span>
                              );
                            })}
                          </div>

                          {/* Access Path */}
                          <div className="space-y-1">
                            {item.grants.map((grant, grantIdx) => (
                              <div
                                key={grantIdx}
                                className={combineClasses(
                                  "flex items-center gap-2 text-xs p-2 rounded",
                                  "bg-gray-50 dark:bg-gray-800"
                                )}
                              >
                                <span
                                  className={combineClasses(
                                    "flex items-center gap-1",
                                    neutralColors.icon
                                  )}
                                >
                                  {grant.scope === "namespace" ? (
                                    <Lock size={12} />
                                  ) : (
                                    <Globe size={12} />
                                  )}
                                  <span className="font-medium">
                                    {grant.binding.kind}
                                  </span>
                                  <span>{grant.binding.name}</span>
                                </span>
                                <ArrowRight
                                  size={12}
                                  className={neutralColors.icon}
                                />
                                <span className={neutralColors.icon}>
                                  <span className="font-medium">
                                    {grant.role.kind}
                                  </span>{" "}
                                  {grant.role.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  emptyMessage="No principals have access to this resource"
                  ariaLabel="Principals with access"
                />
              </div>
            )}
          </section>

          {/* Access by Scope */}
          <section aria-labelledby="scope-heading">
            <h3
              id="scope-heading"
              className={combineClasses(
                "text-lg font-semibold mb-3",
                neutralColors.text
              )}
            >
              Access by Scope
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Namespace Access */}
              <div
                className={combineClasses(
                  "p-4 rounded-lg border-2",
                  neutralColors.bg,
                  neutralColors.border
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={18} className={infoColors.icon} />
                  <h4
                    className={combineClasses(
                      "font-semibold",
                      neutralColors.text
                    )}
                  >
                    Namespace Access
                  </h4>
                </div>
                <p
                  className={combineClasses("text-sm mb-2", neutralColors.icon)}
                >
                  Via RoleBindings in {resource.namespace || "this namespace"}
                </p>
                <div
                  className={combineClasses(
                    "text-2xl font-bold",
                    infoColors.text
                  )}
                >
                  {accessByScope.namespacePrincipalCount}
                </div>
                <p className={combineClasses("text-xs", neutralColors.icon)}>
                  unique principal
                  {accessByScope.namespacePrincipalCount !== 1 ? "s" : ""}
                </p>
                <p
                  className={combineClasses("text-xs mt-1", neutralColors.icon)}
                >
                  ({accessByScope.namespaceAccess.length} binding
                  {accessByScope.namespaceAccess.length !== 1 ? "s" : ""})
                </p>
              </div>

              {/* Cluster Access */}
              <div
                className={combineClasses(
                  "p-4 rounded-lg border-2",
                  neutralColors.bg,
                  neutralColors.border
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={18} className={warningColors.icon} />
                  <h4
                    className={combineClasses(
                      "font-semibold",
                      neutralColors.text
                    )}
                  >
                    Cluster-Wide Access
                  </h4>
                </div>
                <p
                  className={combineClasses("text-sm mb-2", neutralColors.icon)}
                >
                  Via ClusterRoleBindings
                </p>
                <div
                  className={combineClasses(
                    "text-2xl font-bold",
                    warningColors.text
                  )}
                >
                  {accessByScope.clusterPrincipalCount}
                </div>
                <p className={combineClasses("text-xs", neutralColors.icon)}>
                  unique principal
                  {accessByScope.clusterPrincipalCount !== 1 ? "s" : ""}
                </p>
                <p
                  className={combineClasses("text-xs mt-1", neutralColors.icon)}
                >
                  ({accessByScope.clusterAccess.length} binding
                  {accessByScope.clusterAccess.length !== 1 ? "s" : ""})
                </p>
              </div>
            </div>
          </section>

          {/* Resource Access Footer */}
          <ResourceAccessFooter
            resource={resource}
            accessGrants={accessGrants}
          />
        </>
      )}
    </div>
  );
};
