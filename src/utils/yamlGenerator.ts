// src/utils/yamlGenerator.ts
import yaml from "js-yaml";
import {
  type RBACManifest,
  type ResourcePermission,
} from "../types/rbac.types";

interface K8sRole {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
  };
  rules: Array<{
    apiGroups: string[];
    resources: string[];
    verbs: string[];
    resourceNames?: string[];
  }>;
}

interface K8sRoleBinding {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
  };
  subjects: Array<{
    kind: string;
    name: string;
    namespace?: string;
    apiGroup?: string;
  }>;
  roleRef: {
    kind: string;
    name: string;
    apiGroup: string;
  };
}

function groupPermissionsByApiGroup(
  permissions: ResourcePermission[],
): Map<string, ResourcePermission[]> {
  const grouped = new Map<string, ResourcePermission[]>();

  for (const permission of permissions) {
    const apiGroup = permission.apiGroup;
    if (!grouped.has(apiGroup)) {
      grouped.set(apiGroup, []);
    }
    grouped.get(apiGroup)!.push(permission);
  }

  return grouped;
}

export function generateRoleYAML(manifest: RBACManifest): string {
  const { role } = manifest;
  const isClusterRole = !role.namespace;

  const groupedPermissions = groupPermissionsByApiGroup(role.permissions);
  const rules: K8sRole["rules"] = [];

  for (const [apiGroup, permissions] of groupedPermissions) {
    const rule: K8sRole["rules"][0] = {
      apiGroups: [apiGroup],
      resources: permissions.map((p) => p.resource),
      verbs: [...new Set(permissions.flatMap((p) => p.verbs))].sort(),
    };

    const resourceNames = permissions
      .flatMap((p) => p.resourceNames || [])
      .filter((name, index, self) => self.indexOf(name) === index);

    if (resourceNames.length > 0) {
      rule.resourceNames = resourceNames;
    }

    rules.push(rule);
  }

  const roleManifest: K8sRole = {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: isClusterRole ? "ClusterRole" : "Role",
    metadata: {
      name: role.name,
      ...(role.namespace && { namespace: role.namespace }),
    },
    rules,
  };

  return yaml.dump(roleManifest, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}

export function generateBindingYAML(manifest: RBACManifest): string {
  const { binding } = manifest;
  const isClusterBinding = !binding.namespace;

  const bindingManifest: K8sRoleBinding = {
    apiVersion: "rbac.authorization.k8s.io/v1",
    kind: isClusterBinding ? "ClusterRoleBinding" : "RoleBinding",
    metadata: {
      name: binding.name,
      ...(binding.namespace && { namespace: binding.namespace }),
    },
    subjects: binding.subjects.map((subject) => ({
      kind: subject.kind,
      name: subject.name,
      ...(subject.namespace && { namespace: subject.namespace }),
      ...(subject.kind !== "ServiceAccount" && {
        apiGroup: "rbac.authorization.k8s.io",
      }),
    })),
    roleRef: {
      kind: binding.roleRef.kind,
      name: binding.roleRef.name,
      apiGroup: "rbac.authorization.k8s.io",
    },
  };

  return yaml.dump(bindingManifest, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
  });
}

export function generateCompleteYAML(manifest: RBACManifest): string {
  const roleYAML = generateRoleYAML(manifest);
  const bindingYAML = generateBindingYAML(manifest);

  return `${roleYAML}---\n${bindingYAML}`;
}

export function downloadYAML(yaml: string, filename: string): void {
  const blob = new Blob([yaml], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
