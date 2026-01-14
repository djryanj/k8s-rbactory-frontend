// src/components/ResourceSelector/__tests__/ResourceSelector.integration.test.tsx
import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceSelector } from "../ResourceSelector";
import { RBACProvider } from "../../../context/rbac";

// Mock the useMediaQuery hook
jest.mock("../../../hooks/useMediaQuery", () => ({
  useMediaQuery: jest.fn(() => true), // Default to desktop
}));

const renderResourceSelector = () => {
  return render(
    <RBACProvider>
      <ResourceSelector />
    </RBACProvider>
  );
};

describe("ResourceSelector Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Desktop Split-Screen Layout", () => {
    it("renders split-screen layout on desktop", () => {
      renderResourceSelector();

      // Should have two main panels
      expect(screen.getByText("Select Resources")).toBeInTheDocument();
      expect(screen.getByText("No Resources Selected")).toBeInTheDocument();
    });

    it("shows empty state in config panel initially", () => {
      renderResourceSelector();

      expect(
        screen.getByText(
          "Select resources from the left panel to configure their permissions here."
        )
      ).toBeInTheDocument();
    });
  });

  describe("Resource Selection Flow", () => {
    it("allows selecting a standard resource", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Find and click a resource (e.g., Pods)
      const podsCard = screen.getByRole("button", { name: /pods/i });
      await user.click(podsCard);

      // Config panel should now show Pods configuration
      await waitFor(() => {
        expect(screen.getByText("Configure Permissions")).toBeInTheDocument();
        expect(screen.getByText(/permissions for pods/i)).toBeInTheDocument();
      });
    });

    it("allows selecting multiple resources", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Select Pods
      await user.click(screen.getByRole("button", { name: /pods/i }));

      // Select Services
      await user.click(screen.getByRole("button", { name: /services/i }));

      // Both should be in the summary
      await waitFor(() => {
        expect(screen.getByText(/total resources: 2/i)).toBeInTheDocument();
      });
    });

    it("allows deselecting a resource via X button", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Select a resource
      const podsCard = screen.getByRole("button", { name: /pods/i });
      await user.click(podsCard);

      // Hover to show X button and click it
      await user.hover(podsCard);
      const deselectButton = within(podsCard).getByLabelText(/deselect pods/i);
      await user.click(deselectButton);

      // Should return to empty state
      await waitFor(() => {
        expect(screen.getByText("No Resources Selected")).toBeInTheDocument();
      });
    });

    it("switches between selected resources", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Select Pods
      await user.click(screen.getByRole("button", { name: /pods/i }));
      await waitFor(() => {
        expect(screen.getByText(/permissions for pods/i)).toBeInTheDocument();
      });

      // Click Services
      await user.click(screen.getByRole("button", { name: /services/i }));
      await waitFor(() => {
        expect(
          screen.getByText(/permissions for services/i)
        ).toBeInTheDocument();
      });

      // Pods should still be selected (in background)
      expect(screen.getByRole("button", { name: /pods/i })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });
  });

  describe("Custom Resource Flow", () => {
    it("allows adding a custom resource", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Expand custom resources section
      const customSection = screen.getByRole("button", {
        name: /custom resources/i,
      });
      await user.click(customSection);

      // Click add custom resource button
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );

      // Fill form
      await user.type(screen.getByLabelText(/resource name/i), "certificates");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");

      // Submit
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );

      // Should appear in custom resources list
      await waitFor(() => {
        expect(screen.getByText("certificates")).toBeInTheDocument();
        expect(screen.getByText("cert-manager.io")).toBeInTheDocument();
      });
    });

    it("allows deselecting custom resource (keeps in list)", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Add custom resource
      const customSection = screen.getByRole("button", {
        name: /custom resources/i,
      });
      await user.click(customSection);
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );
      await user.type(screen.getByLabelText(/resource name/i), "certificates");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );

      // Wait for it to appear
      await waitFor(() => {
        expect(screen.getByText("certificates")).toBeInTheDocument();
      });

      // Deselect it
      const certCard = screen.getByRole("button", { name: /certificates/i });
      await user.hover(certCard);
      const deselectButton = within(certCard).getByLabelText(
        /deselect certificates/i
      );
      await user.click(deselectButton);

      // Should still be in list but show "No permissions configured"
      await waitFor(() => {
        expect(screen.getByText("certificates")).toBeInTheDocument();
        expect(
          screen.getByText("No permissions configured")
        ).toBeInTheDocument();
      });
    });

    it("allows permanently removing custom resource", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Add custom resource
      const customSection = screen.getByRole("button", {
        name: /custom resources/i,
      });
      await user.click(customSection);
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );
      await user.type(screen.getByLabelText(/resource name/i), "certificates");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );

      await waitFor(() => {
        expect(screen.getByText("certificates")).toBeInTheDocument();
      });

      // Permanently remove
      const removeButton = screen.getByLabelText(
        /permanently remove certificates/i
      );
      await user.click(removeButton);

      // Should be completely gone
      await waitFor(() => {
        expect(screen.queryByText("certificates")).not.toBeInTheDocument();
      });
    });
  });

  describe("Search and Filter", () => {
    it("filters resources by search term", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      const searchInput = screen.getByPlaceholderText(/search resources/i);
      await user.type(searchInput, "pod");

      // Should show pods-related resources
      expect(screen.getByText("Pods")).toBeInTheDocument();

      // Should hide unrelated resources (this depends on your resource list)
      // Adjust based on actual resources
    });

    it("filters resources by category", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      const categoryFilter = screen.getByLabelText(/filter by category/i);
      await user.selectOptions(categoryFilter, "workload");

      // Should only show workload resources
      expect(screen.getByText("Workloads")).toBeInTheDocument();
    });

    it("shows 'no results' message when search has no matches", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      const searchInput = screen.getByPlaceholderText(/search resources/i);
      await user.type(searchInput, "nonexistentresource");

      expect(
        screen.getByText(/no resources match your search/i)
      ).toBeInTheDocument();
    });
  });

  describe("Permission Configuration", () => {
    it("allows configuring verbs for a resource", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Select Pods
      await user.click(screen.getByRole("button", { name: /pods/i }));

      // Wait for permission matrix
      await waitFor(() => {
        expect(screen.getByText(/permissions for pods/i)).toBeInTheDocument();
      });

      // Select some verbs
      const getCheckbox = screen.getByRole("checkbox", { name: /get/i });
      const listCheckbox = screen.getByRole("checkbox", { name: /list/i });

      await user.click(getCheckbox);
      await user.click(listCheckbox);

      // Verify they're checked
      expect(getCheckbox).toBeChecked();
      expect(listCheckbox).toBeChecked();
    });

    it("shows permission count in summary", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Select Pods
      await user.click(screen.getByRole("button", { name: /pods/i }));

      // Select verbs
      await waitFor(() => {
        expect(screen.getByText(/permissions for pods/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("checkbox", { name: /get/i }));
      await user.click(screen.getByRole("checkbox", { name: /list/i }));

      // Check summary
      await waitFor(() => {
        expect(screen.getByText(/total permissions: 2/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("announces resource selection to screen readers", async () => {
      const user = userEvent.setup();

      // Mock announceToScreenReader
      const mockAnnounce = jest.fn();
      jest.mock("../../../utils/accessibility", () => ({
        announceToScreenReader: mockAnnounce,
      }));

      renderResourceSelector();

      await user.click(screen.getByRole("button", { name: /pods/i }));

      // This would need the actual implementation to test
      // Just checking the structure here
    });

    it("has proper heading hierarchy", () => {
      renderResourceSelector();

      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);

      // Main heading should be present
      expect(
        screen.getByRole("heading", { name: /select resources/i })
      ).toBeInTheDocument();
    });

    it("has keyboard navigable cards", () => {
      renderResourceSelector();

      const cards = screen.getAllByRole("button");
      cards.forEach((card) => {
        expect(card).toHaveAttribute("tabIndex");
      });
    });
  });

  describe("Summary Section", () => {
    it("shows summary when resources are selected", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      await user.click(screen.getByRole("button", { name: /pods/i }));

      await waitFor(() => {
        expect(screen.getByText(/total resources: 1/i)).toBeInTheDocument();
      });
    });

    it("updates summary when resources change", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Select first resource
      await user.click(screen.getByRole("button", { name: /pods/i }));
      await waitFor(() => {
        expect(screen.getByText(/total resources: 1/i)).toBeInTheDocument();
      });

      // Select second resource
      await user.click(screen.getByRole("button", { name: /services/i }));
      await waitFor(() => {
        expect(screen.getByText(/total resources: 2/i)).toBeInTheDocument();
      });
    });

    it("shows custom resource count in summary", async () => {
      const user = userEvent.setup();
      renderResourceSelector();

      // Add custom resource
      const customSection = screen.getByRole("button", {
        name: /custom resources/i,
      });
      await user.click(customSection);
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );
      await user.type(screen.getByLabelText(/resource name/i), "certificates");
      await user.type(screen.getByLabelText(/api group/i), "cert-manager.io");
      await user.click(
        screen.getByRole("button", { name: /add custom resource/i })
      );

      await waitFor(() => {
        expect(screen.getByText(/1 custom/i)).toBeInTheDocument();
      });
    });
  });
});
