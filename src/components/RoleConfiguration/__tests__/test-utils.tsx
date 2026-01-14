// src/components/RoleConfiguration/__tests__/test-utils.tsx
import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { vi } from "vitest";
import { type Subject } from "../../../types/rbac.types";

// Define the shape of our manifest
interface MockManifest {
  role: {
    name: string;
    namespace: string;
    isClusterRole: boolean;
    permissions: Array<{
      resource: string;
      verbs: string[];
      apiGroup?: string;
    }>;
  };
  binding: {
    name: string;
    subjects: Subject[];
  };
}

// Define the shape of validation errors
interface ValidationErrors {
  roleName?: string;
  bindingName?: string;
  namespace?: string;
}

// Define the RBAC context interface
interface RBACContextValue {
  manifest: MockManifest;
  validationErrors: ValidationErrors;
  updateRoleName: ReturnType<typeof vi.fn>;
  updateBindingName: ReturnType<typeof vi.fn>;
  updateNamespace: ReturnType<typeof vi.fn>;
  toggleClusterRole: ReturnType<typeof vi.fn>;
  addSubject: ReturnType<typeof vi.fn>;
  removeSubject: ReturnType<typeof vi.fn>;
  addPermission: ReturnType<typeof vi.fn>;
  removePermission: ReturnType<typeof vi.fn>;
  updatePermissionVerbs: ReturnType<typeof vi.fn>;
  loadPreset: ReturnType<typeof vi.fn>;
  resetManifest: ReturnType<typeof vi.fn>;
}

// Mock RBAC context with proper typing
export const mockRBACContext: RBACContextValue = {
  manifest: {
    role: {
      name: "my-role",
      namespace: "default",
      isClusterRole: false,
      permissions: [],
    },
    binding: {
      name: "my-role-binding",
      subjects: [] as Subject[],
    },
  },
  validationErrors: {},
  updateRoleName: vi.fn(),
  updateBindingName: vi.fn(),
  updateNamespace: vi.fn(),
  toggleClusterRole: vi.fn(),
  addSubject: vi.fn(),
  removeSubject: vi.fn(),
  addPermission: vi.fn(),
  removePermission: vi.fn(),
  updatePermissionVerbs: vi.fn(),
  loadPreset: vi.fn(),
  resetManifest: vi.fn(),
};

// Mock the RBAC context hook
vi.mock("../../../context/rbac", () => ({
  useRBAC: () => mockRBACContext,
}));

// Mock accessibility utils
vi.mock("../../../utils/accessibility", () => ({
  announceToScreenReader: vi.fn(),
}));

// Custom render function
export function renderWithContext(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, options);
}

// Helper to reset all mocks
export function resetAllMocks() {
  // Reset function mocks
  mockRBACContext.updateRoleName.mockClear();
  mockRBACContext.updateBindingName.mockClear();
  mockRBACContext.updateNamespace.mockClear();
  mockRBACContext.toggleClusterRole.mockClear();
  mockRBACContext.addSubject.mockClear();
  mockRBACContext.removeSubject.mockClear();
  mockRBACContext.addPermission.mockClear();
  mockRBACContext.removePermission.mockClear();
  mockRBACContext.updatePermissionVerbs.mockClear();
  mockRBACContext.loadPreset.mockClear();
  mockRBACContext.resetManifest.mockClear();

  // Reset manifest to default state
  mockRBACContext.manifest = {
    role: {
      name: "my-role",
      namespace: "default",
      isClusterRole: false,
      permissions: [],
    },
    binding: {
      name: "my-role-binding",
      subjects: [] as Subject[],
    },
  };

  // Reset validation errors
  mockRBACContext.validationErrors = {};
}

// Helper to set subjects in tests
export function setMockSubjects(subjects: Subject[]) {
  mockRBACContext.manifest.binding.subjects = subjects;
}

// Helper to set validation errors
export function setMockValidationErrors(errors: Partial<ValidationErrors>) {
  mockRBACContext.validationErrors = errors;
}

// Helper to set cluster role state
export function setMockClusterRole(isClusterRole: boolean) {
  mockRBACContext.manifest.role.isClusterRole = isClusterRole;
}

// Helper to get closest element with proper typing
export function getClosestElement(
  element: HTMLElement,
  selector: string
): HTMLElement {
  const closest = element.closest(selector);
  if (!closest) {
    throw new Error(`Could not find closest element matching "${selector}"`);
  }
  // Cast to HTMLElement since we know it exists and is an HTML element
  return closest as HTMLElement;
}
