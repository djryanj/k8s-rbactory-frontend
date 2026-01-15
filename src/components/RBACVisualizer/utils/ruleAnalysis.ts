// src/components/RBACVisualizer/utils/ruleAnalysis.ts
import type { SecurityLevel } from "@/types/security.types";

interface RuleSecurityIssue {
  severity: SecurityLevel;
  type: string;
  label: string;
}

export const analyzeRule = (rule: {
  apiGroups?: string[];
  resources?: string[];
  verbs?: string[];
  resourceNames?: string[];
}): RuleSecurityIssue | null => {
  // Check for wildcard all (highest severity) - CRITICAL
  const hasWildcardAll =
    rule.resources?.includes("*") &&
    rule.verbs?.includes("*") &&
    (rule.apiGroups?.includes("*") || rule.apiGroups?.includes(""));

  if (hasWildcardAll) {
    return {
      severity: "critical-destructive",
      type: "wildcard-all",
      label: "Full Access (*/*/*)",
    };
  }

  // Check for sensitive resources - CRITICAL
  const sensitiveResources = ["secrets", "configmaps", "serviceaccounts"];
  const hasSensitiveResources = rule.resources?.some((r) =>
    sensitiveResources.includes(r),
  );

  if (hasSensitiveResources) {
    const dangerousVerbs = [
      "get",
      "list",
      "watch",
      "create",
      "update",
      "patch",
      "delete",
    ];
    const hasDangerousAccess = rule.verbs?.some((v) =>
      dangerousVerbs.includes(v),
    );

    if (hasDangerousAccess) {
      return {
        severity: "critical-sensitive",
        type: "sensitive-resources",
        label: "Sensitive Resources",
      };
    }
  }

  // Check for destructive permissions - CRITICAL
  const dangerousVerbs = ["delete", "deletecollection"];
  const hasDestructiveVerbs = rule.verbs?.some((v) =>
    dangerousVerbs.includes(v),
  );

  if (hasDestructiveVerbs) {
    return {
      severity: "critical-destructive",
      type: "destructive",
      label: "Destructive Permissions",
    };
  }

  // Check for privilege escalation - HIGH
  const rbacResources = [
    "roles",
    "clusterroles",
    "rolebindings",
    "clusterrolebindings",
  ];
  const hasRbacResources = rule.resources?.some((r) =>
    rbacResources.includes(r),
  );

  if (hasRbacResources) {
    const canModify = rule.verbs?.some((v) =>
      ["create", "update", "patch", "delete", "bind", "escalate"].includes(v),
    );

    if (canModify) {
      return {
        severity: "high",
        type: "privilege-escalation",
        label: "Privilege Escalation",
      };
    }
  }

  // Check for wildcard verbs - MEDIUM
  const hasWildcardVerbs = rule.verbs?.includes("*");
  if (hasWildcardVerbs) {
    return {
      severity: "medium",
      type: "wildcard-verbs",
      label: "Wildcard Verbs",
    };
  }

  // Check for wildcard resources - MEDIUM
  const hasWildcardResources = rule.resources?.includes("*");
  if (hasWildcardResources) {
    return {
      severity: "medium",
      type: "wildcard-resources",
      label: "Wildcard Resources",
    };
  }

  return null;
};
