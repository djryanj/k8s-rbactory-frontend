// src/components/ResourceSelector/__tests__/ResourceFilters.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResourceFilters } from "../ResourceFilters";

describe("ResourceFilters", () => {
  const mockOnSearchChange = vi.fn();
  const mockOnCategoryChange = vi.fn();

  const defaultProps = {
    searchTerm: "",
    onSearchChange: mockOnSearchChange,
    selectedCategory: "all",
    onCategoryChange: mockOnCategoryChange,
    resultsCount: 10,
    selectedCount: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders search input", () => {
      render(<ResourceFilters {...defaultProps} />);

      expect(
        screen.getByPlaceholderText(/search resources/i),
      ).toBeInTheDocument();
    });

    it("renders category filter", () => {
      render(<ResourceFilters {...defaultProps} />);

      expect(screen.getByLabelText(/filter by category/i)).toBeInTheDocument();
    });

    it("shows results count for screen readers", () => {
      render(<ResourceFilters {...defaultProps} />);

      expect(screen.getByText(/10 resources found/i)).toBeInTheDocument();
      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("calls onSearchChange when typing in search", async () => {
      const user = userEvent.setup();
      render(<ResourceFilters {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search resources/i);
      await user.type(searchInput, "pod");

      expect(mockOnSearchChange).toHaveBeenCalledWith("p");
      expect(mockOnSearchChange).toHaveBeenCalledWith("o");
      expect(mockOnSearchChange).toHaveBeenCalledWith("d");
    });

    it("displays current search term", () => {
      render(<ResourceFilters {...defaultProps} searchTerm="deployment" />);

      const searchInput = screen.getByPlaceholderText(
        /search resources/i,
      ) as HTMLInputElement;
      expect(searchInput.value).toBe("deployment");
    });

    it("clears search when input is cleared", async () => {
      const user = userEvent.setup();
      render(<ResourceFilters {...defaultProps} searchTerm="pod" />);

      const searchInput = screen.getByPlaceholderText(/search resources/i);
      await user.clear(searchInput);

      expect(mockOnSearchChange).toHaveBeenCalledWith("");
    });
  });

  describe("Category Filter", () => {
    it("calls onCategoryChange when category is selected", async () => {
      const user = userEvent.setup();
      render(<ResourceFilters {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/filter by category/i);
      await user.selectOptions(categorySelect, "workload");

      expect(mockOnCategoryChange).toHaveBeenCalledWith("workload");
    });

    it("displays current category selection", () => {
      render(<ResourceFilters {...defaultProps} selectedCategory="workload" />);

      const categorySelect = screen.getByLabelText(
        /filter by category/i,
      ) as HTMLSelectElement;
      expect(categorySelect.value).toBe("workload");
    });

    it("renders all category options", () => {
      render(<ResourceFilters {...defaultProps} />);

      const categorySelect = screen.getByLabelText(/filter by category/i);

      expect(categorySelect).toContainHTML(
        '<option value="all">All Categories</option>',
      );
      expect(categorySelect).toContainHTML("Workloads");
      expect(categorySelect).toContainHTML("Configuration");
      expect(categorySelect).toContainHTML("Storage");
      expect(categorySelect).toContainHTML("Networking");
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for inputs", () => {
      render(<ResourceFilters {...defaultProps} />);

      expect(screen.getByLabelText(/search resources/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by category/i)).toBeInTheDocument();
    });

    it("announces results to screen readers", () => {
      render(<ResourceFilters {...defaultProps} />);

      const status = screen.getByRole("status");
      expect(status).toHaveTextContent(/10 resources found/i);
      expect(status).toHaveTextContent(/2 selected/i);
    });

    it("updates screen reader announcement when results change", () => {
      const { rerender } = render(<ResourceFilters {...defaultProps} />);

      expect(screen.getByRole("status")).toHaveTextContent(/10 resources/i);

      rerender(<ResourceFilters {...defaultProps} resultsCount={5} />);

      expect(screen.getByRole("status")).toHaveTextContent(/5 resources/i);
    });
  });

  describe("Edge Cases", () => {
    it("handles zero results", () => {
      render(<ResourceFilters {...defaultProps} resultsCount={0} />);

      expect(screen.getByText(/0 resources found/i)).toBeInTheDocument();
    });

    it("handles singular vs plural results", () => {
      const { rerender } = render(
        <ResourceFilters {...defaultProps} resultsCount={1} />,
      );

      expect(screen.getByText(/1 resource found/i)).toBeInTheDocument();

      rerender(<ResourceFilters {...defaultProps} resultsCount={2} />);

      expect(screen.getByText(/2 resources found/i)).toBeInTheDocument();
    });

    it("handles rapid typing in search", async () => {
      const user = userEvent.setup();
      render(<ResourceFilters {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search resources/i);
      await user.type(searchInput, "deployment", { delay: 1 });

      expect(mockOnSearchChange).toHaveBeenCalledTimes("deployment".length);
    });
  });
});
