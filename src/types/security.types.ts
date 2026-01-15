// src/types/security.types.ts

/**
 * Unified security risk/severity level system
 * Used across verb classification, security analysis, and UI components
 */
export type SecurityLevel =
  | "critical-destructive" // Immediate, irreversible damage (delete, *, etc.)
  | "critical-sensitive" // Access to sensitive data (secrets, configmaps)
  | "high" // Privilege escalation, impersonation
  | "medium" // Resource modification without escalation
  | "low" // Read-only access
  | "safe"; // Minimal risk operations

/**
 * Verb operation category
 */
export type VerbCategory = "read" | "write" | "admin";

/**
 * Classification of a Kubernetes RBAC verb
 */
export interface VerbClassification {
  risk: SecurityLevel;
  description: string;
  category: VerbCategory;
}

/**
 * Base security issue interface
 */
interface BaseSecurityIssue {
  severity: SecurityLevel;
  title: string;
  description: string;
}

/**
 * Wildcard all access (cluster-admin equivalent)
 */
export interface WildcardAllIssue extends BaseSecurityIssue {
  severity: "critical-destructive";
  details: {
    type: "wildcard-all";
    apiGroups: string[];
    resourceVerbMap: Record<string, string[]>;
    affectedRules: number;
  };
}

/**
 * Access to sensitive resources (secrets, configmaps, etc.)
 */
export interface SensitiveResourceIssue extends BaseSecurityIssue {
  severity: "critical-sensitive";
  details: {
    type: "sensitive-resources";
    resourceVerbMap: Record<string, string[]>;
    affectedRules: number;
  };
}

/**
 * Destructive permissions (delete, deletecollection)
 */
export interface DestructivePermissionsIssue extends BaseSecurityIssue {
  severity: "critical-destructive";
  details: {
    type: "destructive-verbs";
    resourceVerbMap: Record<string, string[]>;
    affectedRules: number;
  };
}

/**
 * Cluster admin binding
 */
export interface ClusterAdminBindingIssue extends BaseSecurityIssue {
  severity: "critical-destructive";
  details: {
    type: "cluster-admin-binding";
    roleName: string;
    subjectCount: number;
    subjects: string[];
  };
}

/**
 * Wildcard subject in binding
 */
export interface WildcardSubjectIssue extends BaseSecurityIssue {
  severity: "critical-destructive";
  details: {
    type: "wildcard-subject";
    subjects: string[];
    roleName?: string;
  };
}

/**
 * System:authenticated group binding
 */
export interface AuthenticatedGroupIssue extends BaseSecurityIssue {
  severity: "critical-destructive";
  details: {
    type: "authenticated-group";
    groupName: string;
    subjects: string[];
    roleName?: string;
  };
}

/**
 * System:unauthenticated group binding
 */
export interface UnauthenticatedGroupIssue extends BaseSecurityIssue {
  severity: "critical-destructive";
  details: {
    type: "unauthenticated-group";
    groupName: string;
    subjects: string[];
    roleName?: string;
  };
}

/**
 * Privilege escalation risk (RBAC modification)
 */
export interface PrivilegeEscalationIssue extends BaseSecurityIssue {
  severity: "high";
  details: {
    type: "rbac-modification";
    resourceVerbMap: Record<string, string[]>;
    affectedRules: number;
  };
}

/**
 * Wildcard verbs
 */
export interface WildcardVerbsIssue extends BaseSecurityIssue {
  severity: "high";
  details: {
    type: "wildcard-verbs";
    resourceVerbMap: Record<string, string[]>;
    affectedRules: number;
  };
}

/**
 * Wildcard resources
 */
export interface WildcardResourcesIssue extends BaseSecurityIssue {
  severity: "high";
  details: {
    type: "wildcard-resources";
    resourceVerbMap: Record<string, string[]>;
    affectedRules: number;
  };
}

/**
 * Cluster-wide binding
 */
export interface ClusterBindingIssue extends BaseSecurityIssue {
  severity: "medium";
  details: {
    type: "cluster-binding";
    subjectCount: number;
    subjects: string[];
    roleName?: string;
  };
}

/**
 * Cluster-wide scope
 */
export interface ClusterScopeIssue extends BaseSecurityIssue {
  severity: "low";
  details: {
    type: "cluster-scope";
    affectedRules: number;
    namespaceCount: string | number;
  };
}

/**
 * Service account notice
 */
export interface ServiceAccountIssue extends BaseSecurityIssue {
  severity: "low";
  details: {
    type: "service-account";
    name: string;
    namespace?: string;
  };
}

/**
 * Discriminated union of all security issue types
 * Provides type-safe access to issue details based on type
 */
export type SecurityIssue =
  | WildcardAllIssue
  | SensitiveResourceIssue
  | DestructivePermissionsIssue
  | ClusterAdminBindingIssue
  | WildcardSubjectIssue
  | AuthenticatedGroupIssue
  | UnauthenticatedGroupIssue
  | PrivilegeEscalationIssue
  | WildcardVerbsIssue
  | WildcardResourcesIssue
  | ClusterBindingIssue
  | ClusterScopeIssue
  | ServiceAccountIssue;

