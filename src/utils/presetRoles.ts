// src/utils/presetRoles.ts
import { type PresetRole } from "../types/presets.types";

/**
 * Common preset roles based on Kubernetes default roles
 * and real-world use cases
 */

export const PRESET_ROLES: PresetRole[] = [
  {
    id: "view",
    name: "View (Read-Only)",
    description: "Read-only access to most resources in a namespace",
    isClusterRole: false,
    permissions: [
      {
        resource: "pods",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "services",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "deployments",
        apiGroup: "apps",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "replicasets",
        apiGroup: "apps",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "configmaps",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "events",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
    ],
  },
  {
    id: "edit",
    name: "Edit",
    description: "Read/write access to most resources in a namespace",
    isClusterRole: false,
    permissions: [
      {
        resource: "pods",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "services",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "deployments",
        apiGroup: "apps",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "replicasets",
        apiGroup: "apps",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "configmaps",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "secrets",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "persistentvolumeclaims",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
    ],
  },
  {
    id: "admin",
    name: "Admin",
    description: "Full access to all resources in a namespace, including RBAC",
    isClusterRole: false,
    permissions: [
      {
        resource: "pods",
        apiGroup: "",
        verbs: [
          "get",
          "list",
          "watch",
          "create",
          "update",
          "patch",
          "delete",
          "deletecollection",
        ],
      },
      {
        resource: "services",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "deployments",
        apiGroup: "apps",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "statefulsets",
        apiGroup: "apps",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "configmaps",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "secrets",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "serviceaccounts",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "roles",
        apiGroup: "rbac.authorization.k8s.io",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "rolebindings",
        apiGroup: "rbac.authorization.k8s.io",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
    ],
  },
  {
    id: "cluster-admin",
    name: "Cluster Admin",
    description: "Full cluster-wide administrative access",
    isClusterRole: true,
    permissions: [
      {
        resource: "pods",
        apiGroup: "",
        verbs: [
          "get",
          "list",
          "watch",
          "create",
          "update",
          "patch",
          "delete",
          "deletecollection",
        ],
      },
      {
        resource: "namespaces",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "nodes",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "persistentvolumes",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "clusterroles",
        apiGroup: "rbac.authorization.k8s.io",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "clusterrolebindings",
        apiGroup: "rbac.authorization.k8s.io",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
    ],
  },
  {
    id: "developer",
    name: "Developer",
    description: "Common permissions for application developers",
    isClusterRole: false,
    permissions: [
      {
        resource: "pods",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "delete"],
      },
      {
        resource: "deployments",
        apiGroup: "apps",
        verbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
      },
      {
        resource: "services",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "delete"],
      },
      {
        resource: "configmaps",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update", "delete"],
      },
      {
        resource: "secrets",
        apiGroup: "",
        verbs: ["get", "list"],
      },
      {
        resource: "events",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description: "Permissions for automated deployment pipelines",
    isClusterRole: false,
    permissions: [
      {
        resource: "deployments",
        apiGroup: "apps",
        verbs: ["get", "list", "watch", "create", "update", "patch"],
      },
      {
        resource: "services",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update"],
      },
      {
        resource: "configmaps",
        apiGroup: "",
        verbs: ["get", "list", "watch", "create", "update"],
      },
      {
        resource: "secrets",
        apiGroup: "",
        verbs: ["get", "list", "create", "update"],
      },
      {
        resource: "pods",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
    ],
  },
  {
    id: "monitoring",
    name: "Monitoring",
    description: "Read-only access for monitoring and observability tools",
    isClusterRole: true,
    permissions: [
      {
        resource: "pods",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "nodes",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "services",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "deployments",
        apiGroup: "apps",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "events",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
      {
        resource: "namespaces",
        apiGroup: "",
        verbs: ["get", "list", "watch"],
      },
    ],
  },
];
