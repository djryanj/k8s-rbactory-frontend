// src/components/ResourceSelector/__tests__/CustomResourceForm.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomResourceForm } from "../CustomResourceForm";

describe("CustomResourceForm", () => {
  const mockOnAdd = vi.fn();
  const mockOnCancel = vi.fn();
  const existingResources = ["pods", "services"];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all form fields", () => {
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      expect(screen.getByLabelText(/resource name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/api group/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /add custom resource/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it("renders CRD quick select dropdown", () => {
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      expect(
        screen.getByLabelText(/quick select common crd/i),
      ).toBeInTheDocument();
    });

    it("shows info box about next steps", () => {
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      expect(screen.getByText(/next step/i)).toBeInTheDocument();
      expect(screen.getByText(/configure permissions/i)).toBeInTheDocument();
    });

    it("shows help text for inputs", () => {
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      expect(screen.getByText(/plural name/i)).toBeInTheDocument();
      expect(screen.getByText(/domain-style group/i)).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("disables submit button when fields are empty", () => {
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /add custom resource/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("enables submit button when both fields are filled", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/resource name/i), "certificates");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");

      const submitButton = screen.getByRole("button", {
        name: /add custom resource/i,
      });
      expect(submitButton).toBeEnabled();
    });

    it("shows error for empty resource name on submit", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");

      // Force submit by enabling button temporarily
      const nameInput = screen.getByLabelText(/resource name/i);
      await user.type(nameInput, "a");
      await user.clear(nameInput);

      const form = screen
        .getByRole("button", { name: /add custom resource/i })
        .closest("form");
      if (form) {
        await user.click(
          screen.getByRole("button", { name: /add custom resource/i }),
        );
      }

      await waitFor(() => {
        expect(
          screen.getByText(/resource name is required/i),
        ).toBeInTheDocument();
      });
    });

    it("shows error for empty API group on submit", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/resource name/i), "certificates");

      const apiInput = screen.getByLabelText(/api group/i);
      await user.type(apiInput, "a");
      await user.clear(apiInput);

      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        expect(screen.getByText(/api group is required/i)).toBeInTheDocument();
      });
    });

    it("shows error for invalid resource name format", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/resource name/i), "Invalid_Name!");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        expect(screen.getByText(/lowercase alphanumeric/i)).toBeInTheDocument();
      });
    });

    it("shows error for duplicate resource name", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={["certificates"]}
        />,
      );

      await user.type(screen.getByLabelText(/resource name/i), "certificates");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        expect(screen.getByText(/already added/i)).toBeInTheDocument();
      });
    });

    it("converts resource name to lowercase automatically", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      const nameInput = screen.getByLabelText(
        /resource name/i,
      ) as HTMLInputElement;
      await user.type(nameInput, "MyCRD");

      expect(nameInput.value).toBe("mycrd");
    });

    it("clears error when user starts typing", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      // Trigger error
      await user.type(screen.getByLabelText(/api group/i), "test");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(/resource name is required/i),
        ).toBeInTheDocument();
      });

      // Start typing
      await user.type(screen.getByLabelText(/resource name/i), "c");

      expect(
        screen.queryByText(/resource name is required/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("calls onAdd with correct values on valid submission", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/resource name/i), "certificates");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          "certificates",
          "cert-manager.io",
        );
        expect(mockOnAdd).toHaveBeenCalledTimes(1);
      });
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("does not call onAdd when validation fails", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/resource name/i), "Invalid!");
      await user.type(screen.getByLabelText(/api group/i), "test.com");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it("handles form submission via Enter key", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/resource name/i), "certificates");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          "certificates",
          "cert-manager.io",
        );
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper form labels and required attributes", () => {
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      const nameInput = screen.getByLabelText(/resource name/i);
      const apiInput = screen.getByLabelText(/api group/i);

      expect(nameInput).toBeRequired();
      expect(apiInput).toBeRequired();
    });

    it("shows error with proper ARIA attributes", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/api group/i), "test");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        const error = screen.getByRole("alert");
        expect(error).toBeInTheDocument();
        expect(error).toHaveAttribute("aria-live", "assertive");
      });
    });

    it("has descriptive help text for inputs", () => {
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      const nameInput = screen.getByLabelText(/resource name/i);
      const apiInput = screen.getByLabelText(/api group/i);

      expect(nameInput).toHaveAccessibleDescription(/plural name/i);
      expect(apiInput).toHaveAccessibleDescription(/domain-style group/i);
    });

    it("has proper form role and aria-label", () => {
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      const form = screen.getByRole("form", { name: /custom resource form/i });
      expect(form).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid typing without errors", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      const nameInput = screen.getByLabelText(/resource name/i);

      // Type rapidly
      await user.type(nameInput, "abcdefghijklmnop", { delay: 1 });

      expect(nameInput).toHaveValue("abcdefghijklmnop");
    });

    it("handles paste events correctly", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      const nameInput = screen.getByLabelText(/resource name/i);
      await user.click(nameInput);
      await user.paste("MyResource");

      expect(nameInput).toHaveValue("myresource"); // Should be lowercase
    });

    it("handles special characters in API group", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(screen.getByLabelText(/resource name/i), "test");
      await user.type(screen.getByLabelText(/api group/i), "my-company.io/v1");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith("test", "my-company.io/v1");
      });
    });

    it("trims whitespace from inputs", async () => {
      const user = userEvent.setup();
      render(
        <CustomResourceForm
          onAdd={mockOnAdd}
          onCancel={mockOnCancel}
          existingResources={existingResources}
        />,
      );

      await user.type(
        screen.getByLabelText(/resource name/i),
        "  certificates  ",
      );
      await user.type(
        screen.getByLabelText(/api group/i),
        "  cert-manager.io  ",
      );
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i }),
      );

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          "certificates",
          "cert-manager.io",
        );
      });
    });
  });
});
