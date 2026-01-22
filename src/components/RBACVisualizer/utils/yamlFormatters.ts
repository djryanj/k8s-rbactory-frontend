// src/components/RBACVisualizer/utils/yamlFormatters.ts
import type { ClusterRBACResource } from "../../../services/api";
import type { Subject } from "../types";
import type { KubernetesResource, AccessGrant } from "../../../services/api";

export const formatAsYAML = (resource: ClusterRBACResource): string => {
  const lines: string[] = [];

  lines.push(`apiVersion: rbac.authorization.k8s.io/v1`);
  lines.push(`kind: ${resource.kind}`);
  lines.push(`metadata:`);
  lines.push(`  name: ${resource.name}`);

  if (resource.namespace) {
    lines.push(`  namespace: ${resource.namespace}`);
  }

  if (resource.createdAt) {
    lines.push(`  creationTimestamp: ${resource.createdAt}`);
  }

  if (resource.labels && Object.keys(resource.labels).length > 0) {
    lines.push(`  labels:`);
    Object.entries(resource.labels).forEach(([key, value]) => {
      lines.push(`    ${key}: ${value}`);
    });
  }

  if (resource.rules && resource.rules.length > 0) {
    lines.push(`rules:`);
    resource.rules.forEach((rule) => {
      lines.push(`- apiGroups:`);
      (rule.apiGroups || [""]).forEach((group) => {
        lines.push(`  - "${group}"`);
      });
      lines.push(`  resources:`);
      (rule.resources || []).forEach((res) => {
        lines.push(`  - ${res}`);
      });
      lines.push(`  verbs:`);
      (rule.verbs || []).forEach((verb) => {
        lines.push(`  - ${verb}`);
      });
      if (rule.resourceNames && rule.resourceNames.length > 0) {
        lines.push(`  resourceNames:`);
        rule.resourceNames.forEach((name) => {
          lines.push(`  - ${name}`);
        });
      }
    });
  }

  if (resource.subjects && resource.subjects.length > 0) {
    lines.push(`subjects:`);
    resource.subjects.forEach((subject) => {
      lines.push(`- kind: ${subject.kind}`);
      lines.push(`  name: ${subject.name}`);
      if (subject.namespace) {
        lines.push(`  namespace: ${subject.namespace}`);
      }
    });
  }

  if (resource.roleRef) {
    lines.push(`roleRef:`);
    lines.push(`  apiGroup: rbac.authorization.k8s.io`);
    lines.push(`  kind: ${resource.roleRef.kind}`);
    lines.push(`  name: ${resource.roleRef.name}`);
  }

  return lines.join("\n");
};

export const formatServiceAccountYAML = (subject: Subject): string => {
  const lines: string[] = [];

  lines.push(`apiVersion: v1`);
  lines.push(`kind: ServiceAccount`);
  lines.push(`metadata:`);
  lines.push(`  name: ${subject.name}`);

  if (subject.namespace) {
    lines.push(`  namespace: ${subject.namespace}`);
  }

  return lines.join("\n");
};

export const formatMultiDocumentYAML = (
  resources: readonly ClusterRBACResource[],
  subjects?: readonly Subject[],
): string => {
  const documents: string[] = [];

  resources.forEach((resource) => {
    documents.push(formatAsYAML(resource));
  });

  if (subjects) {
    subjects
      .filter((s) => s.kind === "ServiceAccount")
      .forEach((sa) => {
        documents.push(formatServiceAccountYAML(sa));
      });
  }

  return documents.join("\n---\n");
};

export const formatSingleRuleYAML = (
  rule: {
    apiGroups?: string[];
    resources?: string[];
    verbs?: string[];
    resourceNames?: string[];
  },
  ruleIndex: number,
): string => {
  const lines: string[] = [];

  lines.push(`# Rule ${ruleIndex + 1}`);
  lines.push(`- apiGroups:`);
  (rule.apiGroups || [""]).forEach((group) => {
    lines.push(`  - "${group}"`);
  });
  lines.push(`  resources:`);
  (rule.resources || []).forEach((res) => {
    lines.push(`  - ${res}`);
  });
  lines.push(`  verbs:`);
  (rule.verbs || []).forEach((verb) => {
    lines.push(`  - ${verb}`);
  });
  if (rule.resourceNames && rule.resourceNames.length > 0) {
    lines.push(`  resourceNames:`);
    rule.resourceNames.forEach((name) => {
      lines.push(`  - ${name}`);
    });
  }

  return lines.join("\n");
};

/**
 * Formats an access report for a Kubernetes resource showing all principals
 * with access and their permissions
 */