/**
 * Type guard to check if an issue is critical level
 */
export const isCriticalIssue = (issue: SecurityIssue): boolean => {
  return (
    issue.severity === "critical-destructive" ||
    issue.severity === "critical-sensitive"
  );
};

/**
 * Type guard to check if an issue is high risk or above
 */
export const isHighRiskIssue = (issue: SecurityIssue): boolean => {
  return isCriticalIssue(issue) || issue.severity === "high";
};

/**
 * Get numeric priority for sorting issues by severity
 */
export const getIssuePriority = (issue: SecurityIssue): number => {
  const priorityMap: Record<SecurityLevel, number> = {
    "critical-destructive": 6,
    "critical-sensitive": 5,
    high: 4,
    medium: 3,
    low: 2,
    safe: 1,
  };
  return priorityMap[issue.severity] || 0;
};

/**
 * Sort issues by severity (highest first)
 * Returns a new array without mutating the original
 */
export const sortIssuesBySeverity = (
  issues: readonly SecurityIssue[],
): SecurityIssue[] => {
  return [...issues].sort((a, b) => getIssuePriority(b) - getIssuePriority(a));
};

/**
 * Risk level definition for documentation and UI
 */
export interface RiskLevelDefinition {
  title: string;
  description: string;
  examples: string[];
  guidance: string;
  shortDescription: string;
}

/**
 * Comprehensive definitions for each security risk level
 * Used in tooltips, documentation, and security analysis
 */
export const RISK_LEVEL_DEFINITIONS: Record<
  SecurityLevel,
  RiskLevelDefinition
> = {
  "critical-destructive": {
    title: "Critical Risk: Destructive Permissions",
    shortDescription:
      "Can cause immediate, irreversible damage or grant unrestricted access",
    description:
      "Permissions that can cause immediate, irreversible damage or grant unrestricted access to the cluster.",
    examples: [
      "delete - Permanently removes resources",
      "deletecollection - Removes multiple resources at once",
      "* (wildcard) - Grants all possible actions",
    ],
    guidance:
      "Use extreme caution. These permissions should only be granted to cluster administrators or automated systems with strict controls.",
  },
  "critical-sensitive": {
    title: "Critical Risk: Sensitive Resource Access",
    shortDescription: "Allows access to potentially sensitive data",
    description:
      "Permissions that allow access to potentially sensitive data that could be used to exfiltrate other data or in a privilege escalation attack. This applies more to the types of resource being accessed.",
    examples: [
      "get (secret) - Get secret contents, e.g., database credentials",
      "get (configmap) - Get endpoint or other configurations",
    ],
    guidance:
      "Use extreme caution. These permissions should only be granted to cluster administrators or automated systems with strict controls.",
  },
  high: {
    title: "High Risk",
    shortDescription:
      "Enables privilege escalation, impersonation, or security bypass",
    description:
      "Permissions that enable privilege escalation, impersonation, or can modify security-critical resources.",
    examples: [
      "escalate - Can grant higher privileges",
      "bind - Can assign roles to users/groups",
      "impersonate - Can act as other users",
    ],
    guidance:
      "Carefully review who receives these permissions. They can be used to bypass security controls or gain unauthorized access.",
  },
  medium: {
    title: "Medium Risk",
    shortDescription:
      "Allows resource modification without direct privilege escalation",
    description:
      "Permissions that allow modification of resources but don't directly enable privilege escalation.",
    examples: [
      "create - Can create new resources",
      "update - Can modify existing resources",
      "patch - Can partially update resources",
    ],
    guidance:
      "Standard operational permissions. Grant based on job function and principle of least privilege.",
  },
  low: {
    title: "Low Risk",
    shortDescription: "Read-only access without modification capabilities",
    description:
      "Read-only permissions that allow viewing resources without modification capabilities.",
    examples: [
      "get - Read individual resources",
      "list - View multiple resources",
      "watch - Monitor resource changes",
    ],
    guidance:
      "Generally safe for most users. Consider data sensitivity when granting access to secrets or sensitive resources.",
  },
  safe: {
    title: "Safe",
    shortDescription: "Minimal risk operations",
    description:
      "Operations with minimal security impact, typically informational or highly restricted in scope.",
    examples: [
      "use - Can use resources (typically safe)",
      "Custom verbs - Application-specific operations",
    ],
    guidance:
      "These permissions are generally safe but should still be granted based on need.",
  },
};

/**
 * Get a short description for a risk level
 * Useful for inline display without full tooltip
 */
export const getRiskLevelDescription = (level: SecurityLevel): string => {
  return RISK_LEVEL_DEFINITIONS[level].shortDescription;
};

/**
 * Get the risk level definition by risk level key
 */
export const getRiskLevelDefinition = (
  level: SecurityLevel,
): RiskLevelDefinition => {
  return RISK_LEVEL_DEFINITIONS[level];
};
