// src/components/ResourceSelector/__tests__/PermissionMatrix.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PermissionMatrix } from "../PermissionMatrix/PermissionMatrix";
import { type ResourceType, type VerbType } from "../../../types/rbac.types";

const mockUpdatePermissionVerbs = vi.fn();

vi.mock("../../../context/rbac", () => ({
  useRBAC: () => ({
    updatePermissionVerbs: mockUpdatePermissionVerbs,
  }),
}));

describe("PermissionMatrix", () => {
  const defaultProps = {
    resource: "pods" as ResourceType,
    selectedVerbs: [] as VerbType[],
    availableVerbs: [
      "get",
      "list",
      "watch",
      "create",
      "update",
      "delete",
    ] as VerbType[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders permission matrix header with description", () => {
      render(<PermissionMatrix {...defaultProps} />);

      expect(screen.getByText(/permissions for pods/i)).toBeInTheDocument();
      expect(
        screen.getByText(/select individual permissions or use quick actions/i),
      ).toBeInTheDocument();
    });

    it("renders all four quick action buttons in 2x2 grid", () => {
      render(<PermissionMatrix {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /read-only/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /write/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /all permissions/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /clear all/i }),
      ).toBeInTheDocument();
    });

    it("renders quick action buttons with icons", () => {
      render(<PermissionMatrix {...defaultProps} />);

      // Check that buttons contain both icon and text
      const readButton = screen.getByRole("button", { name: /read-only/i });
      expect(readButton).toHaveTextContent("Read-Only");

      const writeButton = screen.getByRole("button", { name: /write/i });
      expect(writeButton).toHaveTextContent("Write");

      const allButton = screen.getByRole("button", {
        name: /all permissions/i,
      });
      expect(allButton).toHaveTextContent("All Permissions");

      const clearButton = screen.getByRole("button", { name: /clear all/i });
      expect(clearButton).toHaveTextContent("Clear All");
    });

    it("categorizes verbs into read and write sections", () => {
      render(<PermissionMatrix {...defaultProps} />);

      expect(screen.getByText("READ PERMISSIONS")).toBeInTheDocument();
      expect(screen.getByText("WRITE PERMISSIONS")).toBeInTheDocument();
    });

    it("shows permission summary with count", () => {
      render(<PermissionMatrix {...defaultProps} />);

      expect(screen.getByText(/selected permissions:/i)).toBeInTheDocument();
      expect(screen.getByText(/0 of 6/i)).toBeInTheDocument();
    });
  });

  describe("Quick Action Buttons - Read-Only", () => {
    it("selects all read permissions when Read-Only clicked", async () => {
      const user = userEvent.setup();
      render(<PermissionMatrix {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /read-only/i }));

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith(
        "pods",
        expect.arrayContaining(["get", "list", "watch"]),
      );
    });

    it("deselects read permissions when Read-Only clicked again", async () => {
      const user = userEvent.setup();
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={["get", "list", "watch"]}
        />,
      );

      await user.click(screen.getByRole("button", { name: /read-only/i }));

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith("pods", []);
    });

    it("shows Read-Only button as pressed when all read verbs selected", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={["get", "list", "watch"]}
        />,
      );

      const readButton = screen.getByRole("button", { name: /read-only/i });
      expect(readButton).toHaveAttribute("aria-pressed", "true");
      expect(readButton.className).toMatch(/bg-blue/i);
    });

    it("preserves write permissions when toggling read-only", async () => {
      const user = userEvent.setup();
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={["create", "update"]}
        />,
      );

      await user.click(screen.getByRole("button", { name: /read-only/i }));

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith(
        "pods",
        expect.arrayContaining(["create", "update", "get", "list", "watch"]),
      );
    });
  });

  describe("Quick Action Buttons - Write", () => {
    it("selects all write permissions when Write clicked", async () => {
      const user = userEvent.setup();
      render(<PermissionMatrix {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /write/i }));

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith(
        "pods",
        expect.arrayContaining(["create", "update", "delete"]),
      );
    });

    it("shows Write button as pressed when all write verbs selected", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={["create", "update", "delete"]}
        />,
      );

      const writeButton = screen.getByRole("button", { name: /write/i });
      expect(writeButton).toHaveAttribute("aria-pressed", "true");
      expect(writeButton.className).toMatch(/amber/i);
    });

    it("preserves read permissions when toggling write", async () => {
      const user = userEvent.setup();
      render(
        <PermissionMatrix {...defaultProps} selectedVerbs={["get", "list"]} />,
      );

      await user.click(screen.getByRole("button", { name: /write/i }));

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith(
        "pods",
        expect.arrayContaining(["get", "list", "create", "update", "delete"]),
      );
    });
  });

  describe("Quick Action Buttons - All Permissions", () => {
    it("selects all available permissions when All Permissions clicked", async () => {
      const user = userEvent.setup();
      render(<PermissionMatrix {...defaultProps} />);

      await user.click(
        screen.getByRole("button", { name: /all permissions/i }),
      );

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith(
        "pods",
        defaultProps.availableVerbs,
      );
    });

    it("shows All Permissions button as pressed when all verbs selected", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={defaultProps.availableVerbs}
        />,
      );

      const allButton = screen.getByRole("button", {
        name: /all permissions/i,
      });
      expect(allButton).toHaveAttribute("aria-pressed", "true");
      expect(allButton.className).toMatch(/green/i);
    });

    it("does not show as pressed when only some verbs selected", () => {
      render(
        <PermissionMatrix {...defaultProps} selectedVerbs={["get", "list"]} />,
      );

      const allButton = screen.getByRole("button", {
        name: /all permissions/i,
      });
      expect(allButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("Quick Action Buttons - Clear All", () => {
    it("clears all permissions when Clear All clicked", async () => {
      const user = userEvent.setup();
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={["get", "list", "create"]}
        />,
      );

      await user.click(screen.getByRole("button", { name: /clear all/i }));

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith("pods", []);
    });

    it("disables Clear All button when no permissions selected", () => {
      render(<PermissionMatrix {...defaultProps} />);

      const clearButton = screen.getByRole("button", { name: /clear all/i });
      expect(clearButton).toBeDisabled();
      expect(clearButton.className).toMatch(/opacity-50/);
    });

    it("enables Clear All button when permissions are selected", () => {
      render(<PermissionMatrix {...defaultProps} selectedVerbs={["get"]} />);

      const clearButton = screen.getByRole("button", { name: /clear all/i });
      expect(clearButton).toBeEnabled();
      expect(clearButton.className).toMatch(/red/i);
    });

    it("shows Clear All as pressed when no verbs selected", () => {
      render(<PermissionMatrix {...defaultProps} />);

      const clearButton = screen.getByRole("button", { name: /clear all/i });
      expect(clearButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Individual Verb Selection", () => {
    it("allows selecting individual verbs", async () => {
      const user = userEvent.setup();
      render(<PermissionMatrix {...defaultProps} />);

      const getCheckbox = screen.getByRole("checkbox", { name: /get/i });
      await user.click(getCheckbox);

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith("pods", ["get"]);
    });

    it("allows deselecting individual verbs", async () => {
      const user = userEvent.setup();
      render(
        <PermissionMatrix {...defaultProps} selectedVerbs={["get", "list"]} />,
      );

      const getCheckbox = screen.getByRole("checkbox", { name: /get/i });
      await user.click(getCheckbox);

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith("pods", ["list"]);
    });

    it("shows selected verbs as checked", () => {
      render(
        <PermissionMatrix {...defaultProps} selectedVerbs={["get", "list"]} />,
      );

      expect(screen.getByRole("checkbox", { name: /get/i })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: /list/i })).toBeChecked();
      expect(
        screen.getByRole("checkbox", { name: /create/i }),
      ).not.toBeChecked();
    });
  });

  describe("Permission Summary", () => {
    it("updates summary count when verbs are selected", () => {
      const { rerender } = render(<PermissionMatrix {...defaultProps} />);

      expect(screen.getByText(/0 of 6/i)).toBeInTheDocument();

      rerender(
        <PermissionMatrix {...defaultProps} selectedVerbs={["get", "list"]} />,
      );

      expect(screen.getByText(/2 of 6/i)).toBeInTheDocument();
    });

    it("shows selected verbs as removable chips", () => {
      render(
        <PermissionMatrix {...defaultProps} selectedVerbs={["get", "list"]} />,
      );

      expect(screen.getByText("get")).toBeInTheDocument();
      expect(screen.getByText("list")).toBeInTheDocument();
    });

    it("allows removing verbs from summary chips", async () => {
      const user = userEvent.setup();
      render(
        <PermissionMatrix {...defaultProps} selectedVerbs={["get", "list"]} />,
      );

      const removeButton = screen.getByLabelText(/remove get permission/i);
      await user.click(removeButton);

      expect(mockUpdatePermissionVerbs).toHaveBeenCalledWith("pods", ["list"]);
    });

    it('shows "no permissions selected" when none selected', () => {
      render(<PermissionMatrix {...defaultProps} />);

      expect(screen.getByText(/no permissions selected/i)).toBeInTheDocument();
    });
  });

  describe("Button Visual States", () => {
    it("applies correct color classes to Read-Only button when selected", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={["get", "list", "watch"]}
        />,
      );

      const button = screen.getByRole("button", { name: /read-only/i });
      expect(button.className).toMatch(/bg-blue-100/);
      expect(button.className).toMatch(/text-blue-900/);
      expect(button.className).toMatch(/border-blue-500/);
    });

    it("applies correct color classes to Write button when selected", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={["create", "update", "delete"]}
        />,
      );

      const button = screen.getByRole("button", { name: /write/i });
      expect(button.className).toMatch(/amber/);
    });

    it("applies correct color classes to All Permissions button when selected", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={defaultProps.availableVerbs}
        />,
      );

      const button = screen.getByRole("button", { name: /all permissions/i });
      expect(button.className).toMatch(/green/);
    });

    it("applies correct color classes to Clear All button when enabled", () => {
      render(<PermissionMatrix {...defaultProps} selectedVerbs={["get"]} />);

      const button = screen.getByRole("button", { name: /clear all/i });
      expect(button.className).toMatch(/red/);
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA region label", () => {
      render(<PermissionMatrix {...defaultProps} />);

      const region = screen.getByRole("region");
      expect(region).toHaveAttribute(
        "aria-labelledby",
        "permission-matrix-pods",
      );
    });

    it("has proper group label for quick actions", () => {
      render(<PermissionMatrix {...defaultProps} />);

      const group = screen.getByRole("group", {
        name: /quick permission actions/i,
      });
      expect(group).toBeInTheDocument();
    });

    it("announces changes to screen readers", () => {
      render(
        <PermissionMatrix {...defaultProps} selectedVerbs={["get", "list"]} />,
      );

      const status = screen.getByRole("status", { hidden: true });
      expect(status).toHaveTextContent(/2 of 6 permissions selected/i);
    });

    it("provides detailed ARIA labels for all buttons", () => {
      render(<PermissionMatrix {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /select read-only permissions/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /select write permissions/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /select all 6 permissions/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /clear all permissions/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles resources with only read verbs", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          availableVerbs={["get", "list", "watch"]}
        />,
      );

      expect(screen.getByText("READ PERMISSIONS")).toBeInTheDocument();
      expect(screen.queryByText("WRITE PERMISSIONS")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /read-only/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /write/i }),
      ).toBeInTheDocument();
    });

    it("handles resources with only write verbs", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          availableVerbs={["create", "update", "delete"]}
        />,
      );

      expect(screen.queryByText("READ PERMISSIONS")).not.toBeInTheDocument();
      expect(screen.getByText("WRITE PERMISSIONS")).toBeInTheDocument();
    });

    it("handles empty available verbs array", () => {
      render(<PermissionMatrix {...defaultProps} availableVerbs={[]} />);

      expect(screen.getByText(/0 of 0/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear all/i })).toBeDisabled();
    });

    it("handles all verbs being selected", () => {
      render(
        <PermissionMatrix
          {...defaultProps}
          selectedVerbs={defaultProps.availableVerbs}
        />,
      );

      expect(screen.getByText(/6 of 6/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /all permissions/i }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: /clear all/i })).toBeEnabled();
    });
  });

  describe("Grid Layout", () => {
    it("renders buttons in a 2x2 grid", () => {
      render(<PermissionMatrix {...defaultProps} />);

      const buttonGroup = screen.getByRole("group", {
        name: /quick permission actions/i,
      });
      expect(buttonGroup.className).toMatch(/grid-cols-2/);
    });
  });
});
