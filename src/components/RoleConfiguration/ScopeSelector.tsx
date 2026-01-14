// src/components/RoleConfiguration/ScopeSelector.tsx
import React, { useState, useEffect } from "react";
import { useRBAC } from "../../context/rbac";
import { Crosshair, AlertCircle } from "lucide-react"; // Keep only UI affordance icons
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";
import { K8sResourceIcon } from "@/icons"; // Add K8s icon import

export const ScopeSelector: React.FC = () => {
  const {
    manifest,
    updateNamespace,
    toggleClusterRole,
    validationErrors,
    resetCounter,
  } = useRBAC();
  const [namespaceTouched, setNamespaceTouched] = useState(false);

  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const criticalColors = ACCESSIBLE_COLORS.critical;

  const isClusterRole = manifest.role.isClusterRole;
  const showNamespaceError = namespaceTouched && !!validationErrors.namespace;

  useEffect(() => {
    setNamespaceTouched(false);
  }, [resetCounter]);

  const handleScopeChange = (isCluster: boolean) => {
    if (isCluster !== isClusterRole) {
      toggleClusterRole();
      setNamespaceTouched(false);
      announceToScreenReader(
        `Scope changed to ${
          isCluster ? "cluster-wide ClusterRole" : "namespace-scoped Role"
        }`
      );
    }
  };

  const handleNamespaceChange = (value: string) => {
    updateNamespace(value);
  };

  const handleNamespaceBlur = () => {
    setNamespaceTouched(true);
    if (validationErrors.namespace) {
      announceToScreenReader(`Namespace error: ${validationErrors.namespace}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4
          className={combineClasses(
            "text-base font-semibold flex items-center gap-2",
            neutralColors.text
          )}
        >
          {/* Crosshair is a UI affordance icon, keep as Lucide */}
          <Crosshair className={infoColors.icon} size={18} aria-hidden="true" />
          Scope
        </h4>
        <p className={combineClasses("text-sm mt-1", neutralColors.icon)}>
          Choose whether this role applies to a single namespace or the entire
          cluster
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">
          Select RBAC scope: namespace-scoped Role or cluster-wide ClusterRole
        </legend>
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          role="radiogroup"
        >
          {/* Namespace-scoped option */}
          <label
            className={combineClasses(
              "flex flex-col gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer transform-gpu",
              "focus-within:ring-2 focus-within:ring-offset-2",
              "hover:scale-[1.02] active:scale-[0.99]",
              !isClusterRole
                ? combineClasses(
                    infoColors.border,
                    infoColors.bg,
                    "shadow-md hover:shadow-lg"
                  )
                : combineClasses(
                    neutralColors.border,
                    neutralColors.hover,
                    "hover:shadow-md"
                  ),
              infoColors.ring
            )}
          >
            <input
              type="radio"
              name="scope"
              checked={!isClusterRole}
              onChange={() => handleScopeChange(false)}
              className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)]"
              aria-label="Namespace-scoped Role"
              aria-describedby="namespace-scope-description"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {/* Use K8s icon for Role resource */}
                <K8sResourceIcon
                  kind="role"
                  size={18}
                  className={combineClasses(
                    "transition-all flex-shrink-0",
                    infoColors.icon
                  )}
                />
                <span
                  className={combineClasses(
                    "font-medium",
                    !isClusterRole ? infoColors.text : neutralColors.text
                  )}
                >
                  Namespace-scoped (Role)
                </span>
                {!isClusterRole && (
                  <span
                    className={combineClasses(
                      "ml-auto px-2 py-0.5 rounded text-xs font-medium border",
                      infoColors.bg,
                      infoColors.text,
                      infoColors.border
                    )}
                    aria-label="Currently selected"
                  >
                    Selected
                  </span>
                )}
              </div>
              <p
                id="namespace-scope-description"
                className={combineClasses("text-sm", neutralColors.icon)}
              >
                Permissions limited to a specific namespace
              </p>
            </div>
          </label>

          {/* Cluster-wide option */}
          <label
            className={combineClasses(
              "flex flex-col gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer transform-gpu",
              "focus-within:ring-2 focus-within:ring-offset-2",
              "hover:scale-[1.02] active:scale-[0.99]",
              isClusterRole
                ? combineClasses(
                    infoColors.border,
                    infoColors.bg,
                    "shadow-md hover:shadow-lg"
                  )
                : combineClasses(
                    neutralColors.border,
                    neutralColors.hover,
                    "hover:shadow-md"
                  ),
              infoColors.ring
            )}
          >
            <input
              type="radio"
              name="scope"
              checked={isClusterRole}
              onChange={() => handleScopeChange(true)}
              className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)]"
              aria-label="Cluster-wide ClusterRole"
              aria-describedby="cluster-scope-description"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {/* Use K8s icon for ClusterRole resource */}
                <K8sResourceIcon
                  kind="clusterrole"
                  size={18}
                  className={combineClasses(
                    "transition-all flex-shrink-0",
                    infoColors.icon
                  )}
                />
                <span
                  className={combineClasses(
                    "font-medium",
                    isClusterRole ? infoColors.text : neutralColors.text
                  )}
                >
                  Cluster-wide (ClusterRole)
                </span>
                {isClusterRole && (
                  <span
                    className={combineClasses(
                      "ml-auto px-2 py-0.5 rounded text-xs font-medium border",
                      infoColors.bg,
                      infoColors.text,
                      infoColors.border
                    )}
                    aria-label="Currently selected"
                  >
                    Selected
                  </span>
                )}
              </div>
              <p
                id="cluster-scope-description"
                className={combineClasses("text-sm", neutralColors.icon)}
              >
                Permissions apply across all namespaces
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Namespace input (shown only for namespace-scoped) */}
      {!isClusterRole && (
        <div className="mt-3">
          <label
            htmlFor="namespace-input"
            className={combineClasses(
              "block text-sm font-medium mb-1",
              neutralColors.text
            )}
          >
            Namespace
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <input
            id="namespace-input"
            type="text"
            value={manifest.role.namespace}
            onChange={(e) => handleNamespaceChange(e.target.value)}
            onBlur={handleNamespaceBlur}
            placeholder="default"
            className={combineClasses(
              "w-full px-3 py-2 border-2 rounded-lg text-sm transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "hover:shadow-md focus:shadow-lg",
              neutralColors.bg,
              neutralColors.text,
              showNamespaceError
                ? combineClasses(criticalColors.border, criticalColors.ring)
                : combineClasses(neutralColors.border, infoColors.ring),
              "placeholder:text-gray-400 dark:placeholder:text-gray-500"
            )}
            aria-invalid={showNamespaceError}
            aria-describedby={
              showNamespaceError ? "namespace-error" : "namespace-hint"
            }
            required
          />
          <p
            id="namespace-hint"
            className={combineClasses("mt-1 text-xs", neutralColors.icon)}
          >
            Enter the Kubernetes namespace for this Role
          </p>
          {showNamespaceError && (
            <div
              id="namespace-error"
              className={combineClasses(
                "mt-2 p-2 rounded flex items-start gap-2 text-sm",
                criticalColors.bg,
                criticalColors.border,
                "border"
              )}
              role="alert"
              aria-live="polite"
            >
              {/* AlertCircle is a UI affordance icon, keep as Lucide */}
              <AlertCircle
                size={16}
                className={combineClasses(
                  criticalColors.icon,
                  "flex-shrink-0 mt-0.5"
                )}
                aria-hidden="true"
              />
              <span className={criticalColors.text}>
                {validationErrors.namespace}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Screen reader announcement */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Current scope:{" "}
        {isClusterRole ? "Cluster-wide ClusterRole" : "Namespace-scoped Role"}
        {!isClusterRole &&
          manifest.role.namespace &&
          ` in namespace ${manifest.role.namespace}`}
      </div>
    </div>
  );
};
