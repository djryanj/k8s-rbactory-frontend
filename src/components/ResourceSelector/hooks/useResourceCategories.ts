// src/components/ResourceSelector/hooks/useResourceCategories.ts
import { useState, useMemo } from "react";
import { type ResourceType, type CategoryKey } from "../../../types/rbac.types";
import { RESOURCE_METADATA, RESOURCE_CATEGORIES } from "../../../utils/resourceMetadata";

export const useResourceCategories = (filteredResources: ResourceType[]) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([...Object.keys(RESOURCE_CATEGORIES), "custom"])
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(category)) {
        newExpanded.delete(category);
      } else {
        newExpanded.add(category);
      }
      return newExpanded;
    });
  };

  const resourcesByCategory = useMemo(() => {
    return filteredResources.reduce((acc, resource) => {
      const category = RESOURCE_METADATA[resource].category as CategoryKey;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(resource);
      return acc;
    }, {} as Record<CategoryKey, ResourceType[]>);
  }, [filteredResources]);

  return {
    expandedCategories,
    toggleCategory,
    resourcesByCategory,
  };
};
