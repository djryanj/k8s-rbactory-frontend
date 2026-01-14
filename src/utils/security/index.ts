// src/utils/security/index.ts
/**
 * Security utilities for RBAC risk assessment
 * 
 * This module provides comprehensive security risk classification for
 * Kubernetes RBAC verbs and risk level definitions used throughout
 * the application for consistent security analysis and user education.
 * 
 * @module utils/security
 */

// Re-export all types and utilities from centralized security types
export type {
  SecurityLevel,
  VerbCategory,
  VerbClassification,
  SecurityIssue,
  WildcardAllIssue,
  SensitiveResourceIssue,
  DestructivePermissionsIssue,
  ClusterAdminBindingIssue,
  WildcardSubjectIssue,
  AuthenticatedGroupIssue,
  UnauthenticatedGroupIssue,
  PrivilegeEscalationIssue,
  WildcardVerbsIssue,
  WildcardResourcesIssue,
  ClusterBindingIssue,
  ClusterScopeIssue,
  ServiceAccountIssue,
  RiskLevelDefinition,
} from "../../types/security.types";

export {
  isCriticalIssue,
  isHighRiskIssue,
  getIssuePriority,
  sortIssuesBySeverity,
  RISK_LEVEL_DEFINITIONS,
  getRiskLevelDescription,
  getRiskLevelDefinition,
} from "../../types/security.types";

// Verb classification utilities
export {
  classifyVerb,
  getVerbBadgeClasses,
  getVerbsByRiskLevel,
  isHighRiskVerb,
} from "./verbClassification";

// React component (separate export to maintain Fast Refresh)
export { RiskLevelTooltipContent } from "./RiskLevelTooltipContent";
