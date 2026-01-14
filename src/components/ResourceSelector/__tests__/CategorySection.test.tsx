// src/components/ResourceSelector/__tests__/CategorySection.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategorySection } from "../CategorySection";
import { type ResourceType } from "../../../types/rbac.types";

// Mock the RBAC context at the top level
const mockAddPermission = vi.fn();
const mockRemovePermission = vi.fn();
const mockUpdatePermissionVerbs = vi.fn();
const mockClearPermissionVerbs = vi.fn();

// Create a mock hook that we can control
const mockUseRBAC = vi.fn();

vi.mock("../../../context/rbac", () => ({
  useRBAC: () => mockUseRBAC(),
}));

// Mock the icon component
vi.mock("@/icons", () => ({
  K8sResourceIcon: ({ kind, size }: { kind: string; size: number }) => (
    <div data-testid={`icon-${kind}`} data-size={size}>
      {kind}
    </div>
  ),
}));

describe("CategorySection", () => {
  const mockOnToggleExpand = vi.fn();
  const mockOnResourceToggle = vi.fn();
  const mockOnResourceClick = vi.fn();
  const mockOnCustomResourceRemove = vi.fn();
  const mockOnAddCustomResource = vi.fn();

  const defaultManifest = {
    role: {
      name: "test-role",
      isClusterRole: false,
      namespace: "default",
      permissions: [],
    },
    binding: {
      name: "test-binding",
      namespace: "default",
      roleRef: { kind: "Role" as const, name: "test-role" },
      subjects: [],
    },
  };

  const defaultProps = {
    category: "workload" as const,
    resources: ["pods", "deployments"] as ResourceType[],
    selectedResources: [] as ResourceType[],
    activeResource: null as ResourceType | null,
    isExpanded: true,
    onToggleExpand: mockOnToggleExpand,
    onResourceToggle: mockOnResourceToggle,
    onResourceClick: mockOnResourceClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default mock implementation
    mockUseRBAC.mockReturnValue({
      manifest: defaultManifest,
      addPermission: mockAddPermission,
      removePermission: mockRemovePermission,
      updatePermissionVerbs: mockUpdatePermissionVerbs,
      clearPermissionVerbs: mockClearPermissionVerbs,
    });
  });

  describe("Rendering", () => {
    it("renders category header with icon and name", () => {
      render(<CategorySection {...defaultProps} />);

      const header = screen.getByRole("button", { name: /workloads/i });
      expect(header).toBeInTheDocument();

      // Check that icon is rendered
      expect(screen.getByTestId("icon-workload")).toBeInTheDocument();
    });

    it("shows resource count in header", () => {
      render(<CategorySection {...defaultProps} />);

      expect(screen.getByText(/2 resources/i)).toBeInTheDocument();
    });

    it("shows selected count when resources are selected", () => {
      render(
        <CategorySection
          {...defaultProps}
          selectedResources={["pods"] as ResourceType[]}
        />
      );

      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    });

    it("renders collapsed state correctly", () => {
      render(<CategorySection {...defaultProps} isExpanded={false} />);

      const content = screen.queryByRole("group");
      expect(content).not.toBeInTheDocument();
    });

    it("renders expanded state with resources", () => {
      render(<CategorySection {...defaultProps} />);

      expect(
        screen.getByRole("group", { name: /workloads resources/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Pods")).toBeInTheDocument();
      expect(screen.getByText("Deployments")).toBeInTheDocument();
    });

    it("shows chevron down when collapsed", () => {
      render(<CategorySection {...defaultProps} isExpanded={false} />);

      const header = screen.getByRole("button", { name: /workloads/i });
      expect(header).toHaveAttribute("aria-expanded", "false");
    });

    it("shows chevron up when expanded", () => {
      render(<CategorySection {...defaultProps} isExpanded={true} />);

      const header = screen.getByRole("button", { name: /workloads/i });
      expect(header).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Custom Resources Category", () => {
    it("renders custom resources category", () => {
      render(
        <CategorySection
          {...defaultProps}
          category="custom"
          resources={[]}
          customResources={[{ resource: "mycrd", apiGroup: "mycompany.com" }]}
        />
      );

      expect(screen.getByText("Custom Resources")).toBeInTheDocument();
      expect(screen.getByText("mycrd")).toBeInTheDocument();
    });

    it("shows add custom resource button when expanded", () => {
      render(
        <CategorySection
          {...defaultProps}
          category="custom"
          resources={[]}
          customResources={[]}
          onAddCustomResource={mockOnAddCustomResource}
        />
      );

      expect(
        screen.getByRole("button", { name: /add custom resource/i })
      ).toBeInTheDocument();
    });

    it("calls onAddCustomResource when button clicked", async () => {
      const user = userEvent.setup();
      render(
        <CategorySection
          {...defaultProps}
          category="custom"
          resources={[]}
          customResources={[]}
          onAddCustomResource={mockOnAddCustomResource}
        />
      );

      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );
      expect(mockOnAddCustomResource).toHaveBeenCalledTimes(1);
    });

    it("shows custom resource form when showCustomResourceForm is true", () => {
      const formComponent = <div data-testid="custom-form">Custom Form</div>;

      render(
        <CategorySection
          {...defaultProps}
          category="custom"
          resources={[]}
          customResources={[]}
          showCustomResourceForm={true}
          customResourceFormComponent={formComponent}
        />
      );

      expect(screen.getByTestId("custom-form")).toBeInTheDocument();
    });

    it("hides add button when form is shown", () => {
      const formComponent = <div data-testid="custom-form">Custom Form</div>;

      render(
        <CategorySection
          {...defaultProps}
          category="custom"
          resources={[]}
          customResources={[]}
          showCustomResourceForm={true}
          customResourceFormComponent={formComponent}
          onAddCustomResource={mockOnAddCustomResource}
        />
      );

      expect(
        screen.queryByRole("button", { name: /add custom resource/i })
      ).not.toBeInTheDocument();
    });

    it("shows empty state for custom resources", () => {
      render(
        <CategorySection
          {...defaultProps}
          category="custom"
          resources={[]}
          customResources={[]}
          onAddCustomResource={mockOnAddCustomResource}
        />
      );

      expect(
        screen.getByText(/no custom resources added yet/i)
      ).toBeInTheDocument();
    });

    it("shows remove button for custom resources", () => {
      render(
        <CategorySection
          {...defaultProps}
          category="custom"
          resources={[]}
          selectedResources={[]}
          customResources={[{ resource: "mycrd", apiGroup: "mycompany.com" }]}
          onCustomResourceRemove={mockOnCustomResourceRemove}
        />
      );

      expect(
        screen.getByLabelText(/permanently remove mycrd/i)
      ).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("calls onToggleExpand when header is clicked", async () => {
      const user = userEvent.setup();
      render(<CategorySection {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /workloads/i }));
      expect(mockOnToggleExpand).toHaveBeenCalledTimes(1);
    });

    it("expands and collapses on header click", () => {
      const { rerender } = render(
        <CategorySection {...defaultProps} isExpanded={false} />
      );

      expect(screen.queryByRole("group")).not.toBeInTheDocument();

      rerender(<CategorySection {...defaultProps} isExpanded={true} />);

      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("passes resource toggle to child cards", async () => {
      const user = userEvent.setup();
      render(<CategorySection {...defaultProps} />);

      const podsCard = screen.getByRole("button", { name: /pods/i });
      await user.click(podsCard);

      expect(mockOnResourceToggle).toHaveBeenCalledWith("pods");
    });

    it("passes resource click to child cards when selected", async () => {
      const user = userEvent.setup();
      render(
        <CategorySection
          {...defaultProps}
          selectedResources={["pods"] as ResourceType[]}
        />
      );

      const podsCard = screen.getByRole("button", { name: /pods/i });
      await user.click(podsCard);

      expect(mockOnResourceClick).toHaveBeenCalledWith("pods");
    });
  });

  describe("Inline Expansion", () => {
    it("shows permission matrix inline when resource is selected", () => {
      // Update the mock to include a permission
      mockUseRBAC.mockReturnValue({
        manifest: {
          ...defaultManifest,
          role: {
            ...defaultManifest.role,
            permissions: [
              { resource: "pods", apiGroup: "", verbs: ["get", "list"] },
            ],
          },
        },
        addPermission: mockAddPermission,
        removePermission: mockRemovePermission,
        updatePermissionVerbs: mockUpdatePermissionVerbs,
        clearPermissionVerbs: mockClearPermissionVerbs,
      });

      render(
        <CategorySection
          {...defaultProps}
          selectedResources={["pods"] as ResourceType[]}
          inlineExpansion={true}
        />
      );

      // Permission matrix should be rendered inline
      expect(screen.getByText(/permissions for pods/i)).toBeInTheDocument();
    });

    it("does not show permission matrix when inlineExpansion is false", () => {
      // Update the mock to include a permission
      mockUseRBAC.mockReturnValue({
        manifest: {
          ...defaultManifest,
          role: {
            ...defaultManifest.role,
            permissions: [
              { resource: "pods", apiGroup: "", verbs: ["get", "list"] },
            ],
          },
        },
        addPermission: mockAddPermission,
        removePermission: mockRemovePermission,
        updatePermissionVerbs: mockUpdatePermissionVerbs,
        clearPermissionVerbs: mockClearPermissionVerbs,
      });

      render(
        <CategorySection
          {...defaultProps}
          selectedResources={["pods"] as ResourceType[]}
          inlineExpansion={false}
        />
      );

      expect(
        screen.queryByText(/permissions for pods/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes on header", () => {
      render(<CategorySection {...defaultProps} />);

      const header = screen.getByRole("button", { name: /workloads/i });
      expect(header).toHaveAttribute("aria-expanded", "true");
      expect(header).toHaveAttribute(
        "aria-controls",
        "category-workload-content"
      );
    });

    it("has proper role and aria-label on content", () => {
      render(<CategorySection {...defaultProps} />);

      const content = screen.getByRole("group", {
        name: /workloads resources/i,
      });
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("id", "category-workload-content");
    });

    it("is keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<CategorySection {...defaultProps} />);

      const header = screen.getByRole("button", { name: /workloads/i });
      header.focus();

      await user.keyboard("{Enter}");
      expect(mockOnToggleExpand).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty resources array", () => {
      render(<CategorySection {...defaultProps} resources={[]} />);

      expect(screen.getByText(/0 resources/i)).toBeInTheDocument();
    });

    it("handles all resources selected", () => {
      render(
        <CategorySection
          {...defaultProps}
          selectedResources={["pods", "deployments"] as ResourceType[]}
        />
      );

      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });

    it("handles mixed selection state", () => {
      render(
        <CategorySection
          {...defaultProps}
          resources={["pods", "deployments", "services"] as ResourceType[]}
          selectedResources={["pods"] as ResourceType[]}
        />
      );

      expect(screen.getByText(/3 resources/i)).toBeInTheDocument();
      expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
    });
  });
});
