// src/components/RBACBrowser/hooks/useResourceData.ts
import { useState, useRef, useCallback, useEffect } from "react";
import { useConnection } from "../../../context/connection";
import type {
  ClusterRBACResource,
  Principal,
  PaginatedResponse,
} from "../../../services/api";
import type { ResourceKind, PaginationState } from "../types";

const AUTO_LOAD_LIMIT_PAGES = 6;
const AUTO_LOAD_BATCH_DELAY = 150;

export const useResourceData = (
  selectedKind: ResourceKind,
  selectedNamespace: string,
  principalNamespaceFilter: string,
  principalTypeFilter: string | undefined,
  pageSize: number,
) => {
  const { connected, apiClientInstance } = useConnection();

  const [resources, setResources] = useState<ClusterRBACResource[]>([]);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 0,
    pageSize,
    totalCount: 0,
    hasMore: false,
    loadedPages: new Set(),
  });

  const resourcesAbortController = useRef<AbortController | null>(null);
  const autoLoadAbortController = useRef<AbortController | null>(null);
  const isAutoLoadingRef = useRef(false);

  const selectedKindRef = useRef(selectedKind);
  const selectedNamespaceRef = useRef(selectedNamespace);
  const principalNamespaceFilterRef = useRef(principalNamespaceFilter);
  const principalTypeFilterRef = useRef(principalTypeFilter);
  const hasMoreRef = useRef(pagination.hasMore);

  useEffect(() => {
    selectedKindRef.current = selectedKind;
  }, [selectedKind]);

  useEffect(() => {
    selectedNamespaceRef.current = selectedNamespace;
  }, [selectedNamespace]);

  useEffect(() => {
    principalNamespaceFilterRef.current = principalNamespaceFilter;
  }, [principalNamespaceFilter]);

  useEffect(() => {
    principalTypeFilterRef.current = principalTypeFilter;
  }, [principalTypeFilter]);

  useEffect(() => {
    hasMoreRef.current = pagination.hasMore;
  }, [pagination.hasMore]);

  const loadResources = useCallback(
    async (page: number = 0, replace: boolean = false) => {
      if (!connected) {
        setError("Not connected to cluster");
        return;
      }

      if (resourcesAbortController.current) {
        resourcesAbortController.current.abort();
      }

      resourcesAbortController.current = new AbortController();

      const isFirstPage = page === 0;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const limit = pageSize;
        const offset = page * pageSize;

        let response:
          | PaginatedResponse<ClusterRBACResource>
          | PaginatedResponse<Principal>;

        const kind = selectedKindRef.current;
        const namespace = selectedNamespaceRef.current;
        const principalNs = principalNamespaceFilterRef.current;

        switch (kind) {
          case "Role":
            response = await apiClientInstance.listRoles(
              namespace,
              limit,
              offset,
            );
            break;
          case "ClusterRole":
            response = await apiClientInstance.listClusterRoles(limit, offset);
            break;
          case "RoleBinding":
            response = await apiClientInstance.listRoleBindings(
              namespace,
              limit,
              offset,
            );
            break;
          case "ClusterRoleBinding":
            response = await apiClientInstance.listClusterRoleBindings(
              limit,
              offset,
            );
            break;
          case "Principal":
            response = await apiClientInstance.listPrincipals(
              principalNs,
              limit,
              offset,
            );
            break;
          default:
            response = { items: [], totalCount: 0, hasMore: false };
        }

        if (resourcesAbortController.current?.signal.aborted) {
          return;
        }

        if (kind === "Principal") {
          const principalResponse = response as PaginatedResponse<Principal>;
          if (replace) {
            setPrincipals(principalResponse.items || []);
          } else {
            setPrincipals((prev) => [
              ...prev,
              ...(principalResponse.items || []),
            ]);
          }
        } else {
          const resourceResponse =
            response as PaginatedResponse<ClusterRBACResource>;
          if (replace) {
            setResources(resourceResponse.items || []);
          } else {
            setResources((prev) => [
              ...prev,
              ...(resourceResponse.items || []),
            ]);
          }
        }

        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalCount: response.totalCount || 0,
          hasMore: response.hasMore ?? false,
          loadedPages: new Set(prev.loadedPages).add(page),
        }));
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            return;
          }
          setError(err.message);
        } else {
          setError("Failed to load resources");
        }
      } finally {
        if (!resourcesAbortController.current?.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [connected, apiClientInstance, pageSize],
  );

  const startAutoLoading = useCallback(async () => {
    if (!connected || isAutoLoadingRef.current) {
      return;
    }

    isAutoLoadingRef.current = true;
    setAutoLoading(true);

    try {
      if (autoLoadAbortController.current) {
        autoLoadAbortController.current.abort();
      }

      autoLoadAbortController.current = new AbortController();

      const startPage = pagination.currentPage + 1;

      for (let i = 0; i < AUTO_LOAD_LIMIT_PAGES; i++) {
        const pageNum = startPage + i;

        if (autoLoadAbortController.current?.signal.aborted) {
          break;
        }

        if (pagination.loadedPages.has(pageNum)) {
          continue;
        }

        const limit = pageSize;
        const offset = pageNum * pageSize;

        if (pagination.totalCount > 0 && offset >= pagination.totalCount) {
          setPagination((prev) => ({ ...prev, hasMore: false }));
          break;
        }

        try {
          let response:
            | PaginatedResponse<ClusterRBACResource>
            | PaginatedResponse<Principal>
            | null = null;

          const kind = selectedKindRef.current;
          const namespace = selectedNamespaceRef.current;
          const principalNs = principalNamespaceFilterRef.current;

          if (autoLoadAbortController.current?.signal.aborted) {
            break;
          }

          switch (kind) {
            case "Role":
              response = await apiClientInstance.listRoles(
                namespace,
                limit,
                offset,
              );
              break;
            case "ClusterRole":
              response = await apiClientInstance.listClusterRoles(
                limit,
                offset,
              );
              break;
            case "RoleBinding":
              response = await apiClientInstance.listRoleBindings(
                namespace,
                limit,
                offset,
              );
              break;
            case "ClusterRoleBinding":
              response = await apiClientInstance.listClusterRoleBindings(
                limit,
                offset,
              );
              break;
            case "Principal":
              response = await apiClientInstance.listPrincipals(
                principalNs,
                limit,
                offset,
              );
              break;
          }

          if (
            autoLoadAbortController.current?.signal.aborted ||
            !response ||
            !response.items ||
            response.items.length === 0
          ) {
            break;
          }

          if (kind === "Principal") {
            const principalResponse = response as PaginatedResponse<Principal>;
            setPrincipals((prev) => [...prev, ...principalResponse.items]);
          } else {
            const resourceResponse =
              response as PaginatedResponse<ClusterRBACResource>;
            setResources((prev) => [...prev, ...resourceResponse.items]);
          }

          setPagination((prev) => ({
            ...prev,
            currentPage: pageNum,
            hasMore: response.hasMore ?? false,
            totalCount:
              response.totalCount !== undefined && response.totalCount > 0
                ? response.totalCount
                : prev.totalCount,
            loadedPages: new Set(prev.loadedPages).add(pageNum),
          }));

          if (!(response.hasMore ?? false)) {
            break;
          }

          if (autoLoadAbortController.current?.signal.aborted) {
            break;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, AUTO_LOAD_BATCH_DELAY),
          );
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            break;
          }
          console.error("Failed to auto-load page", pageNum, ":", err);
          break;
        }
      }
    } finally {
      setAutoLoading(false);
      isAutoLoadingRef.current = false;
    }
  }, [
    connected,
    apiClientInstance,
    pagination.currentPage,
    pagination.loadedPages,
    pagination.totalCount,
    pageSize,
  ]);

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      const nextPage = pagination.currentPage + 1;

      if (pagination.loadedPages.has(nextPage)) {
        setPagination((prev) => ({ ...prev, currentPage: nextPage }));
      } else {
        loadResources(nextPage, false).catch((error) => {
          console.error("Failed to load more resources:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load more resources",
          );
        });
      }
    }
  }, [
    loadingMore,
    pagination.hasMore,
    pagination.currentPage,
    pagination.loadedPages,
    loadResources,
  ]);

  const reset = useCallback(() => {
    if (resourcesAbortController.current) {
      resourcesAbortController.current.abort();
    }
    if (autoLoadAbortController.current) {
      autoLoadAbortController.current.abort();
    }

    setResources([]);
    setPrincipals([]);
    setPagination({
      currentPage: 0,
      pageSize,
      totalCount: 0,
      hasMore: false,
      loadedPages: new Set(),
    });
    isAutoLoadingRef.current = false;
    setAutoLoading(false);
  }, [pageSize]);

  useEffect(() => {
    return () => {
      if (resourcesAbortController.current) {
        resourcesAbortController.current.abort();
      }
      if (autoLoadAbortController.current) {
        autoLoadAbortController.current.abort();
      }
    };
  }, []);

  return {
    resources,
    principals,
    loading,
    loadingMore,
    autoLoading,
    error,
    pagination,
    loadResources,
    startAutoLoading,
    loadMore,
    reset,
  };
};
