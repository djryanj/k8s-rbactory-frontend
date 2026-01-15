// src/types/kubernetes.types.ts

/**
 * Kubernetes API response types
 * These match the structure returned by the Kubernetes API
 */

export interface K8sMetadata {
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  creationTimestamp: string;
  uid?: string;
  resourceVersion?: string;
}

export interface K8sPolicyRule {
  apiGroups: string[];
  resources: string[];
  resourceNames?: string[];
  verbs: string[];
}

export interface K8sSubject {
  kind: string;
  name: string;
  namespace?: string;
  apiGroup?: string;
}

export interface K8sRoleRef {
  kind: string;
  name: string;
  apiGroup: string;
}

export interface K8sRole {
  kind: "Role";
  apiVersion: string;
  metadata: K8sMetadata;
  rules: K8sPolicyRule[];
}

export interface K8sClusterRole {
  kind: "ClusterRole";
  apiVersion: string;
  metadata: K8sMetadata;
  rules: K8sPolicyRule[];
}

export interface K8sRoleBinding {
  kind: "RoleBinding";
  apiVersion: string;
  metadata: K8sMetadata;
  subjects: K8sSubject[];
  roleRef: K8sRoleRef;
}

export interface K8sClusterRoleBinding {
  kind: "ClusterRoleBinding";
  apiVersion: string;
  metadata: K8sMetadata;
  subjects: K8sSubject[];
  roleRef: K8sRoleRef;
}

export interface K8sNamespace {
  kind: "Namespace";
  apiVersion: string;
  metadata: K8sMetadata;
}

export interface K8sNode {
  kind: "Node";
  apiVersion: string;
  metadata: K8sMetadata;
}

export interface K8sVersion {
  major: string;
  minor: string;
  gitVersion: string;
  gitCommit: string;
  gitTreeState: string;
  buildDate: string;
  goVersion: string;
  compiler: string;
  platform: string;
}

export interface K8sListResponse<T> {
  kind: string;
  apiVersion: string;
  metadata: {
    resourceVersion?: string;
    continue?: string;
  };
  items: T[];
}

// Union type for all RBAC resources
export type K8sRBACResource =
  | K8sRole
  | K8sClusterRole
  | K8sRoleBinding
  | K8sClusterRoleBinding;
