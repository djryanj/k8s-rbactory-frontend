// src/components/RBACVisualizer/RelationshipViews/PrincipalRelationshipView.tsx
import React, { useState, useMemo, useRef, useEffect, useId } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import { K8sResourceIcon } from "@/icons";
import { CopyButtonGroup } from "../shared/CopyButtonGroup";
import { CollapsibleList } from "../shared/CollapsibleList";
import { BrowserModeFooter } from "../shared/BrowserModeFooter";
import { copyToClipboard } from "../utils/clipboard";
import {
  formatAsYAML,
  formatServiceAccountYAML,
} from "../utils/yamlFormatters";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import { announceToScreenReader } from "../../../utils/accessibility";
import type { PrincipalRelationshipViewProps } from "../types";
import type { ClusterRBACResource } from "../../../services/api";

export const PrincipalRelationshipView: React.FC<
  PrincipalRelationshipViewProps
> = ({ principal, bindings, roles, onSwitchToPolicyBuilder }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Generate stable IDs for ARIA relationships
  const principalId = useId();
  const bindingsId = useId();
  const rolesId = useId();
  const summaryId = useId();

  // Refs for keyboard navigation
  const principalSectionRef = useRef<HTMLDivElement>(null);
  const bindingsSectionRef = useRef<HTMLDivElement>(null);
  const rolesSectionRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text, label);
    setCopiedItem(label);
    announceToScreenReader(`${label} copied to clipboard`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const totalRules = useMemo(() => {
    return roles.reduce((sum, role) => sum + (role.rules?.length || 0), 0);
  }, [roles]);

  // Keyboard navigation between sections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();

        const sections = [
          principalSectionRef.current,
          bindingsSectionRef.current,
          rolesSectionRef.current,
        ].filter(Boolean) as HTMLDivElement[];

        const currentIndex = sections.findIndex((section) =>
          section.contains(document.activeElement),
        );

        if (currentIndex === -1) return;

        const nextIndex =
          e.key === "ArrowRight"
            ? (currentIndex + 1) % sections.length
            : (currentIndex - 1 + sections.length) % sections.length;

        const firstFocusable = sections[nextIndex]?.querySelector<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );

        firstFocusable?.focus();
        announceToScreenReader(
          `Navigated to ${
            nextIndex === 0
              ? "principal"
              : nextIndex === 1
                ? "bindings"
                : "roles"
          } section`,
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const purpleColors = ACCESSIBLE_COLORS.purple;
  const infoColors = ACCESSIBLE_COLORS.info;
  const successColors = ACCESSIBLE_COLORS.success;
  const warningColors = ACCESSIBLE_COLORS.warning;
  const criticalColors = ACCESSIBLE_COLORS.critical;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div className="space-y-6">
      {/* Skip navigation */}
      <nav aria-label="Relationship sections" className="sr-only">
        <a href={`#${principalId}`} className="skip-link">
          Skip to Principal
        </a>
        <a href={`#${bindingsId}`} className="skip-link">
          Skip to Bindings
        </a>
        <a href={`#${rolesId}`} className="skip-link">
          Skip to Roles
        </a>
      </nav>

      <div
        className="flex items-center justify-between gap-4"
        role="region"
        aria-label="Principal relationship visualization"
      >
        {/* Principal Section */}
        <section
          ref={principalSectionRef}
          id={principalId}
          className="flex-1"
          aria-labelledby={`${principalId}-heading`}
        >
          <div
            className={combineClasses(
              "rounded-lg p-4 border-2",
              purpleColors.bg,
              purpleColors.border,
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind={principal.kind}
                  size={18}
                  className={purpleColors.icon}
                  aria-hidden="true"
                />
                <h3
                  id={`${principalId}-heading`}
                  className={combineClasses(
                    "font-semibold text-base",
                    purpleColors.text,
                  )}
                >
                  Principal
                </h3>
              </div>
              {principal.kind === "ServiceAccount" && (
                <CopyButtonGroup
                  name={principal.name}
                  kind={principal.kind}
                  {...(principal.namespace && {
                    namespace: principal.namespace,
                  })}
                  yaml={formatServiceAccountYAML({
                    kind: principal.kind,
                    name: principal.name,
                    ...(principal.namespace && {
                      namespace: principal.namespace,
                    }),
                  })}
                  onCopy={handleCopy}
                  copiedItem={copiedItem}
                  resourceLabel="principal"
                />
              )}
            </div>
            <div
              className={combineClasses(
                "rounded px-3 py-2 border",
                neutralColors.bg,
                purpleColors.border,
              )}
              role="article"
              aria-label={`Principal ${principal.kind} ${principal.name}${
                principal.namespace
                  ? ` in namespace ${principal.namespace}`
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind={principal.kind}
                  size={14}
                  className={combineClasses(purpleColors.icon, "flex-shrink-0")}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={combineClasses(
                      "font-medium",
                      neutralColors.text,
                    )}
                  >
                    {principal.name}
                  </div>
                  <div
                    className={combineClasses("text-xs", neutralColors.icon)}
                  >
                    {principal.kind}
                  </div>
                  {principal.namespace && (
                    <div
                      className={combineClasses(
                        "text-xs mt-0.5",
                        neutralColors.icon,
                      )}
                    >
                      Namespace: {principal.namespace}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ArrowRight
          className={neutralColors.icon}
          size={32}
          aria-hidden="true"
          role="presentation"
        />

        {/* Bindings Section */}
        <section
          ref={bindingsSectionRef}
          id={bindingsId}
          className="flex-1"
          aria-labelledby={`${bindingsId}-heading`}
        >
          <div
            className={combineClasses(
              "rounded-lg p-4 border-2",
              infoColors.bg,
              infoColors.border,
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind="RoleBinding"
                  size={18}
                  className={infoColors.icon}
                  aria-hidden="true"
                />
                <h3
                  id={`${bindingsId}-heading`}
                  className={combineClasses(
                    "font-semibold text-base",
                    infoColors.text,
                  )}
                >
                  Bindings
                  <span className="sr-only"> - {bindings.length} total</span>
                  <span aria-hidden="true"> ({bindings.length})</span>
                </h3>
              </div>
              {bindings.length > 0 && (
                <CopyButtonGroup
                  name={`${bindings.length} bindings`}
                  kind="Bindings"
                  yaml={bindings.map((b) => formatAsYAML(b)).join("\n---\n")}
                  onCopy={handleCopy}
                  copiedItem={copiedItem}
                  resourceLabel="bindings"
                />
              )}
            </div>
            <CollapsibleList
              items={bindings}
              emptyMessage="No bindings"
              renderItem={(binding: ClusterRBACResource, idx: number) => (
                <div
                  className={combineClasses(
                    "rounded px-3 py-2 text-sm border",
                    neutralColors.bg,
                    infoColors.border,
                  )}
                  role="listitem"
                  aria-label={`Binding ${idx + 1}: ${binding.kind} ${
                    binding.name
                  }${
                    binding.namespace
                      ? ` in namespace ${binding.namespace}`
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <K8sResourceIcon
                      kind={binding.kind}
                      size={14}
                      className={combineClasses(
                        infoColors.icon,
                        "flex-shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={combineClasses(
                          "font-medium",
                          neutralColors.text,
                        )}
                      >
                        {binding.name}
                      </div>
                      <div
                        className={combineClasses(
                          "text-xs",
                          neutralColors.icon,
                        )}
                      >
                        {binding.kind}
                        {binding.namespace && ` • ${binding.namespace}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        </section>

        <ArrowRight
          className={neutralColors.icon}
          size={32}
          aria-hidden="true"
          role="presentation"
        />

        {/* Roles Section */}
        <section
          ref={rolesSectionRef}
          id={rolesId}
          className="flex-1"
          aria-labelledby={`${rolesId}-heading`}
        >
          <div
            className={combineClasses(
              "rounded-lg p-4 border-2",
              successColors.bg,
              successColors.border,
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind="Role"
                  size={18}
                  className={successColors.icon}
                  aria-hidden="true"
                />
                <h3
                  id={`${rolesId}-heading`}
                  className={combineClasses(
                    "font-semibold text-base",
                    successColors.text,
                  )}
                >
                  Roles
                  <span className="sr-only"> - {roles.length} total</span>
                  <span aria-hidden="true"> ({roles.length})</span>
                </h3>
              </div>
              {roles.length > 0 && (
                <CopyButtonGroup
                  name={`${roles.length} roles`}
                  kind="Roles"
                  yaml={roles.map((r) => formatAsYAML(r)).join("\n---\n")}
                  onCopy={handleCopy}
                  copiedItem={copiedItem}
                  resourceLabel="roles"
                />
              )}
            </div>
            <CollapsibleList
              items={roles}
              emptyMessage="No roles"
              renderItem={(role: ClusterRBACResource, idx: number) => (
                <div
                  className={combineClasses(
                    "rounded px-3 py-2 text-sm border",
                    neutralColors.bg,
                    successColors.border,
                  )}
                  role="listitem"
                  aria-label={`Role ${idx + 1}: ${role.kind} ${
                    role.name
                  } with ${role.rules?.length || 0} rules${
                    role.namespace ? ` in namespace ${role.namespace}` : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <K8sResourceIcon
                      kind={role.kind}
                      size={14}
                      className={combineClasses(
                        successColors.icon,
                        "flex-shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={combineClasses(
                          "font-medium",
                          neutralColors.text,
                        )}
                      >
                        {role.name}
                      </div>
                      <div
                        className={combineClasses(
                          "text-xs",
                          neutralColors.icon,
                        )}
                      >
                        {role.kind}
                        {role.namespace && ` • ${role.namespace}`}
                      </div>
                      {role.rules && (
                        <div
                          className={combineClasses(
                            "text-xs mt-0.5",
                            neutralColors.icon,
                          )}
                        >
                          {role.rules.length} rule(s)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        </section>
      </div>

      {/* Effective Permissions Summary */}
      {roles.length > 0 && (
        <section
          id={summaryId}
          className={combineClasses(
            "p-4 rounded-lg border",
            warningColors.bg,
            warningColors.border,
          )}
          role="region"
          aria-labelledby={`${summaryId}-heading`}
        >
          <h3
            id={`${summaryId}-heading`}
            className={combineClasses(
              "font-semibold text-base mb-2",
              warningColors.text,
            )}
          >
            Effective Permissions Summary
          </h3>
          <div className={combineClasses("text-sm", warningColors.icon)}>
            This principal has access to {totalRules} total rule(s) across{" "}
            {roles.length} role(s).
          </div>

          <div className="mt-3 space-y-2">
            <CollapsibleList
              items={roles}
              initialShowCount={3}
              emptyMessage="No roles"
              renderItem={(role: ClusterRBACResource, idx: number) => (
                <div
                  className={combineClasses(
                    "rounded p-2 text-xs",
                    neutralColors.bg,
                  )}
                  role="listitem"
                  aria-label={`Permission summary ${idx + 1}: ${
                    role.name
                  } with resources ${
                    role.rules?.flatMap((r) => r.resources).join(", ") || "none"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <K8sResourceIcon
                      kind={role.kind}
                      size={12}
                      className={combineClasses(
                        warningColors.icon,
                        "flex-shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    <div
                      className={combineClasses(
                        "font-medium",
                        neutralColors.text,
                      )}
                    >
                      {role.name} ({role.kind})
                    </div>
                  </div>
                  {role.rules && role.rules.length > 0 && (
                    <div className={combineClasses("ml-5", neutralColors.icon)}>
                      Resources:{" "}
                      {role.rules.flatMap((r) => r.resources).join(", ")}
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </section>
      )}

      {/* No Effective Permissions Warning */}
      {roles.length === 0 && (
        <div
          className={combineClasses(
            "p-4 rounded-lg border",
            criticalColors.bg,
            criticalColors.border,
          )}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <AlertCircle
              className={criticalColors.icon}
              size={18}
              aria-hidden="true"
            />
            <h3
              className={combineClasses(
                "font-semibold text-base",
                criticalColors.text,
              )}
            >
              No Effective Permissions
            </h3>
          </div>
          <p className={combineClasses("text-sm mt-2", criticalColors.icon)}>
            This principal is bound to {bindings.length} binding(s), but none of
            the referenced roles could be found or have no permissions.
          </p>
        </div>
      )}

      <BrowserModeFooter
        resource={principal}
        {...(roles.length > 0 && { relatedRoles: roles })}
        {...(bindings.length > 0 && { relatedBindings: bindings })}
        {...(onSwitchToPolicyBuilder && { onSwitchToPolicyBuilder })}
      />

      {/* Keyboard shortcuts help */}
      <div
        className="sr-only"
        role="complementary"
        aria-label="Keyboard shortcuts"
      >
        <h4>Keyboard Navigation</h4>
        <ul>
          <li>Alt + Left Arrow: Navigate to previous section</li>
          <li>Alt + Right Arrow: Navigate to next section</li>
          <li>Tab: Move between interactive elements</li>
        </ul>
      </div>
    </div>
  );
};
