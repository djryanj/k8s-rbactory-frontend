// src/components/RBACVisualizer/GeneratorView.tsx
import React from "react";
import { ArrowRight } from "lucide-react";
import { K8sResourceIcon } from "@/icons";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import type { GeneratorViewProps } from "./types";

/**
 * Simple view for the Generator tab showing RBAC relationships
 * Fully accessible with ARIA attributes and semantic HTML
 */
export const GeneratorView: React.FC<GeneratorViewProps> = ({ manifest }) => {
  const isClusterRole = !manifest.role.namespace;

  const infoColors = ACCESSIBLE_COLORS.info;
  const successColors = ACCESSIBLE_COLORS.success;
  const purpleColors = ACCESSIBLE_COLORS.purple;
  const criticalColors = ACCESSIBLE_COLORS.critical;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between gap-4"
        role="region"
        aria-label="RBAC relationship flow"
      >
        {/* Subjects Section */}
        <section className="flex-1" aria-labelledby="subjects-heading">
          <div
            className={combineClasses(
              "rounded-lg p-4 border-2",
              infoColors.bg,
              infoColors.border
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <K8sResourceIcon
                kind="User"
                size={18}
                className={infoColors.icon}
                aria-hidden="true"
              />
              <h3
                id="subjects-heading"
                className={combineClasses(
                  "font-semibold text-base",
                  infoColors.text
                )}
              >
                Subjects
                <span className="sr-only">
                  {" "}
                  - {manifest.binding.subjects.length} assigned
                </span>
                <span aria-hidden="true">
                  {" "}
                  ({manifest.binding.subjects.length})
                </span>
              </h3>
            </div>
            {manifest.binding.subjects.length === 0 ? (
              <p
                className={combineClasses(
                  "text-sm italic p-3 rounded border",
                  neutralColors.icon,
                  neutralColors.bg,
                  neutralColors.border
                )}
                role="status"
              >
                No subjects assigned
              </p>
            ) : (
              <div className="space-y-2" role="list" aria-label="Subject list">
                {manifest.binding.subjects.map((subject, idx) => (
                  <div
                    key={idx}
                    className={combineClasses(
                      "rounded px-3 py-2 text-sm border",
                      neutralColors.bg,
                      infoColors.border
                    )}
                    role="listitem"
                    aria-label={`Subject ${idx + 1}: ${subject.kind} ${
                      subject.name
                    }${
                      subject.namespace
                        ? ` in namespace ${subject.namespace}`
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <K8sResourceIcon
                        kind={subject.kind}
                        size={14}
                        className={combineClasses(
                          infoColors.icon,
                          "flex-shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={combineClasses(
                            "font-medium",
                            neutralColors.text
                          )}
                        >
                          {subject.name}
                        </div>
                        <div
                          className={combineClasses(
                            "text-xs",
                            neutralColors.icon
                          )}
                        >
                          {subject.kind}
                          {subject.namespace && ` (${subject.namespace})`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Binding Arrow */}
        <div
          className="flex flex-col items-center"
          aria-hidden="true"
          role="presentation"
        >
          <ArrowRight className={neutralColors.icon} size={32} />
          <div
            className={combineClasses(
              "mt-2 px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 border",
              neutralColors.bg,
              neutralColors.text,
              neutralColors.border
            )}
          >
            <K8sResourceIcon
              kind={
                manifest.binding.roleRef.kind === "ClusterRole"
                  ? "ClusterRoleBinding"
                  : "RoleBinding"
              }
              size={12}
              className={neutralColors.icon}
            />
            {manifest.binding.roleRef.kind}Binding
          </div>
          {manifest.binding.namespace && (
            <div className={combineClasses("mt-1 text-xs", neutralColors.icon)}>
              ns: {manifest.binding.namespace}
            </div>
          )}
        </div>

        {/* Role Section */}
        <section className="flex-1" aria-labelledby="role-heading">
          <div
            className={combineClasses(
              "rounded-lg p-4 border-2",
              successColors.bg,
              successColors.border
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <K8sResourceIcon
                kind={isClusterRole ? "ClusterRole" : "Role"}
                size={18}
                className={successColors.icon}
                aria-hidden="true"
              />
              <h3
                id="role-heading"
                className={combineClasses(
                  "font-semibold text-base",
                  successColors.text
                )}
              >
                {isClusterRole ? "ClusterRole" : "Role"}
              </h3>
            </div>
            <div
              className={combineClasses(
                "rounded px-3 py-2 border",
                neutralColors.bg,
                successColors.border
              )}
              role="article"
              aria-label={`${isClusterRole ? "ClusterRole" : "Role"} ${
                manifest.role.name
              } with ${manifest.role.permissions.length} resource types`}
            >
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind={isClusterRole ? "ClusterRole" : "Role"}
                  size={14}
                  className={combineClasses(
                    successColors.icon,
                    "flex-shrink-0"
                  )}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={combineClasses(
                      "font-medium",
                      neutralColors.text
                    )}
                  >
                    {manifest.role.name}
                  </div>
                  {manifest.role.namespace && (
                    <div
                      className={combineClasses("text-xs", neutralColors.icon)}
                    >
                      ns: {manifest.role.namespace}
                    </div>
                  )}
                  <div
                    className={combineClasses(
                      "mt-1 text-xs",
                      neutralColors.icon
                    )}
                  >
                    {manifest.role.permissions.length} resource type(s)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Permissions Arrow */}
        <div
          className="flex flex-col items-center"
          aria-hidden="true"
          role="presentation"
        >
          <ArrowRight className={neutralColors.icon} size={32} />
          <div
            className={combineClasses(
              "mt-2 px-3 py-1 rounded text-xs font-medium border",
              neutralColors.bg,
              neutralColors.text,
              neutralColors.border
            )}
          >
            grants
          </div>
        </div>

        {/* Resources Section */}
        <section className="flex-1" aria-labelledby="resources-heading">
          <div
            className={combineClasses(
              "rounded-lg p-4 border-2",
              purpleColors.bg,
              purpleColors.border
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <K8sResourceIcon
                kind="Role"
                size={18}
                className={purpleColors.icon}
                aria-hidden="true"
              />
              <h3
                id="resources-heading"
                className={combineClasses(
                  "font-semibold text-base",
                  purpleColors.text
                )}
              >
                Resources
                <span className="sr-only">
                  {" "}
                  - {manifest.role.permissions.length} permissions
                </span>
                <span aria-hidden="true">
                  {" "}
                  ({manifest.role.permissions.length})
                </span>
              </h3>
            </div>
            {manifest.role.permissions.length === 0 ? (
              <p
                className={combineClasses(
                  "text-sm italic p-3 rounded border",
                  neutralColors.icon,
                  neutralColors.bg,
                  neutralColors.border
                )}
                role="status"
              >
                No permissions defined
              </p>
            ) : (
              <div
                className="space-y-2 max-h-32 overflow-y-auto"
                role="list"
                aria-label="Resource permissions list"
              >
                {manifest.role.permissions.map((perm, idx) => (
                  <div
                    key={idx}
                    className={combineClasses(
                      "rounded px-3 py-2 text-sm border",
                      neutralColors.bg,
                      purpleColors.border
                    )}
                    role="listitem"
                    aria-label={`Permission ${idx + 1}: ${
                      perm.resource
                    } with verbs ${perm.verbs.join(", ")}`}
                  >
                    <div
                      className={combineClasses(
                        "font-medium",
                        neutralColors.text
                      )}
                    >
                      {perm.resource}
                    </div>
                    <div
                      className={combineClasses("text-xs", neutralColors.icon)}
                    >
                      {perm.verbs.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Scope Indicator */}
      <div
        className={combineClasses(
          "p-3 rounded-lg border",
          neutralColors.bg,
          neutralColors.border
        )}
        role="status"
        aria-label={`Scope: ${
          isClusterRole
            ? "Cluster-wide"
            : `Namespace ${manifest.role.namespace}`
        }`}
      >
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span
            className={combineClasses(
              "font-medium flex items-center gap-2",
              neutralColors.text
            )}
          >
            <K8sResourceIcon
              kind={isClusterRole ? "ClusterRole" : "Role"}
              size={14}
              className={neutralColors.icon}
              aria-hidden="true"
            />
            Scope:
          </span>
          <span
            className={combineClasses(
              "px-3 py-1 rounded-full font-medium border",
              isClusterRole ? criticalColors.bg : infoColors.bg,
              isClusterRole ? criticalColors.text : infoColors.text,
              isClusterRole ? criticalColors.border : infoColors.border
            )}
          >
            {isClusterRole
              ? "Cluster-wide"
              : `Namespace: ${manifest.role.namespace}`}
          </span>
        </div>
      </div>

      {/* Screen reader summary */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        RBAC configuration: {manifest.binding.subjects.length} subjects bound to{" "}
        {isClusterRole ? "ClusterRole" : "Role"} {manifest.role.name} with{" "}
        {manifest.role.permissions.length} resource permissions. Scope:{" "}
        {isClusterRole
          ? "Cluster-wide"
          : `Namespace ${manifest.role.namespace}`}
        .
      </div>
    </div>
  );
};
