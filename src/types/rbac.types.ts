// src/types/rbac.types.ts

/**
 * Core RBAC type definitions
 * These types ensure type safety throughout the application
 */

export type ResourceType =
  | "pods"
  | "services"
  | "deployments"
  | "configmaps"
  | "secrets"
  | "namespaces"
  | "nodes"
  | "persistentvolumes"
  | "persistentvolumeclaims"
  | "serviceaccounts"
  | "roles"
  | "rolebindings"
  | "replicasets"
  | "statefulsets"
  | "daemonsets"
  | "jobs"
  | "cronjobs"
  | "ingresses"
  | "networkpolicies"
  | "events"
  | "clusterroles"
  | "clusterrolebindings";

export type VerbType =
  | "get"
  | "list"
  | "watch"
  | "create"
  | "update"
  | "patch"
  | "delete"
  | "deletecollection";

export type SubjectType = "User" | "Group" | "ServiceAccount";

export interface Subject {
  kind: SubjectType;
  name: string;
  namespace?: string; // Only for ServiceAccount
}

export interface ResourcePermission {
  resource: ResourceType;
  apiGroup: string;
  verbs: VerbType[];
  resourceNames?: string[]; // Optional: restrict to specific resource names
}

export interface RBACRole {
  name: string;
  isClusterRole: boolean;
  namespace: string; // Namespace for Role (ignored if isClusterRole is true)
  permissions: ResourcePermission[];
}

export interface RBACBinding {
  name: string;
  namespace?: string; // undefined means ClusterRoleBinding
  roleRef: {
    kind: "Role" | "ClusterRole";
    name: string;
  };
  subjects: Subject[];
}

export interface RBACManifest {
  role: RBACRole;
  binding: RBACBinding;
}

// Category-related types
export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export type CategoryKey =
  | "workload"
  | "config"
  | "network"
  | "storage"
  | "rbac"
  | "cluster";

// Resource metadata for UI display
export interface ResourceMetadata {
  resource: ResourceType;
  apiGroup: string;
  displayName: string;
  description: string;
  commonVerbs: VerbType[];
  category: CategoryKey;
}
