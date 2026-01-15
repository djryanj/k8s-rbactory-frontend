// src/components/RBACVisualizer/utils/yamlFormatters.ts
import type { ClusterRBACResource } from "../../../services/api";
import type { Subject } from "../types";

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
