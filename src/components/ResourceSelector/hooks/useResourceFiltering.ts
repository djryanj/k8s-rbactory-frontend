// src/components/ResourceSelector/hooks/useResourceFiltering.ts
import { useState, useMemo } from "react";
import { type ResourceType } from "../../../types/rbac.types";
import { RESOURCE_METADATA } from "../../../utils/resourceMetadata";

export const useResourceFiltering = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const allResources = useMemo(
    () => Object.keys(RESOURCE_METADATA) as ResourceType[],
    []
  );

  const filteredResources = useMemo(() => {
    return allResources.filter((resource) => {
      const metadata = RESOURCE_METADATA[resource];
      const matchesSearch =
        metadata.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || metadata.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allResources, searchTerm, selectedCategory]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredResources,
  };
};
