// src/components/ResourceSelector/__tests__/ResourceSelector.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceSelector } from "../ResourceSelector";
import { RBACProvider } from "../../../context/rbac";

// Mock hooks
vi.mock("../../../hooks/useMediaQuery", () => ({
  useMediaQuery: vi.fn(() => true),
}));

describe("ResourceSelector", () => {
  const renderWithProvider = () => {
    return render(
      <RBACProvider>
        <ResourceSelector />
      </RBACProvider>,
    );
  };

  it("renders split-screen layout", () => {
    renderWithProvider();

    expect(screen.getByText("Select Resources")).toBeInTheDocument();
    expect(screen.getByText("No Resources Selected")).toBeInTheDocument();
  });

  it("allows selecting a resource", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const podsCard = screen.getByRole("button", { name: /pods/i });
    await user.click(podsCard);

    await waitFor(() => {
      expect(screen.getByText("Configure Permissions")).toBeInTheDocument();
    });
  });
});
