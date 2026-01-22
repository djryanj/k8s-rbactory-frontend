// src/components/RBACBrowser/types.ts
import type {
  ClusterRBACResource,
  Principal,
  KubernetesResource,
  ResourceCounts,
} from "../../services/api";

// Re-export for convenience
export type { ResourceCounts };

export type ResourceKind =
  | "Role"
  | "ClusterRole"
  | "RoleBinding"
  | "ClusterRoleBinding"
  | "Principal"
  | "Resource";

export interface FilterState {
  selectedKind: ResourceKind;
  selectedNamespace: string;
  principalNamespaceFilter: string;
  principalTypeFilter?: string | undefined;
  resourceTypeFilter?: string | undefined;
  searchTerm: string;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  loadedPages: Set<number>;
}

export interface ResourceListProps {
  resources: ClusterRBACResource[];
  principals: Principal[];
  kubernetesResources: KubernetesResource[];
  selectedKind: ResourceKind;
  selectedResource: ClusterRBACResource | KubernetesResource | null;
  searchTerm: string;
  onResourceSelect: (resource: ClusterRBACResource) => Promise<void>;
  onPrincipalSelect: (principal: Principal) => Promise<void>;
  onKubernetesResourceSelect: (resource: KubernetesResource) => Promise<void>;
  onImportRole: (resource: ClusterRBACResource) => void;
  loading: boolean;
  autoLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  totalCount: number;
  currentCount: number;
  onClearSearch?: () => void;
}

export interface BrowserHeaderProps {
  counts: ResourceCounts;
  displayTotal: number;
  autoLoading: boolean;
}

export interface BrowserFiltersProps {
  filters: FilterState;
  counts: ResourceCounts;
  namespaces: string[];
  resourceTypes: string[];
  onFilterChange: (filters: Partial<FilterState>) => void;
  isLoading?: boolean;
  filteredCounts?: ResourceCounts;
}

export interface BrowserFooterProps {
  displayItemsCount: number;
  displayTotal: number;
  currentCount: number;
  hasMore: boolean;
  selectedResource: ClusterRBACResource | KubernetesResource | null;
  loading: boolean;
  initialLoadComplete: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export interface ResourceCardProps {
  resource: ClusterRBACResource;
  isSelected: boolean;
  onSelect: () => void;
  onImport?: () => void;
}

export interface PrincipalCardProps {
  principal: Principal;
  isSelected: boolean;
  onSelect: () => void;
}

export interface KubernetesResourceCardProps {
  resource: KubernetesResource;
  isSelected: boolean;
  onSelect: () => void;
}
