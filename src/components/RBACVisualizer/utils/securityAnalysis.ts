// src/components/RBACVisualizer/utils/securityAnalysis.ts
import type { ClusterRBACResource } from "../../../services/api";
import type {
  SecurityIssue,
  WildcardAllIssue,
  WildcardVerbsIssue,
  WildcardResourcesIssue,
  SensitiveResourceIssue,
  DestructivePermissionsIssue,
  PrivilegeEscalationIssue,
  ClusterScopeIssue,
  ClusterAdminBindingIssue,
  ClusterBindingIssue,
  WildcardSubjectIssue,
  AuthenticatedGroupIssue,
  UnauthenticatedGroupIssue,
  ServiceAccountIssue,
} from "@/types/security.types";

/**
 * Helper function to create a resource-verb mapping
 * Returns a new object without mutating inputs
 */
const createResourceVerbMap = (
  resources: readonly string[],
  verbs: readonly string[],
): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  resources.forEach((resource) => {
    map[resource] = [...verbs];
  });
  return map;
};

/**
 * Helper to deduplicate and return new array
 * Handles empty arrays gracefully
 */
const deduplicateArray = <T>(arr: readonly T[]): T[] => {
  return [...new Set(arr)];
};

/**
 * Helper to safely get array from potentially undefined value
 * Returns empty array if undefined
 */
const safeArray = <T>(arr: T[] | undefined): T[] => {
  return arr || [];
};

