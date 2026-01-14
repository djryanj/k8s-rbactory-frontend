// src/types/api.types.ts

// ============================================================================
// Domain Models - Core Kubernetes RBAC Resources
// ============================================================================

/**
 * Represents a Kubernetes policy rule defining permissions
 */
export interface PolicyRule {
  apiGroups: string[];
  resources: string[];
  resourceNames?: string[];
  verbs: string[];
}

/**
 * Represents a subject (user, group, or service account) in RBAC bindings
 */
export interface Subject {
  kind: string;
  name: string;
  namespace?: string;
}

/**
 * Reference to a Role or ClusterRole
 */
export interface RoleRef {
  kind: string;
  name: string;
  apiGroup: string;
}

/**
 * Unified representation of RBAC resources (Roles, ClusterRoles, RoleBindings, ClusterRoleBindings)
 */
export interface ClusterRBACResource {
  kind: string;
  name: string;
  namespace?: string;
  rules?: PolicyRule[];
  subjects?: Subject[];
  roleRef?: RoleRef;
  labels?: Record<string, string>;
  createdAt: string;
}

/**
 * Represents a principal (user, group, or service account) with aggregated RBAC information
 */
export interface Principal {
  kind: string;
  name: string;
  namespace?: string;
  bindingCount: number;
  roleCount: number;
  bindings?: string[];
  roles?: string[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic paginated response structure used by list endpoints
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasMore?: boolean;
}

/**
 * Response for RBAC resource list endpoints
 */
export interface RBACListResponse {
  items: ClusterRBACResource[];
  totalCount: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

/**
 * Response for principal list endpoints
 */
export interface PrincipalListResponse {
  items: Principal[];
  totalCount: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

/**
 * Response containing relationship information for a resource
 */
export interface RelationshipResponse {
  role?: ClusterRBACResource;
  binding?: ClusterRBACResource;
  relatedBindings: ClusterRBACResource[];
  relatedRoles: ClusterRBACResource[];
}

/**
 * Aggregated counts of RBAC resources in the cluster
 */
export interface ResourceCounts {
  roles: number;
  clusterRoles: number;
  roleBindings: number;
  clusterRoleBindings: number;
  principals: number;
}

/**
 * Basic cluster information
 */
export interface ClusterInfo {
  version: string;
  namespaces: string[];
  nodeCount: number;
}

/**
 * Response from cluster connection check endpoint
 */
export interface ConnectionCheckResponse {
  connected: boolean;
  version?: string;
}

// ============================================================================
// API Client Interface
// ============================================================================

/**
 * Common interface for API clients interacting with Kubernetes RBAC resources
 * This interface defines all available operations for querying and managing RBAC data
 */
export interface IAPIClient {
  // Connection management
  checkConnection(): Promise<boolean>;
  isConnected(): boolean;

  // Cluster information
  getClusterInfo(): Promise<ClusterInfo>;
  listNamespaces(): Promise<string[]>;

  // Resource listing with pagination
  listRoles(
    namespace?: string,
    limit?: number,
    offset?: number
  ): Promise<RBACListResponse>;

  listClusterRoles(
    limit?: number,
    offset?: number
  ): Promise<RBACListResponse>;

  listRoleBindings(
    namespace?: string,
    limit?: number,
    offset?: number
  ): Promise<RBACListResponse>;

  listClusterRoleBindings(
    limit?: number,
    offset?: number
  ): Promise<RBACListResponse>;

  listPrincipals(
    namespace?: string,
    limit?: number,
    offset?: number
  ): Promise<PrincipalListResponse>;

  // Resource counts
  getCounts(): Promise<ResourceCounts>;

  // Individual resource retrieval
  getRole(namespace: string, name: string): Promise<ClusterRBACResource>;
  getClusterRole(name: string): Promise<ClusterRBACResource>;

  // Relationship queries
  getRelationships(
    kind: string,
    namespace: string,
    name: string
  ): Promise<RelationshipResponse>;
}
