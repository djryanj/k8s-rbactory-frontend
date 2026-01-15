// src/utils/clusterResourceTransformer.ts
import type { ClusterRBACResource } from "../services/api";
import type {
  RBACManifest,
  ResourcePermission,
  ResourceType,
  VerbType,
  Subject,
} from "../types/rbac.types";

/**
 * Maps a Kubernetes resource name to our ResourceType
 * Handles pluralization and common variations
 */
const mapToResourceType = (resource: string): ResourceType | null => {
  const resourceMap: Record<string, ResourceType> = {
    pods: "pods",
    services: "services",
    deployments: "deployments",
    configmaps: "configmaps",
    secrets: "secrets",
    namespaces: "namespaces",
    nodes: "nodes",
    persistentvolumes: "persistentvolumes",
    persistentvolumeclaims: "persistentvolumeclaims",
    serviceaccounts: "serviceaccounts",
    roles: "roles",
    rolebindings: "rolebindings",
    replicasets: "replicasets",
    statefulsets: "statefulsets",
    daemonsets: "daemonsets",
    jobs: "jobs",
    cronjobs: "cronjobs",
    ingresses: "ingresses",
    networkpolicies: "networkpolicies",
    events: "events",
    clusterroles: "clusterroles",
    clusterrolebindings: "clusterrolebindings",
  };

  return resourceMap[resource.toLowerCase()] || null;
};

/**
 * Validates and maps verb to VerbType
 */
const mapToVerbType = (verb: string): VerbType | null => {
  const validVerbs: VerbType[] = [
    "get",
    "list",
    "watch",
    "create",
    "update",
    "patch",
    "delete",
    "deletecollection",
  ];

  const lowerVerb = verb.toLowerCase() as VerbType;
  return validVerbs.includes(lowerVerb) ? lowerVerb : null;
};

/**
 * Transforms cluster PolicyRules into ResourcePermissions
 * Groups by resource and apiGroup for cleaner output
 */
const transformRulesToPermissions = (
  rules?: Array<{
    apiGroups: string[];
    resources: string[];
    resourceNames?: string[];
    verbs: string[];
  }>,
): ResourcePermission[] => {
  if (!rules || rules.length === 0) return [];

  const permissionsMap = new Map<string, ResourcePermission>();

  for (const rule of rules) {
    const { apiGroups, resources, verbs, resourceNames } = rule;

    // Process each resource in the rule
    for (const resource of resources) {
      const resourceType = mapToResourceType(resource);
      if (!resourceType) {
        console.warn(`Unknown resource type: ${resource}, skipping`);
        continue;
      }

      // Process each API group
      for (const apiGroup of apiGroups) {
        const key = `${resourceType}-${apiGroup}`;

        // Get or create permission entry
        let permission = permissionsMap.get(key);
        if (!permission) {
          permission = {
            resource: resourceType,
            apiGroup: apiGroup || "", // Empty string for core API group
            verbs: [],
            ...(resourceNames && resourceNames.length > 0 && { resourceNames }),
          };
          permissionsMap.set(key, permission);
        }

        // Add verbs (deduplicated)
        const mappedVerbs = verbs
          .map(mapToVerbType)
          .filter((v): v is VerbType => v !== null);

        permission.verbs = [
          ...new Set([...permission.verbs, ...mappedVerbs]),
        ].sort();

        // Merge resourceNames if present
        if (resourceNames && resourceNames.length > 0) {
          const existingNames = permission.resourceNames || [];
          permission.resourceNames = [
            ...new Set([...existingNames, ...resourceNames]),
          ];
        }
      }
    }
  }

  return Array.from(permissionsMap.values());
};

/**
 * Transforms cluster subjects to policy builder subjects
 */
const transformSubjects = (
  subjects?: Array<{
    kind: string;
    name: string;
    namespace?: string;
  }>,
): Subject[] => {
  if (!subjects || subjects.length === 0) return [];

  return subjects
    .filter(
      (s) =>
        s.kind === "User" || s.kind === "Group" || s.kind === "ServiceAccount",
    )
    .map((subject) => ({
      kind: subject.kind as "User" | "Group" | "ServiceAccount",
      name: subject.name,
      ...(subject.namespace && { namespace: subject.namespace }),
    }));
};

/**
 * Main transformation function: ClusterRBACResource → RBACManifest
 */
export const transformClusterResourceToManifest = (
  resource: ClusterRBACResource,
  relatedRole?: ClusterRBACResource,
  relatedBindings?: ClusterRBACResource[],
): RBACManifest => {
  const isRole = resource.kind === "Role" || resource.kind === "ClusterRole";
  const isBinding =
    resource.kind === "RoleBinding" || resource.kind === "ClusterRoleBinding";

  let roleResource: ClusterRBACResource;
  let bindingResource: ClusterRBACResource | undefined;

  if (isRole) {
    roleResource = resource;
    bindingResource = relatedBindings?.[0]; // Take first binding if available
  } else if (isBinding) {
    roleResource = relatedRole || resource; // Fallback to binding if no role
    bindingResource = resource;
  } else {
    // For principals (User/Group/ServiceAccount), use related resources
    roleResource = relatedRole || {
      kind: "Role",
      name: `${resource.name}-role`,
      namespace: resource.namespace || "default",
      rules: [],
      createdAt: new Date().toISOString(),
    };
    bindingResource = relatedBindings?.[0];
  }

  // Transform role
  const isClusterRole = roleResource.kind === "ClusterRole";
  const roleName = `${roleResource.name}-copy`;
  const roleNamespace = isClusterRole
    ? "default"
    : roleResource.namespace || "default";

  const permissions = transformRulesToPermissions(roleResource.rules);

  // Transform binding
  const bindingName = bindingResource
    ? `${bindingResource.name}-copy`
    : `${roleName}-binding`;

  const subjects = bindingResource
    ? transformSubjects(bindingResource.subjects)
    : [];

  const manifest: RBACManifest = {
    role: {
      name: roleName,
      isClusterRole,
      namespace: roleNamespace,
      permissions,
    },
    binding: {
      name: bindingName,
      ...(isClusterRole ? {} : { namespace: roleNamespace }),
      roleRef: {
        kind: isClusterRole ? "ClusterRole" : "Role",
        name: roleName,
      },
      subjects,
    },
  };

  return manifest;
};

/**
 * Validates if a manifest has any meaningful content
 */
export const hasManifestContent = (manifest: RBACManifest): boolean => {
  return (
    manifest.role.permissions.length > 0 || manifest.binding.subjects.length > 0
  );
};
