// src/context/rbac/RBACContext.ts
import { createContext } from "react";
import type {
  RBACManifest,
  ResourcePermission,
  VerbType,
  Subject,
} from "../../types/rbac.types";

export interface ValidationErrors {
  roleName?: string;
  bindingName?: string;
  namespace?: string;
  permissions?: string;
  subjects?: string;
}

export interface RBACContextType {
  manifest: RBACManifest;
  validationErrors: ValidationErrors;
  resetCounter: number;
  updateRoleName: (name: string) => void;
  updateBindingName: (name: string) => void;
  toggleClusterRole: () => void;
  updateNamespace: (namespace: string) => void;
  addPermission: (permission: ResourcePermission) => void;
  removePermission: (resource: string) => void;
  updatePermissionVerbs: (resource: string, verbs: VerbType[]) => void;
  clearPermissionVerbs: (resource: string) => void;
  addSubject: (subject: Subject) => void;
  removeSubject: (index: number) => void;
  loadPreset: (
    permissions: ResourcePermission[],
    isClusterRole: boolean,
  ) => void;
  resetManifest: () => void;
  exportYAML: () => string;
}

export const RBACContext = createContext<RBACContextType | undefined>(
  undefined,
);
