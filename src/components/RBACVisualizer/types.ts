// src/components/RBACVisualizer/types.ts
import type { ClusterRBACResource } from "../../services/api";
import type { RBACManifest } from "../../types/rbac.types";
import type { SecurityIssue } from "../../types/security.types";

export interface Subject {
  kind: string;
  name: string;
  namespace?: string;
}

export type { SecurityIssue };

export interface RBACVisualizerProps {
  manifest?: RBACManifest;
  selectedResource?: ClusterRBACResource | null;
  relatedResources?: {
    role?: ClusterRBACResource;
    binding?: ClusterRBACResource;
    relatedBindings?: ClusterRBACResource[];
    relatedRoles?: ClusterRBACResource[];
  } | null;
  isLoadingRelationships?: boolean;
  mode?: "generator" | "browser";
  onSwitchToPolicyBuilder?: () => void;
}

export interface CopyButtonGroupProps {
  name: string;
  kind: string;
  namespace?: string;
  yaml: string;
  onCopy: (text: string, label: string) => void;
  copiedItem: string | null;
  resourceLabel: string;
}

export interface BrowserModeFooterProps {
  resource: ClusterRBACResource;
  relatedRole?: ClusterRBACResource;
  relatedRoles?: ClusterRBACResource[];
  relatedBindings?: ClusterRBACResource[];
  onSwitchToPolicyBuilder?: () => void;
}

export interface CollapsibleListProps<T> {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  initialShowCount?: number;
  emptyMessage?: string;
  ariaLabel?: string;
}

export interface GeneratorViewProps {
  manifest: RBACManifest;
}

export interface RoleRelationshipViewProps {
  role: ClusterRBACResource;
  bindings: ClusterRBACResource[];
  onSwitchToPolicyBuilder?: () => void;
}

export interface BindingRelationshipViewProps {
  binding: ClusterRBACResource;
  role?: ClusterRBACResource;
  relatedBindings: ClusterRBACResource[];
  onSwitchToPolicyBuilder?: () => void;
}

export interface PrincipalRelationshipViewProps {
  principal: ClusterRBACResource;
  bindings: ClusterRBACResource[];
  roles: ClusterRBACResource[];
  onSwitchToPolicyBuilder?: () => void;
}