export const analyzeRoleSecurity = (
  role: ClusterRBACResource,
): SecurityIssue[] => {
  const issues: SecurityIssue[] = [];

  if (!role.rules) return issues;

  // Check for wildcard all (cluster-admin equivalent) - CRITICAL
  const wildcardRules = role.rules.filter(
    (rule) =>
      rule.resources?.includes("*") &&
      rule.verbs?.includes("*") &&
      (rule.apiGroups?.includes("*") || rule.apiGroups?.includes("")),
  );

  if (wildcardRules.length > 0) {
    const allApiGroups = wildcardRules.flatMap((r) =>
      safeArray(r.apiGroups).length > 0 ? r.apiGroups! : ["*"],
    );

    const issue: WildcardAllIssue = {
      severity: "critical-destructive",
      title: "Cluster Admin Equivalent",
      description:
        "This role grants full access to all resources (*/*/*)—equivalent to cluster-admin.",
      details: {
        type: "wildcard-all",
        apiGroups: deduplicateArray(allApiGroups),
        resourceVerbMap: {
          "*": ["*"],
        },
        affectedRules: wildcardRules.length,
      },
    };
    issues.push(issue);
  }

  const hasWildcardAll = wildcardRules.length > 0;

  // Check for wildcard verbs - HIGH (not critical, but risky)
  const verbRules = role.rules.filter((rule) => rule.verbs?.includes("*"));
  if (verbRules.length > 0 && !hasWildcardAll) {
    const allResources = verbRules.flatMap((r) => safeArray(r.resources));
    const affectedResources = deduplicateArray(allResources);

    const issue: WildcardVerbsIssue = {
      severity: "high",
      title: "Wildcard Verbs",
      description:
        "This role uses wildcard (*) for verbs, granting all actions on specified resources.",
      details: {
        type: "wildcard-verbs",
        resourceVerbMap: createResourceVerbMap(affectedResources, ["*"]),
        affectedRules: verbRules.length,
      },
    };
    issues.push(issue);
  }

  // Check for wildcard resources - HIGH
  const resourceRules = role.rules.filter((rule) =>
    rule.resources?.includes("*"),
  );
  if (resourceRules.length > 0 && !hasWildcardAll) {
    const allVerbs = resourceRules.flatMap((r) => safeArray(r.verbs));
    const affectedVerbs = deduplicateArray(allVerbs);

    const issue: WildcardResourcesIssue = {
      severity: "high",
      title: "Wildcard Resources",
      description:
        "This role uses wildcard (*) for resources, granting access to all resource types.",
      details: {
        type: "wildcard-resources",
        resourceVerbMap: {
          "*": affectedVerbs,
        },
        affectedRules: resourceRules.length,
      },
    };
    issues.push(issue);
  }

  // Check for sensitive resource access - CRITICAL
  const sensitiveResources = ["secrets", "configmaps", "serviceaccounts"];
  const sensitiveRules = role.rules.filter((rule) =>
    rule.resources?.some((r) => sensitiveResources.includes(r)),
  );

  if (sensitiveRules.length > 0) {
    const dangerousVerbs = [
      "get",
      "list",
      "watch",
      "create",
      "update",
      "patch",
      "delete",
    ];
    const hasDangerousAccess = sensitiveRules.some((rule) =>
      rule.verbs?.some((v) => dangerousVerbs.includes(v)),
    );

    if (hasDangerousAccess) {
      const resourceVerbMap: Record<string, string[]> = {};
      sensitiveRules.forEach((rule) => {
        const resources = safeArray(rule.resources);
        const verbs = safeArray(rule.verbs);

        resources.forEach((resource) => {
          if (sensitiveResources.includes(resource)) {
            if (!resourceVerbMap[resource]) {
              resourceVerbMap[resource] = [];
            }
            resourceVerbMap[resource].push(...verbs);
          }
        });
      });

      // Deduplicate verbs for each resource
      Object.keys(resourceVerbMap).forEach((resource) => {
        const currentVerbs = resourceVerbMap[resource] || [];
        resourceVerbMap[resource] = deduplicateArray(currentVerbs);
      });

      const issue: SensitiveResourceIssue = {
        severity: "critical-sensitive",
        title: "Sensitive Resource Access",
        description:
          "This role grants access to sensitive resources like secrets, configmaps, or serviceaccounts.",
        details: {
          type: "sensitive-resources",
          resourceVerbMap,
          affectedRules: sensitiveRules.length,
        },
      };
      issues.push(issue);
    }
  }

  // Check for destructive permissions - CRITICAL
  const dangerousVerbs = ["delete", "deletecollection"];
  const destructiveRules = role.rules.filter((rule) =>
    rule.verbs?.some((v) => dangerousVerbs.includes(v)),
  );

  if (destructiveRules.length > 0) {
    const resourceVerbMap: Record<string, string[]> = {};

    destructiveRules.forEach((rule) => {
      const verbs = safeArray(rule.verbs);
      const resources = safeArray(rule.resources);
      const destructiveVerbsInRule = verbs.filter((v) =>
        dangerousVerbs.includes(v),
      );

      resources.forEach((resource) => {
        if (!resourceVerbMap[resource]) {
          resourceVerbMap[resource] = [];
        }
        resourceVerbMap[resource].push(...destructiveVerbsInRule);
      });
    });

    // Deduplicate verbs for each resource
    Object.keys(resourceVerbMap).forEach((resource) => {
      const currentVerbs = resourceVerbMap[resource] || [];
      resourceVerbMap[resource] = deduplicateArray(currentVerbs);
    });

    const issue: DestructivePermissionsIssue = {
      severity: "critical-destructive",
      title: "Destructive Permissions",
      description:
        "This role includes delete or deletecollection verbs, which can permanently remove resources.",
      details: {
        type: "destructive-verbs",
        resourceVerbMap,
        affectedRules: destructiveRules.length,
      },
    };
    issues.push(issue);
  }

  // Check for RBAC modification capabilities - HIGH (privilege escalation)
  const rbacResources = [
    "roles",
    "clusterroles",
    "rolebindings",
    "clusterrolebindings",
  ];
  const escalationRules = role.rules.filter((rule) =>
    rule.resources?.some((r) => rbacResources.includes(r)),
  );

  if (escalationRules.length > 0) {
    const canModify = escalationRules.some((rule) =>
      rule.verbs?.some((v) =>
        ["create", "update", "patch", "delete", "bind", "escalate"].includes(v),
      ),
    );

    if (canModify) {
      const resourceVerbMap: Record<string, string[]> = {};
      escalationRules.forEach((rule) => {
        const resources = safeArray(rule.resources);
        const verbs = safeArray(rule.verbs);

        resources.forEach((resource) => {
          if (rbacResources.includes(resource)) {
            if (!resourceVerbMap[resource]) {
              resourceVerbMap[resource] = [];
            }
            resourceVerbMap[resource].push(...verbs);
          }
        });
      });

      // Deduplicate verbs for each resource
      Object.keys(resourceVerbMap).forEach((resource) => {
        const currentVerbs = resourceVerbMap[resource] || [];
        resourceVerbMap[resource] = deduplicateArray(currentVerbs);
      });

      const issue: PrivilegeEscalationIssue = {
        severity: "high",
        title: "Privilege Escalation Risk",
        description:
          "This role can modify RBAC resources, potentially allowing privilege escalation.",
        details: {
          type: "rbac-modification",
          resourceVerbMap,
          affectedRules: escalationRules.length,
        },
      };
      issues.push(issue);
    }
  }

  // Check for cluster-wide scope - LOW
  if (role.kind === "ClusterRole") {
    const nonRbacRules = role.rules.filter(
      (rule) =>
        !rule.resources?.every((r) => rbacResources.includes(r)) &&
        rule.resources?.length,
    );

    if (nonRbacRules.length > 0) {
      const issue: ClusterScopeIssue = {
        severity: "low",
        title: "Cluster-Wide Scope",
        description:
          "This is a ClusterRole with access across all namespaces. Ensure this is intentional.",
        details: {
          type: "cluster-scope",
          affectedRules: nonRbacRules.length,
          namespaceCount: "all",
        },
      };
      issues.push(issue);
    }
  }

  return issues;
};

