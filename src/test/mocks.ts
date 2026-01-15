// src/test/mocks.ts
import { vi } from "vitest";
import type {
  ResourceType,
  VerbType,
  ResourcePermission,
  RBACManifest,
  Subject,
  SubjectType,
} from "../types/rbac.types";

export const createMockPermission = (
  resource: ResourceType = "pods",
  verbs: VerbType[] = [],
): ResourcePermission => ({
  resource,
  apiGroup: "",
  verbs,
});

export const createMockManifest = (): RBACManifest => ({
  role: {
    name: "test-role",
    isClusterRole: false,
    namespace: "default",
    permissions: [] as ResourcePermission[],
  },
  binding: {
    name: "test-binding",
    namespace: "default",
    roleRef: {
      kind: "Role" as const,
      name: "test-role",
    },
    subjects: [] as Subject[],
  },
});

export const mockUseRBAC = () => ({
  manifest: createMockManifest(),
  addPermission: vi.fn(),
  removePermission: vi.fn(),
  updatePermissionVerbs: vi.fn(),
  clearPermissionVerbs: vi.fn(),
  updateRoleName: vi.fn(),
  updateRoleScope: vi.fn(),
  updateBindingName: vi.fn(),
  addSubject: vi.fn(),
  removeSubject: vi.fn(),
  updateSubject: vi.fn(),
  resetManifest: vi.fn(),
  loadPreset: vi.fn(),
});

// Helper to create a mock RBAC context with custom permissions
export const createMockRBACContext = (
  permissions: ResourcePermission[] = [],
) => {
  const manifest: RBACManifest = {
    role: {
      name: "test-role",
      isClusterRole: false,
      namespace: "default",
      permissions: permissions,
    },
    binding: {
      name: "test-binding",
      namespace: "default",
      roleRef: {
        kind: "Role" as const,
        name: "test-role",
      },
      subjects: [] as Subject[],
    },
  };

  return {
    manifest,
    addPermission: vi.fn(),
    removePermission: vi.fn(),
    updatePermissionVerbs: vi.fn(),
    clearPermissionVerbs: vi.fn(),
    updateRoleName: vi.fn(),
    updateRoleScope: vi.fn(),
    updateBindingName: vi.fn(),
    addSubject: vi.fn(),
    removeSubject: vi.fn(),
    updateSubject: vi.fn(),
    resetManifest: vi.fn(),
    loadPreset: vi.fn(),
  };
};

// Helper to create a mock subject
export const createMockSubject = (
  kind: SubjectType = "User",
  name: string = "test-user",
  namespace?: string,
): Subject => {
  const subject: Subject = {
    kind,
    name,
  };

  if (namespace && kind === "ServiceAccount") {
    subject.namespace = namespace;
  }

  return subject;
};

// Preset mock permissions for common scenarios
export const mockPermissions = {
  readPods: (): ResourcePermission =>
    createMockPermission("pods", ["get", "list", "watch"]),
  writePods: (): ResourcePermission =>
    createMockPermission("pods", [
      "get",
      "list",
      "watch",
      "create",
      "update",
      "patch",
      "delete",
    ]),
  readDeployments: (): ResourcePermission =>
    createMockPermission("deployments", ["get", "list", "watch"]),
  writeDeployments: (): ResourcePermission =>
    createMockPermission("deployments", [
      "get",
      "list",
      "watch",
      "create",
      "update",
      "patch",
      "delete",
    ]),
  readServices: (): ResourcePermission =>
    createMockPermission("services", ["get", "list", "watch"]),
  writeServices: (): ResourcePermission =>
    createMockPermission("services", [
      "get",
      "list",
      "watch",
      "create",
      "update",
      "patch",
      "delete",
    ]),
};
