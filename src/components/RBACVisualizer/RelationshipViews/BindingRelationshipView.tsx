// src/components/RBACVisualizer/RelationshipViews/BindingRelationshipView.tsx
import React, { useState, useRef, useEffect, useId } from "react";
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
import type { BindingRelationshipViewProps, Subject } from "../types";

export const BindingRelationshipView: React.FC<
  BindingRelationshipViewProps
> = ({ binding, role, relatedBindings, onSwitchToPolicyBuilder }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Generate stable IDs for ARIA relationships
  const principalsId = useId();
  const bindingId = useId();
  const roleId = useId();
  const relatedBindingsId = useId();

  // Refs for keyboard navigation
  const principalsSectionRef = useRef<HTMLDivElement>(null);
  const bindingSectionRef = useRef<HTMLDivElement>(null);
  const roleSectionRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text, label);
    setCopiedItem(label);

    // Announce to screen readers
    announceToScreenReader(`${label} copied to clipboard`);

    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Keyboard navigation between sections
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Left/Right arrow to navigate between sections
      if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();

        const sections = [
          principalsSectionRef.current,
          bindingSectionRef.current,
          roleSectionRef.current,
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
              ? "principals"
              : nextIndex === 1
                ? "binding"
                : "role"
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
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <div className="space-y-6">
      {/* Skip navigation for keyboard users */}
      <nav aria-label="Relationship sections" className="sr-only">
        <a href={`#${principalsId}`} className="skip-link">
          Skip to Principals
        </a>
        <a href={`#${bindingId}`} className="skip-link">
          Skip to Binding
        </a>
        <a href={`#${roleId}`} className="skip-link">
          Skip to Role
        </a>
      </nav>

      {/* Main relationship flow */}
      <div
        className="flex items-center justify-between gap-4"
        role="region"
        aria-label="Binding relationship visualization"
      >
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
              purpleColors.border,
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
                    purpleColors.text,
                  )}
                >
                  Principals
                  <span className="sr-only">
                    {" "}
                    - {binding.subjects?.length || 0} total
                  </span>
                  <span aria-hidden="true">
                    {" "}
                    ({binding.subjects?.length || 0})
                  </span>
                </h3>
              </div>
              {binding.subjects &&
                binding.subjects.filter((s) => s.kind === "ServiceAccount")
                  .length > 0 && (
                  <CopyButtonGroup
                    name={`${
                      binding.subjects.filter(
                        (s) => s.kind === "ServiceAccount",
                      ).length
                    } ServiceAccounts`}
                    kind="ServiceAccounts"
                    yaml={binding.subjects
                      .filter((s) => s.kind === "ServiceAccount")
                      .map((sa) => formatServiceAccountYAML(sa))
                      .join("\n---\n")}
                    onCopy={handleCopy}
                    copiedItem={copiedItem}
                    resourceLabel="subjects"
                  />
                )}
            </div>
            <CollapsibleList
              items={binding.subjects || []}
              emptyMessage="No principals"
              renderItem={(subject: Subject, idx: number) => (
                <div
                  className={combineClasses(
                    "rounded px-3 py-2 text-sm border",
                    neutralColors.bg,
                    purpleColors.border,
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
                        {subject.name}
                      </div>
                      <div
                        className={combineClasses(
                          "text-xs",
                          neutralColors.icon,
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

        <ArrowRight
          className={neutralColors.icon}
          size={32}
          aria-hidden="true"
          role="presentation"
        />

        {/* Binding Section */}
        <section
          ref={bindingSectionRef}
          id={bindingId}
          className="flex-1"
          aria-labelledby={`${bindingId}-heading`}
          aria-describedby={`${bindingId}-description`}
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
                  kind={binding.kind}
                  size={18}
                  className={infoColors.icon}
                  aria-hidden="true"
                />
                <h3
                  id={`${bindingId}-heading`}
                  className={combineClasses(
                    "font-semibold text-base",
                    infoColors.text,
                  )}
                >
                  {binding.kind}
                </h3>
              </div>
              <CopyButtonGroup
                name={binding.name}
                kind={binding.kind}
                {...(binding.namespace && { namespace: binding.namespace })}
                yaml={formatAsYAML(binding)}
                onCopy={handleCopy}
                copiedItem={copiedItem}
                resourceLabel="binding"
              />
            </div>
            <div
              className={combineClasses(
                "rounded px-3 py-2 border",
                neutralColors.bg,
                infoColors.border,
              )}
            >
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind={binding.kind}
                  size={14}
                  className={combineClasses(infoColors.icon, "flex-shrink-0")}
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
                  {binding.namespace && (
                    <div
                      className={combineClasses("text-xs", neutralColors.icon)}
                    >
                      Namespace: {binding.namespace}
                    </div>
                  )}
                  <div
                    id={`${bindingId}-description`}
                    className={combineClasses(
                      "mt-1 text-xs",
                      neutralColors.icon,
                    )}
                  >
                    References: {binding.roleRef?.name}
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
              successColors.border,
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <K8sResourceIcon
                  kind={binding.roleRef?.kind || "Role"}
                  size={18}
                  className={successColors.icon}
                  aria-hidden="true"
                />
                <h3
                  id={`${roleId}-heading`}
                  className={combineClasses(
                    "font-semibold text-base",
                    successColors.text,
                  )}
                >
                  {binding.roleRef?.kind || "Role"}
                </h3>
              </div>
              {role && (
                <CopyButtonGroup
                  name={role.name}
                  kind={role.kind}
                  {...(role.namespace && { namespace: role.namespace })}
                  yaml={formatAsYAML(role)}
                  onCopy={handleCopy}
                  copiedItem={copiedItem}
                  resourceLabel="role"
                />
              )}
            </div>
            {role ? (
              <div
                className={combineClasses(
                  "rounded px-3 py-2 border",
                  neutralColors.bg,
                  successColors.border,
                )}
                role="article"
                aria-label={`Role ${role.name} with ${
                  role.rules?.length || 0
                } rules`}
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
                    {role.namespace && (
                      <div
                        className={combineClasses(
                          "text-xs",
                          neutralColors.icon,
                        )}
                      >
                        Namespace: {role.namespace}
                      </div>
                    )}
                    <div
                      className={combineClasses(
                        "mt-1 text-xs",
                        neutralColors.icon,
                      )}
                    >
                      {role.rules?.length || 0} rule(s)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={combineClasses(
                  "rounded px-3 py-2 border",
                  neutralColors.bg,
                  successColors.border,
                )}
                role="alert"
                aria-live="polite"
              >
                <div
                  className={combineClasses("font-medium", neutralColors.text)}
                >
                  {binding.roleRef?.name}
                </div>
                <div
                  className={combineClasses(
                    "text-xs mt-1 flex items-center gap-1",
                    warningColors.icon,
                  )}
                >
                  <AlertCircle size={12} aria-hidden="true" />
                  <span>Role not found</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Related Bindings Section */}
      {relatedBindings.length > 0 && (
        <section
          id={relatedBindingsId}
          className={combineClasses(
            "p-4 rounded-lg border",
            infoColors.bg,
            infoColors.border,
          )}
          aria-labelledby={`${relatedBindingsId}-heading`}
          role="region"
        >
          <h3
            id={`${relatedBindingsId}-heading`}
            className={combineClasses(
              "font-semibold text-base mb-3 flex items-center gap-2",
              infoColors.text,
            )}
          >
            <K8sResourceIcon
              kind="RoleBinding"
              size={16}
              className={infoColors.icon}
              aria-hidden="true"
            />
            Other Bindings to Same Role
            <span className="sr-only"> - {relatedBindings.length} total</span>
            <span aria-hidden="true">({relatedBindings.length})</span>
          </h3>
          <div className="grid grid-cols-2 gap-2" role="list">
            {relatedBindings.map((rb, idx) => (
              <div
                key={`related-${rb.name}-${idx}`}
                className={combineClasses(
                  "rounded px-3 py-2 text-sm border",
                  neutralColors.bg,
                  infoColors.border,
                )}
                role="listitem"
                aria-label={`Related binding ${idx + 1}: ${rb.name} with ${
                  rb.subjects?.length || 0
                } subjects`}
              >
                <div className="flex items-center gap-2">
                  <K8sResourceIcon
                    kind={rb.kind}
                    size={12}
                    className={combineClasses(infoColors.icon, "flex-shrink-0")}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={combineClasses(
                        "font-medium",
                        neutralColors.text,
                      )}
                    >
                      {rb.name}
                    </div>
                    <div
                      className={combineClasses("text-xs", neutralColors.icon)}
                    >
                      {rb.subjects?.length || 0} subject(s)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <BrowserModeFooter
        resource={binding}
        {...(role && { relatedRole: role })}
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
          <li>Escape: Close expanded sections</li>
        </ul>
      </div>
    </div>
  );
};
