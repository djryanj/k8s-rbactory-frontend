// src/test/utils.tsx
import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { RBACProvider } from "../context/rbac";
import { ThemeProvider } from "../context/theme";
import { type RBACManifest } from "../types/rbac.types";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialManifest?: Partial<RBACManifest>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <RBACProvider>{children}</RBACProvider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Export the custom render as the default render
export { renderWithProviders as render };
