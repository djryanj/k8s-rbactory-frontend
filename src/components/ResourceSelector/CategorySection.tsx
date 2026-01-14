// src/components/ResourceSelector/CategorySection.tsx
import React from "react";
import { type ResourceType, type CategoryKey } from "../../types/rbac.types";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { K8sResourceIcon } from "@/icons";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_METADATA,
} from "../../utils/resourceMetadata";
import { ResourceCard } from "./ResourceCard";
import { PermissionMatrix } from "./PermissionMatrix/PermissionMatrix";
import { useRBAC } from "../../context/rbac";

interface CategorySectionProps {
  category: CategoryKey | "custom";
  resources: ResourceType[];
  selectedResources: ResourceType[];
  activeResource: ResourceType | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onResourceToggle: (resource: ResourceType) => void;
  onResourceClick: (resource: ResourceType) => void;
  customResources?: Array<{ resource: string; apiGroup: string }>;
  onCustomResourceRemove?: (resource: string) => void;
  inlineExpansion?: boolean;
  // Props for custom resource form
  onAddCustomResource?: () => void;
  showCustomResourceForm?: boolean;
  customResourceFormComponent?: React.ReactNode;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  resources,
  selectedResources,
  activeResource,
  isExpanded,
  onToggleExpand,
  onResourceToggle,
  onResourceClick,
  customResources = [],
  onCustomResourceRemove,
  inlineExpansion = false,
  onAddCustomResource,
  showCustomResourceForm = false,
  customResourceFormComponent,
}) => {
  const { manifest } = useRBAC();
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;

  const isCustomCategory = category === "custom";
  const categoryInfo = isCustomCategory
    ? { name: "Custom Resources" }
    : RESOURCE_CATEGORIES[category as CategoryKey];

  const selectedInCategory = isCustomCategory
    ? customResources.filter((cr) =>
        selectedResources.includes(cr.resource as ResourceType)
      ).length
    : resources.filter((r) => selectedResources.includes(r)).length;

  const totalResources = isCustomCategory
    ? customResources.length
    : resources.length;

  return (
    <div
      className={combineClasses(
        "border rounded-lg overflow-hidden",
        neutralColors.border
      )}
    >
      {/* Category Header */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={combineClasses(
          "w-full flex items-center justify-between p-3 transition-all",
          "focus:outline-none",
          "bg-gray-50 dark:bg-gray-800",
          "hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
        aria-expanded={isExpanded}
        aria-controls={`category-${category}-content`}
      >
        <div className="flex items-center gap-3">
          <K8sResourceIcon
            kind={category}
            size={28}
            className={neutralColors.icon}
            unlabeled={true}
          />
          <div className="text-left">
            <h4 className={combineClasses("font-semibold", neutralColors.text)}>
              {categoryInfo.name}
            </h4>
            <p className={combineClasses("text-xs", neutralColors.icon)}>
              {totalResources} resource{totalResources === 1 ? "" : "s"}
              {selectedInCategory > 0 && ` • ${selectedInCategory} selected`}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp
            size={20}
            className={neutralColors.icon}
            aria-hidden="true"
          />
        ) : (
          <ChevronDown
            size={20}
            className={neutralColors.icon}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Category Content */}
      {isExpanded && (
        <div
          id={`category-${category}-content`}
          className="p-3"
          role="group"
          aria-label={`${categoryInfo.name} resources`}
        >
          {/* Resources Grid */}
          {(
            isCustomCategory ? customResources.length > 0 : resources.length > 0
          ) ? (
            <div className="space-y-3 mb-3">
              {isCustomCategory
                ? customResources.map((cr) => {
                    const isSelected = selectedResources.includes(
                      cr.resource as ResourceType
                    );
                    const isActive = activeResource === cr.resource;
                    const permission = manifest.role.permissions.find(
                      (p) => p.resource === cr.resource
                    );

                    return (
                      <div key={cr.resource}>
                        <ResourceCard
                          resource={cr.resource as ResourceType}
                          isSelected={isSelected}
                          isActive={isActive}
                          onToggle={onResourceToggle}
                          onClick={onResourceClick}
                          isCustom
                          apiGroup={cr.apiGroup}
                          onRemove={() => onCustomResourceRemove?.(cr.resource)}
                          showRemoveButton={!isSelected}
                          hasNoVerbs={!isSelected && permission !== undefined}
                        />
                        {inlineExpansion && isSelected && permission && (
                          <div
                            className={combineClasses(
                              "mt-2 p-3 border rounded-lg",
                              neutralColors.border,
                              neutralColors.bg
                            )}
                          >
                            <PermissionMatrix
                              resource={permission.resource}
                              selectedVerbs={permission.verbs}
                              availableVerbs={[
                                "get",
                                "list",
                                "watch",
                                "create",
                                "update",
                                "patch",
                                "delete",
                                "deletecollection",
                              ]}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                : resources.map((resource) => {
                    const isSelected = selectedResources.includes(resource);
                    const isActive = activeResource === resource;
                    const permission = manifest.role.permissions.find(
                      (p) => p.resource === resource
                    );
                    const metadata = RESOURCE_METADATA[resource];

                    return (
                      <div key={resource}>
                        <ResourceCard
                          resource={resource}
                          isSelected={isSelected}
                          isActive={isActive}
                          onToggle={onResourceToggle}
                          onClick={onResourceClick}
                        />
                        {inlineExpansion && isSelected && permission && (
                          <div
                            className={combineClasses(
                              "mt-2 p-3 border rounded-lg",
                              neutralColors.border,
                              neutralColors.bg
                            )}
                          >
                            <PermissionMatrix
                              resource={permission.resource}
                              selectedVerbs={permission.verbs}
                              availableVerbs={
                                metadata?.commonVerbs || [
                                  "get",
                                  "list",
                                  "watch",
                                  "create",
                                  "update",
                                  "patch",
                                  "delete",
                                  "deletecollection",
                                ]
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
            </div>
          ) : (
            !isCustomCategory && (
              <div
                className={combineClasses(
                  "text-center py-6 text-sm",
                  neutralColors.icon
                )}
              >
                No resources in this category
              </div>
            )
          )}

          {/* Add Custom Resource Button/Form - Only for custom category */}
          {isCustomCategory && (
            <div>
              {!showCustomResourceForm ? (
                <button
                  type="button"
                  onClick={onAddCustomResource}
                  className={combineClasses(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all transform-gpu",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    "hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]",
                    neutralColors.border,
                    neutralColors.hover,
                    infoColors.ring
                  )}
                  aria-label="Add custom resource"
                >
                  <Plus size={20} aria-hidden="true" />
                  <span
                    className={combineClasses(
                      "font-medium",
                      neutralColors.text
                    )}
                  >
                    Add Custom Resource
                  </span>
                </button>
              ) : (
                customResourceFormComponent
              )}
            </div>
          )}

          {/* Empty state for custom resources */}
          {isCustomCategory &&
            customResources.length === 0 &&
            !showCustomResourceForm && (
              <div
                className={combineClasses(
                  "text-center py-6 text-sm mb-3",
                  neutralColors.icon
                )}
              >
                No custom resources added yet
              </div>
            )}
        </div>
      )}
    </div>
  );
};
