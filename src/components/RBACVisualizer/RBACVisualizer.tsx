// src/components/RBACVisualizer/RBACVisualizer.tsx
import React, { useMemo, useEffect } from "react";
import { Loader } from "lucide-react";
import { K8sResourceIcon } from "@/icons";
import { GeneratorView } from "./GeneratorView";
import { RoleRelationshipView } from "./RelationshipViews/RoleRelationshipView";
import { BindingRelationshipView } from "./RelationshipViews/BindingRelationshipView";
import { PrincipalRelationshipView } from "./RelationshipViews/PrincipalRelationshipView";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import type { RBACVisualizerProps } from "./types";

export const RBACVisualizer: React.FC<RBACVisualizerProps> = ({
  manifest,
  selectedResource,
  relatedResources,
  isLoadingRelationships = false,
  mode = "browser",
  onSwitchToPolicyBuilder, // NEW
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;

  const visualizerKey = useMemo(() => {
    if (mode === "generator" && manifest) {
      return `generator-${manifest.role.name}`;
    }
    if (mode === "browser" && selectedResource) {
      return `browser-${selectedResource.kind}-${
        selectedResource.namespace || "cluster"
      }-${selectedResource.name}`;
    }
    return "empty";
  }, [mode, manifest, selectedResource]);

  useEffect(() => {
    if (mode === "browser") {
      console.log("RBACVisualizer (Browser) updated:", {
        selectedResource: selectedResource?.name,
        kind: selectedResource?.kind,
        isLoadingRelationships,
        relatedResources: {
          role: relatedResources?.role?.name,
          binding: relatedResources?.binding?.name,
          relatedBindings: relatedResources?.relatedBindings?.length,
          relatedRoles: relatedResources?.relatedRoles?.length,
        },
      });
    }
  }, [mode, selectedResource, relatedResources, isLoadingRelationships]);

  if (mode === "generator" && !manifest) {
    return (
      <div
        className={combineClasses(
          "rounded-lg border-2 border-dashed p-12",
          neutralColors.bg,
          neutralColors.border
        )}
        role="status"
        aria-label="No RBAC configuration"
      >
        <div className="text-center">
          <div
            className={combineClasses(
              "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
              neutralColors.bg,
              neutralColors.border,
              "border-2"
            )}
            aria-hidden="true"
          >
            <K8sResourceIcon
              kind="Role"
              size={32}
              className={neutralColors.icon}
            />
          </div>
          <h3
            className={combineClasses(
              "text-lg font-semibold mb-2",
              neutralColors.text
            )}
          >
            No Configuration Yet
          </h3>
          <p className={neutralColors.icon}>
            Configure permissions above to see the RBAC relationship diagram
          </p>
        </div>
      </div>
    );
  }

  if (mode === "browser" && !selectedResource) {
    return (
      <div
        className={combineClasses(
          "rounded-lg border-2 border-dashed p-12",
          neutralColors.bg,
          neutralColors.border
        )}
        role="status"
        aria-label="No resource selected"
      >
        <div className="text-center">
          <div
            className={combineClasses(
              "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
              neutralColors.bg,
              neutralColors.border,
              "border-2"
            )}
            aria-hidden="true"
          >
            <K8sResourceIcon
              kind="Role"
              size={32}
              className={neutralColors.icon}
            />
          </div>
          <h3
            className={combineClasses(
              "text-lg font-semibold mb-2",
              neutralColors.text
            )}
          >
            No Resource Selected
          </h3>
          <p className={neutralColors.icon}>
            Select a role, binding, or principal from the browser above to
            visualize its relationships
          </p>
        </div>
      </div>
    );
  }

  if (mode === "generator" && manifest) {
    return (
      <article
        key={visualizerKey}
        className={combineClasses(
          "rounded-lg border-2 p-6",
          neutralColors.bg,
          neutralColors.border
        )}
        role="region"
        aria-labelledby="generator-diagram-title"
      >
        <h2
          id="generator-diagram-title"
          className={combineClasses(
            "text-lg font-semibold mb-4 flex items-center gap-2",
            neutralColors.text
          )}
        >
          <K8sResourceIcon
            kind={manifest.role.namespace ? "Role" : "ClusterRole"}
            size={20}
            className={infoColors.icon}
            aria-hidden="true"
          />
          RBAC Relationship Diagram
        </h2>
        <GeneratorView manifest={manifest} />
      </article>
    );
  }

  if (mode === "browser" && selectedResource) {
    const isRole =
      selectedResource.kind === "Role" ||
      selectedResource.kind === "ClusterRole";
    const isBinding =
      selectedResource.kind === "RoleBinding" ||
      selectedResource.kind === "ClusterRoleBinding";
    const isPrincipal =
      selectedResource.kind === "User" ||
      selectedResource.kind === "Group" ||
      selectedResource.kind === "ServiceAccount";

    return (
      <article
        key={visualizerKey}
        className={combineClasses(
          "rounded-lg border-2 p-6 relative",
          neutralColors.bg,
          neutralColors.border
        )}
        role="region"
        aria-labelledby="browser-diagram-title"
        aria-busy={isLoadingRelationships}
      >
        {isLoadingRelationships && (
          <div
            className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-label="Loading relationships"
          >
            <div className="text-center">
              <Loader
                className={combineClasses(
                  "animate-spin mb-3 mx-auto",
                  infoColors.icon
                )}
                size={32}
                aria-hidden="true"
              />
              <p
                className={combineClasses(
                  "text-sm font-medium",
                  neutralColors.text
                )}
              >
                Loading relationships...
              </p>
              <p className={combineClasses("text-xs mt-1", neutralColors.icon)}>
                Fetching related resources
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4 gap-4">
          <h2
            id="browser-diagram-title"
            className={combineClasses(
              "text-lg font-semibold flex items-center gap-2",
              neutralColors.text
            )}
          >
            <K8sResourceIcon
              kind={selectedResource.kind}
              size={20}
              className={infoColors.icon}
              aria-hidden="true"
            />
            RBAC Relationship Diagram
          </h2>
          <div className="flex items-center gap-2">
            <span className={combineClasses("text-sm", neutralColors.icon)}>
              Selected:{" "}
              <span
                className={combineClasses("font-medium", neutralColors.text)}
              >
                {selectedResource.name}
              </span>
            </span>
            {isLoadingRelationships && (
              <Loader
                className={combineClasses("animate-spin", infoColors.icon)}
                size={16}
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        <div
          className={
            isLoadingRelationships ? "opacity-40 pointer-events-none" : ""
          }
          aria-hidden={isLoadingRelationships}
        >
          {isRole && (
            <RoleRelationshipView
              key={`role-${visualizerKey}`}
              role={selectedResource}
              bindings={relatedResources?.relatedBindings || []}
              {...(onSwitchToPolicyBuilder && { onSwitchToPolicyBuilder })}
            />
          )}

          {isBinding && (
            <BindingRelationshipView
              key={`binding-${visualizerKey}`}
              binding={selectedResource}
              {...(relatedResources?.role && { role: relatedResources.role })}
              relatedBindings={relatedResources?.relatedBindings || []}
              {...(onSwitchToPolicyBuilder && { onSwitchToPolicyBuilder })}
            />
          )}

          {isPrincipal && (
            <PrincipalRelationshipView
              key={`principal-${visualizerKey}`}
              principal={selectedResource}
              bindings={relatedResources?.relatedBindings || []}
              roles={relatedResources?.relatedRoles || []}
              {...(onSwitchToPolicyBuilder && { onSwitchToPolicyBuilder })}
            />
          )}
        </div>

        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isLoadingRelationships
            ? "Loading relationship data for selected resource"
            : `Showing ${selectedResource.kind} ${selectedResource.name} relationships`}
        </div>
      </article>
    );
  }

  return null;
};
