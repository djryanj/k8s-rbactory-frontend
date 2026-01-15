// src/components/ResourceSelector/__tests__/PermissionConfigPanel.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PermissionConfigPanel } from "../PermissionConfigPanel";
import { type ResourceType } from "../../../types/rbac.types";

describe("PermissionConfigPanel", () => {
  const mockOnResourceChange = vi.fn();
  const mockOnRemove = vi.fn();

  const defaultProps = {
    permissions: [
      {
        resource: "pods" as ResourceType,
        apiGroup: "",
        verbs: ["get", "list"],
      },
      { resource: "services" as ResourceType, apiGroup: "", verbs: ["get"] },
    ],
    activeResource: "pods" as ResourceType,
    onResourceChange: mockOnResourceChange,
    onRemove: mockOnRemove,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders header with title", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(screen.getByText("Configure Permissions")).toBeInTheDocument();
    });

    it("does NOT render X button in header", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      // Should not have an X button in the header
      const header = screen.getByText("Configure Permissions").closest("div");
      const xButton = header?.querySelector('button[aria-label*="Remove"]');
      expect(xButton).not.toBeInTheDocument();
    });

    it("renders resource information", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(screen.getByText("Pods")).toBeInTheDocument();
      expect(screen.getByText(/manage pod lifecycle/i)).toBeInTheDocument();
    });

    it("renders permission matrix", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(screen.getByText(/permissions for pods/i)).toBeInTheDocument();
    });

    it("renders footer with summary", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(screen.getByText(/2 permissions configured/i)).toBeInTheDocument();
    });

    it("does NOT render remove button in footer", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      // Should not have a "Remove from Role" button
      expect(
        screen.queryByRole("button", { name: /remove from role/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /deselect resource/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Navigation Controls", () => {
    it("renders navigation buttons when multiple resources", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /previous resource/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /next resource/i }),
      ).toBeInTheDocument();
    });

    it("shows current position indicator", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(screen.getByText("1 of 2")).toBeInTheDocument();
    });

    it("disables Previous button on first resource", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      const prevButton = screen.getByRole("button", {
        name: /previous resource/i,
      });
      expect(prevButton).toBeDisabled();
    });

    it("enables Next button when not on last resource", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      const nextButton = screen.getByRole("button", { name: /next resource/i });
      expect(nextButton).toBeEnabled();
    });

    it("calls onResourceChange when Next is clicked", async () => {
      const user = userEvent.setup();
      render(<PermissionConfigPanel {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /next resource/i }));

      expect(mockOnResourceChange).toHaveBeenCalledWith("services");
    });

    it("calls onResourceChange when Previous is clicked", async () => {
      const user = userEvent.setup();
      render(
        <PermissionConfigPanel
          {...defaultProps}
          activeResource={"services" as ResourceType}
        />,
      );

      await user.click(
        screen.getByRole("button", { name: /previous resource/i }),
      );

      expect(mockOnResourceChange).toHaveBeenCalledWith("pods");
    });

    it("does not render navigation for single resource", () => {
      render(
        <PermissionConfigPanel
          {...defaultProps}
          permissions={[defaultProps.permissions[0]]}
        />,
      );

      expect(
        screen.queryByRole("button", { name: /previous resource/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /next resource/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Quick Resource Selector", () => {
    it("renders dropdown when more than 3 resources", () => {
      const manyPermissions = [
        { resource: "pods" as ResourceType, apiGroup: "", verbs: [] },
        { resource: "services" as ResourceType, apiGroup: "", verbs: [] },
        { resource: "deployments" as ResourceType, apiGroup: "", verbs: [] },
        { resource: "configmaps" as ResourceType, apiGroup: "", verbs: [] },
      ];

      render(
        <PermissionConfigPanel
          {...defaultProps}
          permissions={manyPermissions}
        />,
      );

      expect(screen.getByLabelText(/jump to resource/i)).toBeInTheDocument();
    });

    it("does not render dropdown for 3 or fewer resources", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(
        screen.queryByLabelText(/jump to resource/i),
      ).not.toBeInTheDocument();
    });

    it("calls onResourceChange when dropdown selection changes", async () => {
      const user = userEvent.setup();
      const manyPermissions = [
        { resource: "pods" as ResourceType, apiGroup: "", verbs: [] },
        { resource: "services" as ResourceType, apiGroup: "", verbs: [] },
        { resource: "deployments" as ResourceType, apiGroup: "", verbs: [] },
        { resource: "configmaps" as ResourceType, apiGroup: "", verbs: [] },
      ];

      render(
        <PermissionConfigPanel
          {...defaultProps}
          permissions={manyPermissions}
        />,
      );

      const dropdown = screen.getByLabelText(/jump to resource/i);
      await user.selectOptions(dropdown, "services");

      expect(mockOnResourceChange).toHaveBeenCalledWith("services");
    });
  });

  describe("Footer Summary", () => {
    it("shows permission count", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(screen.getByText(/2 permissions configured/i)).toBeInTheDocument();
    });

    it("shows singular form for one permission", () => {
      render(
        <PermissionConfigPanel
          {...defaultProps}
          permissions={[
            { resource: "pods" as ResourceType, apiGroup: "", verbs: ["get"] },
          ]}
        />,
      );

      expect(screen.getByText(/1 permission configured/i)).toBeInTheDocument();
    });

    it("shows warning when no permissions configured", () => {
      render(
        <PermissionConfigPanel
          {...defaultProps}
          permissions={[
            { resource: "pods" as ResourceType, apiGroup: "", verbs: [] },
          ]}
        />,
      );

      expect(
        screen.getByText(/no permissions configured/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/will not be included in the yaml/i),
      ).toBeInTheDocument();
    });
  });

  describe("Custom Resources", () => {
    it("renders custom resource with custom badge", () => {
      render(
        <PermissionConfigPanel
          {...defaultProps}
          permissions={[
            {
              resource: "mycrd" as ResourceType,
              apiGroup: "mycompany.com",
              verbs: [],
            },
          ]}
          activeResource={"mycrd" as ResourceType}
        />,
      );

      expect(screen.getByText("mycrd")).toBeInTheDocument();
      expect(screen.getByText("Custom")).toBeInTheDocument();
      expect(screen.getByText("mycompany.com")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for navigation", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /previous resource/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /next resource/i }),
      ).toBeInTheDocument();
    });

    it("has proper heading hierarchy", () => {
      render(<PermissionConfigPanel {...defaultProps} />);

      const heading = screen.getByRole("heading", {
        name: /configure permissions/i,
      });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty permissions array", () => {
      render(<PermissionConfigPanel {...defaultProps} permissions={[]} />);

      // Should render nothing
      expect(
        screen.queryByText("Configure Permissions"),
      ).not.toBeInTheDocument();
    });

    it("defaults to first permission when activeResource is null", () => {
      render(<PermissionConfigPanel {...defaultProps} activeResource={null} />);

      expect(screen.getByText("Pods")).toBeInTheDocument();
    });

    it("handles resource without metadata (custom)", () => {
      render(
        <PermissionConfigPanel
          {...defaultProps}
          permissions={[
            {
              resource: "unknownresource" as ResourceType,
              apiGroup: "test.com",
              verbs: [],
            },
          ]}
          activeResource={"unknownresource" as ResourceType}
        />,
      );

      expect(screen.getByText("unknownresource")).toBeInTheDocument();
      expect(
        screen.getByText("Custom resource definition"),
      ).toBeInTheDocument();
    });
  });
});
