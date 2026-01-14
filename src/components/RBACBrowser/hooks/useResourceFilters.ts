// src/components/RBACBrowser/hooks/useResourceFilters.ts
import { useState, useCallback } from "react";
import type { FilterState, ResourceKind } from "../types";

export const useResourceFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    selectedKind: "Role",
    selectedNamespace: "",
    principalNamespaceFilter: "",
    principalTypeFilter: undefined,
    searchTerm: "",
  });

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const setSelectedKind = useCallback((kind: ResourceKind) => {
    setFilters((prev) => ({ ...prev, selectedKind: kind }));
  }, []);

  const setSelectedNamespace = useCallback((namespace: string) => {
    setFilters((prev) => ({ ...prev, selectedNamespace: namespace }));
  }, []);

  const setPrincipalNamespaceFilter = useCallback((namespace: string) => {
    setFilters((prev) => ({ ...prev, principalNamespaceFilter: namespace }));
  }, []);

  const setPrincipalTypeFilter = useCallback((type: string | undefined) => {
    setFilters((prev) => ({ ...prev, principalTypeFilter: type }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const clearSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchTerm: "" }));
  }, []);

  return {
    filters,
    updateFilters,
    setSelectedKind,
    setSelectedNamespace,
    setPrincipalNamespaceFilter,
    setPrincipalTypeFilter,
    setSearchTerm,
    clearSearch,
  };
};
