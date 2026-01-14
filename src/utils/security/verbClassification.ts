// src/utils/security/verbClassification.ts
import type { SecurityLevel, VerbClassification } from "../../types/security.types";

/**
 * Comprehensive verb classification for Kubernetes RBAC
 * Maps each verb to its security risk level and category
 */
const verbClassifications: Record<string, VerbClassification> = {
  // Critical risk - destructive or unrestricted
  "*": {
    risk: "critical-destructive",
    description: "Wildcard - grants all verbs (highest risk)",
    category: "admin",
  },
  delete: {
    risk: "critical-destructive",
    description: "Can permanently delete resources",
    category: "write",
  },
  deletecollection: {
    risk: "critical-destructive",
    description: "Can delete multiple resources at once",
    category: "write",
  },

  // High risk - privilege escalation and modification
  escalate: {
    risk: "high",
    description: "Can escalate privileges (security risk)",
    category: "admin",
  },
  bind: {
    risk: "high",
    description: "Can bind roles (privilege escalation risk)",
    category: "admin",
  },
  impersonate: {
    risk: "high",
    description: "Can impersonate other users (security risk)",
    category: "admin",
  },

  // Medium risk - modification operations
  create: {
    risk: "medium",
    description: "Can create new resources",
    category: "write",
  },
  update: {
    risk: "medium",
    description: "Can update existing resources",
    category: "write",
  },
  patch: {
    risk: "medium",
    description: "Can partially update resources",
    category: "write",
  },

  // Low risk - read operations
  get: {
    risk: "low",
    description: "Can read individual resources",
    category: "read",
  },
  list: {
    risk: "low",
    description: "Can list multiple resources",
    category: "read",
  },
  watch: {
    risk: "low",
    description: "Can watch for resource changes",
    category: "read",
  },

  // Safe - informational only
  use: {
    risk: "safe",
    description: "Can use resources (typically safe)",
    category: "read",
  },
};

/**
 * Classify a verb by its security risk level
 * 
 * @param verb - The Kubernetes RBAC verb to classify
 * @returns Classification with risk level, description, and category
 * 
 * @example
 * ```typescript
 * const classification = classifyVerb("delete");
 * // { risk: "critical-destructive", description: "Can permanently delete resources", category: "write" }
 * ```
 */
export const classifyVerb = (verb: string): VerbClassification => {
  return (
    verbClassifications[verb.toLowerCase()] || {
      risk: "safe",
      description: "Custom or safe verb",
      category: "read",
    }
  );
};

/**
 * Get Tailwind CSS classes for a verb badge based on risk level
 * Provides consistent styling across permission selectors and security analysis
 * 
 * @param verb - The Kubernetes RBAC verb
 * @returns Tailwind CSS class string for the badge
 * 
 * @example
 * ```typescript
 * const classes = getVerbBadgeClasses("delete");
 * // "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 ..."
 * ```
 */
export const getVerbBadgeClasses = (verb: string): string => {
  const classification = classifyVerb(verb);

  switch (classification.risk) {
    case "critical-destructive":
    case "critical-sensitive":
      // Red - critical severity
      return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700";
    case "high":
      // Orange - serious security concerns
      return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700";
    case "medium":
      // Amber - medium risk
      return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700";
    case "low":
      // Blue - low risk, informational
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700";
    case "safe":
    default:
      // Green - safe operations
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700";
  }
};

/**
 * Get all verbs classified at a specific risk level
 * Useful for grouping permissions by risk in UI
 * 
 * @param riskLevel - The risk level to filter by
 * @returns Array of verbs at that risk level
 */
export const getVerbsByRiskLevel = (riskLevel: SecurityLevel): string[] => {
  return Object.entries(verbClassifications)
    .filter(([_, classification]) => classification.risk === riskLevel)
    .map(([verb]) => verb);
};

/**
 * Check if a verb is considered high-risk (critical or high)
 * 
 * @param verb - The verb to check
 * @returns True if the verb is critical or high risk
 */
export const isHighRiskVerb = (verb: string): boolean => {
  const classification = classifyVerb(verb);
  return (
    classification.risk === "critical-destructive" ||
    classification.risk === "critical-sensitive" ||
    classification.risk === "high"
  );
};