export const analyzeBindingSecurity = (
  binding: ClusterRBACResource,
  role?: ClusterRBACResource,
): SecurityIssue[] => {
  const issues: SecurityIssue[] = [];

  // Check for cluster-admin binding - CRITICAL
  if (binding.roleRef?.name === "cluster-admin") {
    const subjects = safeArray(binding.subjects);
    const issue: ClusterAdminBindingIssue = {
      severity: "critical-destructive",
      title: "Cluster Admin Binding",
      description:
        "This binding grants cluster-admin privileges—full control over the cluster.",
      details: {
        type: "cluster-admin-binding",
        roleName: "cluster-admin",
        subjectCount: subjects.length,
        subjects: subjects.map((s) => `${s.kind}:${s.name}`),
      },
    };
    issues.push(issue);
  }

  // Check for cluster-wide binding - MEDIUM
  if (binding.kind === "ClusterRoleBinding") {
    const subjects = safeArray(binding.subjects);
    const issue: ClusterBindingIssue = {
      severity: "medium",
      title: "Cluster-Wide Binding",
      description:
        "This ClusterRoleBinding grants permissions across all namespaces.",
      details: {
        type: "cluster-binding",
        subjectCount: subjects.length,
        subjects: subjects.map((s) => `${s.kind}:${s.name}`),
        ...(binding.roleRef?.name && { roleName: binding.roleRef.name }),
      },
    };
    issues.push(issue);
  }

  // Check for wildcard subjects - CRITICAL
  const wildcardSubjects = safeArray(binding.subjects).filter(
    (s) => s.name === "*" || s.name.includes("*"),
  );

  if (wildcardSubjects.length > 0) {
    const issue: WildcardSubjectIssue = {
      severity: "critical-destructive",
      title: "Wildcard Subject",
      description:
        "This binding uses wildcard in subject names, which may grant unintended access.",
      details: {
        type: "wildcard-subject",
        subjects: wildcardSubjects.map((s) => `${s.kind}:${s.name}`),
        ...(binding.roleRef?.name && { roleName: binding.roleRef.name }),
      },
    };
    issues.push(issue);
  }

  // Check for system:authenticated group - CRITICAL
  const hasAuthenticatedGroup = safeArray(binding.subjects).some(
    (s) => s.kind === "Group" && s.name === "system:authenticated",
  );

  if (hasAuthenticatedGroup) {
    const issue: AuthenticatedGroupIssue = {
      severity: "critical-destructive",
      title: "All Authenticated Users",
      description:
        "This binding grants permissions to all authenticated users in the cluster.",
      details: {
        type: "authenticated-group",
        groupName: "system:authenticated",
        subjects: ["Group:system:authenticated"],
        ...(binding.roleRef?.name && { roleName: binding.roleRef.name }),
      },
    };
    issues.push(issue);
  }

  // Check for system:unauthenticated group - CRITICAL
  const hasUnauthenticatedGroup = safeArray(binding.subjects).some(
    (s) => s.kind === "Group" && s.name === "system:unauthenticated",
  );

  if (hasUnauthenticatedGroup) {
    const issue: UnauthenticatedGroupIssue = {
      severity: "critical-destructive",
      title: "Unauthenticated Access",
      description:
        "This binding grants permissions to unauthenticated users—a serious security risk.",
      details: {
        type: "unauthenticated-group",
        groupName: "system:unauthenticated",
        subjects: ["Group:system:unauthenticated"],
        ...(binding.roleRef?.name && { roleName: binding.roleRef.name }),
      },
    };
    issues.push(issue);
  }

  // Include role-level issues if role is provided
  if (role) {
    const roleIssues = analyzeRoleSecurity(role);
    issues.push(...roleIssues);
  }

  return issues;
};

export const analyzePrincipalSecurity = (
  principal: ClusterRBACResource,
  roles: readonly ClusterRBACResource[],
): SecurityIssue[] => {
  const issues: SecurityIssue[] = [];

  // Aggregate all role issues
  const allRoleIssues = roles.flatMap((role) => analyzeRoleSecurity(role));

  // Deduplicate issues by title and type
  const uniqueIssues = allRoleIssues.filter(
    (issue, index, self) =>
      index ===
      self.findIndex(
        (i) => i.title === issue.title && i.details.type === issue.details.type,
      ),
  );

  // Add context that these are inherited from roles
  const contextualizedIssues: SecurityIssue[] = uniqueIssues.map((issue) => ({
    ...issue,
    description: `${issue.description} (inherited from bound roles)`,
  }));

  issues.push(...contextualizedIssues);

  // Add service account specific notice - LOW
  if (principal.kind === "ServiceAccount") {
    const issue: ServiceAccountIssue = {
      severity: "low",
      title: "Service Account",
      description:
        "This is a service account. Ensure it follows the principle of least privilege.",
      details: {
        type: "service-account",
        name: principal.name,
        ...(principal.namespace && { namespace: principal.namespace }),
      },
    };
    issues.push(issue);
  }

  return issues;
};
