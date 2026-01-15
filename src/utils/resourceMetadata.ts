// src/utils/resourceMetadata.ts
import {
  type ResourceMetadata,
  type ResourceType,
  type CategoryInfo,
  type CategoryKey,
} from "../types/rbac.types";

export const RESOURCE_METADATA: Record<ResourceType, ResourceMetadata> = {
  // Workload Resources
  pods: {
    resource: "pods",
    apiGroup: "",
    displayName: "Pods",
    description: "Running containers in the cluster",
    commonVerbs: ["get", "list", "watch", "create", "delete"],
    category: "workload",
  },
  deployments: {
    resource: "deployments",
    apiGroup: "apps",
    displayName: "Deployments",
    description: "Declarative updates for Pods and ReplicaSets",
    commonVerbs: [
      "get",
      "list",
      "watch",
      "create",
      "update",
      "patch",
      "delete",
    ],
    category: "workload",
  },
  replicasets: {
    resource: "replicasets",
    apiGroup: "apps",
    displayName: "ReplicaSets",
    description: "Maintain a stable set of replica Pods",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "workload",
  },
  statefulsets: {
    resource: "statefulsets",
    apiGroup: "apps",
    displayName: "StatefulSets",
    description: "Manage stateful applications",
    commonVerbs: [
      "get",
      "list",
      "watch",
      "create",
      "update",
      "patch",
      "delete",
    ],
    category: "workload",
  },
  daemonsets: {
    resource: "daemonsets",
    apiGroup: "apps",
    displayName: "DaemonSets",
    description: "Ensure Pods run on all nodes",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "workload",
  },
  jobs: {
    resource: "jobs",
    apiGroup: "batch",
    displayName: "Jobs",
    description: "Run-to-completion tasks",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "workload",
  },
  cronjobs: {
    resource: "cronjobs",
    apiGroup: "batch",
    displayName: "CronJobs",
    description: "Scheduled Jobs",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "workload",
  },

  // Configuration Resources
  configmaps: {
    resource: "configmaps",
    apiGroup: "",
    displayName: "ConfigMaps",
    description: "Configuration data for applications",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "config",
  },
  secrets: {
    resource: "secrets",
    apiGroup: "",
    displayName: "Secrets",
    description: "Sensitive data like passwords and tokens",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "config",
  },

  // Network Resources
  services: {
    resource: "services",
    apiGroup: "",
    displayName: "Services",
    description: "Network services exposing pods",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "network",
  },
  ingresses: {
    resource: "ingresses",
    apiGroup: "networking.k8s.io",
    displayName: "Ingresses",
    description: "HTTP/HTTPS routing to services",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "network",
  },
  networkpolicies: {
    resource: "networkpolicies",
    apiGroup: "networking.k8s.io",
    displayName: "Network Policies",
    description: "Network traffic rules for pods",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "network",
  },

  // Storage Resources
  persistentvolumes: {
    resource: "persistentvolumes",
    apiGroup: "",
    displayName: "Persistent Volumes",
    description: "Cluster-wide storage resources",
    commonVerbs: ["get", "list", "watch", "create", "delete"],
    category: "storage",
  },
  persistentvolumeclaims: {
    resource: "persistentvolumeclaims",
    apiGroup: "",
    displayName: "Persistent Volume Claims",
    description: "Requests for storage by pods",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "storage",
  },

  // RBAC Resources
  serviceaccounts: {
    resource: "serviceaccounts",
    apiGroup: "",
    displayName: "Service Accounts",
    description: "Identities for processes running in pods",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "rbac",
  },
  roles: {
    resource: "roles",
    apiGroup: "rbac.authorization.k8s.io",
    displayName: "Roles",
    description: "Namespace-scoped RBAC roles",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "rbac",
  },
  rolebindings: {
    resource: "rolebindings",
    apiGroup: "rbac.authorization.k8s.io",
    displayName: "Role Bindings",
    description: "Bindings of roles to subjects",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "rbac",
  },
  clusterroles: {
    resource: "clusterroles",
    apiGroup: "rbac.authorization.k8s.io",
    displayName: "Cluster Roles",
    description: "Cluster-wide RBAC roles",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "rbac",
  },
  clusterrolebindings: {
    resource: "clusterrolebindings",
    apiGroup: "rbac.authorization.k8s.io",
    displayName: "Cluster Role Bindings",
    description: "Cluster-wide role bindings",
    commonVerbs: ["get", "list", "watch", "create", "update", "delete"],
    category: "rbac",
  },

  // Cluster Resources
  namespaces: {
    resource: "namespaces",
    apiGroup: "",
    displayName: "Namespaces",
    description: "Virtual clusters for resource isolation",
    commonVerbs: ["get", "list", "watch", "create", "delete"],
    category: "cluster",
  },
  nodes: {
    resource: "nodes",
    apiGroup: "",
    displayName: "Nodes",
    description: "Worker machines in the cluster",
    commonVerbs: ["get", "list", "watch"],
    category: "cluster",
  },
  events: {
    resource: "events",
    apiGroup: "",
    displayName: "Events",
    description: "Cluster events and logs",
    commonVerbs: ["get", "list", "watch"],
    category: "cluster",
  },
};

export const VERB_DESCRIPTIONS: Record<string, string> = {
  get: "Read a specific resource by name",
  list: "List all resources of this type",
  watch: "Watch for changes to resources",
  create: "Create new resources",
  update: "Update existing resources (full replacement)",
  patch: "Partially update resources",
  delete: "Delete specific resources",
  deletecollection: "Delete multiple resources at once",
};

export const RESOURCE_CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  workload: { name: "Workloads", icon: "🚀", color: "blue" },
  config: { name: "Configuration", icon: "⚙️", color: "purple" },
  network: { name: "Networking", icon: "🌐", color: "green" },
  storage: { name: "Storage", icon: "💾", color: "yellow" },
  rbac: { name: "RBAC", icon: "🔐", color: "red" },
  cluster: { name: "Cluster", icon: "🏗️", color: "gray" },
};
