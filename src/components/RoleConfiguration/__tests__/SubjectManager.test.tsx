// src/components/RoleConfiguration/__tests__/SubjectManager.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubjectManager } from "../SubjectManager";
import {
  renderWithContext,
  mockRBACContext,
  resetAllMocks,
  setMockSubjects,
  getClosestElement,
} from "./test-utils";
import { announceToScreenReader } from "../../../utils/accessibility";

describe("SubjectManager", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("Rendering", () => {
    it("renders the component with correct heading", () => {
      renderWithContext(<SubjectManager />);

      expect(screen.getByText("Subjects")).toBeInTheDocument();
    });

    it("renders all three subject type options", () => {
      renderWithContext(<SubjectManager />);

      expect(screen.getByLabelText("User")).toBeInTheDocument();
      expect(screen.getByLabelText("Group")).toBeInTheDocument();
      expect(screen.getByLabelText("Service Account")).toBeInTheDocument();
    });

    it("shows User as default selected type", () => {
      renderWithContext(<SubjectManager />);

      const userOption = screen.getByLabelText("User");
      expect(userOption).toBeChecked();
    });

    it("shows empty state when no subjects are added", () => {
      renderWithContext(<SubjectManager />);

      expect(screen.getByText(/no subjects added yet/i)).toBeInTheDocument();
    });

    it("shows namespace input only for Service Account", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      // Initially no namespace input (User is selected)
      expect(screen.queryByLabelText(/^namespace/i)).not.toBeInTheDocument();

      // Switch to Service Account
      const saOption = screen.getByLabelText("Service Account");
      await user.click(saOption);

      // Now namespace input should appear
      expect(screen.getByLabelText(/^namespace/i)).toBeInTheDocument();
    });
  });

  describe("Subject Type Selection", () => {
    it("switches subject type when clicking different option", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const groupOption = screen.getByLabelText("Group");
      await user.click(groupOption);

      expect(groupOption).toBeChecked();
      expect(announceToScreenReader).toHaveBeenCalledWith(
        "Subject type changed to Group"
      );
    });

    it("updates placeholder text based on selected type", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      expect(nameInput).toHaveAttribute("placeholder", "user@example.com");

      const groupOption = screen.getByLabelText("Group");
      await user.click(groupOption);

      expect(nameInput).toHaveAttribute("placeholder", "developers");
    });

    it("clears error when switching subject type", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);

      // Enter invalid name and blur to trigger error
      await user.type(nameInput, "invalid name with spaces");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // Switch subject type
      const groupOption = screen.getByLabelText("Group");
      await user.click(groupOption);

      // Error should be cleared
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Adding Subjects", () => {
    it("calls addSubject when form is submitted with valid data", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, "john.doe@example.com");

      const addButton = screen.getByRole("button", { name: /add subject/i });
      await user.click(addButton);

      expect(mockRBACContext.addSubject).toHaveBeenCalledWith({
        kind: "User",
        name: "john.doe@example.com",
      });
    });

    it("includes namespace for Service Account subjects", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      // Switch to Service Account
      const saOption = screen.getByLabelText("Service Account");
      await user.click(saOption);

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, "my-service-account");

      const namespaceInput = screen.getByLabelText(/^namespace/i);
      await user.clear(namespaceInput);
      await user.type(namespaceInput, "production");

      const addButton = screen.getByRole("button", { name: /add subject/i });
      await user.click(addButton);

      expect(mockRBACContext.addSubject).toHaveBeenCalledWith({
        kind: "ServiceAccount",
        name: "my-service-account",
        namespace: "production",
      });
    });

    it("clears form after successful submission", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, "john.doe@example.com");

      const addButton = screen.getByRole("button", { name: /add subject/i });
      await user.click(addButton);

      expect(nameInput).toHaveValue("");
    });

    it("announces subject addition to screen readers", async () => {
      const user = userEvent.setup();

      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, "john.doe@example.com");

      const addButton = screen.getByRole("button", { name: /add subject/i });
      await user.click(addButton);

      expect(announceToScreenReader).toHaveBeenCalledWith(
        expect.stringContaining('User "john.doe@example.com" added')
      );
    });

    it("disables add button when name is empty", () => {
      renderWithContext(<SubjectManager />);

      const addButton = screen.getByRole("button", {
        name: /enter a subject name to add/i,
      });
      expect(addButton).toBeDisabled();
    });

    it("enables add button when name is entered", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, "john.doe");

      const addButton = screen.getByRole("button", {
        name: /add user john.doe/i,
      });
      expect(addButton).toBeEnabled();
    });
  });

  describe("Validation", () => {
    it("does not show validation error before field is touched", () => {
      renderWithContext(<SubjectManager />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows validation error after invalid input is blurred", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, "invalid name with spaces");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("prevents submission with invalid data", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, "invalid name");

      const addButton = screen.getByRole("button", { name: /add subject/i });
      await user.click(addButton);

      expect(mockRBACContext.addSubject).not.toHaveBeenCalled();
    });

    it("hides hint text when showing error", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const hintText = screen.getByText(/email or username/i);
      expect(hintText).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, "invalid name");
      await user.tab();

      await waitFor(() => {
        expect(hintText).not.toBeInTheDocument();
      });
    });
  });

  describe("Removing Subjects", () => {
    beforeEach(() => {
      setMockSubjects([
        { kind: "User", name: "john.doe@example.com" },
        { kind: "Group", name: "developers" },
        { kind: "ServiceAccount", name: "my-sa", namespace: "default" },
      ]);
    });

    it("displays all added subjects", () => {
      renderWithContext(<SubjectManager />);

      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("developers")).toBeInTheDocument();
      expect(screen.getByText("my-sa")).toBeInTheDocument();
    });

    it("shows namespace for Service Account subjects", () => {
      renderWithContext(<SubjectManager />);

      const saItem = getClosestElement(screen.getByText("my-sa"), "li");
      expect(within(saItem).getByText("default")).toBeInTheDocument();
    });

    it("calls removeSubject when first remove button is clicked", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      // Use a specific query for the first subject
      const firstRemoveButton = screen.getByRole("button", {
        name: /remove user john.doe@example.com/i,
      });

      await user.click(firstRemoveButton);

      expect(mockRBACContext.removeSubject).toHaveBeenCalledWith(0);
    });

    it("can remove any subject from the list", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const removeButtons = screen.getAllByRole("button", { name: /remove/i });

      // Verify we have the expected number of remove buttons
      expect(removeButtons).toHaveLength(3);

      // Remove the second subject (Group)
      await user.click(removeButtons[1]!);

      expect(mockRBACContext.removeSubject).toHaveBeenCalledWith(1);
    });

    it("announces subject removal to screen readers", async () => {
      const user = userEvent.setup();
      renderWithContext(<SubjectManager />);

      const removeButton = screen.getByRole("button", {
        name: /remove user john.doe@example.com/i,
      });
      await user.click(removeButton);

      expect(announceToScreenReader).toHaveBeenCalledWith(
        expect.stringContaining('User "john.doe@example.com" removed')
      );
    });

    it("hides empty state when subjects exist", () => {
      renderWithContext(<SubjectManager />);

      expect(
        screen.queryByText(/no subjects added yet/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses radio buttons for subject type selection", () => {
      renderWithContext(<SubjectManager />);

      const userOption = screen.getByLabelText("User");
      const groupOption = screen.getByLabelText("Group");
      const saOption = screen.getByLabelText("Service Account");

      expect(userOption).toHaveAttribute("type", "radio");
      expect(groupOption).toHaveAttribute("type", "radio");
      expect(saOption).toHaveAttribute("type", "radio");
    });

    it("groups radio buttons with same name", () => {
      renderWithContext(<SubjectManager />);

      const userOption = screen.getByLabelText("User");
      const groupOption = screen.getByLabelText("Group");

      expect(userOption).toHaveAttribute("name", "subject-type");
      expect(groupOption).toHaveAttribute("name", "subject-type");
    });

    it("has proper ARIA attributes on form inputs", () => {
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      expect(nameInput).toHaveAttribute("aria-describedby");
      expect(nameInput).toHaveAttribute("aria-invalid");
    });

    it("marks name input as required", () => {
      renderWithContext(<SubjectManager />);

      const nameInput = screen.getByLabelText(/^name$/i);
      expect(nameInput).toBeRequired();
    });

    it("provides descriptive labels for remove buttons", () => {
      setMockSubjects([{ kind: "User", name: "john.doe@example.com" }]);

      renderWithContext(<SubjectManager />);

      expect(
        screen.getByRole("button", {
          name: /remove user john.doe@example.com/i,
        })
      ).toBeInTheDocument();
    });
  });
});
