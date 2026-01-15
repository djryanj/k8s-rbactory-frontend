// src/components/ResourceSelector/ResourceSelector.tsx
import React, { useState } from "react";
import { type ResourceType } from "../../types/rbac.types";
import { RESOURCE_METADATA } from "../../utils/resourceMetadata";
import { useRBAC } from "../../context/rbac";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { ResourceSelectionPanel } from "./ResourceSelectionPanel";
import { PermissionConfigPanel } from "./PermissionConfigPanel";
import { ResourceSummary } from "./ResourceSummary";

export const ResourceSelector: React.FC = () => {
  const { manifest, addPermission, removePermission, clearPermissionVerbs } =
    useRBAC();
  const [activeResource, setActiveResource] = useState<ResourceType | null>(
    null,
  );
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const selectedResources = manifest.role.permissions.map((p) => p.resource);

  // Show all custom resources
  const allCustomResources = manifest.role.permissions.filter(
    (p) => !RESOURCE_METADATA[p.resource as ResourceType],
  );

  const handleResourceToggle = (resource: ResourceType) => {
    const isSelected = manifest.role.permissions.some(
      (p) => p.resource === resource,
    );

    if (isSelected) {
      const isCustom = !RESOURCE_METADATA[resource];

      if (isCustom) {
        // For custom resources, clear verbs but keep the resource
        const permission = manifest.role.permissions.find(
          (p) => p.resource === resource,
        );
        if (permission && permission.verbs.length > 0) {
          clearPermissionVerbs(resource);
          announceToScreenReader(
            `${resource} deselected. Resource kept in list.`,
          );
        }
      } else {
        // For standard resources, remove completely
        removePermission(resource);

        // Update active resource if we just removed it
        if (activeResource === resource) {
          const remaining = manifest.role.permissions.filter(
            (p) => p.resource !== resource,
          );
          const nextActive =
            remaining.length > 0 && remaining[0]
              ? (remaining[0].resource as ResourceType)
              : null;
          setActiveResource(nextActive);
        }

        announceToScreenReader(
          `${RESOURCE_METADATA[resource]?.displayName || resource} removed`,
        );
      }
    } else {
      const metadata = RESOURCE_METADATA[resource];
      addPermission({
        resource,
        apiGroup: metadata?.apiGroup || "",
        verbs: [],
      });
      setActiveResource(resource);
      announceToScreenReader(
        `${metadata?.displayName || resource} added. ${
          isDesktop
            ? "Configure permissions in the right panel."
            : "Configure permissions below."
        }`,
      );
    }
  };

  const handleResourceFocus = (resource: ResourceType | null) => {
    setActiveResource(resource);
    if (resource) {
      const metadata = RESOURCE_METADATA[resource];
      announceToScreenReader(
        `Configuring permissions for ${metadata?.displayName || resource}`,
      );
    } else {
      announceToScreenReader("No resource selected");
    }
  };

  // Desktop: Split-screen layout
  if (isDesktop) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Resource Selection */}
          <div className="lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-4">
            <ResourceSelectionPanel
              selectedResources={selectedResources as ResourceType[]}
              activeResource={activeResource}
              onResourceToggle={handleResourceToggle}
              onResourceFocus={handleResourceFocus}
              inlineExpansion={false}
            />
          </div>

          {/* Right Panel: Permission Configuration (Sticky) */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div
              className={combineClasses(
                "rounded-lg border-2",
                neutralColors.bg,
                neutralColors.border,
                "lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto",
              )}
            >
              {selectedResources.length === 0 ? (
                <EmptyConfigState />
              ) : (
                <PermissionConfigPanel
                  permissions={manifest.role.permissions}
                  activeResource={activeResource}
                  onResourceChange={handleResourceFocus}
                  onRemove={handleResourceToggle}
                />
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        {selectedResources.length > 0 && (
          <ResourceSummary
            totalResources={selectedResources.length}
            customResourcesCount={allCustomResources.length}
            totalPermissions={manifest.role.permissions.reduce(
              (sum, p) => sum + p.verbs.length,
              0,
            )}
          />
        )}
      </div>
    );
  }

  // Mobile/Tablet: Inline expansion
  return (
    <div className="space-y-6">
      <ResourceSelectionPanel
        selectedResources={selectedResources as ResourceType[]}
        activeResource={activeResource}
        onResourceToggle={handleResourceToggle}
        onResourceFocus={handleResourceFocus}
        inlineExpansion={true}
      />

      {/* Summary */}
      {selectedResources.length > 0 && (
        <ResourceSummary
          totalResources={selectedResources.length}
          customResourcesCount={allCustomResources.length}
          totalPermissions={manifest.role.permissions.reduce(
            (sum, p) => sum + p.verbs.length,
            0,
          )}
        />
      )}
    </div>
  );
};

const EmptyConfigState: React.FC = () => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;

  return (
    <div className="p-8 text-center">
      <div
        className={combineClasses(
          "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
          infoColors.bg,
        )}
      >
        <svg
          className={combineClasses("w-8 h-8", infoColors.icon)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3
        className={combineClasses(
          "text-lg font-semibold mb-2",
          neutralColors.text,
        )}
      >
        No Resources Selected
      </h3>
      <p className={combineClasses("text-sm", neutralColors.icon)}>
        Select resources from the left panel to configure their permissions
        here.
      </p>
    </div>
  );
};
