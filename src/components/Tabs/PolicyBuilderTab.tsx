// src/components/Tabs/PolicyBuilderTab.tsx
import React, { useState, useMemo } from "react";
import { RoleConfiguration } from "../RoleConfiguration";
import { RolePresetsCompact } from "../RolePresets/RolePresetsCompact";
import { ResourceSelector } from "../ResourceSelector/ResourceSelector";
import { RBACVisualizer } from "../RBACVisualizer/RBACVisualizer";
import { PolicyBuilderSecurityAnalysis } from "../PolicyBuilder/components/PolicyBuilderSecurityAnalysis";

import { YamlPreview } from "../YamlPreview/YamlPreview";
import { useRBAC } from "../../context/rbac";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { Lightbulb, RotateCcw, AlertTriangle } from "lucide-react";
import { announceToScreenReader } from "../../utils/accessibility";

export const PolicyBuilderTab: React.FC = () => {
  const { manifest, resetManifest } = useRBAC();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const warningColors = ACCESSIBLE_COLORS.warning;
  const criticalColors = ACCESSIBLE_COLORS.critical;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  // Check if ANY changes have been made from defaults
  const hasChanges = useMemo(() => {
    const defaultRoleName = "my-role";
    const defaultBindingName = "my-role-binding";
    const defaultNamespace = "default";
    const defaultIsClusterRole = false;

    return (
      manifest.role.name !== defaultRoleName ||
      manifest.binding.name !== defaultBindingName ||
      manifest.role.namespace !== defaultNamespace ||
      manifest.role.isClusterRole !== defaultIsClusterRole ||
      manifest.role.permissions.length > 0 ||
      manifest.binding.subjects.length > 0
    );
  }, [manifest]);

  const handleReset = () => {
    resetManifest();
    setShowResetConfirm(false);
    announceToScreenReader(
      "All configuration has been reset. Role and binding cleared.",
    );
  };

  return (
    <div className="space-y-6">
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        RBAC Generator tab loaded. Configure your Kubernetes role and role
        binding.
      </div>

      {/* Main Configuration Section */}
      <RoleConfiguration />

      {/* Quick Start Templates - Compact & Collapsible */}
      <RolePresetsCompact />

      {/* Resource Permissions */}
      <ResourceSelector />

      {/* Security Analysis */}
      <PolicyBuilderSecurityAnalysis />

      {/* Visualization Section */}
      <section aria-labelledby="visualizer-heading">
        <h2 id="visualizer-heading" className="sr-only">
          RBAC Relationship Visualizer
        </h2>
        <RBACVisualizer mode="generator" manifest={manifest} />
      </section>

      {/* YAML Preview Section */}
      <section aria-labelledby="yaml-preview-heading">
        <h2 id="yaml-preview-heading" className="sr-only">
          YAML Output Preview
        </h2>
        <YamlPreview />
      </section>

      {/* Best Practices Section */}
      <aside
        className={combineClasses(
          "border rounded-lg p-6",
          warningColors.bg,
          warningColors.border,
        )}
        aria-labelledby="best-practices-heading"
      >
        <h3
          id="best-practices-heading"
          className={combineClasses(
            "text-lg font-semibold mb-3 flex items-center gap-2",
            warningColors.text,
          )}
        >
          <Lightbulb size={20} aria-hidden="true" />
          RBAC Best Practices
        </h3>
        <div
          className={combineClasses(
            "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm",
            warningColors.text,
          )}
        >
          <section aria-labelledby="security-practices-heading">
            <h4 id="security-practices-heading" className="font-semibold mb-2">
              Security
            </h4>
            <ul className="space-y-1" aria-label="Security best practices">
              <li>• Use least privilege principle</li>
              <li>• Avoid cluster-admin for regular users</li>
              <li>• Be specific with resource permissions</li>
              <li>• Regularly audit role bindings</li>
            </ul>
          </section>
          <section aria-labelledby="organization-practices-heading">
            <h4
              id="organization-practices-heading"
              className="font-semibold mb-2"
            >
              Organization
            </h4>
            <ul className="space-y-1" aria-label="Organization best practices">
              <li>• Use namespaces for isolation</li>
              <li>• Create role templates for teams</li>
              <li>• Document custom roles clearly</li>
              <li>• Use groups instead of individual users</li>
            </ul>
          </section>
        </div>
      </aside>

      {/* Floating Reset Button - Sticky in bottom-right */}
      {hasChanges && (
        <div
          className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
          role="region"
          aria-label="Reset configuration action"
        >
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className={combineClasses(
              "flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all transform-gpu",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "hover:scale-110 active:scale-95 hover:shadow-xl",
              "font-medium text-sm",
              criticalColors.bg,
              "text-white",
              criticalColors.hover,
              criticalColors.ring,
            )}
            aria-label={`Reset all configuration. Currently ${
              manifest.role.permissions.length
            } resource${
              manifest.role.permissions.length === 1 ? "" : "s"
            } and ${manifest.binding.subjects.length} subject${
              manifest.binding.subjects.length === 1 ? "" : "s"
            } configured.`}
            title="Reset all configuration"
          >
            <RotateCcw size={20} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
          aria-describedby="reset-dialog-description"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowResetConfirm(false);
            }
          }}
        >
          <div
            className={combineClasses(
              "rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200",
              neutralColors.bg,
            )}
            role="document"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={combineClasses(
                  "p-2 rounded-full",
                  criticalColors.bg,
                )}
                aria-hidden="true"
              >
                <AlertTriangle className={criticalColors.icon} size={24} />
              </div>
              <h3
                id="reset-dialog-title"
                className={combineClasses(
                  "text-lg font-semibold",
                  neutralColors.text,
                )}
              >
                Reset Configuration?
              </h3>
            </div>

            <p
              id="reset-dialog-description"
              className={combineClasses("mb-6", neutralColors.text)}
            >
              This will clear all your current configuration and return to
              defaults:
            </p>

            <ul
              className={combineClasses(
                "space-y-2 mb-6 text-sm",
                neutralColors.text,
              )}
              aria-label="Items that will be cleared"
            >
              {manifest.role.name !== "my-role" && (
                <li className="flex items-center gap-2">
                  <span
                    className={combineClasses(
                      "w-1.5 h-1.5 rounded-full",
                      "bg-red-500 dark:bg-red-400",
                    )}
                    aria-hidden="true"
                  ></span>
                  Role name: "{manifest.role.name}" → "my-role"
                </li>
              )}
              {manifest.binding.name !== "my-role-binding" && (
                <li className="flex items-center gap-2">
                  <span
                    className={combineClasses(
                      "w-1.5 h-1.5 rounded-full",
                      "bg-red-500 dark:bg-red-400",
                    )}
                    aria-hidden="true"
                  ></span>
                  Binding name: "{manifest.binding.name}" → "my-role-binding"
                </li>
              )}
              {manifest.role.isClusterRole && (
                <li className="flex items-center gap-2">
                  <span
                    className={combineClasses(
                      "w-1.5 h-1.5 rounded-full",
                      "bg-red-500 dark:bg-red-400",
                    )}
                    aria-hidden="true"
                  ></span>
                  Scope: ClusterRole → Namespace-scoped Role
                </li>
              )}
              {manifest.role.namespace !== "default" &&
                !manifest.role.isClusterRole && (
                  <li className="flex items-center gap-2">
                    <span
                      className={combineClasses(
                        "w-1.5 h-1.5 rounded-full",
                        "bg-red-500 dark:bg-red-400",
                      )}
                      aria-hidden="true"
                    ></span>
                    Namespace: "{manifest.role.namespace}" → "default"
                  </li>
                )}
              {manifest.role.permissions.length > 0 && (
                <li className="flex items-center gap-2">
                  <span
                    className={combineClasses(
                      "w-1.5 h-1.5 rounded-full",
                      "bg-red-500 dark:bg-red-400",
                    )}
                    aria-hidden="true"
                  ></span>
                  All resource permissions ({manifest.role.permissions.length}{" "}
                  resource{manifest.role.permissions.length === 1 ? "" : "s"})
                </li>
              )}
              {manifest.binding.subjects.length > 0 && (
                <li className="flex items-center gap-2">
                  <span
                    className={combineClasses(
                      "w-1.5 h-1.5 rounded-full",
                      "bg-red-500 dark:bg-red-400",
                    )}
                    aria-hidden="true"
                  ></span>
                  All subjects ({manifest.binding.subjects.length} subject
                  {manifest.binding.subjects.length === 1 ? "" : "s"})
                </li>
              )}
            </ul>

            <div
              className="flex gap-3"
              role="group"
              aria-label="Reset confirmation actions"
            >
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  announceToScreenReader("Reset cancelled");
                }}
                className={combineClasses(
                  "flex-1 px-4 py-2 border rounded-lg transition-all font-medium transform-gpu",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  "hover:scale-105 active:scale-95",
                  neutralColors.text,
                  neutralColors.border,
                  neutralColors.hover,
                  neutralColors.ring,
                )}
                aria-label="Cancel reset"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={combineClasses(
                  "flex-1 px-4 py-2 rounded-lg transition-all font-medium transform-gpu",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  "hover:scale-105 active:scale-95",
                  "bg-red-600 dark:bg-red-700 text-white",
                  "hover:bg-red-700 dark:hover:bg-red-600",
                  criticalColors.ring,
                )}
                aria-label="Confirm reset and clear all configuration"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
