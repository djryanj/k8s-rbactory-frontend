// src/components/Config/__tests__/test-utils.tsx
import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ConfigProvider } from "../../../context/config";
import { ThemeProvider } from "../../../context/theme";

// Mock the feature flags module
export const mockFeatureFlags = (flags: { CLUSTER_BROWSER?: boolean } = {}) => {
  vi.doMock("../../../utils/featureFlags", () => ({
    FEATURE_FLAGS: {
      CLUSTER_BROWSER: flags.CLUSTER_BROWSER ?? true,
    },
    isFeatureEnabled: (feature: string) => {
      const flagMap: Record<string, boolean> = {
        CLUSTER_BROWSER: flags.CLUSTER_BROWSER ?? true,
      };
      return flagMap[feature] ?? false;
    },
  }));
};

// Mock screen reader announcements
export const mockAnnounceToScreenReader = vi.fn();

// This mock needs to be set up before importing components that use it
vi.mock("../../../utils/accessibility", () => ({
  announceToScreenReader: mockAnnounceToScreenReader,
}));

interface AllProvidersProps {
  children: React.ReactNode;
}

// Wrapper with all necessary providers
const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <ConfigProvider>{children}</ConfigProvider>
    </ThemeProvider>
  );
};

// Custom render function that includes providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

// Re-export everything from React Testing Library
export * from "@testing-library/react";
