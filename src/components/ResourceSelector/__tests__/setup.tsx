// src/components/ResourceSelector/__tests__/setup.tsx
import { vi } from "vitest";
import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import { RBACProvider } from "../../../context/rbac/RBACProvider";

// Mock the RBAC context with controllable state
export const mockRBACContext = {
  manifest: {
    role: {
      name: "test-role",
      isClusterRole: false,
      namespace: "default",
      permissions: [],
    },
    binding: {
      name: "test-binding",
      namespace: "default",
      roleRef: {
        kind: "Role" as const,
        name: "test-role",
      },
      subjects: [],
    },
  },
  validationErrors: {},
  updateRoleName: vi.fn(),
  updateBindingName: vi.fn(),
  toggleClusterRole: vi.fn(),
  updateNamespace: vi.fn(),
  addPermission: vi.fn(),
  removePermission: vi.fn(),
  updatePermissionVerbs: vi.fn(),
  clearPermissionVerbs: vi.fn(),
  addSubject: vi.fn(),
  removeSubject: vi.fn(),
  loadPreset: vi.fn(),
  resetManifest: vi.fn(),
  exportYAML: vi.fn(),
};

// Custom render with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <RBACProvider>{children}</RBACProvider>;
  }

  return render(ui, {
    wrapper: Wrapper,
    ...options,
  });
}

// Mock useMediaQuery hook
export const mockUseMediaQuery = (matches: boolean) => {
  vi.mock("../../../hooks/useMediaQuery", () => ({
    useMediaQuery: () => matches,
  }));
};

// Helper to reset all mocks in the context
export const resetMockRBACContext = () => {
  mockRBACContext.manifest.role.permissions = [];
  mockRBACContext.validationErrors = {};

  // Reset all mock functions
  Object.entries(mockRBACContext).forEach(([key, value]) => {
    if (typeof value === "function" && "mockClear" in value) {
      (value as any).mockClear();
    }
  });
};
