// src/context/rbac/RBACProvider.tsx
import React, { useState, useCallback } from "react";
import type {
  RBACManifest,
  ResourcePermission,
  VerbType,
  Subject,
} from "../../types/rbac.types";
import { RBACContext, type ValidationErrors } from "./RBACContext";
import { generateRoleYAML } from "../../utils/yamlGenerator";

const initialManifest: RBACManifest = {
  role: {
    name: "my-role",
    isClusterRole: false,
    namespace: "default",
    permissions: [],
  },
  binding: {
    name: "my-role-binding",
    roleRef: {
      kind: "Role",
      name: "my-role",
    },
    subjects: [],
  },
};

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [manifest, setManifest] = useState<RBACManifest>(initialManifest);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  // Add reset counter to track when reset happens
  const [resetCounter, setResetCounter] = useState(0);

  const updateValidationError = useCallback(
    (field: keyof ValidationErrors, error: string | undefined) => {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    },
    [],
  );

  const validateRoleName = useCallback((name: string): string | undefined => {
    if (!name) return "Role name is required";
    if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(name)) {
      return "Role name must be lowercase alphanumeric with hyphens";
    }
    return undefined;
  }, []);

  const validateBindingName = useCallback(
    (name: string): string | undefined => {
      if (!name) return "Binding name is required";
      if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(name)) {
        return "Binding name must be lowercase alphanumeric with hyphens";
      }
      return undefined;
    },
    [],
  );

  const validateNamespace = useCallback(
    (namespace: string): string | undefined => {
      if (!namespace) return "Namespace is required";
      if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(namespace)) {
        return "Namespace must be lowercase alphanumeric with hyphens";
      }
      return undefined;
    },
    [],
  );

  const updateRoleName = useCallback(
    (name: string) => {
      setManifest((prev) => ({
        ...prev,
        role: { ...prev.role, name },
        binding: {
          ...prev.binding,
          roleRef: {
            ...prev.binding.roleRef,
            name,
          },
        },
      }));
      updateValidationError("roleName", validateRoleName(name));
    },
    [validateRoleName, updateValidationError],
  );

  const updateBindingName = useCallback(
    (name: string) => {
      setManifest((prev) => ({
        ...prev,
        binding: { ...prev.binding, name },
      }));
      updateValidationError("bindingName", validateBindingName(name));
    },
    [validateBindingName, updateValidationError],
  );

  const toggleClusterRole = useCallback(() => {
    setManifest((prev) => {
      const newIsClusterRole = !prev.role.isClusterRole;
      return {
        ...prev,
        role: {
          ...prev.role,
          isClusterRole: newIsClusterRole,
        },
        binding: {
          ...prev.binding,
          roleRef: {
            ...prev.binding.roleRef,
            kind: newIsClusterRole ? "ClusterRole" : "Role",
          },
        },
      };
    });
  }, []);

  const updateNamespace = useCallback(
    (namespace: string) => {
      setManifest((prev) => ({
        ...prev,
        role: { ...prev.role, namespace },
      }));
      // Only validate if not a cluster role
      if (!manifest.role.isClusterRole) {
        updateValidationError("namespace", validateNamespace(namespace));
      }
    },
    [manifest.role.isClusterRole, validateNamespace, updateValidationError],
  );

  const addPermission = useCallback((permission: ResourcePermission) => {
    setManifest((prev) => {
      // Check if resource already exists - DUPLICATE PREVENTION
      const exists = prev.role.permissions.some(
        (p) => p.resource === permission.resource,
      );

      if (exists) {
        // Resource already exists - don't add duplicate
        console.warn(
          `Resource ${permission.resource} already exists in permissions`,
        );
        return prev; // Return unchanged state
      }

      // Resource doesn't exist - add it
      return {
        ...prev,
        role: {
          ...prev.role,
          permissions: [...prev.role.permissions, permission],
        },
      };
    });
  }, []);

  const removePermission = useCallback((resource: string) => {
    setManifest((prev) => ({
      ...prev,
      role: {
        ...prev.role,
        permissions: prev.role.permissions.filter(
          (p) => p.resource !== resource,
        ),
      },
    }));
  }, []);

  const updatePermissionVerbs = useCallback(
    (resource: string, verbs: VerbType[]) => {
      setManifest((prev) => ({
        ...prev,
        role: {
          ...prev.role,
          permissions: prev.role.permissions.map((p) =>
            p.resource === resource ? { ...p, verbs } : p,
          ),
        },
      }));
    },
    [],
  );

  const clearPermissionVerbs = (resource: string) => {
    setManifest((prev) => ({
      ...prev,
      role: {
        ...prev.role,
        permissions: prev.role.permissions.map((p) =>
          p.resource === resource ? { ...p, verbs: [] } : p,
        ),
      },
    }));
  };

  const addSubject = useCallback((subject: Subject) => {
    setManifest((prev) => ({
      ...prev,
      binding: {
        ...prev.binding,
        subjects: [...prev.binding.subjects, subject],
      },
    }));
  }, []);

  const removeSubject = useCallback((index: number) => {
    setManifest((prev) => ({
      ...prev,
      binding: {
        ...prev.binding,
        subjects: prev.binding.subjects.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const loadPreset = useCallback(
    (permissions: ResourcePermission[], isClusterRole: boolean) => {
      setManifest((prev) => ({
        ...prev,
        role: {
          ...prev.role,
          permissions,
          isClusterRole,
        },
        binding: {
          ...prev.binding,
          roleRef: {
            ...prev.binding.roleRef,
            kind: isClusterRole ? "ClusterRole" : "Role",
          },
        },
      }));
    },
    [],
  );

  const resetManifest = useCallback(() => {
    setManifest(initialManifest);
    setValidationErrors({});
    // Increment reset counter to signal components
    setResetCounter((prev) => prev + 1);
  }, []);

  const exportYAML = useCallback(() => {
    return generateRoleYAML(manifest);
  }, [manifest]);

  const value = {
    manifest,
    validationErrors,
    resetCounter,
    updateRoleName,
    updateBindingName,
    toggleClusterRole,
    updateNamespace,
    addPermission,
    removePermission,
    updatePermissionVerbs,
    clearPermissionVerbs,
    addSubject,
    removeSubject,
    loadPreset,
    resetManifest,
    exportYAML,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};
