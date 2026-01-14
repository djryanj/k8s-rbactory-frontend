// src/components/RoleConfiguration/__tests__/ScopeSelector.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScopeSelector } from "../ScopeSelector";
import {
  renderWithContext,
  mockRBACContext,
  resetAllMocks,
} from "./test-utils";
import { announceToScreenReader } from "../../../utils/accessibility";

describe("ScopeSelector", () => {
  beforeEach(() => {
    resetAllMocks();
    mockRBACContext.manifest.role.isClusterRole = false;
    mockRBACContext.manifest.role.namespace = "default";
  });

  describe("Rendering", () => {
    it("renders the component with correct heading", () => {
      renderWithContext(<ScopeSelector />);

      expect(screen.getByText("Scope")).toBeInTheDocument();
    });

    it("renders both scope options", () => {
      renderWithContext(<ScopeSelector />);

      expect(
        screen.getByLabelText(/namespace-scoped role/i)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/cluster-wide clusterrole/i)
      ).toBeInTheDocument();
    });

    it("shows namespace-scoped as selected by default", () => {
      renderWithContext(<ScopeSelector />);

      const namespaceOption = screen.getByLabelText(/namespace-scoped role/i);
      expect(namespaceOption).toBeChecked();
    });

    it("shows namespace input when namespace-scoped is selected", () => {
      renderWithContext(<ScopeSelector />);

      expect(screen.getByLabelText(/^namespace/i)).toBeInTheDocument();
    });

    it("hides namespace input when cluster-scoped is selected", () => {
      mockRBACContext.manifest.role.isClusterRole = true;

      renderWithContext(<ScopeSelector />);

      expect(screen.queryByLabelText(/^namespace/i)).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls toggleClusterRole when switching to cluster scope", async () => {
      const user = userEvent.setup();
      renderWithContext(<ScopeSelector />);

      const clusterOption = screen.getByLabelText(/cluster-wide clusterrole/i);
      await user.click(clusterOption);

      expect(mockRBACContext.toggleClusterRole).toHaveBeenCalled();
    });

    it("announces scope change to screen readers", async () => {
      const user = userEvent.setup();
      renderWithContext(<ScopeSelector />);

      const clusterOption = screen.getByLabelText(/cluster-wide clusterrole/i);
      await user.click(clusterOption);

      expect(announceToScreenReader).toHaveBeenCalledWith(
        expect.stringContaining("cluster-wide ClusterRole")
      );
    });

    it("calls updateNamespace when namespace input changes", async () => {
      const user = userEvent.setup();
      renderWithContext(<ScopeSelector />);

      const namespaceInput = screen.getByLabelText(/^namespace/i);
      await user.clear(namespaceInput);
      await user.type(namespaceInput, "production");

      expect(mockRBACContext.updateNamespace).toHaveBeenCalledWith(
        "production"
      );
    });

    it("does not call toggleClusterRole when clicking already selected option", async () => {
      const user = userEvent.setup();
      renderWithContext(<ScopeSelector />);

      const namespaceOption = screen.getByLabelText(/namespace-scoped role/i);
      await user.click(namespaceOption);

      expect(mockRBACContext.toggleClusterRole).not.toHaveBeenCalled();
    });
  });

  describe("Validation - Namespace Input", () => {
    it("does not show validation error before namespace is touched", () => {
      mockRBACContext.validationErrors = {
        namespace: "Invalid namespace",
      };

      renderWithContext(<ScopeSelector />);

      expect(screen.queryByText("Invalid namespace")).not.toBeInTheDocument();
    });

    it("shows validation error after namespace input is blurred", async () => {
      const user = userEvent.setup();
      mockRBACContext.validationErrors = {
        namespace: "Invalid namespace",
      };

      renderWithContext(<ScopeSelector />);

      const namespaceInput = screen.getByLabelText(/^namespace/i);
      await user.click(namespaceInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Invalid namespace")).toBeInTheDocument();
      });
    });

    it("resets touched state when switching to cluster scope", async () => {
      const user = userEvent.setup();
      mockRBACContext.validationErrors = {
        namespace: "Invalid namespace",
      };

      renderWithContext(<ScopeSelector />);

      // Touch the namespace field
      const namespaceInput = screen.getByLabelText(/^namespace/i);
      await user.click(namespaceInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Invalid namespace")).toBeInTheDocument();
      });

      // Switch to cluster scope
      const clusterOption = screen.getByLabelText(/cluster-wide clusterrole/i);
      await user.click(clusterOption);

      // Switch back to namespace scope
      mockRBACContext.manifest.role.isClusterRole = false;
      const namespaceOption = screen.getByLabelText(/namespace-scoped role/i);
      await user.click(namespaceOption);

      // Error should not be shown (touched state was reset)
      expect(screen.queryByText("Invalid namespace")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses radio buttons for scope selection", () => {
      renderWithContext(<ScopeSelector />);

      const namespaceOption = screen.getByLabelText(/namespace-scoped role/i);
      const clusterOption = screen.getByLabelText(/cluster-wide clusterrole/i);

      expect(namespaceOption).toHaveAttribute("type", "radio");
      expect(clusterOption).toHaveAttribute("type", "radio");
    });

    it("groups radio buttons with same name", () => {
      renderWithContext(<ScopeSelector />);

      const namespaceOption = screen.getByLabelText(/namespace-scoped role/i);
      const clusterOption = screen.getByLabelText(/cluster-wide clusterrole/i);

      expect(namespaceOption).toHaveAttribute("name", "scope");
      expect(clusterOption).toHaveAttribute("name", "scope");
    });

    it("has descriptive ARIA labels", () => {
      renderWithContext(<ScopeSelector />);

      expect(screen.getByLabelText(/namespace-scoped role/i)).toHaveAttribute(
        "aria-describedby",
        "namespace-scope-description"
      );
      expect(
        screen.getByLabelText(/cluster-wide clusterrole/i)
      ).toHaveAttribute("aria-describedby", "cluster-scope-description");
    });

    it("marks namespace input as required", () => {
      renderWithContext(<ScopeSelector />);

      const namespaceInput = screen.getByLabelText(/^namespace/i);
      expect(namespaceInput).toBeRequired();
    });
  });

  describe("Visual Feedback", () => {
    it("shows 'Selected' badge on active option", () => {
      renderWithContext(<ScopeSelector />);

      const badges = screen.getAllByText("Selected");
      expect(badges).toHaveLength(1);
    });

    it("moves 'Selected' badge when switching options", async () => {
      const user = userEvent.setup();
      mockRBACContext.manifest.role.isClusterRole = false;

      const { rerender } = renderWithContext(<ScopeSelector />);

      expect(screen.getByText("Selected")).toBeInTheDocument();

      // Switch to cluster scope
      const clusterOption = screen.getByLabelText(/cluster-wide clusterrole/i);
      await user.click(clusterOption);

      // Update mock and rerender
      mockRBACContext.manifest.role.isClusterRole = true;
      rerender(<ScopeSelector />);

      const badges = screen.getAllByText("Selected");
      expect(badges).toHaveLength(1);
    });
  });
});
