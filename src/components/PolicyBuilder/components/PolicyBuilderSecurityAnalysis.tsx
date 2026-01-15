// src/components/PolicyBuilder/components/PolicyBuilderSecurityAnalysis.tsx
import React, { useMemo } from "react";
import { useRBAC } from "../../../context/rbac";
import { analyzeRoleSecurity } from "../../RBACVisualizer/utils/securityAnalysis";
import { SecurityAnalysisPanel } from "../../RBACVisualizer/shared/SecurityAnalysisPanel";

import type { SecurityIssue } from "../../RBACVisualizer/types";
import type { ClusterRBACResource } from "../../../services/api";

/**
 * Real-time security analysis for Policy Builder
 * Provides the same security insights as Cluster Browser
 */
export const PolicyBuilderSecurityAnalysis: React.FC = () => {
  const { manifest } = useRBAC();

  // Convert manifest to ClusterRBACResource format for analysis
  const roleResource: ClusterRBACResource = useMemo(() => {
    const baseResource: ClusterRBACResource = {
      kind: manifest.role.isClusterRole ? "ClusterRole" : "Role",
      name: manifest.role.name,
      createdAt: new Date().toISOString(),
      rules: manifest.role.permissions
        .filter((p) => p.verbs.length > 0)
        .map((p) => ({
          apiGroups: p.apiGroup ? [p.apiGroup] : [""],
          resources: [p.resource],
          verbs: p.verbs,
        })),
      labels: {},
    };

    if (!manifest.role.isClusterRole && manifest.role.namespace) {
      return {
        ...baseResource,
        namespace: manifest.role.namespace,
      };
    }

    return baseResource;
  }, [manifest]);

  // Analyze security issues
  const securityIssues: SecurityIssue[] = useMemo(() => {
    if (!roleResource.rules || roleResource.rules.length === 0) {
      return [];
    }
    return analyzeRoleSecurity(roleResource);
  }, [roleResource]);

  // Don't show if no permissions configured yet
  if (manifest.role.permissions.length === 0) {
    return null;
  }

  // Don't show if no permissions have verbs selected
  const hasActivePermissions = manifest.role.permissions.some(
    (p) => p.verbs.length > 0,
  );
  if (!hasActivePermissions) {
    return null;
  }

  return (
    <SecurityAnalysisPanel
      securityIssues={securityIssues}
      context="policy-builder"
      title="Security Analysis"
      showNote={true}
    />
  );
};
