// src/components/RoleConfiguration/__tests__/BasicInformation.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BasicInformation } from "../BasicInformation";
import {
  renderWithContext,
  mockRBACContext,
  resetAllMocks,
} from "./test-utils";

describe("BasicInformation", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("Rendering", () => {
    it("renders the component with correct heading", () => {
      renderWithContext(<BasicInformation />);

      expect(screen.getByText("Basic Information")).toBeInTheDocument();
    });

    it("renders role name input with correct value", () => {
      renderWithContext(<BasicInformation />);

      const roleInput = screen.getByLabelText(/role name/i);
      expect(roleInput).toHaveValue("my-role");
    });

    it("renders binding name input with correct value", () => {
      renderWithContext(<BasicInformation />);

      const bindingInput = screen.getByLabelText(/binding name/i);
      expect(bindingInput).toHaveValue("my-role-binding");
    });

    it("shows required indicators on labels", () => {
      renderWithContext(<BasicInformation />);

      const requiredIndicators = screen.getAllByLabelText("required");
      expect(requiredIndicators).toHaveLength(2);
    });

    it("shows hint text for both inputs", () => {
      renderWithContext(<BasicInformation />);

      expect(
        screen.getByText(/lowercase alphanumeric characters or hyphens/i)
      ).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls updateRoleName when role name input changes", async () => {
      const user = userEvent.setup();
      renderWithContext(<BasicInformation />);

      const roleInput = screen.getByLabelText(/role name/i);
      await user.clear(roleInput);
      await user.type(roleInput, "new-role");

      expect(mockRBACContext.updateRoleName).toHaveBeenCalledWith("new-role");
    });

    it("calls updateBindingName when binding name input changes", async () => {
      const user = userEvent.setup();
      renderWithContext(<BasicInformation />);

      const bindingInput = screen.getByLabelText(/binding name/i);
      await user.clear(bindingInput);
      await user.type(bindingInput, "new-binding");

      expect(mockRBACContext.updateBindingName).toHaveBeenCalledWith(
        "new-binding"
      );
    });
  });

  describe("Validation - Touched State", () => {
    it("does not show validation error before field is touched", () => {
      mockRBACContext.validationErrors = {
        roleName: "Invalid role name",
      };

      renderWithContext(<BasicInformation />);

      expect(screen.queryByText("Invalid role name")).not.toBeInTheDocument();
    });

    it("shows validation error after field is blurred", async () => {
      const user = userEvent.setup();
      mockRBACContext.validationErrors = {
        roleName: "Invalid role name",
      };

      renderWithContext(<BasicInformation />);

      const roleInput = screen.getByLabelText(/role name/i);
      await user.click(roleInput);
      await user.tab(); // Blur the input

      await waitFor(() => {
        expect(screen.getByText("Invalid role name")).toBeInTheDocument();
      });
    });

    it("shows error styling on input when validation fails", async () => {
      const user = userEvent.setup();
      mockRBACContext.validationErrors = {
        roleName: "Invalid role name",
      };

      renderWithContext(<BasicInformation />);

      const roleInput = screen.getByLabelText(/role name/i);
      await user.click(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(roleInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("hides hint text when showing error", async () => {
      const user = userEvent.setup();
      mockRBACContext.validationErrors = {
        roleName: "Invalid role name",
      };

      renderWithContext(<BasicInformation />);

      const roleInput = screen.getByLabelText(/role name/i);
      const hintText = screen.getAllByText(/lowercase alphanumeric/i)[0];

      expect(hintText).toBeInTheDocument();

      await user.click(roleInput);
      await user.tab();

      await waitFor(() => {
        expect(hintText).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes on inputs", () => {
      renderWithContext(<BasicInformation />);

      const roleInput = screen.getByLabelText(/role name/i);
      expect(roleInput).toHaveAttribute("aria-describedby");
      expect(roleInput).toHaveAttribute("aria-invalid", "false");
    });

    it("associates error messages with inputs", async () => {
      const user = userEvent.setup();
      mockRBACContext.validationErrors = {
        roleName: "Invalid role name",
      };

      renderWithContext(<BasicInformation />);

      const roleInput = screen.getByLabelText(/role name/i);
      await user.click(roleInput);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText("Invalid role name");
        expect(errorMessage).toHaveAttribute("role", "alert");
        expect(roleInput).toHaveAttribute(
          "aria-describedby",
          "role-name-error"
        );
      });
    });

    it("marks inputs as required", () => {
      renderWithContext(<BasicInformation />);

      const roleInput = screen.getByLabelText(/role name/i);
      const bindingInput = screen.getByLabelText(/binding name/i);

      expect(roleInput).toBeRequired();
      expect(bindingInput).toBeRequired();
    });
  });
});
