// src/components/RBACVisualizer/RelationshipViews/RoleRelationshipView.tsx
import React, { useState, useMemo, useRef, useEffect, useId } from "react";
import { ArrowRight } from "lucide-react";
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
import type { RoleRelationshipViewProps, Subject } from "../types";
import type { ClusterRBACResource } from "../../../services/api";

export const RoleRelationshipView: React.FC<RoleRelationshipViewProps> = ({
  role,
  bindings,
  onSwitchToPolicyBuilder,
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Generate stable IDs for ARIA relationships
  const roleId = useId();
  const bindingsId = useId();
  const principalsId = useId();

  // Refs for keyboard navigation
  const roleSectionRef = useRef<HTMLDivElement>(null);
  const bindingsSectionRef = useRef<HTMLDivElement>(null);
  const principalsSectionRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text, label);
    setCopiedItem(label);
    announceToScreenReader(`${label} copied to clipboard`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const { uniqueSubjects } = useMemo(() => {
    const all = bindings.flatMap((b) => b.subjects || []);
    const unique = all.filter(
      (subject, index, self) =>
        index ===
        self.findIndex(
          (s) => s.kind === subject.kind && s.name === subject.name
        )
    );
    return { allSubjects: all, uniqueSubjects: unique };
  }, [bindings]);

  // Keyboard navigation between sections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();

        const sections = [
          roleSectionRef.current,
          bindingsSectionRef.current,
          principalsSectionRef.current,
        ].filter(Boolean) as HTMLDivElement[];

        const currentIndex = sections.findIndex((section) =>
          section.contains(document.activeElement)
        );

        if (currentIndex === -1) return;

        const nextIndex =
          e.key === "ArrowRight"
            ? (currentIndex + 1) % sections.length
            : (currentIndex - 1 + sections.length) % sections.length;

        const firstFocusable = sections[nextIndex]?.querySelector<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );

        firstFocusable?.focus();
        announceToScreenReader(
          `Navigated to ${
            nextIndex === 0
              ? "role"
              : nextIndex === 1
              ? "bindings"
              : "principals"
          } section`
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const successColors = ACCESSIBLE_COLORS.success;
  const infoColors = ACCESSIBLE_COLORS.info;
  const purpleColors = ACCESSIBLE_COLORS.purple;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div className="space-y-6">
      {/* Skip navigation */}
      <nav aria-label="Relationship sections" className="sr-only">
        <a href={`#${roleId}`} className="skip-link">
          Skip to Role
        </a>
        <a href={`#${bindingsId}`} className="skip-link">
          Skip to Bindings
        </a>
        <a href={`#${principalsId}`} className="skip-link">
          Skip to Principals
        </a>
      </nav>

      <div
        className="flex items-center justify-between gap-4"
        role="region"
        aria-label="Role relationship visualization"
      >
        {/* Role Section */}
        <section
          ref={roleSectionRef}
          id={roleId}
          className="flex-1"
          aria-labelledby={`${roleId}-heading`}
        >
          <div
            className={combineClasses(
              "rounded-lg p-4 border-2",
              successColors.bg,
              successColors.border
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind={role.kind}
                  size={18}
                  className={successColors.icon}
                  aria-hidden="true"
                />
                <h3
                  id={`${roleId}-heading`}
                  className={combineClasses(
                    "font-semibold text-base",
                    successColors.text
                  )}
                >
                  {role.kind}
                </h3>
              </div>
              <CopyButtonGroup
                name={role.name}
                kind={role.kind}
                {...(role.namespace && { namespace: role.namespace })}
                yaml={formatAsYAML(role)}
                onCopy={handleCopy}
                copiedItem={copiedItem}
                resourceLabel="role"
              />
            </div>
            <div
              className={combineClasses(
                "rounded px-3 py-2 border",
                neutralColors.bg,
                successColors.border
              )}
              role="article"
              aria-label={`Role ${role.name} with ${
                role.rules?.length || 0
              } rules${
                role.namespace ? ` in namespace ${role.namespace}` : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind={role.kind}
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
                    {role.name}
                  </div>
                  {role.namespace && (
                    <div
                      className={combineClasses("text-xs", neutralColors.icon)}
                    >
                      Namespace: {role.namespace}
                    </div>
                  )}
                  <div
                    className={combineClasses(
                      "mt-1 text-xs",
                      neutralColors.icon
                    )}
                  >
                    {role.rules?.length || 0} rule(s)
                  </div>
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
              infoColors.border
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
                    infoColors.text
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
              emptyMessage="No bindings found"
              renderItem={(binding: ClusterRBACResource, idx: number) => (
                <div
                  className={combineClasses(
                    "rounded px-3 py-2 text-sm border",
                    neutralColors.bg,
                    infoColors.border
                  )}
                  role="listitem"
                  aria-label={`Binding ${idx + 1}: ${binding.kind} ${
                    binding.name
                  } with ${binding.subjects?.length || 0} subjects${
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
                        {binding.name}
                      </div>
                      <div
                        className={combineClasses(
                          "text-xs",
                          neutralColors.icon
                        )}
                      >
                        {binding.kind}
                        {binding.namespace && ` • ${binding.namespace}`}
                      </div>
                      <div
                        className={combineClasses(
                          "text-xs mt-0.5",
                          neutralColors.icon
                        )}
                      >
                        {binding.subjects?.length || 0} subject(s)
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

        {/* Principals Section */}
        <section
          ref={principalsSectionRef}
          id={principalsId}
          className="flex-1"
          aria-labelledby={`${principalsId}-heading`}
        >
          <div
            className={combineClasses(
              "rounded-lg p-4 border-2",
              purpleColors.bg,
              purpleColors.border
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind="User"
                  size={18}
                  className={purpleColors.icon}
                  aria-hidden="true"
                />
                <h3
                  id={`${principalsId}-heading`}
                  className={combineClasses(
                    "font-semibold text-base",
                    purpleColors.text
                  )}
                >
                  Principals
                  <span className="sr-only">
                    {" "}
                    - {uniqueSubjects.length} total
                  </span>
                  <span aria-hidden="true"> ({uniqueSubjects.length})</span>
                </h3>
              </div>
              {uniqueSubjects.filter((s) => s.kind === "ServiceAccount")
                .length > 0 && (
                <CopyButtonGroup
                  name={`${
                    uniqueSubjects.filter((s) => s.kind === "ServiceAccount")
                      .length
                  } ServiceAccounts`}
                  kind="ServiceAccounts"
                  yaml={uniqueSubjects
                    .filter((s) => s.kind === "ServiceAccount")
                    .map((sa) => formatServiceAccountYAML(sa))
                    .join("\n---\n")}
                  onCopy={handleCopy}
                  copiedItem={copiedItem}
                  resourceLabel="principals"
                />
              )}
            </div>
            <CollapsibleList
              items={uniqueSubjects}
              emptyMessage="No principals found"
              renderItem={(subject: Subject, idx: number) => (
                <div
                  className={combineClasses(
                    "rounded px-3 py-2 text-sm border",
                    neutralColors.bg,
                    purpleColors.border
                  )}
                  role="listitem"
                  aria-label={`Principal ${idx + 1}: ${subject.kind} ${
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
                        purpleColors.icon,
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
                        {subject.namespace && ` • ${subject.namespace}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        </section>
      </div>

      <BrowserModeFooter
        resource={role}
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
