// src/components/RBACVisualizer/index.ts

// Main component
export { RBACVisualizer } from "./RBACVisualizer";

// Component-specific types (non-security)
export type {
  RBACVisualizerProps,
  Subject,
  GeneratorViewProps,
  RoleRelationshipViewProps,
  BindingRelationshipViewProps,
  PrincipalRelationshipViewProps,
} from "./types";

// Security types - re-export from centralized location
export type {
  SecurityIssue,
  SecurityLevel,
  VerbClassification,
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
} from "../../types/security.types";

export {
  isCriticalIssue,
  isHighRiskIssue,
  getIssuePriority,
  sortIssuesBySeverity,
} from "../../types/security.types";

// Utility functions
export { copyToClipboard } from "./utils/clipboard";
export {
  formatAsYAML,
  formatServiceAccountYAML,
  formatMultiDocumentYAML,
  formatSingleRuleYAML,
} from "./utils/yamlFormatters";

// Security analysis utilities
export {
  analyzeRoleSecurity,
  analyzeBindingSecurity,
  analyzePrincipalSecurity,
} from "./utils/securityAnalysis";
export { analyzeRule } from "./utils/ruleAnalysis";

// Verb classification - re-export from centralized security utils
export {
  classifyVerb,
  getVerbBadgeClasses,
  getVerbsByRiskLevel,
  isHighRiskVerb,
} from "../../utils/security";

// Shared components
export { CopyButtonGroup } from "./shared/CopyButtonGroup";
export { CollapsibleList } from "./shared/CollapsibleList";
export { BrowserModeFooter } from "./shared/BrowserModeFooter";
export { SecurityIssueCard } from "./shared/SecurityIssueCard";
export { SecurityAnalysisPanel } from "./shared/SecurityAnalysisPanel";

// View components
export { GeneratorView } from "./GeneratorView";
export { RoleRelationshipView } from "./RelationshipViews/RoleRelationshipView";
export { BindingRelationshipView } from "./RelationshipViews/BindingRelationshipView";
export { PrincipalRelationshipView } from "./RelationshipViews/PrincipalRelationshipView";