export const formatAccessReportYAML = (
  resource: KubernetesResource,
  accessGrants: readonly AccessGrant[],
): string => {
  const lines: string[] = [];

  // Header comments
  lines.push(`# Access Report for ${resource.kind}: ${resource.name}`);
  if (resource.namespace) {
    lines.push(`# Namespace: ${resource.namespace}`);
  } else {
    lines.push(`# Scope: Cluster-wide`);
  }
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(``);

  // Resource information
  lines.push(`resource:`);
  lines.push(`  kind: ${resource.kind}`);
  lines.push(`  name: ${resource.name}`);
  if (resource.namespace) {
    lines.push(`  namespace: ${resource.namespace}`);
  }
  if (resource.createdAt) {
    lines.push(`  createdAt: ${resource.createdAt}`);
  }
  lines.push(``);

  // Access summary
  const uniquePrincipals = new Set(
    accessGrants.map(
      (g) =>
        `${g.principal.kind}:${g.principal.name}:${g.principal.namespace || ""}`
    )
  );
  
  lines.push(`access_summary:`);
  lines.push(`  total_principals: ${uniquePrincipals.size}`);
  lines.push(`  total_grants: ${accessGrants.length}`);
  
  // Count by scope
  const clusterGrants = accessGrants.filter((g) => g.scope === "cluster");
  const namespaceGrants = accessGrants.filter((g) => g.scope === "namespace");
  
  if (clusterGrants.length > 0 || namespaceGrants.length > 0) {
    lines.push(`  by_scope:`);
    if (namespaceGrants.length > 0) {
      lines.push(`    namespace: ${namespaceGrants.length}`);
    }
    if (clusterGrants.length > 0) {
      lines.push(`    cluster: ${clusterGrants.length}`);
    }
  }
  
  lines.push(``);

  // Group grants by principal
  const principalMap = new Map<string, AccessGrant[]>();
  accessGrants.forEach((grant) => {
    const key = `${grant.principal.kind}:${grant.principal.name}:${grant.principal.namespace || ""}`;
    if (!principalMap.has(key)) {
      principalMap.set(key, []);
    }
    principalMap.get(key)!.push(grant);
  });

  // Sort principals by kind, then name
const sortedPrincipals = Array.from(principalMap.entries()).sort(
  ([keyA], [keyB]) => {
    // Parse principal keys (format: "kind:name:namespace")
    const parseKey = (key: string): { kind: string; name: string } => {
      const [kind = "", name = ""] = key.split(":");
      return { kind, name };
    };
    
    const principalA = parseKey(keyA);
    const principalB = parseKey(keyB);
    
    // Sort by kind first, then by name
    if (principalA.kind !== principalB.kind) {
      return principalA.kind.localeCompare(principalB.kind);
    }
    return principalA.name.localeCompare(principalB.name);
  }
);

  // Principals section
  lines.push(`principals:`);
  
sortedPrincipals.forEach(([_principalKey, grants]) => {
  if (grants.length === 0) return;
  
  // Get principal info from first grant (all grants for same principal)
  const firstGrant = grants[0];
  if (!firstGrant) return;
  
  const principal = firstGrant.principal;
  
  lines.push(`- kind: ${principal.kind}`);
  lines.push(`  name: ${principal.name}`);
  if (principal.namespace) {
    lines.push(`  namespace: ${principal.namespace}`);
  }
  
  // Collect all unique verbs for this principal
  const allVerbs = new Set<string>();
  grants.forEach((g) => g.verbs.forEach((v) => allVerbs.add(v)));
  const sortedVerbs = Array.from(allVerbs).sort();
  
  lines.push(`  verbs:`);
  sortedVerbs.forEach((verb) => {
    lines.push(`  - ${verb}`);
  });
  
  // List all bindings that grant access
  lines.push(`  via_bindings:`);
  grants.forEach((grant) => {
    lines.push(`  - binding:`);
    lines.push(`      kind: ${grant.binding.kind}`);
    lines.push(`      name: ${grant.binding.name}`);
    if (grant.binding.namespace) {
      lines.push(`      namespace: ${grant.binding.namespace}`);
    }
    lines.push(`    role:`);
    lines.push(`      kind: ${grant.role.kind}`);
    lines.push(`      name: ${grant.role.name}`);
    if (grant.role.namespace) {
      lines.push(`      namespace: ${grant.role.namespace}`);
    }
    lines.push(`    scope: ${grant.scope}`);
    lines.push(`    verbs:`);
    grant.verbs.forEach((verb) => {
      lines.push(`    - ${verb}`);
    });
  });
});

  return lines.join("\n");
};

