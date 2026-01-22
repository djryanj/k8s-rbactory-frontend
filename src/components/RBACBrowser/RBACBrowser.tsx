// src/components/RBACBrowser/RBACBrowser.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRBAC } from "../../context/rbac";
import { useConfig } from "../../context/config";
import { useConnection } from "../../context/connection";
import { useClusterRBAC } from "../../context/clusterRBAC";
import { useResourceData } from "./hooks/useResourceData";
import { useResourceFilters } from "./hooks/useResourceFilters";
import { BrowserHeader } from "./components/BrowserHeader";
import { BrowserFilters } from "./components/BrowserFilters";
import { ResourceList } from "./components/ResourceList";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import { BrowserFooter } from "./components/BrowserFooter";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";
import type {
  ResourceType,
  VerbType,
  ResourcePermission,
} from "../../types/rbac.types";
import type {
  ClusterRBACResource,
  KubernetesResource,
  ResourceCounts,
} from "../../services/api";

export const RBACBrowser: React.FC = () => {
  const { loadPreset } = useRBAC();
  const { defaultResourceLoadSize } = useConfig();
  const {
    connected,
    loading: connectionLoading,
    apiClientInstance,
  } = useConnection();

  const {
    selectedResource,
    setSelectedResource,
    setRelatedResources,
    setIsLoadingRelationships,
  } = useClusterRBAC();

  const [pageSize, setPageSize] = useState(defaultResourceLoadSize);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);
  const [counts, setCounts] = useState<ResourceCounts>({
    roles: 0,
    clusterRoles: 0,
    roleBindings: 0,
    clusterRoleBindings: 0,
    principals: 0,
    resources: 0,
  });
  const [initializing, setInitializing] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const isInitialized = useRef(false);
  const filterChangeTimer = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  const { filters, updateFilters } = useResourceFilters();

  const {
    resources,
    principals,
    kubernetesResources,
    loading,
    loadingMore,
    autoLoading,
    error,
    pagination,
    loadResources,
    startAutoLoading,
    loadMore,
    reset,
  } = useResourceData(
    filters.selectedKind,
    filters.selectedNamespace,
    filters.principalNamespaceFilter,
    filters.principalTypeFilter,
    filters.resourceTypeFilter,
    pageSize
  );

  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const normalizeResourceType = (kind: string): string => {
    const lower = kind.toLowerCase();
    const typeMap: Record<string, string> = {
      secret: "secrets",
      secrets: "secrets",
      configmap: "configmaps",
      configmaps: "configmaps",
      pod: "pods",
      pods: "pods",
      service: "services",
      services: "services",
      deployment: "deployments",
      deployments: "deployments",
      statefulset: "statefulsets",
      statefulsets: "statefulsets",
      daemonset: "daemonsets",
      daemonsets: "daemonsets",
      persistentvolumeclaim: "persistentvolumeclaims",
      persistentvolumeclaims: "persistentvolumeclaims",
    };

    return typeMap[lower] || lower;
  };

  useEffect(() => {
    setPageSize(defaultResourceLoadSize);
  }, [defaultResourceLoadSize]);

  useEffect(() => {
    // Auto-select ServiceAccounts when namespace filter is applied
    if (
      filters.selectedKind === "Principal" &&
      filters.principalNamespaceFilter &&
      !filters.principalTypeFilter
    ) {
      updateFilters({ principalTypeFilter: "ServiceAccount" });
    }
  }, [
    filters.selectedKind,
    filters.principalNamespaceFilter,
    filters.principalTypeFilter,
    updateFilters,
  ]);

  // Ensure namespace filter is cleared when User or Group is selected
  useEffect(() => {
    if (
      filters.selectedKind === "Principal" &&
      filters.principalTypeFilter &&
      filters.principalTypeFilter !== "ServiceAccount" &&
      filters.principalNamespaceFilter
    ) {
      updateFilters({ principalNamespaceFilter: "" });
    }
  }, [
    filters.selectedKind,
    filters.principalTypeFilter,
    filters.principalNamespaceFilter,
    updateFilters,
  ]);

  // Auto-select default resource type when Resource kind is selected
  useEffect(() => {
    if (
      filters.selectedKind === "Resource" &&
      !filters.resourceTypeFilter &&
      resourceTypes.length > 0
    ) {
      // Default to secrets
      updateFilters({ resourceTypeFilter: "secrets" });
    }
  }, [
    filters.selectedKind,
    filters.resourceTypeFilter,
    resourceTypes.length,
    updateFilters,
  ]);

  const loadCounts = useCallback(async () => {
    try {
      const countsData = await apiClientInstance.getCounts();
      setCounts(countsData);
      announceToScreenReader("Resource counts updated");
    } catch (err) {
      console.error("Failed to load counts:", err);
      announceToScreenReader("Failed to load resource counts", "assertive");
    }
  }, [apiClientInstance]);

  const loadNamespaces = useCallback(async () => {
    try {
      const ns = await apiClientInstance.listNamespaces();
      setNamespaces(ns || []);
    } catch (err) {
      console.error("Failed to load namespaces:", err);
      setNamespaces([]);
    }
  }, [apiClientInstance]);

  const loadResourceTypes = useCallback(async () => {
    try {
      const types = await apiClientInstance.listResourceTypes();
      setResourceTypes(types || []);
    } catch (err) {
      console.error("Failed to load resource types:", err);
      setResourceTypes([]);
    }
  }, [apiClientInstance]);

  const handleRefresh = useCallback(() => {
    announceToScreenReader("Refreshing resources");
    void (async () => {
      try {
        await Promise.all([loadCounts(), loadResources(0, true)]);
        announceToScreenReader("Resources refreshed successfully");
      } catch (err) {
        console.error("Failed to refresh:", err);
        announceToScreenReader("Failed to refresh resources", "assertive");
      }
    })();
  }, [loadCounts, loadResources]);

  const handleImportRole = useCallback(
    (resource: ClusterRBACResource) => {
      if (!resource?.rules) return;

      const permissions = resource.rules.flatMap((rule) =>
        (rule.resources || []).map((res) => {
          const permission: ResourcePermission = {
            resource: res as ResourceType,
            apiGroup: (rule.apiGroups && rule.apiGroups[0]) || "",
            verbs: (rule.verbs || []) as VerbType[],
          };

          if (rule.resourceNames && rule.resourceNames.length > 0) {
            permission.resourceNames = rule.resourceNames;
          }

          return permission;
        })
      );

      const isClusterRole = resource.kind === "ClusterRole";
      loadPreset(permissions, isClusterRole);
      announceToScreenReader(
        `Imported ${resource.kind} ${resource.name} as preset`
      );
    },
    [loadPreset]
  );

  const handleResourceSelect = useCallback(
    async (resource: ClusterRBACResource) => {
      if (!resource) return;

      setSelectedResource(resource);
      setIsLoadingRelationships(true);

      try {
        const relationships = await apiClientInstance.getRelationships(
          resource.kind,
          resource.namespace || "",
          resource.name
        );

        setRelatedResources(relationships);
        announceToScreenReader(
          `Selected ${resource.kind} ${resource.name}. Loading relationships.`
        );
      } catch (err) {
        console.error("Failed to load relationships:", err);
        setRelatedResources({
          relatedBindings: [],
          relatedRoles: [],
        });
        announceToScreenReader("Failed to load relationships", "assertive");
      } finally {
        setIsLoadingRelationships(false);
      }
    },
    [
      apiClientInstance,
      setSelectedResource,
      setRelatedResources,
      setIsLoadingRelationships,
    ]
  );

  const handlePrincipalSelect = useCallback(
    async (principal: { kind: string; name: string; namespace?: string }) => {
      if (!principal) return;

      const pseudoResource: ClusterRBACResource = {
        kind: principal.kind,
        name: principal.name,
        ...(principal.namespace && { namespace: principal.namespace }),
        subjects: [],
        createdAt: new Date().toISOString(),
        labels: {},
      };

      setSelectedResource(pseudoResource);
      setIsLoadingRelationships(true);

      try {
        const relationships = await apiClientInstance.getRelationships(
          principal.kind,
          principal.namespace || "",
          principal.name
        );

        setRelatedResources(relationships);
        announceToScreenReader(
          `Selected ${principal.kind} ${principal.name}. Loading relationships.`
        );
      } catch (err) {
        console.error("Failed to load relationships:", err);
        setRelatedResources({
          relatedBindings: [],
          relatedRoles: [],
        });
        announceToScreenReader("Failed to load relationships", "assertive");
      } finally {
        setIsLoadingRelationships(false);
      }
    },
    [
      apiClientInstance,
      setSelectedResource,
      setRelatedResources,
      setIsLoadingRelationships,
    ]
  );

  const handleKubernetesResourceSelect = useCallback(
    async (resource: KubernetesResource) => {
      if (!resource) return;

      // Type assertion to satisfy the selectedResource type
      const pseudoResource = resource as unknown as ClusterRBACResource;
      setSelectedResource(pseudoResource);
      setIsLoadingRelationships(true);

      try {
        const accessDetail = await apiClientInstance.getResourceAccess(
          resource.kind.toLowerCase(),
          resource.namespace || "",
          resource.name
        );

        // Set related resources with access grants
        setRelatedResources({
          relatedBindings: [],
          relatedRoles: [],
          accessGrants: accessDetail.accessGrants,
        });

        announceToScreenReader(
          `Loaded access information for ${resource.kind} ${resource.name}. ${accessDetail.summary.totalPrincipals} principals have access.`
        );
      } catch (err) {
        console.error("Failed to load resource access:", err);
        setRelatedResources({
          relatedBindings: [],
          relatedRoles: [],
          accessGrants: [],
        });
        announceToScreenReader(
          "Failed to load access information",
          "assertive"
        );
      } finally {
        setIsLoadingRelationships(false);
      }
    },
    [
      apiClientInstance,
      setSelectedResource,
      setRelatedResources,
      setIsLoadingRelationships,
    ]
  );
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8 && pagination.hasMore && !loadingMore) {
        loadMore();
      }
    },
    [pagination.hasMore, loadingMore, loadMore]
  );

  const handleClearSearch = useCallback(() => {
    updateFilters({ searchTerm: "" });
    announceToScreenReader("Search cleared");
  }, [updateFilters]);

  // Calculate filtered counts based on currently loaded resources
  const calculateFilteredCounts = useCallback(():
    | ResourceCounts
    | undefined => {
    // Only calculate filtered counts if namespace or type filtering is active
    const isFiltered =
      ((filters.selectedKind === "Role" ||
        filters.selectedKind === "RoleBinding") &&
        filters.selectedNamespace !== "") ||
      (filters.selectedKind === "Principal" &&
        (filters.principalNamespaceFilter !== "" ||
          filters.principalTypeFilter)) ||
      (filters.selectedKind === "Resource" &&
        (filters.selectedNamespace !== "" || filters.resourceTypeFilter));

    if (!isFiltered) {
      return undefined; // No filtering active, use total counts
    }

    // Calculate counts from currently loaded resources
    const roleCount = resources.filter(
      (r) =>
        r.kind === "Role" &&
        (!filters.selectedNamespace ||
          r.namespace === filters.selectedNamespace)
    ).length;

    const roleBindingCount = resources.filter(
      (r) =>
        r.kind === "RoleBinding" &&
        (!filters.selectedNamespace ||
          r.namespace === filters.selectedNamespace)
    ).length;

    // Filter principals based on namespace AND type
    const principalCount = principals.filter((p) => {
      // Type filter
      if (
        filters.principalTypeFilter &&
        p.kind !== filters.principalTypeFilter
      ) {
        return false;
      }

      // Namespace filter - only applies to ServiceAccounts
      if (filters.principalNamespaceFilter) {
        return (
          p.kind === "ServiceAccount" &&
          p.namespace === filters.principalNamespaceFilter
        );
      }

      return true;
    }).length;

    // Filter Kubernetes resources
    const k8sResourceCount = kubernetesResources.filter((r) => {
      if (
        filters.selectedNamespace &&
        r.namespace !== filters.selectedNamespace
      ) {
        return false;
      }
      if (
        filters.resourceTypeFilter &&
        r.kind.toLowerCase() !== filters.resourceTypeFilter
      ) {
        return false;
      }
      return true;
    }).length;

    return {
      roles: roleCount,
      clusterRoles: counts.clusterRoles,
      roleBindings: roleBindingCount,
      clusterRoleBindings: counts.clusterRoleBindings,
      principals: principalCount,
      resources: k8sResourceCount,
    };
  }, [filters, resources, principals, kubernetesResources, counts]);

  useEffect(() => {
    const initialize = async () => {
      if (!connected) {
        setInitializing(false);
        setInitialLoadComplete(false);
        return;
      }

      setInitializing(true);
      setInitialLoadComplete(false);
      announceToScreenReader("Initializing RBAC browser");

      try {
        await Promise.all([
          loadCounts(),
          loadNamespaces(),
          loadResourceTypes(),
        ]);
        await loadResources(0, true);
        isInitialized.current = true;
        setInitialLoadComplete(true);
        announceToScreenReader("RBAC browser initialized successfully");
      } catch (err) {
        console.error("Initialization failed:", err);
        announceToScreenReader(
          "Failed to initialize RBAC browser",
          "assertive"
        );
      } finally {
        setInitializing(false);
      }
    };

    initialize().catch((err) => {
      console.error("Unexpected initialization error:", err);
      setInitializing(false);
    });

    return () => {
      if (filterChangeTimer.current) {
        clearTimeout(filterChangeTimer.current);
      }
    };
  }, [connected, loadCounts, loadNamespaces, loadResourceTypes, loadResources]);

  useEffect(() => {
    if (!initialLoadComplete || autoLoading || loading) {
      return;
    }

    const currentItemCount =
      filters.selectedKind === "Principal"
        ? principals.length
        : filters.selectedKind === "Resource"
          ? kubernetesResources.length
          : resources.length;

    if (currentItemCount === 0 || !pagination.hasMore) {
      return;
    }

    if (
      pagination.totalCount > 0 &&
      currentItemCount >= pagination.totalCount
    ) {
      return;
    }

    const timer = setTimeout(() => {
      startAutoLoading().catch((err) => {
        console.error("Auto-load failed:", err);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [
    initialLoadComplete,
    principals.length,
    resources.length,
    kubernetesResources.length,
    pagination.totalCount,
    pagination.hasMore,
    filters.selectedKind,
    autoLoading,
    loading,
    startAutoLoading,
  ]);

  useEffect(() => {
    if (!isInitialized.current) {
      return;
    }

    if (filterChangeTimer.current) {
      clearTimeout(filterChangeTimer.current);
    }

    reset();
    setInitialLoadComplete(false);

    filterChangeTimer.current = window.setTimeout(() => {
      announceToScreenReader(`Loading ${filters.selectedKind.toLowerCase()}s`);
      void loadResources(0, true)
        .then(() => {
          setInitialLoadComplete(true);
        })
        .catch((err) => {
          console.error("Failed to load resources after filter change:", err);
          setInitialLoadComplete(true);
          announceToScreenReader("Failed to load resources", "assertive");
        });
    }, 300);

    return () => {
      if (filterChangeTimer.current) {
        clearTimeout(filterChangeTimer.current);
      }
    };
  }, [
    filters.selectedKind,
    filters.selectedNamespace,
    filters.principalNamespaceFilter,
    filters.principalTypeFilter,
    filters.resourceTypeFilter,
    pageSize,
    loadResources,
    reset,
  ]);

  const getCurrentResourceTotal = () => {
    switch (filters.selectedKind) {
      case "Role":
        return counts.roles;
      case "ClusterRole":
        return counts.clusterRoles;
      case "RoleBinding":
        return counts.roleBindings;
      case "ClusterRoleBinding":
        return counts.clusterRoleBindings;
      case "Principal":
        return counts.principals;
      case "Resource":
        return counts.resources ?? 0;
      default:
        return 0;
    }
  };

  const isLoading = initializing || loading || connectionLoading;
  const currentCount =
    filters.selectedKind === "Principal"
      ? principals.length
      : filters.selectedKind === "Resource"
        ? kubernetesResources.length
        : resources.length;
  const displayTotal = getCurrentResourceTotal();
  const filteredCounts = calculateFilteredCounts();

  const filteredResources =
    filters.selectedKind === "Principal" || filters.selectedKind === "Resource"
      ? []
      : resources.filter(
          (resource) =>
            resource?.name
              ?.toLowerCase()
              .includes(filters.searchTerm.toLowerCase()) ||
            resource?.namespace
              ?.toLowerCase()
              .includes(filters.searchTerm.toLowerCase())
        );

  const filteredPrincipals = principals.filter((principal) => {
    if (!principal) return false;

    // Search filter
    const matchesSearch =
      principal.name
        ?.toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      principal.kind?.toLowerCase().includes(filters.searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Type filter
    if (
      filters.principalTypeFilter &&
      principal.kind !== filters.principalTypeFilter
    ) {
      return false;
    }

    // Namespace filter - only applies to ServiceAccounts
    if (filters.principalNamespaceFilter) {
      return (
        principal.kind === "ServiceAccount" &&
        principal.namespace === filters.principalNamespaceFilter
      );
    }

    return true;
  });

  const filteredKubernetesResources = kubernetesResources.filter((resource) => {
    if (!resource) return false;

    // Search filter
    if (filters.searchTerm) {
      const matchesSearch =
        resource.name
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        resource.namespace
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        resource.kind?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      if (!matchesSearch) return false;
    }

    // Namespace filter
    if (
      filters.selectedNamespace &&
      resource.namespace !== filters.selectedNamespace
    ) {
      return false;
    }

    // Resource type filter
    if (filters.resourceTypeFilter) {
      const normalizedResourceKind = normalizeResourceType(resource.kind);
      const normalizedFilter = normalizeResourceType(
        filters.resourceTypeFilter
      );

      if (normalizedResourceKind !== normalizedFilter) {
        return false;
      }
    }

    return true;
  });

  const displayItemsCount =
    filters.selectedKind === "Principal"
      ? filteredPrincipals.length
      : filters.selectedKind === "Resource"
        ? filteredKubernetesResources.length
        : filteredResources.length;

  return (
    <article
      className={combineClasses(
        "rounded-lg border",
        neutralColors.bg,
        neutralColors.border
      )}
      role="region"
      aria-labelledby="rbac-browser-title"
      aria-describedby="rbac-browser-description"
    >
      {/* Screen reader title and description */}
      <h1 id="rbac-browser-title" className="sr-only">
        RBAC Resource Browser
      </h1>
      <p id="rbac-browser-description" className="sr-only">
        Browse and manage Kubernetes RBAC resources including roles, cluster
        roles, role bindings, cluster role bindings, principals, and Kubernetes
        resources. Use filters to narrow down results and select resources to
        view details.
      </p>

      {/* Skip to main content link */}
      <a
        href="#rbac-browser-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        Skip to resource list
      </a>

      {/* Header and filters section */}
      <div
        className={combineClasses("p-4 border-b", neutralColors.border)}
        role="banner"
      >
        <BrowserHeader
          counts={counts}
          displayTotal={displayTotal}
          autoLoading={autoLoading}
        />
        <BrowserFilters
          filters={filters}
          counts={counts}
          namespaces={namespaces}
          resourceTypes={resourceTypes}
          onFilterChange={updateFilters}
          isLoading={initializing || !initialLoadComplete}
          {...(filteredCounts && { filteredCounts })}
        />
      </div>

      {/* Main content area */}
      <main
        id="rbac-browser-main"
        ref={mainContentRef}
        className="p-4"
        aria-busy={isLoading}
        aria-live="polite"
      >
        {!connected && !connectionLoading ? (
          <EmptyState
            type="disconnected"
            message="Not connected to cluster"
            submessage="Please check your connection settings and try again"
          />
        ) : isLoading ? (
          <LoadingState
            message={
              initializing
                ? "Initializing..."
                : `Loading ${filters.selectedKind.toLowerCase()}s...`
            }
            submessage={
              initializing
                ? "Connecting to cluster and loading metadata"
                : `Loading ${pageSize} items at a time`
            }
          />
        ) : error ? (
          <EmptyState
            type="error"
            message={error}
            onRetry={() => {
              void loadResources(0, true);
            }}
          />
        ) : (
          <ResourceList
            resources={resources}
            principals={filteredPrincipals}
            kubernetesResources={filteredKubernetesResources}
            selectedKind={filters.selectedKind}
            selectedResource={selectedResource}
            searchTerm={filters.searchTerm}
            onResourceSelect={handleResourceSelect}
            onPrincipalSelect={handlePrincipalSelect}
            onKubernetesResourceSelect={handleKubernetesResourceSelect}
            onImportRole={handleImportRole}
            loading={loading}
            autoLoading={autoLoading}
            hasMore={pagination.hasMore}
            onLoadMore={loadMore}
            onScroll={handleScroll}
            scrollContainerRef={scrollContainerRef}
            totalCount={pagination.totalCount}
            currentCount={currentCount}
            onClearSearch={handleClearSearch}
          />
        )}
      </main>

      {/* Footer */}
      <BrowserFooter
        displayItemsCount={displayItemsCount}
        displayTotal={displayTotal}
        currentCount={currentCount}
        hasMore={pagination.hasMore}
        selectedResource={selectedResource}
        loading={loading}
        initialLoadComplete={initialLoadComplete}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Keyboard shortcuts help */}
      <div
        className="sr-only"
        role="complementary"
        aria-label="Keyboard shortcuts"
      >
        <h2>Keyboard Navigation</h2>
        <ul>
          <li>Tab: Move between interactive elements</li>
          <li>Enter or Space: Activate buttons and select items</li>
          <li>Escape: Clear search or close dialogs</li>
          <li>Arrow keys: Navigate within lists</li>
        </ul>
      </div>
    </article>
  );
};
