// src/components/ResourceSelector/ResourceSelectionPanel.tsx
import React, { useState } from "react";
import { type ResourceType } from "../../types/rbac.types";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";
import { ResourceFilters } from "./ResourceFilters";
import { CategorySection } from "./CategorySection";
import { CustomResourceForm } from "./CustomResourceForm";
import { useResourceFiltering } from "./hooks/useResourceFiltering";
import { useResourceCategories } from "./hooks/useResourceCategories";
import { useRBAC } from "../../context/rbac";
import {
  RESOURCE_METADATA,
  RESOURCE_CATEGORIES,
} from "../../utils/resourceMetadata";
import { type CategoryKey } from "../../types/rbac.types";

interface ResourceSelectionPanelProps {
  selectedResources: ResourceType[];
  activeResource: ResourceType | null;
  onResourceToggle: (resource: ResourceType) => void;
  onResourceFocus: (resource: ResourceType | null) => void;
  inlineExpansion?: boolean;
}

const isCategoryKey = (key: string): key is CategoryKey => {
  return key in RESOURCE_CATEGORIES;
};

export const ResourceSelectionPanel: React.FC<ResourceSelectionPanelProps> = ({
  selectedResources,
  activeResource,
  onResourceToggle,
  onResourceFocus,
  inlineExpansion = false,
}) => {
  const { manifest, addPermission, removePermission, clearPermissionVerbs } =
    useRBAC();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredResources,
  } = useResourceFiltering();

  const { expandedCategories, toggleCategory, resourcesByCategory } =
    useResourceCategories(filteredResources);

  const allCustomResources = manifest.role.permissions.filter(
    (p) => !RESOURCE_METADATA[p.resource as ResourceType]
  );

  const customResourcesWithVerbs = allCustomResources.filter(
    (p) => p.verbs.length > 0
  );

  const handleCustomResourceAdd = (name: string, apiGroup: string) => {
    addPermission({
      resource: name as ResourceType,
      apiGroup,
      verbs: [],
    });

    announceToScreenReader(
      `Custom resource "${name}" from API group "${apiGroup}" added. ${
        inlineExpansion
          ? "Configure permissions below."
          : "Configure permissions in the right panel."
      }`
    );

    setShowCustomForm(false);
    onResourceFocus(name as ResourceType);
  };

  const handleResourceClick = (resource: ResourceType) => {
    const isSelected = selectedResources.includes(resource);

    if (!isSelected) {
      onResourceToggle(resource);
    }
    onResourceFocus(resource);
  };

  const handleCustomResourceToggle = (resource: ResourceType) => {
    const permission = manifest.role.permissions.find(
      (p) => p.resource === resource
    );

    if (permission && permission.verbs.length > 0) {
      clearPermissionVerbs(resource);
      announceToScreenReader(`${resource} deselected. Resource kept in list.`);
    } else if (permission) {
      onResourceFocus(resource);
      announceToScreenReader(
        `${resource} selected. Configure permissions ${
          inlineExpansion ? "below" : "in the right panel"
        }.`
      );
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    // Remove all standard resources
    selectedResources.forEach((resource) => {
      const isCustom = !RESOURCE_METADATA[resource];
      if (!isCustom) {
        onResourceToggle(resource);
      } else {
        // For custom resources, just clear verbs
        clearPermissionVerbs(resource);
      }
    });

    // Clear active resource
    onResourceFocus(null);

    setShowClearConfirm(false);
    announceToScreenReader(
      `All ${selectedResources.length} selected resources cleared`
    );
  };

  const cancelClearAll = () => {
    setShowClearConfirm(false);
    announceToScreenReader("Clear all cancelled");
  };

  return (
    <section
      className={combineClasses(
        "rounded-lg border p-4",
        neutralColors.bg,
        neutralColors.border
      )}
      aria-labelledby="resource-selector-heading"
    >
      <h3
        id="resource-selector-heading"
        className={combineClasses(
          "text-lg font-semibold mb-3",
          neutralColors.text
        )}
      >
        Select Resources
      </h3>
      <p className={combineClasses("text-sm mb-4", neutralColors.icon)}>
        Choose the Kubernetes resources this role can access.
        {!inlineExpansion &&
          " Configure permissions in the panel on the right."}
      </p>

      {/* Search and Filter with Clear All */}
      <div className="mb-4">
        <ResourceFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          resultsCount={filteredResources.length}
          selectedCount={selectedResources.length}
          {...(selectedResources.length > 0 && { onClearAll: handleClearAll })}
        />
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearConfirm && (
        <div
          className={combineClasses(
            "mb-4 p-4 rounded-lg border-2",
            "bg-red-50 dark:bg-red-900/20",
            "border-red-300 dark:border-red-700"
          )}
          role="alertdialog"
          aria-labelledby="clear-all-title"
          aria-describedby="clear-all-description"
        >
          <h4
            id="clear-all-title"
            className={combineClasses(
              "text-base font-semibold mb-2",
              "text-red-900 dark:text-red-100"
            )}
          >
            Clear All Selected Resources?
          </h4>
          <p
            id="clear-all-description"
            className={combineClasses(
              "text-sm mb-3",
              "text-red-800 dark:text-red-200"
            )}
          >
            This will remove all {selectedResources.length} selected resource
            {selectedResources.length === 1 ? "" : "s"} and their configured
            permissions. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmClearAll}
              className={combineClasses(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "bg-red-600 hover:bg-red-700",
                "text-white",
                "focus:ring-red-500"
              )}
            >
              Yes, Clear All
            </button>
            <button
              type="button"
              onClick={cancelClearAll}
              className={combineClasses(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all border-2",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                neutralColors.hover,
                neutralColors.ring
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resource Categories */}
      {filteredResources.length === 0 ? (
        <div
          className={combineClasses(
            "text-center py-8 text-sm italic",
            neutralColors.icon
          )}
          role="status"
        >
          No resources match your search "{searchTerm}"
        </div>
      ) : (
        <div className="space-y-4">
          {/* Standard Resource Categories */}
          {Object.entries(resourcesByCategory).map(([category, resources]) => {
            if (!isCategoryKey(category)) {
              console.warn(`Unknown category: ${category}`);
              return null;
            }

            return (
              <CategorySection
                key={category}
                category={category}
                resources={resources}
                selectedResources={selectedResources}
                activeResource={activeResource}
                isExpanded={expandedCategories.has(category)}
                onToggleExpand={() => toggleCategory(category)}
                onResourceToggle={onResourceToggle}
                onResourceClick={handleResourceClick}
                inlineExpansion={inlineExpansion}
              />
            );
          })}

          {/* Custom Resources Category */}
          <CategorySection
            category="custom"
            resources={[]}
            selectedResources={
              customResourcesWithVerbs.map((p) => p.resource) as ResourceType[]
            }
            activeResource={activeResource}
            isExpanded={expandedCategories.has("custom")}
            onToggleExpand={() => toggleCategory("custom")}
            onResourceToggle={handleCustomResourceToggle}
            onResourceClick={handleResourceClick}
            customResources={allCustomResources}
            onCustomResourceRemove={(resource) => {
              removePermission(resource);
              if (activeResource === resource) {
                onResourceFocus(null);
              }
              announceToScreenReader(`${resource} permanently removed.`);
            }}
            inlineExpansion={inlineExpansion}
            // NEW: Pass custom resource form props
            onAddCustomResource={() => {
              setShowCustomForm(true);
              announceToScreenReader("Custom resource form opened");
            }}
            showCustomResourceForm={showCustomForm}
            customResourceFormComponent={
              <CustomResourceForm
                onAdd={handleCustomResourceAdd}
                onCancel={() => {
                  setShowCustomForm(false);
                  announceToScreenReader("Custom resource form closed");
                }}
                existingResources={allCustomResources.map((p) => p.resource)}
              />
            }
          />
        </div>
      )}
    </section>
  );
};
